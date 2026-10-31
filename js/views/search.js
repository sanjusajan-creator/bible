import {
  BOOKS,
  TOPICS,
  bookDisplayName,
  getBook,
  getVersion,
  matchBook,
  parseReference,
  readerPath,
  referenceLabel,
} from '../data.js';
import { friendlyError, getChapter, searchBook } from '../api.js';
import { addSearch, getState, lastReading, recentSearches } from '../store.js';
import {
  copyText,
  debounce,
  escapeHTML,
  highlightMatches,
  icon,
  ornament,
  toast,
} from '../ui.js';

const QUICK_REFERENCES = [
  'Psalm 23',
  'John 3:16',
  'Romans 8:28',
  'Genesis 1:1',
  'Philippians 4:6',
  'Isaiah 40:31',
];

function idleJumpMarkup() {
  return `<div class="search-idle">
    <span class="search-idle-icon">${icon('compass', { size: 26 })}</span>
    <p>Enter a book, chapter, or verse. We’ll take you straight there.</p>
    <span class="search-idle-example">For example: <button type="button" class="inline-link" data-jump-ref="John 3:16">John 3:16</button> or <button type="button" class="inline-link" data-jump-ref="Psalm 23">Psalm 23</button></span>
  </div>`;
}

function initialResultsMarkup() {
  return `<div class="search-results-idle">
    ${ornament()}
    <p class="eyebrow">Listen for a word</p>
    <h2>What are you looking for?</h2>
    <p>Choose a book above and search every verse in it. Downloads are cached, so a second search is almost instant.</p>
    <div class="word-chips">
      ${['shepherd', 'light', 'rest', 'mercy', 'hope', 'fear not'].map((word) => `<button type="button" class="word-chip" data-word="${word}">${word}</button>`).join('')}
    </div>
  </div>`;
}

function jumpPreviewMarkup({ parsed, chapter, verses, version, href, range }) {
  const isSingle = verses.length === 1 && parsed.verse && !range;
  const label = referenceLabel(parsed.book.slug, parsed.chapter, parsed.verse || null, version.short);
  const chapterLabel = bookDisplayName(parsed.book.slug, parsed.chapter);
  const verseTexts = verses.slice(0, 4);
  const extra = verses.length - verseTexts.length;

  return `<div class="jump-preview">
    <div class="jump-preview-head">
      <div>
        <span class="jump-kicker">${icon('book-open', { size: 14 })} ${isSingle ? 'Verse found' : 'Passage found'}</span>
        <strong>${escapeHTML(label)}</strong>
      </div>
      <span class="jump-chapter-count">${chapter.verses.length} verses in chapter</span>
    </div>
    <div class="jump-preview-text ${isSingle ? 'jump-preview-text--single' : ''}">
      ${verseTexts.map((verse) => `<p><sup>${verse.number}</sup>${escapeHTML(verse.text)}</p>`).join('')}
      ${extra > 0 ? `<p class="jump-preview-more">+ ${extra} more verse${extra === 1 ? '' : 's'} in this passage</p>` : ''}
    </div>
    <div class="jump-preview-actions">
      <a class="btn btn--primary btn--small" href="${href}" data-jump-open data-jump-label="${escapeHTML(label)}">Open ${isSingle ? 'in reader' : `chapter`} ${icon('arrow-right', { size: 15 })}</a>
      <button type="button" class="text-button" data-copy-ref="${escapeHTML(label)}">${icon('copy', { size: 14 })} Copy reference</button>
      <span class="jump-preview-version">${escapeHTML(version.name)} · ${version.year}</span>
    </div>
  </div>`;
}

function searchHitMarkup(result, query) {
  return `<a class="search-hit" href="${readerPath(result.book, result.chapter, { verse: result.verse })}">
    <span class="search-hit-ref">${escapeHTML(bookDisplayName(result.book, result.chapter))}:${result.verse}</span>
    <span class="search-hit-text">${highlightMatches(result.text, query)}</span>
    <span class="search-hit-arrow">${icon('arrow-right', { size: 14 })}</span>
  </a>`;
}

