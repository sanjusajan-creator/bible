import {
  DEFAULT_LOCATION,
  TOPIC_MAP,
  bookDisplayName,
  getBook,
  getPlan,
  getVersion,
  readerPath,
  LANGUAGES,
  getVersionsByLanguage,
} from './data.js';
import {
  exportData,
  getState,
  lastReading,
  resetLibrary,
  setTheme,
  setTypography,
  setVersion,
  setFontFamily,
  getFavoriteLanguages,
  toggleFavoriteLanguage,
  reloadState,
  subscribe,
} from './store.js';
import {
  closeModal,
  confirmDialog,
  downloadFile,
  escapeHTML,
  icon,
  logomark,
  mountTranslationBrowser,
  openVersionPicker,
  setPageTitle,
  toast,
  translationBrowserMarkup,
} from './ui.js';
import { render as renderHome } from './views/home.js';
import { render as renderReader } from './views/reader.js';
import { render as renderExplore } from './views/explore.js';
import { render as renderTopic } from './views/topic.js';
import { render as renderSearch } from './views/search.js';
import { render as renderSaved } from './views/saved.js';
import { render as renderPlans } from './views/plans.js';
import { render as renderPlan } from './views/plan.js';
import { render as renderNotFound } from './views/notfound.js';

const VIEW_RENDERERS = {
  home: renderHome,
  reader: renderReader,
  explore: renderExplore,
  topic: renderTopic,
  search: renderSearch,
  saved: renderSaved,
  plans: renderPlans,
  plan: renderPlan,
  notfound: renderNotFound,
};

const THEME_META = {
  light: '#f6f1e7',
  sepia: '#efe3cf',
  dark: '#141a15',
};

const THEME_LABELS = {
  light: 'Daylight',
  sepia: 'Parchment',
  dark: 'Nightfall',
};

const appRoot = document.getElementById('app');
let currentView = null;
let currentRoute = null;
let drawer = null;
let pendingRestore = null;
let pendingFocusSearch = false;
let preserveDrawerOnce = false;
let booted = false;

/* ------------------------------------------------------------------ */
/* Chrome & preferences                                               */
/* ------------------------------------------------------------------ */

function hydrateChrome() {
  const brandMark = document.getElementById('brand-mark');
  const footerMark = document.getElementById('footer-mark');
  if (brandMark) brandMark.innerHTML = logomark({ size: 38 });
  if (footerMark) footerMark.innerHTML = logomark({ size: 30 });

  document.querySelectorAll('[data-icon]').forEach((element) => {
    const name = element.getAttribute('data-icon');
    if (name) element.innerHTML = icon(name, { size: 18 });
  });

  const year = document.getElementById('footer-year');
  if (year) year.textContent = String(new Date().getFullYear());
}

function applyTheme() {
  const theme = getState().theme;
  document.documentElement.dataset.theme = theme;

  const meta = document.getElementById('theme-color-meta');
  if (meta) meta.setAttribute('content', THEME_META[theme] || THEME_META.light);

  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    const iconName = theme === 'dark' ? 'moon' : theme === 'sepia' ? 'leaf' : 'sun';
    themeIcon.innerHTML = icon(iconName, { size: 18 });
  }

  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const next = theme === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', `Appearance: ${THEME_LABELS[theme]}. Switch to ${THEME_LABELS[next]}.`);
    toggle.setAttribute('title', `Appearance: ${THEME_LABELS[theme]}`);
  }
}

function applyTypography() {
  const { font, size, leading, verseNumbers, fontFamily } = getState().typography;
  document.documentElement.style.setProperty('--reading-size', `${size}px`);
  document.documentElement.style.setProperty('--reading-leading', String(leading));
  document.body.dataset.readingFont = font === 'sans' ? 'sans' : 'serif';
  document.body.dataset.fontFamily = fontFamily || 'default';
  document.body.classList.toggle('verse-numbers-hidden', verseNumbers === false);
}

