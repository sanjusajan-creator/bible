import {
  BOOKS,
  BOOK_GROUPS,
  STORY,
  TOPICS,
  bookDisplayName,
  readerPath,
} from '../data.js';
import { getState } from '../store.js';
import { escapeHTML, icon, ornament } from '../ui.js';

function topicCard(topic, index) {
  return `<a class="topic-card" href="#/explore/${topic.id}" data-tone="${topic.tone}" data-reveal>
    <div class="topic-card-top">
      <span class="topic-icon">${icon(topic.icon, { size: 22 })}</span>
      <span class="topic-index">${String(index + 1).padStart(2, '0')}</span>
    </div>
    <div class="topic-card-copy">
      <h2>${escapeHTML(topic.title)}</h2>
      <p>${escapeHTML(topic.subtitle)}</p>
      <span class="topic-count">${topic.refs.length} passages</span>
    </div>
    <span class="topic-card-arrow">${icon('arrow-up-right', { size: 17 })}</span>
  </a>`;
}

function storyRow(item, index) {
  return `<a class="story-row" href="${readerPath(item.book, item.chapter)}" data-tone="${item.tone}" data-reveal>
    <span class="story-row-numeral">${escapeHTML(item.numeral)}</span>
    <div class="story-row-main">
      <span class="story-row-meta">Movement ${String(index + 1).padStart(2, '0')} · ${escapeHTML(bookDisplayName(item.book, item.chapter))}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.description)}</p>
    </div>
    <span class="story-row-subtitle">${escapeHTML(item.subtitle)}</span>
    <span class="story-row-arrow">${icon('arrow-right', { size: 16 })}</span>
  </a>`;
}

function bookCard(book, versionId) {
  return `<a class="book-card" href="${readerPath(book.slug, 1, { version: versionId !== getState().version ? versionId : undefined })}" data-book data-scope="${book.testament}" data-name="${escapeHTML(`${book.name} ${book.short} ${book.slug}`.toLowerCase())}" data-reveal>
    <span class="book-card-mark">${escapeHTML(book.short)}</span>
    <span class="book-card-copy">
      <strong>${escapeHTML(book.name)}</strong>
      <span>${book.chapters} chapter${book.chapters === 1 ? '' : 's'}</span>
    </span>
    <span class="book-card-arrow">${icon('arrow-up-right', { size: 15 })}</span>
  </a>`;
}

function bookGroup(group, versionId) {
  const books = BOOKS.filter((book) => book.group === group);
  if (!books.length) return '';
  return `<section class="library-group" data-library-group>
    <div class="library-group-head">
      <h3>${escapeHTML(group)}</h3>
      <span>${books.length} book${books.length === 1 ? '' : 's'}</span>
    </div>
    <div class="book-grid">
      ${books.map((book) => bookCard(book, versionId)).join('')}
    </div>
  </section>`;
}