function resultsMarkup({ book, version, query, results, shownLimit = 80 }) {
  const groups = new Map();
  for (const result of results) {
    if (!groups.has(result.chapter)) groups.set(result.chapter, []);
    groups.get(result.chapter).push(result);
  }

  let rendered = 0;
  const groupMarkup = [];
  for (const [chapter, hits] of groups) {
    if (rendered >= shownLimit) break;
    const limited = hits.slice(0, shownLimit - rendered);
    rendered += limited.length;
    groupMarkup.push(`<div class="search-result-group">
      <div class="search-result-group-head">
        <h3>${escapeHTML(bookDisplayName(book.slug, chapter))}</h3>
        <a class="text-button" href="${readerPath(book.slug, chapter)}">Open chapter ${icon('arrow-right', { size: 13 })}</a>
      </div>
      <div class="search-hit-list">${limited.map((hit) => searchHitMarkup(hit, query)).join('')}</div>
    </div>`);
  }

  return `<div class="search-results-head">
    <p class="eyebrow">Search results</p>
    <h2>${results.length} ${results.length === 1 ? 'verse' : 'verses'} found.</h2>
    <p><em>“${escapeHTML(query)}”</em> in ${escapeHTML(book.name)} · ${escapeHTML(version.short)}</p>
    ${results.length > rendered ? `<span class="search-results-note">Showing the first ${rendered} matches. Try a more specific word to narrow the search.</span>` : ''}
  </div>
  <div class="search-result-groups">${groupMarkup.join('')}</div>`;
}