function updateChrome() {
  const state = getState();
  const version = getVersion(state.version);
  const short = document.getElementById('version-chip-short');
  if (short) short.textContent = version.short;

  const versionButton = document.getElementById('header-version');
  if (versionButton) {
    versionButton.setAttribute('aria-label', `Change Bible translation. Currently ${version.name}.`);
    versionButton.setAttribute('title', `${version.name} · ${version.year}`);
  }

  const last = lastReading();
  const readHref = last
    ? readerPath(last.book, last.chapter, { version: last.version })
    : readerPath(DEFAULT_LOCATION.book, DEFAULT_LOCATION.chapter);
  document.querySelectorAll('[data-nav="read"]').forEach((link) => {
    link.setAttribute('href', readHref);
  });

  const count = state.bookmarks.length + state.highlights.length + state.notes.length;
  const badge = document.getElementById('saved-badge');
  if (badge) {
    badge.hidden = count === 0;
    badge.textContent = count > 99 ? '99+' : String(count);
  }

  updateActiveNav();
}

function updateActiveNav() {
  const navMap = {
    home: null,
    reader: 'read',
    explore: 'explore',
    topic: 'explore',
    search: 'search',
    saved: 'saved',
    plans: 'plans',
    plan: 'plans',
  };
  const active = currentRoute ? navMap[currentRoute.name] : null;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const isActive = Boolean(active) && link.getAttribute('data-nav') === active;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function cycleTheme() {
  const theme = getState().theme;
  setTheme(theme === 'dark' ? 'light' : 'dark');
}

/* ------------------------------------------------------------------ */
/* Routing                                                             */
/* ------------------------------------------------------------------ */

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const queryIndex = raw.indexOf('?');
  const path = queryIndex >= 0 ? raw.slice(0, queryIndex) : raw;
  const query = new URLSearchParams(queryIndex >= 0 ? raw.slice(queryIndex + 1) : '');
  let segments = [];
  try {
    segments = path.split('/').filter(Boolean).map((segment) => decodeURIComponent(segment));
  } catch {
    segments = [];
  }

  if (!segments.length) return { name: 'home' };
  const [first, second, third] = segments;

  if (first === 'read') {
    if (!second || !third) return { name: 'notfound' };
    return {
      name: 'reader',
      book: second,
      chapter: Number(third),
      verse: Number(query.get('verse')) || undefined,
      version: query.get('version') || undefined,
      plan: query.get('plan') || undefined,
      day: Number(query.get('day')) || undefined,
    };
  }

  if (first === 'explore') {
    return second ? { name: 'topic', topicId: second } : { name: 'explore' };
  }

  if (first === 'topic') {
    return second ? { name: 'topic', topicId: second } : { name: 'notfound' };
  }

  if (first === 'search') return { name: 'search' };

  if (first === 'saved') {
    return { name: 'saved', tab: second || query.get('tab') || 'bookmarks' };
  }

  if (first === 'plans') {
    return second ? { name: 'plan', planId: second } : { name: 'plans' };
  }

  return { name: 'notfound' };
}

function pageTitleFor(route) {
  if (!route) return '';
  if (route.name === 'home') return '';
  if (route.name === 'reader') {
    const book = getBook(route.book);
    if (!book) return 'Reader';
    return bookDisplayName(book.slug, route.chapter);
  }
  if (route.name === 'topic') return TOPIC_MAP.get(route.topicId)?.title || 'A collection';
  if (route.name === 'explore') return 'Explore Scripture';
  if (route.name === 'search') return 'Search Scripture';
  if (route.name === 'saved') return 'Your library';
  if (route.name === 'plans') return 'Reading plans';
  if (route.name === 'plan') return getPlan(route.planId)?.title || 'Reading plan';
  return 'Page not found';
}

function setRouteBody(route) {
  [...document.body.classList]
    .filter((name) => name.startsWith('route-'))
    .forEach((name) => document.body.classList.remove(name));
  document.body.classList.add(`route-${route.name}`);
  document.body.classList.toggle('reader-active', route.name === 'reader');
  document.body.dataset.route = route.name;
}

function handleRouteChange() {
  const route = parseHash();
  const restoreY = pendingRestore;
  pendingRestore = null;

  closeModal('route');
  if (!preserveDrawerOnce) closeDrawer({ immediate: true });
  preserveDrawerOnce = false;

  document.body.classList.remove('focus-mode', 'sidebar-lock');
  setRouteBody(route);
  renderRoute(route, { restoreY, scrollTop: true });

  if (route.name === 'search' && pendingFocusSearch) {
    pendingFocusSearch = false;
    requestAnimationFrame(() => currentView?.focusSearch?.());
  }
}

