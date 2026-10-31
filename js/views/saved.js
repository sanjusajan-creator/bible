import { bookDisplayName, getBook, getVersion, readerPath, referenceLabel } from '../data.js';
import {
  exportData,
  getState,
  libraryCounts,
  removeBookmark,
  removeHighlight,
  removeNote,
  restoreLibraryItem,
} from '../store.js';
import {
  copyText,
  downloadFile,
  escapeHTML,
  formatDate,
  icon,
  ornament,
  timeAgo,
  toast,
} from '../ui.js';

const TABS = [
  { id: 'bookmarks', label: 'Saved', icon: 'bookmark' },
  { id: 'highlights', label: 'Highlights', icon: 'highlighter' },
  { id: 'notes', label: 'Notes', icon: 'pen' },
  { id: 'history', label: 'History', icon: 'clock' },
];

function savedReference(item) {
  return referenceLabel(item.book, item.chapter, item.verse, getVersion(item.version).short);
}

function itemLink(item) {
  return readerPath(item.book, item.chapter, {
    verse: item.verse,
    version: item.version,
  });
}

function emptyState(tab) {
  const content = {
    bookmarks: {
      icon: 'bookmark',
      title: 'No saved verses yet.',
      copy: 'When a line catches you, select the verse and tap the bookmark. It will wait for you here.',
      action: 'Open the reader',
      href: '#/read/psalms/23',
    },
    highlights: {
      icon: 'highlighter',
      title: 'Nothing highlighted yet.',
      copy: 'Select any verse while reading and choose a quiet colour. Your highlights will gather here.',
      action: 'Begin reading',
      href: '#/read/psalms/23',
    },
    notes: {
      icon: 'pen',
      title: 'The margins are waiting.',
      copy: 'Select a verse and write what stirs in you. Notes stay on this device, for your eyes only.',
      action: 'Explore a passage',
      href: '#/explore',
    },
    history: {
      icon: 'clock',
      title: 'No reading history yet.',
      copy: 'Every chapter you open will leave a gentle trail here, so you can always find your way back.',
      action: 'Start with Psalm 23',
      href: '#/read/psalms/23',
    },
  }[tab];

  return `<div class="saved-empty">
    ${ornament()}
    <span class="saved-empty-icon">${icon(content.icon, { size: 30 })}</span>
    <h2>${escapeHTML(content.title)}</h2>
    <p>${escapeHTML(content.copy)}</p>
    <a class="btn btn--primary btn--small" href="${content.href}">${escapeHTML(content.action)} ${icon('arrow-right', { size: 15 })}</a>
  </div>`;
}

function savedCard(item, kind) {
  const version = getVersion(item.version);
  const reference = savedReference(item);
  const note = item.note || '';
  return `<article class="saved-card" data-kind="${kind}" data-id="${escapeHTML(item.id)}" ${kind === 'highlights' ? `data-tone="${item.color}"` : ''}>
    <div class="saved-card-top">
      <div class="saved-card-ref">
        <span class="saved-ref-main">${escapeHTML(reference)}</span>
        <span class="saved-version">${escapeHTML(version.short)}</span>
      </div>
      <button type="button" class="saved-remove" data-remove-kind="${kind}" data-remove-id="${escapeHTML(item.id)}" aria-label="Remove ${escapeHTML(reference)}" title="Remove">${icon('trash', { size: 15 })}</button>
    </div>
    ${note ? `<div class="saved-note"><span>${icon('pen', { size: 13 })} Your note</span><p>${escapeHTML(note)}</p></div>` : ''}
    <blockquote class="saved-quote">“${escapeHTML(item.text)}”</blockquote>
    <div class="saved-card-foot">
      <span class="saved-date">${kind === 'notes' ? `Edited ${timeAgo(item.updatedAt || item.createdAt)}` : `Saved ${timeAgo(item.createdAt)}`}</span>
      <div class="saved-card-actions">
        <button type="button" class="saved-action" data-copy-kind="${kind}" data-copy-id="${escapeHTML(item.id)}">${icon('copy', { size: 14 })}<span>Copy</span></button>
        <a class="saved-action" href="${itemLink(item)}">${icon('book-open', { size: 14 })}<span>Open</span></a>
      </div>
    </div>
  </article>`;
}

function historyRow(item) {
  const book = getBook(item.book);
  if (!book) return '';
  const version = getVersion(item.version);
  return `<a class="history-row" href="${readerPath(item.book, item.chapter, { version: item.version })}">
    <span class="history-mark">${escapeHTML(book.short)}</span>
    <span class="history-copy">
      <strong>${escapeHTML(bookDisplayName(item.book, item.chapter))}</strong>
      <span>${escapeHTML(version.short)} · ${escapeHTML(timeAgo(item.at))}</span>
    </span>
    <span class="history-arrow">${icon('arrow-right', { size: 15 })}</span>
  </a>`;
}

function listMarkup(tab, state) {
  if (tab === 'bookmarks') {
    if (!state.bookmarks.length) return emptyState(tab);
    return `<div class="saved-grid">${state.bookmarks.map((item) => savedCard(item, 'bookmarks')).join('')}</div>`;
  }
  if (tab === 'highlights') {
    if (!state.highlights.length) return emptyState(tab);
    return `<div class="saved-grid">${state.highlights.map((item) => savedCard(item, 'highlights')).join('')}</div>`;
  }
  if (tab === 'notes') {
    if (!state.notes.length) return emptyState(tab);
    return `<div class="saved-grid">${state.notes.map((item) => savedCard(item, 'notes')).join('')}</div>`;
  }
  if (!state.history.length) return emptyState('history');
  return `<div class="history-list">
    <div class="history-head">
      <p class="eyebrow">Recently opened</p>
      <span>${state.history.length} chapter${state.history.length === 1 ? '' : 's'} in your trail</span>
    </div>
    ${state.history.map(historyRow).join('')}
  </div>`;
}

