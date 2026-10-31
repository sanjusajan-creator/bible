import { BOOKS, apiBookSlug, getBook, getVersion } from './data.js';

const API_BASE = 'https://bible.helloao.org/api';

const chapterCache = new Map();
const pendingRequests = new Map();
const booksCache = new Map(); // translationId -> books array
const pendingBooksRequests = new Map();

function cleanText(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ' ')
    .replace(/\uFEFF/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/¶/g, '')
    .replace(/\s*\|\|\s*/g, ' ')
    // Some Thai editions separate clauses with a slash. Read it as a space.
    .replace(/([\u0E00-\u0E7F])\s*\/\s*(?=[\u0E00-\u0E7F])/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json();
}

const CJK = /[\u2E80-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F]/;

/**
 * Flatten a helloao content tree into ordered text, notes, and line breaks.
 * Objects can carry poetry, words-of-Jesus, footnote, heading, or line-break
 * metadata; plain strings are the most common node.
 */
function collectSegments(value, out) {
  if (value == null) return;
  if (typeof value === 'string') {
    out.push({ text: value });
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectSegments(item, out);
    return;
  }
  if (typeof value !== 'object') return;
  if (typeof value.text === 'string') {
    out.push({
      text: value.text,
      poem: Number(value.poem) || 0,
      wordsOfJesus: value.wordsOfJesus === true,
    });
    return;
  }
  if (value.noteId != null) {
    out.push({ noteId: Number(value.noteId) });
    return;
  }
  if (value.heading != null) {
    out.push({ text: String(value.heading) });
    return;
  }
  if (value.lineBreak) {
    out.push({ lineBreak: true });
    return;
  }
  if (Array.isArray(value.content)) collectSegments(value.content, out);
}

function joinTextParts(parts) {
  let result = '';
  for (const part of parts) {
    if (!part) continue;
    if (!result) {
      result = part;
      continue;
    }
    const left = result.slice(-1);
    const right = part.charAt(0);
    // CJK scripts read naturally without spaces between wrapped lines.
    if (/\s/.test(left) || CJK.test(left) || CJK.test(right)) {
      result += part;
    } else {
      result += ` ${part}`;
    }
  }
  return result;
}

function textFromContent(value) {
  const parts = [];
  collectSegments(value, parts);
  return cleanText(joinTextParts(parts.filter((part) => typeof part.text === 'string').map((part) => part.text)));
}

function appendWithSpacing(previous, value) {
  const text = cleanText(value);
  if (!text) return { full: previous, added: '' };
  if (!previous) return { full: text, added: text };
  const left = previous.slice(-1);
  const right = text.charAt(0);
  const spacer = /\s/.test(left) || CJK.test(left) || CJK.test(right) ? '' : ' ';
  return { full: previous + spacer + text, added: spacer + text };
}

/**
 * Join segments into both a plain string (for search, copy, speech) and a
 * span-ready segment list (for red-letter text and footnote markers).
 */
function joinSegments(segments) {
  let text = '';
  const merged = [];

  for (const segment of segments) {
    if (segment.noteId != null) {
      merged.push({ type: 'note', noteId: segment.noteId });
      continue;
    }
    if (segment.lineBreak) {
      if (text && !text.endsWith('\n')) {
        text += '\n';
        const last = merged[merged.length - 1];
        if (last && last.type === 'text') last.text += '\n';
        else merged.push({ type: 'text', text: '\n', wordsOfJesus: false });
      }
      continue;
    }
    if (typeof segment.text !== 'string') continue;

    const { full, added } = appendWithSpacing(text, segment.text);
    if (!added) continue;
    text = full;

    const last = merged[merged.length - 1];
    if (last && last.type === 'text' && last.wordsOfJesus === Boolean(segment.wordsOfJesus)) {
      last.text += added;
    } else {
      merged.push({ type: 'text', text: added, wordsOfJesus: Boolean(segment.wordsOfJesus) });
    }
  }

  text = text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const cleanSegments = merged
    .map((part) => (part.type === 'text'
      ? { ...part, text: part.text.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '') }
      : part))
    .filter((part) => part.type !== 'text' || part.text.length > 0);

  return { text, segments: cleanSegments };
}

function extractChapterContent(content) {
  const verses = [];
  const blocks = [];

  const visit = (node) => {
    if (node == null) return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }
    if (typeof node !== 'object') return;

    if (node.type === 'heading') {
      const text = textFromContent(node.content);
      if (text) blocks.push({ type: 'heading', text });
      return;
    }
    if (node.type === 'hebrew_subtitle') {
      const text = textFromContent(node.content);
      if (text) blocks.push({ type: 'subtitle', text });
      return;
    }
    if (node.type === 'line_break') return;
    if (node.type === 'verse' && node.number != null) {
      const segments = [];
      collectSegments(node.content, segments);
      const { text, segments: verseSegments } = joinSegments(segments);
      if (text) {
        const verse = {
          number: Number(node.number),
          text,
          segments: verseSegments,
        };
        verses.push(verse);
        blocks.push({ type: 'verse', verse });
      }
      return;
    }
    if (Array.isArray(node.content)) visit(node.content);
  };

  visit(content);

  verses.sort((a, b) => a.number - b.number);
  const seen = new Set();
  const unique = [];
  for (const verse of verses) {
    if (!seen.has(verse.number)) {
      seen.add(verse.number);
      unique.push(verse);
    }
  }
  return { verses: unique, blocks };
}

