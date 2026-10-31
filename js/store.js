import { DEFAULT_VERSION } from './data.js';

export const STORAGE_KEY = 'selah.v1';

const DEFAULT_TYPOGRAPHY = Object.freeze({
  font: 'serif',
  size: 19,
  leading: 1.85,
  verseNumbers: true,
  fontFamily: 'default', // 'default', 'serif', 'sans', 'display'
});

const defaults = {
  version: DEFAULT_VERSION,
  theme: 'light',
  typography: { ...DEFAULT_TYPOGRAPHY },
  bookmarks: [],
  highlights: [],
  notes: [],
  history: [],
  readChapters: [],
  visits: [],
  plans: {},
  searches: [],
  favoriteLanguages: [], // array of language codes
};

const listeners = new Set();
let state = load();

// Sync state with localStorage changes from other tabs or direct manipulation
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        state = {
          ...structuredClone(defaults),
          ...parsed,
          typography: { ...DEFAULT_TYPOGRAPHY, ...(parsed.typography || {}) },
          bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
          highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          history: Array.isArray(parsed.history) ? parsed.history : [],
          readChapters: Array.isArray(parsed.readChapters) ? parsed.readChapters : [],
          visits: Array.isArray(parsed.visits) ? parsed.visits : [],
          plans: parsed.plans && typeof parsed.plans === 'object' ? parsed.plans : {},
          searches: Array.isArray(parsed.searches) ? parsed.searches : [],
          favoriteLanguages: Array.isArray(parsed.favoriteLanguages) ? parsed.favoriteLanguages : [],
        };
        listeners.forEach((listener) => {
          try {
            listener(state, 'storage');
          } catch {
            // ignore
          }
        });
      } catch {
        // ignore parse errors
      }
    }
  });
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaults);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaults),
      ...parsed,
      typography: { ...DEFAULT_TYPOGRAPHY, ...(parsed.typography || {}) },
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      history: Array.isArray(parsed.history) ? parsed.history : [],
      readChapters: Array.isArray(parsed.readChapters) ? parsed.readChapters : [],
      visits: Array.isArray(parsed.visits) ? parsed.visits : [],
      plans: parsed.plans && typeof parsed.plans === 'object' ? parsed.plans : {},
      searches: Array.isArray(parsed.searches) ? parsed.searches : [],
      favoriteLanguages: Array.isArray(parsed.favoriteLanguages) ? parsed.favoriteLanguages : [],
    };
  } catch {
    return structuredClone(defaults);
  }
}

function save(type = 'change') {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The app still works for the current session if storage is unavailable.
  }
  listeners.forEach((listener) => {
    try {
      listener(state, type);
    } catch {
      // A view should never be able to break the store.
    }
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('selah:store', { detail: { type } }));
  }
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState() {
  return state;
}

/**
 * Reload state from localStorage (useful after external changes).
 */
export function reloadState() {
  state = load();
  listeners.forEach((listener) => {
    try {
      listener(state, 'reload');
    } catch {
      // ignore
    }
  });
  return state;
}

export function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function itemId(version, book, chapter, verse) {
  return `${version}|${book}|${chapter}|${verse}`;
}

/* ------------------------------------------------------------------ */
/* Preferences                                                         */
/* ------------------------------------------------------------------ */

export function setVersion(versionId) {
  if (!versionId || state.version === versionId) return;
  state.version = versionId;
  save('version');
}

export function setTheme(theme) {
  if (!['light', 'sepia', 'dark'].includes(theme) || state.theme === theme) return;
  state.theme = theme;
  save('theme');
}

export function setTypography(patch) {
  state.typography = { ...state.typography, ...patch };
  save('typography');
}

export function setFontFamily(family) {
  const allowed = ['default', 'serif', 'sans', 'display'];
  if (!allowed.includes(family)) return;
  state.typography.fontFamily = family;
  save('typography');
}

/* ------------------------------------------------------------------ */
/* Favorite Languages                                                 */
/* ------------------------------------------------------------------ */

export function getFavoriteLanguages() {
  return state.favoriteLanguages || [];
}

export function isFavoriteLanguage(langCode) {
  return (state.favoriteLanguages || []).includes(langCode);
}