function renderRoute(route, { restoreY = null, scrollTop = false, keepScroll = false } = {}) {
  if (currentView?.cleanup) {
    try {
      currentView.cleanup();
    } catch {
      // A view should never be able to block the next view.
    }
  }

  const previousScroll = keepScroll || restoreY !== null ? window.scrollY : 0;
  currentRoute = route;
  appRoot.innerHTML = '';
  currentView = null;

  const ctx = {
    rerender({ preserveScroll = false } = {}) {
      renderRoute(route, {
        restoreY: preserveScroll ? window.scrollY : null,
        scrollTop: !preserveScroll,
      });
    },
    openVersionPicker(currentId) {
      openVersionModal(currentId);
    },
    openSettings() {
      openDrawer();
    },
    focusSearch() {
      currentView?.focusSearch?.();
    },
  };

  try {
    currentView = VIEW_RENDERERS[route.name](appRoot, route, ctx) || {};
  } catch (error) {
    console.error('Selah could not render this view.', error);
    currentView = {};
    appRoot.innerHTML = `<section class="empty-page app-error">
      <p class="eyebrow">A quiet interruption</p>
      <h1>Something went quiet.</h1>
      <p>This page could not be opened. Reloading usually brings it back.</p>
      <button type="button" class="btn btn--primary" data-reload-app>Reload Selah ${icon('refresh', { size: 16 })}</button>
    </section>`;
  }

  updateChrome();
  updateSettingsUI();
  setPageTitle(pageTitleFor(route));
  applyRevealAnimation(appRoot);

  if (restoreY !== null) beginScrollRestore(restoreY);
  else if (scrollTop) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  else if (keepScroll) window.scrollTo({ top: previousScroll, left: 0, behavior: 'instant' });
}

function beginScrollRestore(targetY) {
  if (targetY === null || targetY === undefined) return;
  const target = Math.max(0, targetY);
  let tries = 0;
  let lastHeight = -1;
  let stable = 0;

  const attempt = () => {
    const height = document.documentElement.scrollHeight;
    const max = Math.max(0, height - window.innerHeight);
    if (height === lastHeight) stable += 1;
    else stable = 0;
    lastHeight = height;

    if (max >= target || stable >= 7 || tries >= 40) {
      window.scrollTo({ top: Math.min(target, max), left: 0, behavior: 'instant' });
      return;
    }
    tries += 1;
    window.setTimeout(attempt, 100);
  };

  requestAnimationFrame(attempt);
}

function applyRevealAnimation(root) {
  const items = root.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((item) => item.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

  items.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
    observer.observe(item);
  });
}

/* ------------------------------------------------------------------ */
/* Version selection                                                   */
/* ------------------------------------------------------------------ */

function openVersionModal(currentId) {
  const fallback = currentRoute?.name === 'reader' && currentRoute.version
    ? currentRoute.version
    : getState().version;
  openVersionPicker(currentId || fallback, (versionId) => chooseVersion(versionId));
}

function chooseVersion(versionId) {
  const version = getVersion(versionId);
  if (!version) return;
  setVersion(version.id);

  if (currentRoute?.name === 'reader') {
    const options = {};
    if (currentRoute.verse) options.verse = currentRoute.verse;
    if (currentRoute.plan) options.plan = currentRoute.plan;
    if (currentRoute.day) options.day = currentRoute.day;
    const href = readerPath(currentRoute.book, currentRoute.chapter, options);
    const y = window.scrollY;

    if (location.hash === href) {
      renderRoute(currentRoute, { restoreY: y });
    } else {
      preserveDrawerOnce = Boolean(drawer);
      pendingRestore = y;
      location.hash = href;
    }
    toast(`Now reading ${version.short}.`);
    return;
  }

  const y = window.scrollY;
  renderRoute(currentRoute, { restoreY: y });
  toast(`Reading in ${version.short} now.`);
}

/* ------------------------------------------------------------------ */
/* Settings drawer                                                     */
/* ------------------------------------------------------------------ */