async function loadChapter(versionId, bookSlug, chapterNumber) {
  const book = getBook(bookSlug);
  const version = getVersion(versionId);
  if (!book) throw new Error('That book could not be found.');
  if (!version) throw new Error('That translation could not be found.');
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > book.chapters) {
    throw new Error(`${book.name} has ${book.chapters} chapter${book.chapters === 1 ? '' : 's'}.`);
  }

  const bookId = apiBookSlug(version.id, book.slug);
  const url = `${API_BASE}/${version.id}/${bookId}/${chapterNumber}.json`;

  const data = await fetchJson(url);

  const { verses, blocks } = extractChapterContent(data.chapter?.content);

  if (!verses.length) {
    throw new Error('This chapter is not available in the selected translation.');
  }

  let autoCaller = 0;
  const footnotes = (data.chapter?.footnotes || []).map((note) => {
    let label = note.caller;
    if (label === '+' || label == null) {
      label = String.fromCharCode(97 + (autoCaller % 26));
      autoCaller += 1;
    }
    return {
      id: Number(note.noteId),
      text: cleanText(note.text),
      caller: String(label),
      reference: note.reference || null,
    };
  });

  const audio = Object.entries(data.thisChapterAudioLinks || {})
    .filter(([, audioUrl]) => typeof audioUrl === 'string' && audioUrl)
    .map(([reader, audioUrl]) => ({ reader, url: audioUrl }));

  const audioTimings = data.thisChapterAudioTimings || {};

  // Fetch localized book info
  let localizedBook = null;
  try {
    localizedBook = await getBookForVersion(version.id, bookSlug);
  } catch {
    // Fallback to static data
  }

  const wordCount = verses.reduce((total, verse) => total + verse.text.split(/\s+/).filter(Boolean).length, 0);

  return {
    version: version.id,
    book: book.slug,
    chapter: chapterNumber,
    verses,
    blocks,
    footnotes,
    audio,
    audioTimings,
    wordCount,
    // Localized book info
    bookName: localizedBook?.name || book.name,
    bookShortName: localizedBook?.shortName || book.shortName,
    bookCommonName: localizedBook?.commonName || book.name,
  };
}

/**
 * Fetch one chapter, sharing requests between views and searches.
 * The returned object is cached in memory for the life of the page.
 */
export function getChapter(versionId, bookSlug, chapterNumber) {
  const version = getVersion(versionId);
  const book = getBook(bookSlug);
  const safeChapter = Number(chapterNumber);
  if (!version || !book || !Number.isInteger(safeChapter)) {
    return Promise.reject(new Error('Invalid passage.'));
  }

  const key = `${version.id}|${book.slug}|${safeChapter}`;
  if (chapterCache.has(key)) return chapterCache.get(key);
  if (pendingRequests.has(key)) return pendingRequests.get(key);

  const request = loadChapter(version.id, book.slug, safeChapter)
    .then((chapter) => {
      chapterCache.set(key, Promise.resolve(chapter));
      pendingRequests.delete(key);
      return chapter;
    })
    .catch((error) => {
      pendingRequests.delete(key);
      throw error;
    });

  pendingRequests.set(key, request);
  return request;
}

export async function getVerse(versionId, bookSlug, chapterNumber, verseNumber) {
  const chapter = await getChapter(versionId, bookSlug, chapterNumber);
  const verse = chapter.verses.find((item) => item.number === Number(verseNumber));
  if (!verse) {
    throw new Error(`Verse ${verseNumber} was not found in this chapter.`);
  }
  return { ...verse, chapter };
}

export async function getVerses(versionId, bookSlug, chapterNumber, startVerse, endVerse) {
  const chapter = await getChapter(versionId, bookSlug, chapterNumber);
  const start = Number(startVerse) || 1;
  const end = Number(endVerse) || start;
  return chapter.verses.filter((verse) => verse.number >= start && verse.number <= end).map((verse) => ({
    ...verse,
    chapter,
  }));
}

/**
 * Search every chapter of a book with a small worker pool.
 * Pass `isCancelled` to stop a superseded search without aborting shared requests.
 */