export function render(root, route) {
  const state = getState();
  const counts = libraryCounts();
  let activeTab = TABS.some((tab) => tab.id === route.tab) ? route.tab : 'bookmarks';

  const tabCount = (id) => {
    if (id === 'bookmarks') return state.bookmarks.length;
    if (id === 'highlights') return state.highlights.length;
    if (id === 'notes') return state.notes.length;
    return state.history.length;
  };

  root.innerHTML = `
    <section class="page-hero page-hero--compact library-hero">
      <div class="shell page-hero-inner">
        <div class="page-hero-copy">
          <p class="eyebrow" data-reveal><span class="eyebrow-mark"></span>Your library</p>
          <h1 class="page-title" data-reveal>Words you wanted<br /><em>to keep.</em></h1>
          <p class="page-lede" data-reveal>Saved verses, highlights, notes, and the chapters you have wandered through. Kept privately on this device.</p>
        </div>
        <div class="library-stats" data-reveal>
          <div><strong>${counts.bookmarks}</strong><span>saved verses</span></div>
          <div><strong>${counts.highlights}</strong><span>highlights</span></div>
          <div><strong>${counts.notes}</strong><span>notes</span></div>
          <div><strong>${counts.chapters}</strong><span>chapters opened</span></div>
        </div>
      </div>
    </section>

    <section class="shell section saved-section">
      <div class="saved-toolbar" data-reveal>
        <div class="saved-tabs" role="tablist" aria-label="Library sections">
          ${TABS.map((tab) => `<button type="button" class="saved-tab ${tab.id === activeTab ? 'is-active' : ''}" data-saved-tab="${tab.id}" role="tab" aria-selected="${tab.id === activeTab}">
            ${icon(tab.icon, { size: 15 })}<span>${tab.label}</span><em>${tabCount(tab.id)}</em>
          </button>`).join('')}
        </div>
        <button type="button" class="btn btn--quiet btn--small saved-export" data-export-library>${icon('download', { size: 15 })} Export library</button>
      </div>

      <div class="saved-content" id="saved-content">
        ${listMarkup(activeTab, state)}
      </div>

      <div class="privacy-note">
        ${icon('info', { size: 14 })}
        <p>Your saved verses, notes, and reading history never leave this browser. Export a copy whenever you like.</p>
      </div>
    </section>

    <section class="shell closing-invite closing-invite--small saved-invite" data-reveal>
      ${ornament()}
      <p class="eyebrow">Keep returning</p>
      <h2>The Word is not a place<br /><em>you visit once.</em></h2>
      <div class="closing-actions">
        <a class="btn btn--primary" href="#/read/psalms/23">Open the reader ${icon('arrow-right', { size: 16 })}</a>
        <a class="btn btn--ghost" href="#/plans">Find a daily rhythm</a>
      </div>
    </section>
  `;

  const content = root.querySelector('#saved-content');
  const tabs = root.querySelectorAll('[data-saved-tab]');

  function renderTab(tab) {
    activeTab = tab;
    tabs.forEach((button) => {
      const active = button.getAttribute('data-saved-tab') === tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    content.innerHTML = listMarkup(tab, getState());
  }

  function findItem(kind, id) {
    const stateNow = getState();
    if (kind === 'bookmarks') return stateNow.bookmarks.find((item) => item.id === id);
    if (kind === 'highlights') return stateNow.highlights.find((item) => item.id === id);
    if (kind === 'notes') return stateNow.notes.find((item) => item.id === id);
    return null;
  }

  function removeItem(kind, id) {
    let removed = null;
    if (kind === 'bookmarks') removed = removeBookmark(id);
    if (kind === 'highlights') removed = removeHighlight(id);
    if (kind === 'notes') removed = removeNote(id);
    return removed;
  }

  const onRootClick = (event) => {
    const tabButton = event.target.closest('[data-saved-tab]');
    if (tabButton) {
      renderTab(tabButton.getAttribute('data-saved-tab'));
      return;
    }

    const removeButton = event.target.closest('[data-remove-kind]');
    if (removeButton) {
      const kind = removeButton.getAttribute('data-remove-kind');
      const id = removeButton.getAttribute('data-remove-id');
      const removed = removeItem(kind, id);
      if (removed) {
        renderTab(activeTab);
        const label = savedReference(removed);
        toast(`${label} removed.`, {
          actionLabel: 'Undo',
          onAction: () => {
            restoreLibraryItem(kind, removed);
            renderTab(activeTab);
          },
        });
      }
      return;
    }

    const copyButton = event.target.closest('[data-copy-kind]');
    if (copyButton) {
      const kind = copyButton.getAttribute('data-copy-kind');
      const item = findItem(kind, copyButton.getAttribute('data-copy-id'));
      if (!item) return;
      const text = kind === 'notes'
        ? `${item.note}\n\n“${item.text}”\n— ${savedReference(item)}`
        : `“${item.text}”\n— ${savedReference(item)}`;
      copyText(text).then((ok) => {
        toast(ok ? 'Copied to clipboard.' : 'Could not copy.', { tone: ok ? 'default' : 'error' });
      });
      return;
    }

    if (event.target.closest('[data-export-library]')) {
      const data = exportData();
      downloadFile(
        `selah-library-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(data, null, 2),
      );
      toast('Your library was exported.');
    }
  };

  root.addEventListener('click', onRootClick);

  return {
    cleanup() {
      root.removeEventListener('click', onRootClick);
    },
  };
}