export function render(root, route, ctx) {
  const state = getState();
  const version = state.version;

  root.innerHTML = `
    <section class="page-hero explore-hero">
      <div class="shell page-hero-inner">
        <div class="page-hero-copy">
          <p class="eyebrow" data-reveal><span class="eyebrow-mark"></span>Explore</p>
          <h1 class="page-title" data-reveal>Wander through<br /><em>the story.</em></h1>
          <p class="page-lede" data-reveal>Ten doorways into Scripture for whatever season you are carrying. Or open the whole library and begin anywhere.</p>
          <div class="page-hero-actions" data-reveal>
            <a class="btn btn--primary" href="#/search">Search the Word ${icon('search', { size: 16 })}</a>
            <a class="btn btn--ghost" href="#/plans">Find a rhythm</a>
          </div>
        </div>
        <div class="explore-hero-art" aria-hidden="true" data-reveal>
          <span class="explore-orbit explore-orbit--one"></span>
          <span class="explore-orbit explore-orbit--two"></span>
          <span class="explore-sun"></span>
          <span class="explore-arch"></span>
          <span class="explore-word">Selah</span>
          <span class="explore-subword">pause · breathe · return</span>
        </div>
      </div>
    </section>

    <section class="shell section section--topics">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">By season</p>
          <h2>What are you carrying today?</h2>
        </div>
        <p class="section-aside">Each collection holds four passages, chosen for a moment like this one.</p>
      </div>
      <div class="topic-grid">
        ${TOPICS.map(topicCard).join('')}
      </div>
    </section>

    <section class="section story-section">
      <div class="shell">
        <div class="section-head" data-reveal>
          <div>
            <p class="eyebrow">The metanarrative</p>
            <h2>The story in twelve movements.</h2>
          </div>
          <a class="text-link" href="#/plans/story">Read it as a plan ${icon('arrow-right', { size: 15 })}</a>
        </div>
        <div class="story-timeline">
          ${STORY.map(storyRow).join('')}
        </div>
      </div>
    </section>

    <section class="shell section library-section" id="library">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">The library</p>
          <h2>Sixty-six books.<br /><em>One story.</em></h2>
        </div>
        <p class="section-aside">Every chapter of every book, in the translation you choose.</p>
      </div>

      <div class="library-toolbar" data-reveal>
        <div class="library-tabs" role="tablist" aria-label="Filter by testament">
          <button type="button" class="library-tab is-active" data-scope="all" role="tab" aria-selected="true">All <span>66</span></button>
          <button type="button" class="library-tab" data-scope="old" role="tab" aria-selected="false">Old Testament <span>39</span></button>
          <button type="button" class="library-tab" data-scope="new" role="tab" aria-selected="false">New Testament <span>27</span></button>
        </div>
        <div class="library-search">
          ${icon('search', { size: 16 })}
          <input type="search" id="library-search" placeholder="Find a book…" autocomplete="off" aria-label="Find a book" />
          <button type="button" class="search-clear" data-clear-library aria-label="Clear search" hidden>${icon('close', { size: 13 })}</button>
        </div>
      </div>

      <div class="library-count" id="library-count">${BOOKS.length} books</div>

      <div class="library-groups" id="library-groups">
        ${BOOK_GROUPS.map((group) => bookGroup(group, version)).join('')}
      </div>

      <div class="library-empty" id="library-empty" hidden>
        ${ornament()}
        <h3>No books found.</h3>
        <p>Try a different name, or clear the search to see the whole library.</p>
        <button type="button" class="text-button" data-clear-library>Show all books</button>
      </div>
    </section>

    <section class="shell closing-invite closing-invite--explore" data-reveal>
      ${ornament()}
      <p class="eyebrow">A quieter way in</p>
      <h2>You do not have to read<br /><em>the whole Bible at once.</em></h2>
      <p class="closing-ref">One chapter is enough for today.</p>
      <div class="closing-actions">
        <a class="btn btn--primary" href="#/read/psalms/23">Begin with Psalm 23 ${icon('arrow-right', { size: 16 })}</a>
        <a class="btn btn--ghost" href="#/plans/stillness">Seven days of stillness</a>
      </div>
    </section>
  `;

  const searchInput = root.querySelector('#library-search');
  const clearButtons = root.querySelectorAll('[data-clear-library]');
  const empty = root.querySelector('#library-empty');
  const countEl = root.querySelector('#library-count');
  const groups = [...root.querySelectorAll('[data-library-group]')];
  const books = [...root.querySelectorAll('[data-book]')];
  let scope = 'all';

  function updateLibrary() {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    for (const book of books) {
      const testamentMatch = scope === 'all' || book.getAttribute('data-scope') === scope;
      const searchMatch = !query || book.getAttribute('data-name').includes(query);
      const show = testamentMatch && searchMatch;
      book.hidden = !show;
      if (show) visible += 1;
    }

    for (const group of groups) {
      const hasVisible = [...group.querySelectorAll('[data-book]')].some((book) => !book.hidden);
      group.hidden = !hasVisible;
    }

    empty.hidden = visible > 0;
    countEl.textContent = `${visible} book${visible === 1 ? '' : 's'}`;
    clearButtons.forEach((button) => { button.hidden = !query; });
  }

  const onRootClick = (event) => {
    const tab = event.target.closest('.library-tab[data-scope]');
    if (tab) {
      scope = tab.getAttribute('data-scope');
      root.querySelectorAll('.library-tab[data-scope]').forEach((button) => {
        const active = button === tab;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
      });
      updateLibrary();
      return;
    }

    if (event.target.closest('[data-clear-library]')) {
      searchInput.value = '';
      updateLibrary();
      searchInput.focus();
    }
  };

  const onSearch = () => updateLibrary();
  const onSearchKeydown = (event) => {
    if (event.key === 'Escape') {
      searchInput.value = '';
      updateLibrary();
      searchInput.blur();
    }
  };

  root.addEventListener('click', onRootClick);
  searchInput.addEventListener('input', onSearch);
  searchInput.addEventListener('keydown', onSearchKeydown);

  return {
    cleanup() {
      root.removeEventListener('click', onRootClick);
      searchInput.removeEventListener('input', onSearch);
      searchInput.removeEventListener('keydown', onSearchKeydown);
    },
  };
}