export function toggleFavoriteLanguage(langCode) {
  const favorites = state.favoriteLanguages || [];
  const index = favorites.indexOf(langCode);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.unshift(langCode);
  }
  state.favoriteLanguages = favorites;
  save('favoriteLanguages');
  return favorites;
}

export function resetTypography() {
  state.typography = { ...DEFAULT_TYPOGRAPHY };
  save('typography');
}

/* ------------------------------------------------------------------ */
/* Library                                                             */
/* ------------------------------------------------------------------ */

function verseSnapshot(version, book, chapter, verse, text) {
  return {
    id: itemId(version, book, chapter, verse),
    version,
    book,
    chapter: Number(chapter),
    verse: Number(verse),
    text: String(text || '').trim(),
    createdAt: Date.now(),
  };
}

export function isBookmarked(version, book, chapter, verse) {
  const id = itemId(version, book, chapter, verse);
  return state.bookmarks.some((item) => item.id === id);
}

export function toggleBookmark({ version, book, chapter, verse, text }) {
  const id = itemId(version, book, chapter, verse);
  const existingIndex = state.bookmarks.findIndex((item) => item.id === id);
  if (existingIndex >= 0) {
    const [removed] = state.bookmarks.splice(existingIndex, 1);
    save('bookmarks');
    return { added: false, removed };
  }
  const item = verseSnapshot(version, book, chapter, verse, text);
  state.bookmarks.unshift(item);
  save('bookmarks');
  return { added: true, item };
}

export function removeBookmark(id) {
  const index = state.bookmarks.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const [removed] = state.bookmarks.splice(index, 1);
  save('bookmarks');
  return removed;
}

export function getHighlight(version, book, chapter, verse) {
  const id = itemId(version, book, chapter, verse);
  return state.highlights.find((item) => item.id === id) || null;
}

export function toggleHighlight({ version, book, chapter, verse, text }, color) {
  const id = itemId(version, book, chapter, verse);
  const index = state.highlights.findIndex((item) => item.id === id);
  if (index >= 0) {
    const current = state.highlights[index];
    if (current.color === color) {
      const [removed] = state.highlights.splice(index, 1);
      save('highlights');
      return { active: false, removed };
    }
    current.color = color;
    current.text = String(text || current.text).trim();
    current.updatedAt = Date.now();
    save('highlights');
    return { active: true, item: current, updated: true };
  }
  const item = { ...verseSnapshot(version, book, chapter, verse, text), color, updatedAt: Date.now() };
  state.highlights.unshift(item);
  save('highlights');
  return { active: true, item };
}

export function removeHighlight(id) {
  const index = state.highlights.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const [removed] = state.highlights.splice(index, 1);
  save('highlights');
  return removed;
}

export function getNote(version, book, chapter, verse) {
  const id = itemId(version, book, chapter, verse);
  return state.notes.find((item) => item.id === id) || null;
}

export function saveNote({ version, book, chapter, verse, text }, note) {
  const id = itemId(version, book, chapter, verse);
  const index = state.notes.findIndex((item) => item.id === id);
  const trimmed = String(note || '').trim();
  if (!trimmed) {
    if (index >= 0) {
      const [removed] = state.notes.splice(index, 1);
      save('notes');
      return { removed, saved: false };
    }
    return { saved: false };
  }
  if (index >= 0) {
    const item = state.notes[index];
    item.note = trimmed;
    item.text = String(text || item.text).trim();
    item.updatedAt = Date.now();
    save('notes');
    return { saved: true, item };
  }
  const item = {
    ...verseSnapshot(version, book, chapter, verse, text),
    note: trimmed,
    updatedAt: Date.now(),
  };
  state.notes.unshift(item);
  save('notes');
  return { saved: true, item };
}

export function removeNote(id) {
  const index = state.notes.findIndex((item) => item.id === id);
  if (index < 0) return null;
  const [removed] = state.notes.splice(index, 1);
  save('notes');
  return removed;
}