export function render(root, route, ctx) {
  const state = getState();
  const version = getVersion(state.version);
  const defaultBookSlug = lastReading()?.book || 'psalms';
  const savedSearches = recentSearches();

  root.innerHTML = `
    <section class="page-hero page-hero--compact search-hero">
      <div class="shell page-hero-inner">
        <div class="page-hero-copy">
          <p class="eyebrow" data-reveal><span class="eyebrow-mark"></span>Search the library</p>
          <h1 class="page-title" data-reveal>Seek, and<br /><em>you will find.</em></h1>
          <p class="page-lede" data-reveal>Jump to a passage by reference, or search every verse of a book for a word you are carrying.</p>
        </div>
        <div class="search-hero-mark" aria-hidden="true" data-reveal>
          <span>${icon('search', { size: 40 })}</span>
          <span class="search-hero-ring"></span>
          <span class="search-hero-ring search-hero-ring--two"></span>
        </div>
      </div>
    </section>

    <section class="shell search-layout">
      <article class="search-card search-card--reference" data-reveal>
        <div class="search-card-head">
          <div>
            <p class="eyebrow">Go to a passage</p>
            <h2>Follow a reference.</h2>
          </div>
          <span class="search-card-index">01</span>
        </div>

        <div class="big-search" id="jump-search">
          ${icon('book-open', { size: 19 })}
          <input type="text" id="jump-input" placeholder="John 3:16 or Psalm 23" autocomplete="off" spellcheck="false" aria-label="Enter a Bible reference" />
          <kbd>↵</kbd>
        </div>

        <div class="search-suggestions">
          ${QUICK_REFERENCES.map((reference) => `<button type="button" class="search-chip" data-jump-ref="${reference}">${reference}</button>`).join('')}
        </div>

        <div class="jump-result" id="jump-result">
          ${idleJumpMarkup()}
        </div>
      </article>

      <article class="search-card search-card--book" data-reveal>
        <div class="search-card-head">
          <div>
            <p class="eyebrow">Search inside a book</p>
            <h2>Listen for a word.</h2>
          </div>
          <span class="search-card-index">02</span>
        </div>

        <form class="keyword-form" id="keyword-form">
          <label class="field-label" for="search-book">Book</label>
          <div class="select-wrap">
            <select id="search-book" aria-label="Book to search">
              <optgroup label="Old Testament">
                ${BOOKS.filter((book) => book.testament === 'old').map((book) => `<option value="${book.slug}" ${book.slug === defaultBookSlug ? 'selected' : ''}>${escapeHTML(book.name)} · ${book.chapters} ch.</option>`).join('')}
              </optgroup>
              <optgroup label="New Testament">
                ${BOOKS.filter((book) => book.testament === 'new').map((book) => `<option value="${book.slug}" ${book.slug === defaultBookSlug ? 'selected' : ''}>${escapeHTML(book.name)} · ${book.chapters} ch.</option>`).join('')}
              </optgroup>
            </select>
            <span class="select-chevron">${icon('chevron-down', { size: 15 })}</span>
          </div>

          <label class="field-label" for="keyword-input">Word or phrase</label>
          <div class="big-search big-search--keyword">
            ${icon('search', { size: 18 })}
            <input type="search" id="keyword-input" placeholder="Try “shepherd” or “light”" autocomplete="off" spellcheck="false" aria-label="Word or phrase to search for" />
            <button type="submit" class="keyword-submit" aria-label="Search">${icon('arrow-right', { size: 17 })}</button>
          </div>
          <p class="search-book-hint" id="search-hint">Every verse of ${escapeHTML(getBook(defaultBookSlug).name)} will be searched in ${escapeHTML(version.short)}.</p>
          <button type="submit" class="btn btn--primary keyword-search-btn">Search this book ${icon('arrow-right', { size: 15 })}</button>
        </form>

        ${savedSearches.length ? `<div class="recent-searches">
          <span class="recent-label">Recent</span>
          <div class="recent-list">
            ${savedSearches.map((item, index) => `<button type="button" class="recent-chip" data-recent-index="${index}">${escapeHTML(item.label)}</button>`).join('')}
          </div>
        </div>` : ''}

        <p class="search-card-note">${icon('info', { size: 13 })} Searches only the book you choose, so the whole library stays light and quick.</p>
      </article>
    </section>

    <section class="shell search-results-section" id="search-results-section">
      <div class="search-results-host" id="search-results" aria-live="polite">
        ${initialResultsMarkup()}
      </div>
    </section>

    <section class="shell section search-explore">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">Or begin with a feeling</p>
          <h2>Let a word lead you.</h2>
        </div>
        <a class="text-link" href="#/explore">Explore all topics ${icon('arrow-right', { size: 15 })}</a>
      </div>
      <div class="word-topic-grid">
        ${TOPICS.slice(0, 6).map((topic) => `<a class="word-topic" href="#/explore/${topic.id}" data-tone="${topic.tone}">${icon(topic.icon, { size: 17 })}<span>${escapeHTML(topic.title)}</span>${icon('arrow-up-right', { size: 14 })}</a>`).join('')}
      </div>
    </section>
  `;

  const jumpInput = root.querySelector('#jump-input');
  const jumpResult = root.querySelector('#jump-result');
  const keywordForm = root.querySelector('#keyword-form');
  const bookSelect = root.querySelector('#search-book');
  const keywordInput = root.querySelector('#keyword-input');
  const searchHint = root.querySelector('#search-hint');
  const resultsHost = root.querySelector('#search-results');
  const resultsSection = root.querySelector('#search-results-section');

  let destroyed = false;
  let jumpToken = 0;
  let currentJumpHref = '';
  let currentJumpLabel = '';
  let searchToken = 0;
  let cancelFlag = { cancelled: false };
  let running = false;

  function showJumpSearching() {
    jumpResult.innerHTML = `<div class="jump-preview jump-preview--loading" aria-busy="true">
      <div class="skeleton skeleton--meta"></div>
      <div class="skeleton skeleton--quote"></div>
      <div class="skeleton skeleton--quote skeleton--short"></div>
      <div class="skeleton skeleton--meta"></div>
    </div>`;
  }

  function showJumpMessage(title, copy) {
    jumpResult.innerHTML = `<div class="jump-message">
      <span class="jump-message-icon">${icon('compass', { size: 22 })}</span>
      <strong>${escapeHTML(title)}</strong>
      <p>${escapeHTML(copy)}</p>
    </div>`;
  }

  async function loadJumpPreview() {
    const value = jumpInput.value.trim();
    currentJumpHref = '';
    currentJumpLabel = '';
    if (!value) {
      jumpResult.innerHTML = idleJumpMarkup();
      return;
    }

    const parsed = parseReference(value);
    if (parsed?.error) {
      showJumpMessage('That chapter is beyond the book.', parsed.error);
      return;
    }

    if (!parsed) {
      const book = matchBook(value);
      if (book) {
        jumpResult.innerHTML = `<div class="jump-book">
          <span class="jump-book-mark">${escapeHTML(book.short)}</span>
          <div><span class="jump-kicker">Book found</span><strong>${escapeHTML(book.name)}</strong><p>${book.chapters} chapter${book.chapters === 1 ? '' : 's'} in the library.</p></div>
          <a class="btn btn--primary btn--small" href="${readerPath(book.slug, 1)}" data-jump-open data-jump-label="${escapeHTML(book.name)} 1">Open ${icon('arrow-right', { size: 15 })}</a>
        </div>`;
        currentJumpHref = readerPath(book.slug, 1);
        currentJumpLabel = `${book.name} 1`;
        return;
      }
      showJumpMessage('No passage found.', 'Try a reference like “John 3:16” or a book name like “Romans”.');
      return;
    }

    const token = ++jumpToken;
    showJumpSearching();
    try {
      const chapter = await getChapter(version.id, parsed.book.slug, parsed.chapter);
      if (destroyed || token !== jumpToken) return;

      let verses;
      if (parsed.verse) {
        const end = parsed.endVerse || parsed.verse;
        verses = chapter.verses.filter((verse) => verse.number >= parsed.verse && verse.number <= end);
        if (!verses.length) {
          showJumpMessage('That verse was not found.', `This chapter has ${chapter.verses.length} verses. Try a reference within that range.`);
          return;
        }
      } else {
        verses = chapter.verses.slice(0, 3);
      }

      const href = readerPath(parsed.book.slug, parsed.chapter, {
        verse: parsed.verse || undefined,
        version: version.id,
      });
      currentJumpHref = href;
      currentJumpLabel = referenceLabel(parsed.book.slug, parsed.chapter, parsed.verse, version.short);
      jumpResult.innerHTML = jumpPreviewMarkup({
        parsed,
        chapter,
        verses,
        version,
        href,
        range: Boolean(parsed.endVerse),
      });
    } catch (error) {
      if (destroyed || token !== jumpToken) return;
      showJumpMessage('We couldn’t open that passage.', friendlyError(error));
    }
  }

  const debouncedJump = debounce(loadJumpPreview, 280);
  const onJumpInput = () => {
    const value = jumpInput.value.trim();
    currentJumpHref = '';
    currentJumpLabel = '';
    if (!value) {
      jumpToken += 1;
      jumpResult.innerHTML = idleJumpMarkup();
      return;
    }
    debouncedJump();
  };
  const onJumpKeydown = async (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    debouncedJump.cancel();

    if (!currentJumpHref) await loadJumpPreview();
    if (destroyed || !currentJumpHref) return;

    if (currentJumpLabel) addSearch({ type: 'reference', label: currentJumpLabel, query: currentJumpLabel });
    location.hash = currentJumpHref;
  };

  function updateHint() {
    const book = getBook(bookSelect.value);
    searchHint.textContent = `Every verse of ${book.name} will be searched in ${version.short}.`;
  }

  async function executeKeywordSearch() {
    if (running) return;
    const query = keywordInput.value.trim();
    const book = getBook(bookSelect.value);
    if (query.length < 2) {
      toast('Type at least two characters to search.', { tone: 'error' });
      keywordInput.focus();
      return;
    }

    const token = ++searchToken;
    cancelFlag = { cancelled: false };
    const cancelRef = cancelFlag;
    running = true;
    const submitButtons = keywordForm.querySelectorAll('button[type="submit"]');
    submitButtons.forEach((button) => { button.disabled = true; });

    addSearch({
      type: 'keyword',
      label: `“${query}” in ${book.name}`,
      query,
      book: book.slug,
    });

    resultsHost.innerHTML = `<div class="search-progress">
      <div class="search-progress-head">
        <div>
          <p class="eyebrow">Searching ${escapeHTML(book.name)}</p>
          <h2>Looking for “${escapeHTML(query)}”.</h2>
        </div>
        <button type="button" class="text-button" data-cancel-search>Cancel</button>
      </div>
      <div class="search-progress-bar"><span id="search-progress-fill" style="width:0%"></span></div>
      <div class="search-progress-meta">
        <span id="search-progress-count">0 of ${book.chapters} chapters</span>
        <span id="search-progress-hits">0 matches</span>
      </div>
      <div class="search-progress-suggestions">
        <div class="skeleton skeleton--reading"></div>
        <div class="skeleton skeleton--reading skeleton--short"></div>
        <div class="skeleton skeleton--reading"></div>
      </div>
    </div>`;

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      const result = await searchBook({
        versionId: version.id,
        bookSlug: book.slug,
        query,
        isCancelled: () => cancelRef.cancelled,
        concurrency: 6,
        onProgress(progress) {
          if (destroyed || token !== searchToken) return;
          const fill = resultsHost.querySelector('#search-progress-fill');
          const count = resultsHost.querySelector('#search-progress-count');
          const hits = resultsHost.querySelector('#search-progress-hits');
          if (fill) fill.style.width = `${progress.percent}%`;
          if (count) count.textContent = `${progress.completed} of ${progress.total} chapters`;
          if (hits) hits.textContent = `${progress.results} match${progress.results === 1 ? '' : 'es'}`;
        },
      });

      if (destroyed || token !== searchToken) return;

      if (result.cancelled) {
        resultsHost.innerHTML = `<div class="search-results-idle">
          ${ornament()}
          <p class="eyebrow">Search cancelled</p>
          <h2>The pages are still here.</h2>
          <p>Change your word or book whenever you are ready.</p>
        </div>`;
        return;
      }

      if (!result.results.length) {
        resultsHost.innerHTML = `<div class="search-empty">
          <span class="search-empty-icon">${icon('search', { size: 28 })}</span>
          <p class="eyebrow">No matches</p>
          <h2>That word isn’t in ${escapeHTML(book.name)}.</h2>
          <p>Try a shorter word, a different spelling, or choose another book. ${result.errors.length ? `${result.errors.length} chapter${result.errors.length === 1 ? '' : 's'} could not be loaded.` : ''}</p>
          <button type="button" class="text-button" data-refocus-keyword>Try another word ${icon('arrow-right', { size: 14 })}</button>
        </div>`;
        return;
      }

      resultsHost.innerHTML = resultsMarkup({ book, version, query, results: result.results });
    } catch (error) {
      if (destroyed || token !== searchToken) return;
      resultsHost.innerHTML = `<div class="search-empty">
        ${ornament()}
        <p class="eyebrow">A quiet interruption</p>
        <h2>The search could not finish.</h2>
        <p>${escapeHTML(friendlyError(error))}</p>
        <button type="button" class="text-button" data-refocus-keyword>Try again ${icon('refresh', { size: 14 })}</button>
      </div>`;
    } finally {
      if (!destroyed && token === searchToken) {
        running = false;
        submitButtons.forEach((button) => { button.disabled = false; });
      }
    }
  }

  const onFormSubmit = (event) => {
    event.preventDefault();
    executeKeywordSearch();
  };

  const onRootClick = (event) => {
    const jumpRef = event.target.closest('[data-jump-ref]');
    if (jumpRef) {
      jumpInput.value = jumpRef.getAttribute('data-jump-ref');
      jumpToken += 1;
      loadJumpPreview();
      jumpInput.focus();
      return;
    }

    const jumpOpen = event.target.closest('[data-jump-open]');
    if (jumpOpen) {
      const label = jumpOpen.getAttribute('data-jump-label');
      if (label) addSearch({ type: 'reference', label, query: label });
      return;
    }

    const copyRef = event.target.closest('[data-copy-ref]');
    if (copyRef) {
      copyText(copyRef.getAttribute('data-copy-ref')).then((ok) => {
        toast(ok ? 'Reference copied.' : 'Could not copy the reference.', { tone: ok ? 'default' : 'error' });
      });
      return;
    }

    const recent = event.target.closest('[data-recent-index]');
    if (recent) {
      const entry = savedSearches[Number(recent.getAttribute('data-recent-index'))];
      if (!entry) return;
      if (entry.type === 'reference') {
        jumpInput.value = entry.query || entry.label;
        jumpToken += 1;
        loadJumpPreview();
        jumpInput.focus();
      } else {
        if (entry.book && getBook(entry.book)) bookSelect.value = entry.book;
        keywordInput.value = entry.query || '';
        updateHint();
        executeKeywordSearch();
      }
      return;
    }

    const word = event.target.closest('[data-word]');
    if (word) {
      keywordInput.value = word.getAttribute('data-word');
      keywordInput.focus();
      executeKeywordSearch();
      return;
    }

    if (event.target.closest('[data-cancel-search]')) {
      cancelFlag.cancelled = true;
      searchToken += 1;
      running = false;
      const submitButtons = keywordForm.querySelectorAll('button[type="submit"]');
      submitButtons.forEach((button) => { button.disabled = false; });
      resultsHost.innerHTML = `<div class="search-results-idle">
        ${ornament()}
        <p class="eyebrow">Search cancelled</p>
        <h2>The pages are still here.</h2>
        <p>Change your word or book whenever you are ready.</p>
      </div>`;
      return;
    }

    if (event.target.closest('[data-refocus-keyword]')) {
      keywordInput.focus();
    }
  };

  bookSelect.addEventListener('change', updateHint);
  jumpInput.addEventListener('input', onJumpInput);
  jumpInput.addEventListener('keydown', onJumpKeydown);
  keywordForm.addEventListener('submit', onFormSubmit);
  root.addEventListener('click', onRootClick);
  updateHint();

  return {
    focusSearch() {
      jumpInput.focus();
    },
    cleanup() {
      destroyed = true;
      jumpToken += 1;
      searchToken += 1;
      cancelFlag.cancelled = true;
      debouncedJump.cancel();
      bookSelect.removeEventListener('change', updateHint);
      jumpInput.removeEventListener('input', onJumpInput);
      jumpInput.removeEventListener('keydown', onJumpKeydown);
      keywordForm.removeEventListener('submit', onFormSubmit);
      root.removeEventListener('click', onRootClick);
    },
  };
}