function themeOption(id, label, iconName) {
  const active = getState().theme === id;
  return `<button type="button" class="theme-option ${active ? 'is-active' : ''}" data-theme-option="${id}" aria-pressed="${active}">
    <span class="theme-option-swatch theme-option-swatch--${id}">${icon(iconName, { size: 18 })}</span>
    <span>${label}</span>
  </button>`;
}

function drawerMarkup() {
  const state = getState();
  const typography = state.typography;
  const version = getVersion(state.version);
  const favorites = getFavoriteLanguages();

  return `<div class="drawer-layer" data-drawer-layer>
    <aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <header class="drawer-head">
        <div>
          <p class="eyebrow">The reading room</p>
          <h2 id="settings-title">Make it yours.</h2>
        </div>
        <button type="button" class="icon-btn drawer-close" data-drawer-close aria-label="Close settings">${icon('close', { size: 18 })}</button>
      </header>

      <div class="drawer-body">
        <section class="settings-group">
          <div class="settings-group-head">
            <p class="eyebrow">Appearance</p>
            <h3>Set the room.</h3>
          </div>
          <div class="theme-options">
            ${themeOption('light', 'Daylight', 'sun')}
            ${themeOption('sepia', 'Parchment', 'leaf')}
            ${themeOption('dark', 'Nightfall', 'moon')}
          </div>
        </section>

        <section class="settings-group">
          <div class="settings-group-head">
            <p class="eyebrow">Reading</p>
            <h3>Shape the text.</h3>
          </div>

          <div class="settings-field">
            <span class="settings-row-label">Font family</span>
            <div class="segmented" role="group" aria-label="Reading font family">
              <button type="button" class="segmented-btn ${typography.fontFamily === 'default' ? 'is-active' : ''}" data-font-family="default" aria-pressed="${typography.fontFamily === 'default'}">Default</button>
              <button type="button" class="segmented-btn ${typography.fontFamily === 'serif' ? 'is-active' : ''}" data-font-family="serif" aria-pressed="${typography.fontFamily === 'serif'}">Serif</button>
              <button type="button" class="segmented-btn ${typography.fontFamily === 'sans' ? 'is-active' : ''}" data-font-family="sans" aria-pressed="${typography.fontFamily === 'sans'}">Sans</button>
              <button type="button" class="segmented-btn ${typography.fontFamily === 'display' ? 'is-active' : ''}" data-font-family="display" aria-pressed="${typography.fontFamily === 'display'}">Display</button>
            </div>
          </div>

          <div class="settings-field">
            <span class="settings-row-label">Typeface</span>
            <div class="segmented" role="group" aria-label="Reading typeface">
              <button type="button" class="segmented-btn ${typography.font === 'serif' ? 'is-active' : ''}" data-font-option="serif" aria-pressed="${typography.font === 'serif'}"><span class="font-sample font-sample--serif">Aa</span> Serif</button>
              <button type="button" class="segmented-btn ${typography.font === 'sans' ? 'is-active' : ''}" data-font-option="sans" aria-pressed="${typography.font === 'sans'}"><span class="font-sample font-sample--sans">Aa</span> Sans</button>
            </div>
          </div>

          <label class="settings-field settings-range">
            <span class="settings-range-head"><span class="settings-row-label">Text size</span><em data-size-value>${typography.size}px</em></span>
            <input type="range" min="16" max="26" step="1" value="${typography.size}" data-size-range aria-label="Reading text size" />
            <span class="range-track-labels"><span>Aa</span><span>Aa</span></span>
          </label>

          <label class="settings-field settings-range">
            <span class="settings-range-head"><span class="settings-row-label">Line spacing</span><em data-leading-value>${Number(typography.leading).toFixed(2)}</em></span>
            <input type="range" min="1.5" max="2.2" step="0.05" value="${typography.leading}" data-leading-range aria-label="Reading line spacing" />
            <span class="range-track-labels"><span>Close</span><span>Open</span></span>
          </label>

          <button type="button" class="settings-toggle ${typography.verseNumbers ? 'is-on' : ''}" data-verse-toggle role="switch" aria-checked="${typography.verseNumbers}">
            <span>
              <span class="settings-row-label">Verse numbers</span>
              <small>Keep the reference visible while reading</small>
            </span>
            <span class="switch-track" aria-hidden="true"><i></i></span>
          </button>
        </section>

        <section class="settings-group">
          <div class="settings-group-head">
            <p class="eyebrow">Language & Translation</p>
            <h3>Choose your tongue.</h3>
          </div>

          <button type="button" class="settings-row settings-row--button" data-settings-version>
            <span>
              <span class="settings-row-label">Current translation</span>
              <strong data-settings-version-value>${escapeHTML(version.name)}</strong>
            </span>
            <span class="settings-row-side">
              <em>${escapeHTML(version.short)}</em>
              ${icon('chevron-right', { size: 16 })}
            </span>
          </button>

          ${favorites.length > 0 ? `
          <div class="settings-field">
            <span class="settings-row-label">Your languages <span class="settings-fav-count">${favorites.length}</span></span>
            <div class="favorite-languages" role="list" aria-label="Favorite languages">
              ${favorites.map(langCode => {
                const lang = LANGUAGES.find(l => l.code === langCode);
                if (!lang) return '';
                const versions = getVersionsByLanguage(langCode);
                return `<button type="button" class="favorite-lang-btn" data-fav-lang="${escapeHTML(langCode)}" aria-pressed="true" title="${escapeHTML(lang.name)} (${escapeHTML(lang.nativeName)}) - ${versions.length} version${versions.length !== 1 ? 's' : ''}">
                  <span class="favorite-lang-native" dir="${lang.direction === 'rtl' ? 'rtl' : 'ltr'}" lang="${escapeHTML(langCode)}">${escapeHTML(lang.nativeName)}</span>
                  <span class="favorite-lang-english">${escapeHTML(lang.name)}</span>
                  <span class="favorite-lang-count">${versions.length}</span>
                  <span class="favorite-lang-remove" data-remove-fav-lang="${escapeHTML(langCode)}" aria-label="Remove ${escapeHTML(lang.name)} from favorites">${icon('close', { size: 12 })}</span>
                </button>`;
              }).join('')}
            </div>
          </div>
          ` : ''}

          <div class="settings-field">
            <span class="settings-row-label">Browse by language</span>
            ${translationBrowserMarkup(state.version)}
          </div>
        </section>

        <section class="settings-group">
          <div class="settings-group-head">
            <p class="eyebrow">Your data</p>
            <h3>Kept quietly on this device.</h3>
          </div>
          <p class="settings-note">Saved verses, notes, highlights, and reading plans never leave your browser. Export a copy whenever you like.</p>
          <div class="settings-actions">
            <button type="button" class="btn btn--quiet btn--small" data-settings-export>${icon('download', { size: 15 })} Export library</button>
            <button type="button" class="btn btn--quiet btn--small btn--danger-quiet" data-settings-reset>${icon('trash', { size: 15 })} Clear library</button>
          </div>
        </section>

        <section class="settings-group settings-shortcuts">
          <div class="settings-group-head">
            <p class="eyebrow">While reading</p>
            <h3>Quiet shortcuts.</h3>
          </div>
          <dl class="shortcut-list">
            <div><dt>Search anywhere</dt><dd><kbd>/</kbd></dd></div>
            <div><dt>Previous chapter</dt><dd><kbd>←</kbd></dd></div>
            <div><dt>Next chapter</dt><dd><kbd>→</kbd></dd></div>
            <div><dt>Focus mode</dt><dd><kbd>F</kbd></dd></div>
            <div><dt>Listen aloud</dt><dd><kbd>L</kbd></dd></div>
            <div><dt>Close a panel</dt><dd><kbd>Esc</kbd></dd></div>
          </dl>
        </section>

        <p class="drawer-attribution">Scripture text served by the free, open <a href="https://bible.helloao.org" target="_blank" rel="noopener">Free Use Bible API</a>. Public-domain and openly licensed translations only.</p>
      </div>
    </aside>
  </div>`;
}

