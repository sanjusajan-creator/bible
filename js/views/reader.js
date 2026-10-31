import {
  BOOKS,
  bookDisplayName,
  getBook,
  getPlan,
  getVersion,
  parseReference,
  matchBook,
  readerPath,
  referenceLabel,
  apiBookSlug,
} from '../data.js';
import { friendlyError, getAudioTimings, getChapter, getCrossReferences, getBooksForVersion } from '../api.js';
import { ensureLanguageFont, scriptFor } from '../fonts.js';
import {
  addHistory,
  getHighlight,
  getNote,
  getState,
  isBookmarked,
  isPlanDayComplete,
  saveNote,
  toggleBookmark,
  toggleHighlight,
  togglePlanDay,
} from '../store.js';
import {
  copyText,
  escapeHTML,
  icon,
  logomark,
  openNoteEditor,
  ornament,
  toast,
} from '../ui.js';

const HIGHLIGHT_COLORS = [
  { color: 'gold', label: 'Golden' },
  { color: 'sage', label: 'Sage' },
  { color: 'rose', label: 'Rose' },
  { color: 'sky', label: 'Sky' },
];

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function chapterTitleMarkup(book, chapter) {
  if (book.slug === 'psalms') {
    return `Psalm <em>${chapter}</em>`;
  }
  return `${escapeHTML(book.name)} <em>${chapter}</em>`;
}

function adjacentChapter(book, chapter, direction) {
  const index = BOOKS.findIndex((item) => item.slug === book.slug);
  if (direction > 0) {
    if (chapter < book.chapters) return { book, chapter: chapter + 1 };
    const next = BOOKS[index + 1];
    return next ? { book: next, chapter: 1 } : null;
  }
  if (chapter > 1) return { book, chapter: chapter - 1 };
  const previous = BOOKS[index - 1];
  return previous ? { book: previous, chapter: previous.chapters } : null;
}

function chapterButtons(bookSlug, activeChapter, versionId, stateVersion) {
  const book = getBook(bookSlug);
  if (!book) return '';
  return Array.from({ length: book.chapters }, (_, index) => {
    const chapter = index + 1;
    const query = versionId !== stateVersion ? `?version=${encodeURIComponent(versionId)}` : '';
    return `<a class="chapter-chip ${chapter === activeChapter ? 'is-current' : ''}" href="#/read/${book.slug}/${chapter}${query}" ${chapter === activeChapter ? 'aria-current="page"' : ''}>${chapter}</a>`;
  }).join('');
}

function bookRows(books, activeBook, activeChapter, versionId, stateVersion) {
  return books.map((book) => {
    const isActive = book.slug === activeBook;
    // Use localized book name if available (stored on book object from API)
    const localizedName = book.localizedName || book.name;
    return `<div class="book-item ${isActive ? 'is-active' : ''}" data-book-item data-book="${book.slug}">
      <button type="button" class="book-row" data-book-toggle aria-expanded="${isActive ? 'true' : 'false'}" aria-controls="chapters-${book.slug}">
        <span class="book-row-title">${escapeHTML(localizedName)}</span>
        <span class="book-row-count">${book.chapters}<span class="book-row-chevron">${icon('chevron-down', { size: 14 })}</span></span>
      </button>
      <div class="chapter-panel" id="chapters-${book.slug}" data-chapter-panel ${isActive ? '' : 'hidden'}>
        ${isActive ? chapterButtons(book.slug, activeChapter, versionId, stateVersion) : ''}
      </div>
    </div>`;
  }).join('');
}

function verseTextMarkup(verse, noteMap) {
  if (!Array.isArray(verse.segments) || !verse.segments.length) {
    return escapeHTML(verse.text);
  }
  return verse.segments.map((segment) => {
    if (segment.type === 'note') {
      const note = noteMap?.get(segment.noteId);
      if (!note) return '';
      return `<sup class="verse-footnote" data-note-id="${note.id}" title="${escapeHTML(note.text)}" tabindex="0" role="button" aria-label="Footnote ${escapeHTML(note.caller)}">${escapeHTML(note.caller)}</sup>`;
    }
    const text = escapeHTML(segment.text);
    return segment.wordsOfJesus ? `<span class="words-of-jesus">${text}</span>` : text;
  }).join('');
}

function verseMarkup(book, versionId, chapterNumber, verse, chapterGenre, noteMap) {
  const highlight = getHighlight(versionId, book.slug, chapterNumber, verse.number);
  const note = getNote(versionId, book.slug, chapterNumber, verse.number);
  return `<p class="verse" data-verse="${verse.number}" data-highlight="${highlight ? highlight.color : ''}" tabindex="0" role="button">
    <sup class="verse-num">${verse.number}</sup><span class="verse-text">${verseTextMarkup(verse, noteMap)}</span>${note ? '<span class="verse-note-dot" title="You have a note on this verse" aria-label="You have a note on this verse"></span>' : ''}
  </p>${chapterGenre === 'poetry' ? '' : ' '}`;
}

function planFooterMarkup(route, book, chapterNumber) {
  const plan = route.plan ? getPlan(route.plan) : null;
  const dayNumber = Number(route.day);
  if (!plan || !Number.isInteger(dayNumber) || !plan.days[dayNumber - 1]) return '';
  const day = plan.days[dayNumber - 1];
  const isReading = day.readings.some((reading) => reading.book === book.slug && reading.chapter === chapterNumber);
  if (!isReading) return '';

  const completed = isPlanDayComplete(plan.id, dayNumber);
  const readingLabels = day.readings
    .map((reading) => `${getBook(reading.book)?.short || reading.book} ${reading.chapter}`)
    .join(' · ');

  return `<div class="plan-reading-card" data-tone="${plan.tone}">
    <span class="plan-reading-icon">${icon(plan.icon, { size: 20 })}</span>
    <div class="plan-reading-copy">
      <p class="eyebrow">${escapeHTML(plan.title)} · Day ${dayNumber}</p>
      <h3>${escapeHTML(day.title || `Day ${dayNumber}`)}</h3>
      <p>${escapeHTML(readingLabels)}</p>
    </div>
    <div class="plan-reading-actions">
      <button type="button" class="btn btn--small ${completed ? 'btn--done' : 'btn--quiet'}" data-plan-toggle data-plan-id="${plan.id}" data-day="${dayNumber}" aria-pressed="${completed}">
        ${completed ? `${icon('check', { size: 15 })} Day complete` : `${icon('circle', { size: 15 })} Mark day complete`}
      </button>
      <a class="text-button" href="#/plans/${plan.id}">Back to plan ${icon('arrow-right', { size: 14 })}</a>
    </div>
  </div>`;
}