export function restoreLibraryItem(type, item) {
  if (!item) return;
  const collections = { bookmarks: 'bookmarks', highlights: 'highlights', notes: 'notes' };
  const key = collections[type];
  if (!key) return;
  if (state[key].some((existing) => existing.id === item.id)) return;
  state[key].unshift(item);
  save(key);
}

export function libraryCounts() {
  return {
    bookmarks: state.bookmarks.length,
    highlights: state.highlights.length,
    notes: state.notes.length,
    history: state.history.length,
    chapters: state.readChapters.length,
  };
}

/* ------------------------------------------------------------------ */
/* Reading history & rhythm                                            */
/* ------------------------------------------------------------------ */

export function addHistory(version, book, chapter) {
  const safeChapter = Number(chapter);
  const existing = state.history.findIndex(
    (item) => item.version === version && item.book === book && item.chapter === safeChapter,
  );
  if (existing >= 0) state.history.splice(existing, 1);
  state.history.unshift({
    version,
    book,
    chapter: safeChapter,
    at: Date.now(),
  });
  state.history = state.history.slice(0, 24);

  const readKey = `${version}|${book}|${safeChapter}`;
  if (!state.readChapters.includes(readKey)) {
    state.readChapters.push(readKey);
    if (state.readChapters.length > 1200) state.readChapters.shift();
  }
  save('history');
}

export function lastReading() {
  return state.history[0] || null;
}

export function recordVisit() {
  const today = localDayKey();
  if (!state.visits.includes(today)) {
    state.visits.push(today);
    state.visits = state.visits.slice(-370);
    save('visits');
  }
}

export function readingStreak() {
  const days = new Set(state.visits);
  const now = new Date();
  const todayKey = localDayKey(now);
  if (!days.has(todayKey)) {
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (!days.has(localDayKey(yesterday))) return 0;
    now.setDate(now.getDate() - 1);
  }
  let streak = 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (days.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/* ------------------------------------------------------------------ */
/* Reading plans                                                       */
/* ------------------------------------------------------------------ */

export function startPlan(planId) {
  if (!state.plans[planId]) {
    state.plans[planId] = { startedAt: Date.now(), completedDays: [] };
    save('plans');
  }
  return state.plans[planId];
}

export function planState(planId) {
  return state.plans[planId] || null;
}

export function togglePlanDay(planId, dayNumber) {
  const plan = startPlan(planId);
  const safeDay = Number(dayNumber);
  const index = plan.completedDays.indexOf(safeDay);
  if (index >= 0) {
    plan.completedDays.splice(index, 1);
  } else {
    plan.completedDays.push(safeDay);
  }
  plan.completedDays.sort((a, b) => a - b);
  save('plans');
  return index < 0;
}

export function isPlanDayComplete(planId, dayNumber) {
  const plan = state.plans[planId];
  return Boolean(plan?.completedDays.includes(Number(dayNumber)));
}

export function startedPlans() {
  return Object.entries(state.plans)
    .map(([id, value]) => ({ id, ...value }))
    .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0));
}

/* ------------------------------------------------------------------ */
/* Searches                                                            */
/* ------------------------------------------------------------------ */

export function addSearch(entry) {
  const label = String(entry?.label || entry?.query || '').trim();
  if (!label) return;
  state.searches = state.searches.filter((item) => item.label !== label);
  state.searches.unshift({ ...entry, label, at: Date.now() });
  state.searches = state.searches.slice(0, 6);
  save('searches');
}

export function recentSearches() {
  return state.searches;
}

/* ------------------------------------------------------------------ */
/* Export & reset                                                      */
/* ------------------------------------------------------------------ */

export function exportData() {
  return {
    app: 'Selah',
    exportedAt: new Date().toISOString(),
    version: state.version,
    bookmarks: state.bookmarks,
    highlights: state.highlights,
    notes: state.notes,
    history: state.history,
    plans: state.plans,
    visits: state.visits,
    readChapters: state.readChapters,
  };
}

export function resetLibrary() {
  state.bookmarks = [];
  state.highlights = [];
  state.notes = [];
  state.history = [];
  state.readChapters = [];
  state.plans = {};
  state.searches = [];
  save('reset');
}

export function resetEverything() {
  state = structuredClone(defaults);
  save('reset');
}