function focusable(container) {
  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => element.offsetParent !== null);
}

function openDrawer() {
  if (drawer) return;
  const host = document.getElementById('drawer-root');
  if (!host) return;

  // Reload state to pick up any external changes (e.g., favorites from other tabs)
  reloadState();

  host.innerHTML = drawerMarkup();
  const layer = host.querySelector('[data-drawer-layer]');
  const previousFocus = document.activeElement;
  mountTranslationBrowser(host);

  const onKeydown = (event) => {
    if (!drawer) return;
    if (event.key === 'Escape') {
      if (document.querySelector('.modal-layer')) return;
      event.preventDefault();
      closeDrawer();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusable(layer);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const onClick = (event) => {
    if (event.target === layer) {
      closeDrawer();
      return;
    }
    if (event.target.closest('[data-drawer-close]')) {
      closeDrawer();
      return;
    }

    const themeButton = event.target.closest('[data-theme-option]');
    if (themeButton) {
      setTheme(themeButton.getAttribute('data-theme-option'));
      return;
    }

    const fontFamilyButton = event.target.closest('[data-font-family]');
    if (fontFamilyButton) {
      setFontFamily(fontFamilyButton.getAttribute('data-font-family'));
      return;
    }

    const fontButton = event.target.closest('[data-font-option]');
    if (fontButton) {
      setTypography({ font: fontButton.getAttribute('data-font-option') });
      return;
    }

    const favLangButton = event.target.closest('[data-fav-lang]');
    if (favLangButton && !event.target.closest('[data-remove-fav-lang]')) {
      const langCode = favLangButton.getAttribute('data-fav-lang');
      const versions = getVersionsByLanguage(langCode);
      if (versions.length > 0) {
        chooseVersion(versions[0].id);
      }
      return;
    }

    const removeFavButton = event.target.closest('[data-remove-fav-lang]');
    if (removeFavButton) {
      event.stopPropagation();
      const langCode = removeFavButton.getAttribute('data-remove-fav-lang');
      toggleFavoriteLanguage(langCode);
      // Re-render drawer to update favorites list
      host.innerHTML = drawerMarkup();
      mountTranslationBrowser(host);
      return;
    }

    const versionRow = event.target.closest('[data-version-id]');
    if (versionRow) {
      chooseVersion(versionRow.getAttribute('data-version-id'));
      return;
    }

    if (event.target.closest('[data-settings-version]')) {
      openVersionModal(getState().version);
      return;
    }

    if (event.target.closest('[data-verse-toggle]')) {
      setTypography({ verseNumbers: !getState().typography.verseNumbers });
      return;
    }

    if (event.target.closest('[data-settings-export]')) {
      const data = exportData();
      downloadFile(
        `selah-library-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(data, null, 2),
      );
      toast('Your library was exported.');
      return;
    }

    if (event.target.closest('[data-settings-reset]')) {
      clearLibrary();
    }
  };

  const onInput = (event) => {
    if (event.target.matches('[data-size-range]')) {
      setTypography({ size: Number(event.target.value) });
      return;
    }
    if (event.target.matches('[data-leading-range]')) {
      setTypography({ leading: Number(event.target.value) });
    }
  };

  layer.addEventListener('click', onClick);
  layer.addEventListener('input', onInput);
  document.addEventListener('keydown', onKeydown);
  document.body.classList.add('drawer-open');

  drawer = {
    layer,
    onKeydown,
    onClick,
    onInput,
    previousFocus,
  };

  requestAnimationFrame(() => {
    layer.classList.add('is-visible');
    layer.querySelector('[data-drawer-close]')?.focus({ preventScroll: true });
  });
}

function closeDrawer({ immediate = false } = {}) {
  if (!drawer) return;
  const active = drawer;
  drawer = null;
  document.removeEventListener('keydown', active.onKeydown);
  active.layer.removeEventListener('click', active.onClick);
  active.layer.removeEventListener('input', active.onInput);
  document.body.classList.remove('drawer-open');
  active.layer.classList.remove('is-visible');

  if (immediate) {
    active.layer.remove();
  } else {
    window.setTimeout(() => active.layer.remove(), 280);
    if (active.previousFocus && typeof active.previousFocus.focus === 'function') {
      active.previousFocus.focus({ preventScroll: true });
    }
  }
}

function updateSettingsUI() {
  if (!drawer) return;
  const layer = drawer.layer;
  const state = getState();
  const typography = state.typography;
  const version = getVersion(state.version);

  layer.querySelectorAll('[data-theme-option]').forEach((button) => {
    const active = button.getAttribute('data-theme-option') === state.theme;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  layer.querySelectorAll('[data-font-option]').forEach((button) => {
    const active = button.getAttribute('data-font-option') === typography.font;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  layer.querySelectorAll('[data-version-id]').forEach((button) => {
    const active = button.getAttribute('data-version-id') === state.version;
    button.classList.toggle('is-current', active);
    if (active) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
    const check = button.querySelector('.version-row-check');
    if (check) check.innerHTML = active ? icon('check', { size: 16 }) : '';
  });

  const versionValue = layer.querySelector('[data-settings-version-value]');
  if (versionValue) versionValue.textContent = version.name;
  const versionShort = layer.querySelector('.settings-row-side em');
  if (versionShort) versionShort.textContent = version.short;

  const sizeRange = layer.querySelector('[data-size-range]');
  if (sizeRange) sizeRange.value = typography.size;
  const sizeValue = layer.querySelector('[data-size-value]');
  if (sizeValue) sizeValue.textContent = `${typography.size}px`;

  const leadingRange = layer.querySelector('[data-leading-range]');
  if (leadingRange) leadingRange.value = typography.leading;
  const leadingValue = layer.querySelector('[data-leading-value]');
  if (leadingValue) leadingValue.textContent = Number(typography.leading).toFixed(2);

  const verseToggle = layer.querySelector('[data-verse-toggle]');
  if (verseToggle) {
    verseToggle.classList.toggle('is-on', typography.verseNumbers);
    verseToggle.setAttribute('aria-checked', String(typography.verseNumbers));
  }
}

async function clearLibrary() {
  const confirmed = await confirmDialog({
    title: 'Clear your library?',
    message: 'This removes every saved verse, highlight, note, reading history entry, and reading plan from this device. Your appearance settings will stay as they are. This cannot be undone.',
    confirmLabel: 'Clear library',
    tone: 'danger',
  });
  if (!confirmed) return;

  resetLibrary();
  closeDrawer({ immediate: true });
  renderRoute(currentRoute, { restoreY: window.scrollY });
  toast('Your library was cleared.');
}

/* ------------------------------------------------------------------ */
/* Global events                                                       */
/* ------------------------------------------------------------------ */

function onWindowScroll() {
  const header = document.getElementById('site-header');
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
}

function onGlobalKeydown(event) {
  if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
  if (event.key !== '/') return;
  const target = event.target;
  const isTyping = target instanceof HTMLElement && (
    target.matches('input, textarea, select') || target.isContentEditable
  );
  if (isTyping) return;
  if (document.querySelector('.modal-layer') || document.querySelector('.drawer-layer')) return;

  event.preventDefault();
  if (currentRoute?.name === 'search') {
    currentView?.focusSearch?.();
  } else {
    pendingFocusSearch = true;
    location.hash = '#/search';
  }
}

function bindChrome() {
  document.getElementById('header-version')?.addEventListener('click', () => {
    openVersionModal(getState().version);
  });

  document.getElementById('theme-toggle')?.addEventListener('click', cycleTheme);

  document.getElementById('settings-open')?.addEventListener('click', openDrawer);

  document.getElementById('site-header')?.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="#/"]')?.getAttribute('href') === location.hash) {
      // Re-running a route that is already active should still feel responsive.
      event.preventDefault();
      handleRouteChange();
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-reload-app]')) location.reload();
  });

  window.addEventListener('hashchange', handleRouteChange);
  window.addEventListener('scroll', onWindowScroll, { passive: true });
  document.addEventListener('keydown', onGlobalKeydown);
}

export function boot() {
  if (booted) return;
  booted = true;

  hydrateChrome();
  applyTheme();
  applyTypography();
  updateChrome();
  bindChrome();
  recordVisitOnce();

  subscribe(() => {
    applyTheme();
    applyTypography();
    updateChrome();
    updateSettingsUI();
  });

  handleRouteChange();
  onWindowScroll();
}

function recordVisitOnce() {
  // Imported lazily so the chrome can paint before any storage writes.
  import('./store.js').then(({ recordVisit }) => {
    recordVisit();
  }).catch(() => {});
}