export function render(root, route, ctx) {
  const state = getState();
  const book = getBook(route.book);
  const chapterNumber = Number(route.chapter);
  const versionId = route.version && getVersion(route.version)?.id === route.version ? route.version : state.version;
  const version = getVersion(versionId);
  ensureLanguageFont(version.langCode);

  if (!book || !Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > book.chapters) {
    root.innerHTML = `<section class="shell empty-page">
      <p class="eyebrow">Not in the library</p>
      <h1>That chapter isn’t here.</h1>
      <p>The library holds sixty-six books, from Genesis to Revelation. Choose a place to begin.</p>
      <a class="btn btn--primary" href="#/read/psalms/23">Open Psalm 23 ${icon('arrow-right', { size: 16 })}</a>
    </section>`;
    return {};
  }

  const oldBooks = BOOKS.filter((item) => item.testament === 'old');
  const newBooks = BOOKS.filter((item) => item.testament === 'new');
  const previous = adjacentChapter(book, chapterNumber, -1);
  const next = adjacentChapter(book, chapterNumber, 1);
  const versionQuery = versionId !== state.version ? `?version=${encodeURIComponent(versionId)}` : '';
  const plainTitle = bookDisplayName(book.slug, chapterNumber);

  const navHref = (target) => {
    if (!target) return '';
    return readerPath(target.book.slug, target.chapter, {
      version: versionId !== state.version ? versionId : undefined,
    });
  };

  // Function to update the reader header with localized book name
  function updateReaderHeader(localizedBookName, localizedBookShortName) {
    const titleEl = root.querySelector('.reader-bar-center strong');
    const crumbEl = root.querySelector('.reader-crumb');
    if (titleEl) titleEl.textContent = localizedBookName;
    if (crumbEl) {
      const testament = book.testament === 'old' ? 'Old Testament' : 'New Testament';
      crumbEl.innerHTML = `${escapeHTML(testament)} <span>·</span> ${escapeHTML(localizedBookName)}`;
    }
  }

  root.innerHTML = `
    <div class="reader" id="reader">
      <header class="reader-bar">
        <div class="reader-bar-inner">
          <div class="reader-bar-left">
            <a class="reader-brand" href="#/" aria-label="Selah home">${logomark({ size: 28 })}<span>Selah</span></a>
            <button type="button" class="reader-library-btn" id="open-library" aria-expanded="false" aria-controls="reader-sidebar">
              ${icon('library', { size: 16 })}<span>Library</span>
            </button>
          </div>

          <div class="reader-bar-center">
            <span class="reader-crumb">${escapeHTML(book.testament === 'old' ? 'Old Testament' : 'New Testament')} <span>·</span> ${escapeHTML(book.group)}</span>
            <strong>${escapeHTML(plainTitle)}</strong>
          </div>

          <div class="reader-bar-actions">
            <button type="button" class="reader-version" data-version-picker aria-label="Change translation" title="Change translation">
              <span class="version-badge" data-tone="${version.accent}">${version.short}</span>
              <span class="reader-version-name">${escapeHTML(version.name)}</span>
              ${icon('chevron-down', { size: 14 })}
            </button>
            <button type="button" class="reader-action reader-action--listen" data-listen aria-label="Listen to this chapter" title="Listen to this chapter">
              ${icon('headphones', { size: 17 })}<span class="reader-action-label">Listen</span>
            </button>
            <button type="button" class="reader-action reader-action--icon" data-open-settings aria-label="Reading settings" title="Reading settings">
              ${icon('type', { size: 17 })}
            </button>
            <button type="button" class="reader-action reader-action--icon" data-focus aria-label="Enter focus mode" title="Focus mode (F)" aria-pressed="false">
              ${icon('maximize', { size: 17 })}
            </button>
          </div>
        </div>
        <div class="reader-progress"><span id="reader-progress"></span></div>
      </header>

      <div class="sidebar-scrim" data-sidebar-scrim hidden></div>

      <div class="reader-layout">
        <aside class="reader-sidebar" id="reader-sidebar" aria-label="Bible library">
          <div class="sidebar-head">
            <div>
              <p class="eyebrow">The library</p>
              <h2>Choose a place<br /><em>to begin.</em></h2>
            </div>
            <button type="button" class="icon-btn sidebar-close" data-sidebar-close aria-label="Close library">${icon('close', { size: 18 })}</button>
          </div>

          <div class="sidebar-search">
            ${icon('search', { size: 16 })}
            <input type="text" id="book-filter" placeholder="Find a book…" autocomplete="off" spellcheck="false" aria-label="Find a book or reference" />
            <button type="button" class="sidebar-search-clear" data-clear-filter aria-label="Clear book search" hidden>${icon('close', { size: 13 })}</button>
          </div>
          <div class="sidebar-jump" id="sidebar-jump" hidden></div>

          <div class="sidebar-scroll" id="sidebar-scroll">
            <section class="testament-group" data-testament-group="old">
              <p class="sidebar-testament">Old Testament <span>${oldBooks.length} books</span></p>
              ${bookRows(oldBooks, book.slug, chapterNumber, versionId, state.version)}
            </section>
            <section class="testament-group" data-testament-group="new">
              <p class="sidebar-testament">New Testament <span>${newBooks.length} books</span></p>
              ${bookRows(newBooks, book.slug, chapterNumber, versionId, state.version)}
            </section>
          </div>

          <div class="sidebar-foot">
            <span>${icon('book-open', { size: 14 })} Reading in <strong>${escapeHTML(version.short)}</strong></span>
            <button type="button" class="text-button" data-open-settings>Adjust text</button>
          </div>
        </aside>

        <main class="reader-main">
          <article class="reading-sheet" id="reading-sheet">
            <div class="chapter-head" data-number="${chapterNumber}">
              <div class="chapter-topline">
                <a href="#/explore">${escapeHTML(book.group)}</a>
                <span></span>
                <span>Chapter ${chapterNumber} of ${book.chapters}</span>
              </div>
              <p class="eyebrow">${escapeHTML(book.testament === 'old' ? 'Old Testament' : 'New Testament')} · ${escapeHTML(book.name)}</p>
              <h1 class="chapter-title">${chapterTitleMarkup(book, chapterNumber)}</h1>
              <p class="chapter-meta" id="chapter-meta">Opening the chapter…</p>
              <div class="chapter-ornament">${ornament()}</div>
            </div>

            <div class="chapter-content" id="chapter-content" lang="${escapeHTML(version.langCode)}" dir="${version.direction === 'rtl' ? 'rtl' : 'ltr'}" data-script="${scriptFor(version.langCode)}">
              <div class="chapter-skeleton" aria-hidden="true">
                <div class="skeleton skeleton--reading"></div>
                <div class="skeleton skeleton--reading"></div>
                <div class="skeleton skeleton--reading skeleton--short"></div>
                <div class="skeleton skeleton--reading"></div>
                <div class="skeleton skeleton--reading skeleton--short"></div>
              </div>
            </div>

            <div id="chapter-footer"></div>
          </article>
        </main>

        <!-- Bottom navigation bar (mobile) -->
        <nav class="reader-bottom-bar" id="reader-bottom-bar" aria-label="Reading navigation">
          <button type="button" class="bottom-bar-btn" data-bottom-action="prev" aria-label="Previous chapter">
            ${icon('chevron-left', { size: 20 })}
          </button>
          <button type="button" class="bottom-bar-btn bottom-bar-btn--primary" data-bottom-action="listen" aria-label="Listen to chapter">
            ${icon('headphones', { size: 22 })}
          </button>
          <button type="button" class="bottom-bar-btn" data-bottom-action="next" aria-label="Next chapter">
            ${icon('chevron-right', { size: 20 })}
          </button>
        </nav>
      </div>

      <div class="verse-toolbar" id="verse-toolbar" role="toolbar" aria-label="Verse actions" hidden>
        <div class="verse-toolbar-ref">
          <strong id="verse-toolbar-reference">Verse</strong>
          <span>${version.short}</span>
        </div>
        <span class="toolbar-rule" aria-hidden="true"></span>
        <div class="highlight-swatches" aria-label="Highlight colour">
          ${HIGHLIGHT_COLORS.map((item) => `<button type="button" class="swatch swatch--${item.color}" data-swatch="${item.color}" aria-label="${item.label} highlight" title="${item.label} highlight"></button>`).join('')}
        </div>
        <span class="toolbar-rule" aria-hidden="true"></span>
        <button type="button" class="toolbar-action" data-verse-action="bookmark" aria-label="Save verse" title="Save verse">${icon('bookmark', { size: 17 })}</button>
        <button type="button" class="toolbar-action" data-verse-action="note" aria-label="Write a note" title="Write a note">${icon('pen', { size: 17 })}</button>
        <button type="button" class="toolbar-action" data-verse-action="copy" aria-label="Copy verse" title="Copy verse">${icon('copy', { size: 17 })}</button>
        <button type="button" class="toolbar-action" data-verse-action="share" aria-label="Share verse" title="Share verse">${icon('share', { size: 17 })}</button>
        <button type="button" class="toolbar-action toolbar-close" data-verse-action="close" aria-label="Close verse actions" title="Close">${icon('close', { size: 17 })}</button>
      </div>

      <div class="listen-dock" id="listen-dock" hidden aria-live="polite">
        <span class="listen-bars" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="listen-copy"><strong id="listen-title">Listening</strong><span id="listen-sub">Verse 1</span></div>
        <button type="button" class="listen-btn" data-listen-toggle aria-label="Pause reading">${icon('pause', { size: 16 })}</button>
        <button type="button" class="listen-btn" data-listen-stop aria-label="Stop reading">${icon('stop', { size: 16 })}</button>
      </div>
    </div>`;

  const readerEl = root.querySelector('#reader');
  const sidebar = root.querySelector('#reader-sidebar');
  const scrim = root.querySelector('[data-sidebar-scrim]');
  const filterInput = root.querySelector('#book-filter');
  const clearFilter = root.querySelector('[data-clear-filter]');
  const jumpHost = root.querySelector('#sidebar-jump');
  const content = root.querySelector('#chapter-content');
  const footer = root.querySelector('#chapter-footer');
  const meta = root.querySelector('#chapter-meta');
  const toolbar = root.querySelector('#verse-toolbar');
  const toolbarRef = root.querySelector('#verse-toolbar-reference');
  const listenDock = root.querySelector('#listen-dock');
  const listenBtn = root.querySelector('[data-listen]');
  const focusBtn = root.querySelector('[data-focus]');
  const progressFill = root.querySelector('#reader-progress');
  const bottomBar = root.querySelector('#reader-bottom-bar');

  let destroyed = false;
  let loadToken = 0;
  let chapterData = null;
  let selectedVerse = null;
  let targetTimer = null;

  /* ---------------------------------------------------------------- */
  /* Library sidebar                                                   */
  /* ---------------------------------------------------------------- */

  function fillChapterPanel(item) {
    const panel = item.querySelector('[data-chapter-panel]');
    if (!panel || panel.dataset.filled === 'true') return;
    const slug = item.getAttribute('data-book');
    panel.innerHTML = chapterButtons(slug, chapterNumber, versionId, state.version);
    panel.dataset.filled = 'true';
  }

  function setBookOpen(item, open) {
    if (!item) return;
    const button = item.querySelector('[data-book-toggle]');
    const panel = item.querySelector('[data-chapter-panel]');
    item.classList.toggle('is-open', open);
    button?.setAttribute('aria-expanded', String(open));
    if (panel) {
      if (open) fillChapterPanel(item);
      panel.hidden = !open;
    }
  }

  function closeSidebar() {
    readerEl.classList.remove('sidebar-open');
    scrim.hidden = true;
    document.body.classList.remove('sidebar-lock');
    root.querySelector('#open-library')?.setAttribute('aria-expanded', 'false');
    if (document.activeElement && sidebar.contains(document.activeElement)) {
      root.querySelector('#open-library')?.focus({ preventScroll: true });
    }
  }

  function openSidebar() {
    readerEl.classList.add('sidebar-open');
    scrim.hidden = false;
    document.body.classList.add('sidebar-lock');
    root.querySelector('#open-library')?.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => sidebar.querySelector('[data-sidebar-close]')?.focus({ preventScroll: true }));
  }

  function closeOtherBooks(except) {
    sidebar.querySelectorAll('[data-book-item].is-open').forEach((item) => {
      if (item !== except) setBookOpen(item, false);
    });
  }

  const bookItems = [...sidebar.querySelectorAll('[data-book-item]')];
  function filterBooks(query) {
    const normalized = normalize(query);
    const showClear = query.length > 0;
    if (clearFilter) clearFilter.hidden = !showClear;

    for (const item of bookItems) {
      const book = getBook(item.getAttribute('data-book'));
      const localizedName = item.dataset.localizedName || book.name;
      const haystack = normalize(`${localizedName} ${book.name} ${book.short} ${book.slug}`);
      item.hidden = Boolean(normalized) && !haystack.includes(normalized);
    }

    sidebar.querySelectorAll('[data-testament-group]').forEach((group) => {
      const anyVisible = [...group.querySelectorAll('[data-book-item]')].some((item) => !item.hidden);
      group.hidden = !anyVisible;
    });

    let jumpHref = '';
    let jumpLabel = '';
    if (normalized) {
      const parsed = parseReference(query);
      if (parsed?.book && !parsed.error) {
        const verse = parsed.verse ? `:${parsed.verse}` : '';
        jumpLabel = `${parsed.book.name} ${parsed.chapter}${verse}`;
        jumpHref = readerPath(parsed.book.slug, parsed.chapter, {
          verse: parsed.verse || undefined,
          version: versionId !== state.version ? versionId : undefined,
        });
      } else {
        const matched = matchBook(query);
        if (matched) {
          jumpLabel = `${matched.name} 1`;
          jumpHref = readerPath(matched.slug, 1, {
            version: versionId !== state.version ? versionId : undefined,
          });
        }
      }
    }

    if (jumpHref) {
      jumpHost.hidden = false;
      jumpHost.innerHTML = `<button type="button" class="sidebar-jump-btn" data-sidebar-jump data-href="${jumpHref}">
        <span>${icon('corner-down-right', { size: 15 })} Jump to</span>
        <strong>${escapeHTML(jumpLabel)}</strong>
        ${icon('arrow-right', { size: 15 })}
      </button>`;
    } else {
      jumpHost.hidden = true;
      jumpHost.innerHTML = '';
    }
  }

  /* ---------------------------------------------------------------- */
  /* Chapter loading                                                   */
  /* ---------------------------------------------------------------- */

  function skeletonMarkup() {
    return `<div class="chapter-skeleton" aria-hidden="true">
      <div class="skeleton skeleton--reading"></div>
      <div class="skeleton skeleton--reading"></div>
      <div class="skeleton skeleton--reading skeleton--short"></div>
      <div class="skeleton skeleton--reading"></div>
      <div class="skeleton skeleton--reading skeleton--short"></div>
    </div>`;
  }

  function renderChapter(data) {
    const genreClass = book.genre === 'poetry' ? 'chapter-body--poetry' : 'chapter-body--prose';
    content.className = `chapter-body ${genreClass}`;
    content.lang = version.langCode;
    content.dir = version.direction === 'rtl' ? 'rtl' : 'ltr';
    content.dataset.script = scriptFor(version.langCode);

    // Use localized book name from API if available, fall back to static data
    const localizedBookName = data.bookName || book.name;
    const localizedBookShortName = data.bookShortName || book.shortName;

    // Update reader header with localized book name
    updateReaderHeader(localizedBookName, localizedBookShortName);

    const noteMap = new Map((data.footnotes || []).map((note) => [note.id, note]));
    const blockMarkup = (block) => {
      if (block.type === 'heading') return `<h2 class="chapter-heading">${escapeHTML(block.text)}</h2>`;
      if (block.type === 'subtitle') return `<p class="chapter-subtitle">${escapeHTML(block.text)}</p>`;
      if (block.type === 'verse') return verseMarkup(book, version.id, chapterNumber, block.verse, book.genre, noteMap);
      return '';
    };

    content.innerHTML = data.blocks?.length
      ? data.blocks.map(blockMarkup).join(book.genre === 'poetry' ? '' : ' ')
      : data.verses.map((verse) => verseMarkup(book, version.id, chapterNumber, verse, book.genre, noteMap)).join(book.genre === 'poetry' ? '' : ' ');

    const minutes = Math.max(1, Math.round(data.wordCount / 190));
    meta.innerHTML = `${escapeHTML(version.name)}<span>·</span>${data.verses.length} verses<span>·</span>${minutes} min read`;

    renderFooter();
    updateProgress();

    if (route.verse) {
      const target = content.querySelector(`.verse[data-verse="${Number(route.verse)}"]`);
      if (target) {
        target.classList.add('is-target');
        targetTimer = window.setTimeout(() => {
          const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }, 80);
        window.setTimeout(() => target.classList.remove('is-target'), 3200);
      }
    }
  }

  function renderFooter() {
    if (!chapterData) {
      footer.innerHTML = '';
      return;
    }

    footer.innerHTML = `
      <div class="chapter-endmark">
        ${ornament()}
        <span>Selah</span>
      </div>

      <section class="chapter-reflection">
        <p class="eyebrow">Before you go</p>
        <h2>Let the words <em>settle.</em></h2>
        <p class="reflection-copy">What word or phrase stayed with you? You might read it once more, then carry it into the hours ahead.</p>
        <div class="reflection-actions">
          <button type="button" class="btn btn--quiet btn--small" data-copy-chapter>${icon('copy', { size: 15 })} Copy chapter</button>
          <button type="button" class="btn btn--quiet btn--small" data-share-chapter>${icon('share', { size: 15 })} Share link</button>
          <button type="button" class="text-button" data-open-settings>${icon('type', { size: 14 })} Adjust the text</button>
        </div>
      </section>

      ${(chapterData.footnotes || []).length ? `<section class="chapter-notes" id="chapter-notes">
        <p class="eyebrow">Marginalia</p>
        <h2>Notes on the text.</h2>
        <ol class="footnote-list">
          ${chapterData.footnotes.map((note) => `<li id="footnote-${note.id}" data-note-item="${note.id}">
            <span class="footnote-caller">${escapeHTML(note.caller)}</span>
            <div>
              <p>${escapeHTML(note.text)}</p>
              ${note.reference ? `<a class="footnote-ref" href="${readerPath(book.slug, note.reference.chapter, {
                verse: note.reference.verse,
                version: version.id !== state.version ? version.id : undefined,
              })}">${escapeHTML(referenceLabel(book.slug, note.reference.chapter, note.reference.verse))}</a>` : ''}
            </div>
          </li>`).join('')}
        </ol>
      </section>` : ''}

      ${(chapterData.audio || []).length ? `<section class="chapter-audio" data-chapter-audio>
        <div class="chapter-audio-head">
          <div>
            <p class="eyebrow">Listen</p>
            <h2>Hear this chapter.</h2>
          </div>
          <span class="audio-source">${icon('headphones', { size: 15 })} Chapter recording</span>
        </div>
        <div class="audio-player">
          <button type="button" class="audio-play" data-audio-toggle aria-label="Play chapter audio">${icon('play', { size: 18 })}</button>
          <div class="audio-main">
            <div class="audio-line">
              <strong data-audio-reader-name>${escapeHTML(chapterData.audio[0].reader.charAt(0).toUpperCase() + chapterData.audio[0].reader.slice(1))}</strong>
              <span data-audio-time>0:00</span>
            </div>
            <div class="audio-track" data-audio-track role="slider" tabindex="0" aria-label="Seek chapter audio" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-audio-progress></span></div>
          </div>
          ${chapterData.audio.length > 1 ? `<label class="audio-reader"><span>Reader</span><select data-audio-reader>${chapterData.audio.map((item) => `<option value="${escapeHTML(item.reader)}">${escapeHTML(item.reader.charAt(0).toUpperCase() + item.reader.slice(1))}</option>`).join('')}</select></label>` : ''}
        </div>
        <audio data-audio-element preload="metadata"></audio>
      </section>` : ''}

      <section class="chapter-crossrefs" data-crossrefs>
        <div class="crossrefs-head">
          <div>
            <p class="eyebrow">Related passages</p>
            <h2>Threads through Scripture.</h2>
          </div>
          <button type="button" class="btn btn--quiet btn--small" data-crossrefs-toggle>${icon('link', { size: 15 })} Show references</button>
        </div>
        <div class="crossrefs-body" data-crossrefs-body hidden></div>
      </section>

      ${planFooterMarkup(route, book, chapterNumber)}

      <nav class="chapter-pagination" aria-label="Chapter navigation">
        ${previous ? `<a class="chapter-page-link" href="${navHref(previous)}">
          <span class="chapter-page-direction">${icon('arrow-left', { size: 15 })} Previous</span>
          <strong>${escapeHTML(bookDisplayName(previous.book.slug, previous.chapter))}</strong>
          <span class="chapter-page-book">${escapeHTML(previous.book.name)}</span>
        </a>` : `<div class="chapter-page-link is-empty"><span class="chapter-page-direction">${icon('book-open', { size: 15 })} The beginning</span><strong>Genesis 1</strong><span class="chapter-page-book">Where the story opens</span></div>`}
        ${next ? `<a class="chapter-page-link chapter-page-link--next" href="${navHref(next)}">
          <span class="chapter-page-direction">Next ${icon('arrow-right', { size: 15 })}</span>
          <strong>${escapeHTML(bookDisplayName(next.book.slug, next.chapter))}</strong>
          <span class="chapter-page-book">${escapeHTML(next.book.name)}</span>
        </a>` : `<div class="chapter-page-link chapter-page-link--next is-empty"><span class="chapter-page-direction">The end ${icon('check', { size: 15 })}</span><strong>Revelation 22</strong><span class="chapter-page-book">All things new</span></div>`}
      </nav>

      <div class="reader-footnote">
        <span>${icon('leaf', { size: 14 })} Read slowly. There is no finish line.</span>
        <span>Text: ${escapeHTML(version.name)}</span>
      </div>`;

    setupAudioPlayer();
  }

  let crossRefsToken = 0;

  async function loadCrossRefs(button) {
    const host = footer.querySelector('[data-crossrefs]');
    const body = footer.querySelector('[data-crossrefs-body]');
    if (!host || !body || !button) return;

    if (host.dataset.loaded === 'true') {
      const willShow = body.hidden;
      body.hidden = !willShow;
      button.innerHTML = willShow
        ? `${icon('chevron-up', { size: 15 })} Hide references`
        : `${icon('link', { size: 15 })} Show references`;
      return;
    }

    const chapterToken = loadToken;
    const token = ++crossRefsToken;
    host.dataset.loaded = 'loading';
    button.disabled = true;
    button.innerHTML = `${icon('refresh', { size: 15 })} Gathering references…`;
    body.hidden = false;
    body.innerHTML = '<div class="crossrefs-loading" aria-label="Loading related passages"><span class="skeleton skeleton--reading"></span><span class="skeleton skeleton--reading skeleton--short"></span></div>';

    try {
      const groups = await getCrossReferences(book.slug, chapterNumber);
      if (destroyed || chapterToken !== loadToken || token !== crossRefsToken) return;

      if (!groups.length) {
        body.innerHTML = '<p class="crossrefs-empty">No related passages were found for this chapter.</p>';
      } else {
        body.innerHTML = `<div class="crossrefs-list">${groups.map((group) => {
          const shown = group.references.slice(0, 5);
          const extra = group.references.length - shown.length;
          return `<div class="crossref-row">
            <span class="crossref-verse">${escapeHTML(referenceLabel(book.slug, chapterNumber, group.verse))}</span>
            <div class="crossref-links">
              ${shown.map((reference) => `<a class="crossref-link" href="${readerPath(reference.book, reference.chapter, {
                verse: reference.verse,
                version: version.id !== state.version ? version.id : undefined,
              })}">${escapeHTML(referenceLabel(reference.book, reference.chapter, reference.verse))}${reference.endVerse && reference.endVerse !== reference.verse ? `–${reference.endVerse}` : ''}</a>`).join('')}
              ${extra > 0 ? `<span class="crossref-more">+${extra} more</span>` : ''}
            </div>
          </div>`;
        }).join('')}</div>`;
      }

      host.dataset.loaded = 'true';
      button.disabled = false;
      button.innerHTML = `${icon('chevron-up', { size: 15 })} Hide references`;
    } catch {
      if (destroyed || chapterToken !== loadToken || token !== crossRefsToken) return;
      host.dataset.loaded = 'false';
      body.hidden = true;
      button.disabled = false;
      button.innerHTML = `${icon('refresh', { size: 15 })} Try again`;
      toast('Related passages could not be loaded.', { tone: 'error' });
    }
  }

  async function loadChapter() {
    const token = ++loadToken;
    content.className = 'chapter-content';
    content.innerHTML = skeletonMarkup();
    meta.textContent = 'Opening the chapter…';
    footer.innerHTML = '';
    closeToolbar();

    try {
      const data = await getChapter(version.id, book.slug, chapterNumber);
      if (destroyed || token !== loadToken) return;
      chapterData = data;
      renderChapter(data);
      addHistory(version.id, book.slug, chapterNumber);
      // Fetch localized book names for sidebar
      loadLocalizedBookNames();
    } catch (error) {
      if (destroyed || token !== loadToken) return;
      content.className = 'chapter-content chapter-error';
      content.innerHTML = `<div class="chapter-error-inner">
        <span class="chapter-error-icon">${icon('book-open', { size: 28 })}</span>
        <p class="eyebrow">A quiet interruption</p>
        <h2>We couldn’t open this chapter.</h2>
        <p>${escapeHTML(friendlyError(error))}</p>
        <div class="chapter-error-actions">
          <button type="button" class="btn btn--primary btn--small" data-retry>${icon('refresh', { size: 15 })} Try again</button>
          <a class="btn btn--quiet btn--small" href="#/read/${book.slug}/${chapterNumber}">Reload page</a>
        </div>
      </div>`;
      meta.textContent = 'The passage could not be reached';
    }
  }

  /* ---------------------------------------------------------------- */
  /* Verse selection & actions                                         */