export async function searchBook({
  versionId,
  bookSlug,
  query,
  onProgress,
  isCancelled = () => false,
  concurrency = 6,
}) {
  const book = getBook(bookSlug);
  const normalized = String(query || '').trim().toLowerCase();
  if (!book) throw new Error('Choose a book to search.');
  if (normalized.length < 2) throw new Error('Type at least two characters.');

  const results = [];
  const errors = [];
  let cursor = 0;
  let completed = 0;

  const worker = async () => {
    while (!isCancelled()) {
      const chapterNumber = cursor + 1;
      cursor += 1;
      if (chapterNumber > book.chapters) return;

      try {
        const chapter = await getChapter(versionId, book.slug, chapterNumber);
        if (isCancelled()) return;
        for (const verse of chapter.verses) {
          if (verse.text.toLowerCase().includes(normalized)) {
            results.push({
              book: book.slug,
              bookName: book.name,
              chapter: chapterNumber,
              verse: verse.number,
              text: verse.text,
            });
          }
        }
      } catch (error) {
        errors.push({ chapter: chapterNumber, message: error?.message || 'Failed' });
      }

      completed += 1;
      onProgress?.({
        completed,
        total: book.chapters,
        results: results.length,
        percent: Math.round((completed / book.chapters) * 100),
      });
    }
  };

  const poolSize = Math.min(concurrency, book.chapters);
  await Promise.all(Array.from({ length: poolSize }, () => worker()));

  results.sort((a, b) => a.chapter - b.chapter || a.verse - b.verse);

  return {
    results,
    errors,
    chapterCount: book.chapters,
    cancelled: isCancelled(),
  };
}

let apiBookSlugs = null;

function bookSlugFromApiId(bookId) {
  if (!apiBookSlugs) {
    apiBookSlugs = new Map(BOOKS.map((book) => [apiBookSlug(null, book.slug), book.slug]));
  }
  return apiBookSlugs.get(bookId) || null;
}

/**
 * Verse audio start times for one chapter recording. The returned array is
 * index-aligned with the chapter's verse list.
 */
export async function getAudioTimings(path) {
  if (!path) return null;
  const url = /^https?:/i.test(path)
    ? path
    : `https://bible.helloao.org${path.startsWith('/') ? path : `/${path}`}`;
  const data = await fetchJson(url);
  return Array.isArray(data.verses) ? data.verses.map(Number).filter(Number.isFinite) : null;
}

/**
 * Cross references from the open-cross-ref dataset, grouped by verse.
 * Loaded only when the reader asks to see them.
 */
export async function getCrossReferences(bookSlug, chapterNumber) {
  const book = getBook(bookSlug);
  if (!book) throw new Error('That book could not be found.');
  const bookId = apiBookSlug(null, bookSlug);
  const data = await fetchJson(`${API_BASE}/d/open-cross-ref/${bookId}/${Number(chapterNumber)}.json`);
  const content = data.chapter?.content || [];
  return content
    .map((entry) => ({
      verse: Number(entry.verse),
      references: (entry.references || [])
        .map((reference) => {
          const slug = bookSlugFromApiId(reference.book);
          if (!slug) return null;
          return {
            book: slug,
            chapter: Number(reference.chapter),
            verse: Number(reference.verse),
            endVerse: reference.endVerse ? Number(reference.endVerse) : null,
          };
        })
        .filter(Boolean),
    }))
    .filter((entry) => entry.references.length);
}

/**
 * Fetch books for a specific translation. Returns localized book names.
 * Cached per translation for the session.
 */
export async function getBooksForVersion(versionId) {
  if (booksCache.has(versionId)) return booksCache.get(versionId);
  if (pendingBooksRequests.has(versionId)) return pendingBooksRequests.get(versionId);

  const request = fetchJson(`${API_BASE}/${versionId}/books.json`)
    .then((data) => {
      const books = (data.books || []).map((book) => ({
        id: book.id,
        name: book.name,           // localized full name
        commonName: book.commonName, // localized common name
        shortName: book.shortName,   // localized short name
        order: book.order,
        chapters: book.numberOfChapters,
      }));
      booksCache.set(versionId, Promise.resolve(books));
      pendingBooksRequests.delete(versionId);
      return books;
    })
    .catch((error) => {
      pendingBooksRequests.delete(versionId);
      throw error;
    });

  pendingBooksRequests.set(versionId, request);
  return request;
}

/**
 * Get a single book's localized info for a version.
 */
export async function getBookForVersion(versionId, bookSlug) {
  const books = await getBooksForVersion(versionId);
  const book = books.find((b) => b.id === apiBookSlug(versionId, bookSlug));
  return book || null;
}

export function clearChapterCache() {
  chapterCache.clear();
  pendingRequests.clear();
  booksCache.clear();
  pendingBooksRequests.clear();
}

export function friendlyError(error) {
  const message = String(error?.message || '');
  if (/Failed to fetch|NetworkError|abort/i.test(message)) {
    return 'The scripture library could not be reached. Check your connection and try again.';
  }
  if (/not available/i.test(message)) {
    return message;
  }
  return message || 'Something went wrong while opening this passage.';
}