/* ---------------------------------------------------------------- */

/**
 * Fetch localized book names from API and update sidebar book titles.
 */
async function loadLocalizedBookNames() {
  try {
    const apiBooks = await getBooksForVersion(version.id);
    // Create a map of book ID to localized name
    const localizedMap = new Map(apiBooks.map((b) => [b.id, b.name]));
    // Update each book item in the sidebar
    sidebar.querySelectorAll('[data-book-item]').forEach((item) => {
      const bookSlug = item.getAttribute('data-book');
      const bookId = apiBookSlug(version.id, bookSlug);
      const localizedName = localizedMap.get(bookId);
      if (localizedName) {
        const titleEl = item.querySelector('.book-row-title');
        if (titleEl) titleEl.textContent = localizedName;
        // Store for filter/search
        item.dataset.localizedName = localizedName;
      }
    });
  } catch {
    // Silently fail - static names will be used
  }
}

function closeToolbar() {
    toolbar.classList.remove('is-visible');
    toolbar.hidden = true;
    if (selectedVerse) selectedVerse.el.classList.remove('is-selected');
    selectedVerse = null;
  }

  function updateToolbarState() {
    if (!selectedVerse) return;
    const { number } = selectedVerse;
    const saved = isBookmarked(version.id, book.slug, chapterNumber, number);
    const note = getNote(version.id, book.slug, chapterNumber, number);
    const highlight = getHighlight(version.id, book.slug, chapterNumber, number);

    const bookmarkButton = toolbar.querySelector('[data-verse-action="bookmark"]');
    bookmarkButton.innerHTML = icon(saved ? 'bookmark-filled' : 'bookmark', { size: 17 });
    bookmarkButton.classList.toggle('is-active', saved);
    bookmarkButton.setAttribute('aria-pressed', String(saved));
    bookmarkButton.setAttribute('aria-label', saved ? 'Remove from saved verses' : 'Save verse');
    bookmarkButton.title = saved ? 'Remove from saved' : 'Save verse';

    const noteButton = toolbar.querySelector('[data-verse-action="note"]');
    noteButton.classList.toggle('is-active', Boolean(note));
    noteButton.setAttribute('aria-label', note ? 'Edit your note' : 'Write a note');
    noteButton.title = note ? 'Edit note' : 'Write a note';

    toolbar.querySelectorAll('[data-swatch]').forEach((button) => {
      const isCurrent = highlight?.color === button.getAttribute('data-swatch');
      button.classList.toggle('is-current', isCurrent);
      button.setAttribute('aria-pressed', String(isCurrent));
    });
  }

  function selectVerse(element) {
    if (!chapterData) return;
    if (selectedVerse?.el === element) {
      closeToolbar();
      return;
    }
    if (selectedVerse) selectedVerse.el.classList.remove('is-selected');
    const number = Number(element.getAttribute('data-verse'));
    const verse = chapterData.verses.find((item) => item.number === number);
    if (!verse) return;

    selectedVerse = { number, text: verse.text, el: element };
    element.classList.add('is-selected');
    toolbarRef.textContent = referenceLabel(book.slug, chapterNumber, number);
    updateToolbarState();
    toolbar.hidden = false;
    requestAnimationFrame(() => toolbar.classList.add('is-visible'));
  }

  function refreshNoteDot(number, present) {
    const verseEl = content.querySelector(`.verse[data-verse="${number}"]`);
    if (!verseEl) return;
    const dot = verseEl.querySelector('.verse-note-dot');
    if (present && !dot) {
      const span = document.createElement('span');
      span.className = 'verse-note-dot';
      span.title = 'You have a note on this verse';
      span.setAttribute('aria-label', 'You have a note on this verse');
      verseEl.append(span);
    } else if (!present && dot) {
      dot.remove();
    }
  }

  async function handleVerseAction(action) {
    if (!selectedVerse) return;
    const { number, text } = selectedVerse;
    const snapshot = { version: version.id, book: book.slug, chapter: chapterNumber, verse: number, text };

    if (action === 'bookmark') {
      const result = toggleBookmark(snapshot);
      updateToolbarState();
      toast(result.added ? 'Saved to your library.' : 'Removed from saved verses.', {
        actionLabel: 'Undo',
        onAction: () => {
          toggleBookmark(snapshot);
          updateToolbarState();
        },
      });
      return;
    }

    if (action === 'note') {
      const existing = getNote(version.id, book.slug, chapterNumber, number);
      openNoteEditor({
        reference: referenceLabel(book.slug, chapterNumber, number, version.short),
        verseText: text,
        existingNote: existing?.note || '',
        onSave: (value) => {
          const result = saveNote(snapshot, value);
          if (result.saved) toast('Your note was saved.');
          else if (result.removed) toast('Note removed.');
          refreshNoteDot(number, Boolean(result.saved));
          updateToolbarState();
        },
        onDelete: () => {
          saveNote(snapshot, '');
          refreshNoteDot(number, false);
          updateToolbarState();
          toast('Note removed.');
        },
      });
      return;
    }

    if (action === 'copy') {
      const reference = referenceLabel(book.slug, chapterNumber, number, version.short);
      const ok = await copyText(`“${text}”\n— ${reference}`);
      toast(ok ? 'Verse copied.' : 'Could not copy the verse.', { tone: ok ? 'default' : 'error' });
      return;
    }

    if (action === 'share') {
      await shareVerse(number);
      return;
    }

    if (action === 'close') {
      closeToolbar();
    }
  }

  function handleSwatch(color) {
    if (!selectedVerse) return;
    const { number, text } = selectedVerse;
    const result = toggleHighlight(
      { version: version.id, book: book.slug, chapter: chapterNumber, verse: number, text },
      color,
    );
    selectedVerse.el.setAttribute('data-highlight', result.active ? color : '');
    updateToolbarState();
  }

  async function shareVerse(number) {
    const verse = chapterData?.verses.find((item) => item.number === number);
    const path = readerPath(book.slug, chapterNumber, { verse: number, version: version.id });
    const url = `${location.origin}${location.pathname}${path}`;
    const reference = referenceLabel(book.slug, chapterNumber, number, version.short);

    if (navigator.share) {
      try {
        await navigator.share({ title: reference, text: verse ? `“${verse.text}”` : reference, url });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    const ok = await copyText(url);
    toast(ok ? 'Link copied.' : 'Could not copy the link.', { tone: ok ? 'default' : 'error' });
  }

  async function copyChapter() {
    if (!chapterData) return;
    const text = `${plainTitle} (${version.short})\n\n${chapterData.verses.map((verse) => verse.text).join(' ')}`;
    const ok = await copyText(text);
    toast(ok ? 'Chapter copied.' : 'Could not copy the chapter.', { tone: ok ? 'default' : 'error' });
  }

  async function shareChapter() {
    const path = readerPath(book.slug, chapterNumber, { version: version.id });
    const url = `${location.origin}${location.pathname}${path}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${plainTitle} · Selah`, text: `Read ${plainTitle}`, url });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    const ok = await copyText(url);
    toast(ok ? 'Link copied.' : 'Could not copy the link.', { tone: ok ? 'default' : 'error' });
  }

  /* ---------------------------------------------------------------- */
  /* Read-aloud                                                        */
  /* ---------------------------------------------------------------- */

  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  let speechActive = false;
  let speechPaused = false;
  let speechIndex = 0;
  let speechSerial = 0;
  let currentUtterance = null;
  let nativeAudio = null;

  function formatAudioTime(seconds) {
    const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  }

  function stopNativeAudio({ clearMarks = true } = {}) {
    if (nativeAudio) {
      const { el } = nativeAudio;
      nativeAudio = null;
      try {
        el.pause();
        el.removeAttribute('src');
        el.load();
      } catch {
        /* no-op */
      }
    }
    if (clearMarks) clearSpeakingMarks();
  }

  function setupAudioPlayer() {
    stopNativeAudio({ clearMarks: true });
    const host = footer.querySelector('[data-chapter-audio]');
    if (!host || !chapterData?.audio?.length) return;

    const el = host.querySelector('[data-audio-element]');
    const playButton = host.querySelector('[data-audio-toggle]');
    const track = host.querySelector('[data-audio-track]');
    const progress = host.querySelector('[data-audio-progress]');
    const timeLabel = host.querySelector('[data-audio-time]');
    const readerName = host.querySelector('[data-audio-reader-name]');
    const readerSelect = host.querySelector('[data-audio-reader]');
    let reader = chapterData.audio[0].reader;
    let timings = null;
    let timingsToken = 0;
    let lastVerse = null;

    const readerLabel = (value) => value.charAt(0).toUpperCase() + value.slice(1);

    function setSource() {
      const entry = chapterData.audio.find((item) => item.reader === reader) || chapterData.audio[0];
      el.src = entry.url;
      if (readerName) readerName.textContent = readerLabel(reader);
    }

    async function loadTimings() {
      const token = ++timingsToken;
      timings = null;
      lastVerse = null;
      const path = chapterData.audioTimings?.[reader];
      if (!path) return;
      try {
        const data = await getAudioTimings(path);
        if (token === timingsToken) timings = data;
      } catch {
        /* Timing metadata is optional; audio still plays without it. */
      }
    }

    function update() {
      const duration = Number.isFinite(el.duration) ? el.duration : 0;
      const percent = duration > 0 ? Math.min(100, (el.currentTime / duration) * 100) : 0;
      if (progress) progress.style.width = `${percent}%`;
      if (timeLabel) {
        timeLabel.textContent = duration > 0
          ? `${formatAudioTime(el.currentTime)} / ${formatAudioTime(duration)}`
          : formatAudioTime(el.currentTime);
      }
      if (track) track.setAttribute('aria-valuenow', String(Math.round(percent)));
      if (playButton) {
        playButton.innerHTML = icon(el.paused ? 'play' : 'pause', { size: 18 });
        playButton.setAttribute('aria-label', el.paused ? 'Play chapter audio' : 'Pause chapter audio');
      }
    }

    function syncVerse() {
      if (!Array.isArray(timings) || !timings.length) return;
      let index = 0;
      for (let i = 0; i < timings.length; i += 1) {
        if (el.currentTime >= timings[i]) index = i;
        else break;
      }
      const verse = chapterData.verses[index];
      if (verse && verse.number !== lastVerse) {
        lastVerse = verse.number;
        markSpeaking(verse.number);
      }
    }

    el.addEventListener('play', () => {
      stopSpeech();
      update();
    });
    el.addEventListener('pause', update);
    el.addEventListener('ended', () => {
      clearSpeakingMarks();
      lastVerse = null;
      update();
    });
    el.addEventListener('loadedmetadata', update);
    el.addEventListener('timeupdate', () => {
      update();
      syncVerse();
    });

    playButton?.addEventListener('click', () => {
      if (el.paused) {
        stopSpeech();
        el.play().catch(() => toast('The recording could not be played.', { tone: 'error' }));
      } else {
        el.pause();
      }
    });

    const seek = (event) => {
      const duration = el.duration;
      if (!Number.isFinite(duration) || duration <= 0 || !track) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      el.currentTime = ratio * duration;
    };
    track?.addEventListener('click', seek);
    track?.addEventListener('keydown', (event) => {
      if (!Number.isFinite(el.duration)) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        el.currentTime = Math.min(el.duration, el.currentTime + 15);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        el.currentTime = Math.max(0, el.currentTime - 15);
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        playButton?.click();
      }
    });

    readerSelect?.addEventListener('change', () => {
      const wasPlaying = !el.paused;
      reader = readerSelect.value;
      el.pause();
      setSource();
      el.load();
      loadTimings();
      update();
      if (wasPlaying) {
        el.play().catch(() => toast('The recording could not be played.', { tone: 'error' }));
      }
    });

    nativeAudio = { el };
    setSource();
    loadTimings();
    update();
  }

  function preferredVoice() {
    if (!synth) return null;
    try {
      const voices = synth.getVoices().filter((voice) => /^en[-_]/i.test(voice.lang));
      return voices.find((voice) => /Samantha|Daniel|Serena|Google US English|Microsoft (Aria|Jenny|Guy)/i.test(voice.name))
        || voices[0]
        || null;
    } catch {
      return null;
    }
  }

  function clearSpeakingMarks() {
    content.querySelectorAll('.verse.is-speaking').forEach((element) => element.classList.remove('is-speaking'));
  }

  function markSpeaking(number) {
    clearSpeakingMarks();
    const verseEl = content.querySelector(`.verse[data-verse="${number}"]`);
    verseEl?.classList.add('is-speaking');
    if (verseEl) {
      const rect = verseEl.getBoundingClientRect();
      if (rect.top < 90 || rect.bottom > window.innerHeight - 100) {
        verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function updateListenUI() {
    if (!listeningUI()) return;
    const pauseButton = listenDock.querySelector('[data-listen-toggle]');
    listenDock.hidden = !speechActive;
    if (!speechActive) {
      listenBtn.classList.remove('is-active');
      listenBtn.setAttribute('aria-label', 'Listen to this chapter');
      return;
    }
    listenBtn.classList.add('is-active');
    listenBtn.setAttribute('aria-label', speechPaused ? 'Resume read-aloud' : 'Pause read-aloud');
    pauseButton.innerHTML = icon(speechPaused ? 'play' : 'pause', { size: 16 });
    pauseButton.setAttribute('aria-label', speechPaused ? 'Resume reading' : 'Pause reading');
    const verse = chapterData?.verses[speechIndex];
    const title = listenDock.querySelector('#listen-title');
    const sub = listenDock.querySelector('#listen-sub');
    if (title) title.textContent = speechPaused ? 'Paused' : 'Listening';
    if (sub) sub.textContent = verse ? `Verse ${verse.number} of ${chapterData.verses.length}` : 'Finishing';
  }

  function listeningUI() {
    return Boolean(listenDock && listenBtn);
  }

  function speakCurrent() {
    if (!speechActive || !chapterData) return;
    const verse = chapterData.verses[speechIndex];
    if (!verse) {
      stopSpeech();
      return;
    }
    const serial = speechSerial;
    markSpeaking(verse.number);
    updateListenUI();
    const utterance = new SpeechSynthesisUtterance(verse.text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    const voice = preferredVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (!speechActive || speechPaused || serial !== speechSerial) return;
      speechIndex += 1;
      if (speechIndex >= chapterData.verses.length) {
        stopSpeech();
      } else {
        speakCurrent();
      }
    };
    utterance.onerror = () => {
      if (serial === speechSerial) stopSpeech();
    };
    currentUtterance = utterance;
    try {
      synth.speak(utterance);
    } catch {
      stopSpeech();
      toast('Read-aloud is not available in this browser.', { tone: 'error' });
    }
  }

  function startSpeech(fromVerse) {
    if (!synth || typeof SpeechSynthesisUtterance === 'undefined') {
      toast('Read-aloud is not available in this browser.', { tone: 'error' });
      return;
    }
    if (!chapterData?.verses?.length) return;
    stopNativeAudio();
    speechSerial += 1;
    try { synth.cancel(); } catch { /* no-op */ }
    speechActive = true;
    speechPaused = false;
    let index = chapterData.verses.findIndex((verse) => verse.number >= fromVerse);
    if (index < 0) index = 0;
    speechIndex = index;
    speakCurrent();
  }

  function stopSpeech() {
    speechSerial += 1;
    speechActive = false;
    speechPaused = false;
    currentUtterance = null;
    try { synth?.cancel(); } catch { /* no-op */ }
    clearSpeakingMarks();
    updateListenUI();
  }

  function toggleSpeech() {
    if (!speechActive) {
      startSpeech(selectedVerse?.number || 1);
      return;
    }
    if (speechPaused) {
      try { synth.resume(); } catch { /* no-op */ }
      speechPaused = false;
    } else {
      try { synth.pause(); } catch { /* no-op */ }
      speechPaused = true;
    }
    updateListenUI();
  }

  /* ---------------------------------------------------------------- */
  /* Focus & progress                                                  */
  /* ---------------------------------------------------------------- */

  function setFocus(enabled) {
    document.body.classList.toggle('focus-mode', enabled);
    focusBtn.setAttribute('aria-pressed', String(enabled));
    focusBtn.setAttribute('aria-label', enabled ? 'Exit focus mode' : 'Enter focus mode');
    focusBtn.innerHTML = icon(enabled ? 'minimize' : 'maximize', { size: 17 });
    if (enabled) closeSidebar();
  }

  function toggleFocus() {
    setFocus(!document.body.classList.contains('focus-mode'));
  }

  function updateProgress() {
    if (!progressFill) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
    progressFill.style.width = `${percent}%`;
  }

  /* ---------------------------------------------------------------- */
  /* Events                                                            */
  /* ---------------------------------------------------------------- */

  function onRootClick(event) {
    const target = event.target;

    const closeSidebarButton = target.closest('[data-sidebar-close]');
    if (closeSidebarButton) {
      closeSidebar();
      return;
    }

    if (target.closest('#open-library')) {
      if (readerEl.classList.contains('sidebar-open')) closeSidebar();
      else openSidebar();
      return;
    }

    if (target.closest('[data-sidebar-scrim]')) {
      closeSidebar();
      return;
    }

    const jump = target.closest('[data-sidebar-jump]');
    if (jump) {
      const href = jump.getAttribute('data-href');
      if (href) location.hash = href;
      return;
    }

    const bookToggle = target.closest('[data-book-toggle]');
    if (bookToggle) {
      const item = bookToggle.closest('[data-book-item]');
      const willOpen = !item.classList.contains('is-open');
      closeOtherBooks(item);
      setBookOpen(item, willOpen);
      return;
    }

    if (target.closest('[data-clear-filter]')) {
      filterInput.value = '';
      filterBooks('');
      filterInput.focus();
      return;
    }

    const versionButton = target.closest('[data-version-picker]');
    if (versionButton) {
      ctx.openVersionPicker();
      return;
    }

    if (target.closest('[data-open-settings]')) {
      ctx.openSettings();
      return;
    }

    const footnoteMarker = target.closest('.verse-footnote');
    if (footnoteMarker) {
      const item = footer.querySelector(`#footnote-${footnoteMarker.getAttribute('data-note-id')}`);
      if (item) {
        item.classList.add('is-target');
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => item.classList.remove('is-target'), 2400);
      }
      return;
    }

    const crossrefsButton = target.closest('[data-crossrefs-toggle]');
    if (crossrefsButton) {
      loadCrossRefs(crossrefsButton);
      return;
    }

    if (target.closest('[data-focus]')) {
      toggleFocus();
      return;
    }

    if (target.closest('[data-listen]')) {
      toggleSpeech();
      return;
    }

    if (target.closest('[data-listen-toggle]')) {
      toggleSpeech();
      return;
    }

    if (target.closest('[data-listen-stop]')) {
      stopSpeech();
      return;
    }

    const bottomBtn = target.closest('[data-bottom-action]');
    if (bottomBtn) {
      const action = bottomBtn.getAttribute('data-bottom-action');
      if (action === 'prev' && previous) {
        location.href = readerPath(previous.book.slug, previous.chapter, {
          version: versionId !== state.version ? versionId : undefined,
        });
      } else if (action === 'next' && next) {
        location.href = readerPath(next.book.slug, next.chapter, {
          version: versionId !== state.version ? versionId : undefined,
        });
      } else if (action === 'listen') {
        toggleSpeech();
      }
      return;
    }

    const swatch = target.closest('[data-swatch]');
    if (swatch) {
      handleSwatch(swatch.getAttribute('data-swatch'));
      return;
    }

    const toolbarAction = target.closest('[data-verse-action]');
    if (toolbarAction) {
      handleVerseAction(toolbarAction.getAttribute('data-verse-action'));
      return;
    }

    const copyChapterButton = target.closest('[data-copy-chapter]');
    if (copyChapterButton) {
      copyChapter();
      return;
    }

    const shareChapterButton = target.closest('[data-share-chapter]');
    if (shareChapterButton) {
      shareChapter();
      return;
    }

    const retry = target.closest('[data-retry]');
    if (retry) {
      loadChapter();
      return;
    }

    const planToggle = target.closest('[data-plan-toggle]');
    if (planToggle) {
      const planId = planToggle.getAttribute('data-plan-id');
      const dayNumber = Number(planToggle.getAttribute('data-day'));
      const completed = togglePlanDay(planId, dayNumber);
      planToggle.classList.toggle('btn--done', completed);
      planToggle.classList.toggle('btn--quiet', !completed);
      planToggle.setAttribute('aria-pressed', String(completed));
      planToggle.innerHTML = completed
        ? `${icon('check', { size: 15 })} Day complete`
        : `${icon('circle', { size: 15 })} Mark day complete`;
      toast(completed ? 'Day marked complete. Keep going.' : 'Day marked incomplete.');
      return;
    }

    const verse = target.closest('.verse');
    if (verse && content.contains(verse)) {
      selectVerse(verse);
    }
  }

  const onFilterInput = () => filterBooks(filterInput.value);
  const onFilterKeydown = (event) => {
    if (event.key === 'Enter') {
      const jump = jumpHost.querySelector('[data-sidebar-jump]');
      if (jump?.getAttribute('data-href')) {
        location.hash = jump.getAttribute('data-href');
      }
    }
    if (event.key === 'Escape') {
      filterInput.value = '';
      filterBooks('');
      filterInput.blur();
    }
  };

  const onOutsidePointerDown = (event) => {
    if (!selectedVerse) return;
    const target = event.target;
    if (toolbar.contains(target) || selectedVerse.el.contains(target) || target.closest('.modal-layer') || target.closest('.drawer-layer')) {
      return;
    }
    closeToolbar();
  };

  const onKeyDown = (event) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    const isTyping = target instanceof HTMLElement && (
      target.matches('input, textarea, select') || target.isContentEditable
    );
    if (isTyping) return;
    if (document.querySelector('.modal-layer') || document.querySelector('.drawer-layer')) return;

    if (event.key === 'Escape') {
      if (readerEl.classList.contains('sidebar-open')) {
        closeSidebar();
        return;
      }
      if (selectedVerse) {
        closeToolbar();
        return;
      }
      if (document.body.classList.contains('focus-mode')) {
        setFocus(false);
      }
      return;
    }

    if (event.key === 'ArrowRight' && next) {
      event.preventDefault();
      location.hash = navHref(next);
      return;
    }
    if (event.key === 'ArrowLeft' && previous) {
      event.preventDefault();
      location.hash = navHref(previous);
      return;
    }
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleFocus();
      return;
    }
    if (event.key.toLowerCase() === 'l') {
      event.preventDefault();
      toggleSpeech();
    }
  };

  const onVerseKeydown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const verse = event.target.closest('.verse');
    if (!verse) return;
    event.preventDefault();
    selectVerse(verse);
  };

  function bind() {
    root.addEventListener('click', onRootClick);
    content.addEventListener('keydown', onVerseKeydown);
    filterInput.addEventListener('input', onFilterInput);
    filterInput.addEventListener('keydown', onFilterKeydown);
    document.addEventListener('pointerdown', onOutsidePointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    sidebar.querySelector('.book-item.is-active')?.classList.add('is-open');
  }

  bind();
  loadChapter();

  return {
    cleanup() {
      destroyed = true;
      loadToken += 1;
      if (targetTimer) clearTimeout(targetTimer);
      stopSpeech();
      stopNativeAudio({ clearMarks: true });
      closeSidebar();
      document.body.classList.remove('focus-mode');
      root.removeEventListener('click', onRootClick);
      content.removeEventListener('keydown', onVerseKeydown);
      document.removeEventListener('pointerdown', onOutsidePointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      footer.innerHTML = '';
    },
  };
}
