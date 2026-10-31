/**
 * Static canon + curated content for Selah.
 * Chapter counts follow the 66-book Protestant canon.
 * Translation data sourced from https://bible.helloao.org
 */

export const BOOKS = Object.freeze([
  // Pentateuch
  { slug: 'genesis', name: 'Genesis', short: 'Gen', chapters: 50, testament: 'old', group: 'Law', genre: 'prose' },
  { slug: 'exodus', name: 'Exodus', short: 'Exod', chapters: 40, testament: 'old', group: 'Law', genre: 'prose' },
  { slug: 'leviticus', name: 'Leviticus', short: 'Lev', chapters: 27, testament: 'old', group: 'Law', genre: 'prose' },
  { slug: 'numbers', name: 'Numbers', short: 'Num', chapters: 36, testament: 'old', group: 'Law', genre: 'prose' },
  { slug: 'deuteronomy', name: 'Deuteronomy', short: 'Deut', chapters: 34, testament: 'old', group: 'Law', genre: 'prose' },

  // History
  { slug: 'joshua', name: 'Joshua', short: 'Josh', chapters: 24, testament: 'old', group: 'History', genre: 'prose' },
  { slug: 'judges', name: 'Judges', short: 'Judg', chapters: 21, testament: 'old', group: 'History', genre: 'prose' },
  { slug: 'ruth', name: 'Ruth', short: 'Ruth', chapters: 4, testament: 'old', group: 'History', genre: 'prose' },
  { slug: '1samuel', name: '1 Samuel', short: '1 Sam', chapters: 31, testament: 'old', group: 'History', genre: 'prose' },
  { slug: '2samuel', name: '2 Samuel', short: '2 Sam', chapters: 24, testament: 'old', group: 'History', genre: 'prose' },
  { slug: '1kings', name: '1 Kings', short: '1 Kgs', chapters: 22, testament: 'old', group: 'History', genre: 'prose' },
  { slug: '2kings', name: '2 Kings', short: '2 Kgs', chapters: 25, testament: 'old', group: 'History', genre: 'prose' },
  { slug: '1chronicles', name: '1 Chronicles', short: '1 Chr', chapters: 29, testament: 'old', group: 'History', genre: 'prose' },
  { slug: '2chronicles', name: '2 Chronicles', short: '2 Chr', chapters: 36, testament: 'old', group: 'History', genre: 'prose' },
  { slug: 'ezra', name: 'Ezra', short: 'Ezra', chapters: 10, testament: 'old', group: 'History', genre: 'prose' },
  { slug: 'nehemiah', name: 'Nehemiah', short: 'Neh', chapters: 13, testament: 'old', group: 'History', genre: 'prose' },
  { slug: 'esther', name: 'Esther', short: 'Esth', chapters: 10, testament: 'old', group: 'History', genre: 'prose' },

  // Wisdom & poetry
  { slug: 'job', name: 'Job', short: 'Job', chapters: 42, testament: 'old', group: 'Wisdom & Poetry', genre: 'prose' },
  { slug: 'psalms', name: 'Psalms', short: 'Ps', chapters: 150, testament: 'old', group: 'Wisdom & Poetry', genre: 'poetry' },
  { slug: 'proverbs', name: 'Proverbs', short: 'Prov', chapters: 31, testament: 'old', group: 'Wisdom & Poetry', genre: 'poetry' },
  { slug: 'ecclesiastes', name: 'Ecclesiastes', short: 'Eccl', chapters: 12, testament: 'old', group: 'Wisdom & Poetry', genre: 'prose' },
  { slug: 'songofsolomon', name: 'Song of Solomon', short: 'Song', chapters: 8, testament: 'old', group: 'Wisdom & Poetry', genre: 'poetry' },

  // Major prophets
  { slug: 'isaiah', name: 'Isaiah', short: 'Isa', chapters: 66, testament: 'old', group: 'Major Prophets', genre: 'prose' },
  { slug: 'jeremiah', name: 'Jeremiah', short: 'Jer', chapters: 52, testament: 'old', group: 'Major Prophets', genre: 'prose' },
  { slug: 'lamentations', name: 'Lamentations', short: 'Lam', chapters: 5, testament: 'old', group: 'Major Prophets', genre: 'poetry' },
  { slug: 'ezekiel', name: 'Ezekiel', short: 'Ezek', chapters: 48, testament: 'old', group: 'Major Prophets', genre: 'prose' },
  { slug: 'daniel', name: 'Daniel', short: 'Dan', chapters: 12, testament: 'old', group: 'Major Prophets', genre: 'prose' },

  // Minor prophets
  { slug: 'hosea', name: 'Hosea', short: 'Hos', chapters: 14, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'joel', name: 'Joel', short: 'Joel', chapters: 3, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'amos', name: 'Amos', short: 'Amos', chapters: 9, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'obadiah', name: 'Obadiah', short: 'Obad', chapters: 1, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'jonah', name: 'Jonah', short: 'Jonah', chapters: 4, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'micah', name: 'Micah', short: 'Mic', chapters: 7, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'nahum', name: 'Nahum', short: 'Nah', chapters: 3, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'habakkuk', name: 'Habakkuk', short: 'Hab', chapters: 3, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'zephaniah', name: 'Zephaniah', short: 'Zeph', chapters: 3, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'haggai', name: 'Haggai', short: 'Hag', chapters: 2, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'zechariah', name: 'Zechariah', short: 'Zech', chapters: 14, testament: 'old', group: 'Minor Prophets', genre: 'prose' },
  { slug: 'malachi', name: 'Malachi', short: 'Mal', chapters: 4, testament: 'old', group: 'Minor Prophets', genre: 'prose' },

  // Gospels & Acts
  { slug: 'matthew', name: 'Matthew', short: 'Matt', chapters: 28, testament: 'new', group: 'Gospels & Acts', genre: 'prose' },
  { slug: 'mark', name: 'Mark', short: 'Mark', chapters: 16, testament: 'new', group: 'Gospels & Acts', genre: 'prose' },
  { slug: 'luke', name: 'Luke', short: 'Luke', chapters: 24, testament: 'new', group: 'Gospels & Acts', genre: 'prose' },
  { slug: 'john', name: 'John', short: 'John', chapters: 21, testament: 'new', group: 'Gospels & Acts', genre: 'prose' },
  { slug: 'acts', name: 'Acts', short: 'Acts', chapters: 28, testament: 'new', group: 'Gospels & Acts', genre: 'prose' },

  // Letters
  { slug: 'romans', name: 'Romans', short: 'Rom', chapters: 16, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '1corinthians', name: '1 Corinthians', short: '1 Cor', chapters: 16, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '2corinthians', name: '2 Corinthians', short: '2 Cor', chapters: 13, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: 'galatians', name: 'Galatians', short: 'Gal', chapters: 6, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: 'ephesians', name: 'Ephesians', short: 'Eph', chapters: 6, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: 'philippians', name: 'Philippians', short: 'Phil', chapters: 4, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: 'colossians', name: 'Colossians', short: 'Col', chapters: 4, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '1thessalonians', name: '1 Thessalonians', short: '1 Thess', chapters: 5, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '2thessalonians', name: '2 Thessalonians', short: '2 Thess', chapters: 3, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '1timothy', name: '1 Timothy', short: '1 Tim', chapters: 6, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '2timothy', name: '2 Timothy', short: '2 Tim', chapters: 4, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: 'titus', name: 'Titus', short: 'Titus', chapters: 3, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: 'philemon', name: 'Philemon', short: 'Phlm', chapters: 1, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: 'hebrews', name: 'Hebrews', short: 'Heb', chapters: 13, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: 'james', name: 'James', short: 'Jas', chapters: 5, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '1peter', name: '1 Peter', short: '1 Pet', chapters: 5, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '2peter', name: '2 Peter', short: '2 Pet', chapters: 3, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '1john', name: '1 John', short: '1 John', chapters: 5, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '2john', name: '2 John', short: '2 John', chapters: 1, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: '3john', name: '3 John', short: '3 John', chapters: 1, testament: 'new', group: 'Letters', genre: 'prose' },
  { slug: 'jude', name: 'Jude', short: 'Jude', chapters: 1, testament: 'new', group: 'Letters', genre: 'prose' },

  // Apocalyptic
  { slug: 'revelation', name: 'Revelation', short: 'Rev', chapters: 22, testament: 'new', group: 'Apocalyptic', genre: 'prose' },
]);

export const BOOK_MAP = new Map(BOOKS.map((book) => [book.slug, book]));
export const BOOK_GROUPS = [
  'Law',
  'History',
  'Wisdom & Poetry',
  'Major Prophets',
  'Minor Prophets',
  'Gospels & Acts',
  'Letters',
  'Apocalyptic',
];

// Bible book ID mapping (helloao API uses standard 3-letter codes)
const BOOK_ID_MAP = {
  genesis: 'GEN',
  exodus: 'EXO',
  leviticus: 'LEV',
  numbers: 'NUM',
  deuteronomy: 'DEU',
  joshua: 'JOS',
  judges: 'JDG',
  ruth: 'RUT',
  '1samuel': '1SA',
  '2samuel': '2SA',
  '1kings': '1KI',
  '2kings': '2KI',
  '1chronicles': '1CH',
  '2chronicles': '2CH',
  ezra: 'EZR',
  nehemiah: 'NEH',
  esther: 'EST',
  job: 'JOB',
  psalms: 'PSA',
  proverbs: 'PRO',
  ecclesiastes: 'ECC',
  songofsolomon: 'SNG',
  isaiah: 'ISA',
  jeremiah: 'JER',
  lamentations: 'LAM',
  ezekiel: 'EZK',
  daniel: 'DAN',
  hosea: 'HOS',
  joel: 'JOL',
  amos: 'AMO',
  obadiah: 'OBA',
  jonah: 'JON',
  micah: 'MIC',
  nahum: 'NAM',
  habakkuk: 'HAB',
  zephaniah: 'ZEP',
  haggai: 'HAG',
  zechariah: 'ZEC',
  malachi: 'MAL',
  matthew: 'MAT',
  mark: 'MRK',
  luke: 'LUK',
  john: 'JHN',
  acts: 'ACT',
  romans: 'ROM',
  '1corinthians': '1CO',
  '2corinthians': '2CO',
  galatians: 'GAL',
  ephesians: 'EPH',
  philippians: 'PHP',
  colossians: 'COL',
  '1thessalonians': '1TH',
  '2thessalonians': '2TH',
  '1timothy': '1TI',
  '2timothy': '2TI',
  titus: 'TIT',
  philemon: 'PHM',
  hebrews: 'HEB',
  james: 'JAS',
  '1peter': '1PE',
  '2peter': '2PE',
  '1john': '1JN',
  '2john': '2JN',
  '3john': '3JN',
  jude: 'JUD',
  revelation: 'REV',
};

/**
 * All 247 complete Bible translations (66 books) from bible.helloao.org
 * covering 134 languages
 */

{{VERSIONS}}

export const VERSION_MAP = new Map(VERSIONS.map((version) => [version.id, version]));
export const DEFAULT_VERSION = 'eng_asv';
export const DEFAULT_LOCATION = { book: 'psalms', chapter: 23 };

{{LANGUAGES}}

export function getVersionsByLanguage(langCode) {
  return VERSIONS.filter(v => v.langCode === langCode);
}

export function getLanguages() {
  return LANGUAGES;
}

// API book ID mapping (helloao API uses standard 3-letter codes)
export function apiBookSlug(versionId, bookSlug) {
  return BOOK_ID_MAP[bookSlug] || bookSlug;
}

export function getBook(bookSlug) {
  return BOOK_MAP.get(bookSlug) || null;
}

export function getVersion(versionId) {
  return VERSION_MAP.get(versionId) || VERSION_MAP.get(DEFAULT_VERSION);
}

export function bookDisplayName(bookSlug, chapter) {
  const book = getBook(bookSlug);
  if (!book) return '';
  if (!chapter) return book.name;
  if (bookSlug === 'psalms') return `Psalm ${chapter}`;
  return `${book.name} ${chapter}`;
}

export function referenceLabel(bookSlug, chapter, verse, versionShort) {
  const book = getBook(bookSlug);
  if (!book) return '';
  const base = bookSlug === 'psalms' ? `Psalm ${chapter}` : `${book.name} ${chapter}`;
  const withVerse = verse ? `${base}:${verse}` : base;
  return versionShort ? `${withVerse} · ${versionShort}` : withVerse;
}

export function readerPath(bookSlug, chapter, options = {}) {
  const params = new URLSearchParams();
  if (options.verse) params.set('verse', String(options.verse));
  if (options.version) params.set('version', options.version);
  if (options.plan) params.set('plan', options.plan);
  if (options.day) params.set('day', String(options.day));
  const query = params.toString();
  return `#/read/${bookSlug}/${chapter}${query ? `?${query}` : ''}`;
}

export function chapterHref(bookSlug, chapter) {
  return `#/read/${bookSlug}/${chapter}`;
}

/* ------------------------------------------------------------------ */
/* Reference parsing                                                   */
/* ------------------------------------------------------------------ */

const EXTRA_ALIASES = {
  genesis: ['ge', 'gn'],
  exodus: ['ex', 'exo'],
  leviticus: ['lv', 'le'],
  numbers: ['nu', 'nm', 'nb'],
  deuteronomy: ['dt', 'de'],
  joshua: ['josh'],
  judges: ['jdg', 'jg', 'judges'],
  ruth: ['ru', 'rth'],
  '1samuel': ['1sm', '1sa', '1s'],
  '2samuel': ['2sm', '2sa', '2s'],
  '1kings': ['1ki', '1kgs', '1k'],
  '2kings': ['2ki', '2kgs', '2k'],
  '1chronicles': ['1ch', '1chr'],
  '2chronicles': ['2ch', '2chr'],
  ezra: ['ezr'],
  nehemiah: ['ne', 'neh'],
  esther: ['es', 'esth'],
  job: ['jb'],
  psalms: ['psalm', 'ps', 'psa', 'pss', 'pslm', 'psm'],
  proverbs: ['prov', 'pro', 'pr', 'prv'],
  ecclesiastes: ['eccl', 'ecc', 'ec', 'qoh'],
  songofsolomon: ['song', 'songofsongs', 'sos', 'canticles', 'cant', 'songofsongs'],
  isaiah: ['isa', 'is'],
  jeremiah: ['jer', 'je'],
  lamentations: ['lam', 'la'],
  ezekiel: ['eze', 'ezek', 'ezk'],
  daniel: ['dan', 'da', 'dn'],
  hosea: ['hos', 'ho'],
  joel: ['jl'],
  amos: ['am'],
  obadiah: ['obad', 'ob'],
  jonah: ['jon', 'jnh'],
  micah: ['mic', 'mi'],
  nahum: ['nah', 'na'],
  habakkuk: ['hab', 'hb'],
  zephaniah: ['zeph', 'zep', 'zp'],
  haggai: ['hag', 'hg'],
  zechariah: ['zech', 'zec', 'zc'],
  malachi: ['mal', 'ml'],
  matthew: ['matt', 'mat', 'mt'],
  mark: ['mk', 'mr'],
  luke: ['lk', 'luk'],
  john: ['jn', 'joh'],
  acts: ['ac', 'act'],
  romans: ['rom', 'ro', 'rm'],
  '1corinthians': ['1cor', '1co'],
  '2corinthians': ['2cor', '2co'],
  galatians: ['gal', 'ga'],
  ephesians: ['eph', 'ep'],
  philippians: ['phil', 'php'],
  colossians: ['col', 'co'],
  '1thessalonians': ['1thess', '1thes', '1th'],
  '2thessalonians': ['2thess', '2thes', '2th'],
  '1timothy': ['1tim', '1ti'],
  '2timothy': ['2tim', '2ti'],
  titus: ['tit', 'ti'],
  philemon: ['philem', 'phm', 'phlm'],
  hebrews: ['heb', 'hbr'],
  james: ['jas', 'jm'],
  '1peter': ['1pet', '1pe'],
  '2peter': ['2pet', '2pe'],
  '1john': ['1jn', '1jo'],
  '2john': ['2jn', '2jo'],
  '3john': ['3jn', '3jo'],
  jude: ['jd', 'jde'],
  revelation: ['rev', 're', 'apocalypse', 'revelations'],
};

export function normalizeBookKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const ALIAS_TO_SLUG = new Map();
for (const book of BOOKS) {
  const aliases = [book.name, book.short, book.slug, ...(EXTRA_ALIASES[book.slug] || [])];
  for (const alias of aliases) {
    ALIAS_TO_SLUG.set(normalizeBookKey(alias), book.slug);
  }
}

export function matchBook(value) {
  if (!value) return null;
  const key = normalizeBookKey(value);
  const slug = ALIAS_TO_SLUG.get(key);
  return slug ? getBook(slug) : null;
}

/**
 * Parse strings such as "John 3:16", "1 cor 13", "psalm 23 1",
 * "Genesis 1:1-5", or "romans 8".
 * Returns null when the input is not a reference.
 */
export function parseReference(input) {
  let text = String(input || '').trim().toLowerCase();
  if (!text) return null;

  text = text
    .replace(/^book\s+of\s+/, '')
    .replace(/\b(chapter|chapters|chap|ch)\b\.?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const match = text.match(/^(.*?)\s*(\d{1,3})(?:\s*(?:[:.]\s*|\s+)(\d{1,3}))?(?:\s*[-–—]\s*(\d{1,3}))?$/);
  if (!match) return null;

  const [, rawBook, rawChapter, rawVerse, rawEnd] = match;
  const book = matchBook(rawBook);
  if (!book) return null;

  const chapter = Number(rawChapter);
  const verse = rawVerse ? Number(rawVerse) : null;
  const endVerse = rawEnd ? Number(rawEnd) : null;
  if (!chapter || chapter < 1) return null;

  if (chapter > book.chapters) {
    return {
      error: `${book.name} has ${book.chapters} chapter${book.chapters === 1 ? '' : 's'}.`,
      book,
    };
  }

  return {
    book,
    chapter,
    verse: verse && verse > 0 ? verse : null,
    endVerse: endVerse && endVerse >= (verse || 1) ? endVerse : null,
    label: `${book.name} ${chapter}${verse ? `:${verse}${endVerse ? `–${endVerse}` : ''}` : ''}`,
  };
}

/* ------------------------------------------------------------------ */
/* Curated verse collections                                           */
/* ------------------------------------------------------------------ */

export const DAILY_VERSES = Object.freeze([
  { book: 'psalms', chapter: 23, verse: 1, theme: 'The Shepherd' },
  { book: 'isaiah', chapter: 40, verse: 31, theme: 'Renewed strength' },
  { book: 'lamentations', chapter: 3, verse: 22, theme: 'New every morning' },
  { book: 'psalms', chapter: 46, verse: 10, theme: 'Be still' },
  { book: 'proverbs', chapter: 3, verse: 5, theme: 'Trust the path' },
  { book: 'matthew', chapter: 11, verse: 28, theme: 'Come and rest' },
  { book: 'romans', chapter: 8, verse: 28, theme: 'Held together' },
  { book: 'psalms', chapter: 27, verse: 1, theme: 'Light and salvation' },
  { book: 'isaiah', chapter: 41, verse: 10, theme: 'Do not fear' },
  { book: '1corinthians', chapter: 13, verse: 4, theme: 'The shape of love' },
  { book: 'psalms', chapter: 139, verse: 14, theme: 'Wonderfully made' },
  { book: 'hebrews', chapter: 11, verse: 1, theme: 'Faith' },
  { book: 'micah', chapter: 6, verse: 8, theme: 'What is good' },
  { book: 'psalms', chapter: 118, verse: 24, theme: 'This is the day' },
  { book: '2corinthians', chapter: 5, verse: 17, theme: 'New creation' },
  { book: 'psalms', chapter: 119, verse: 105, theme: 'A lamp for the way' },
  { book: 'john', chapter: 3, verse: 16, theme: 'For God so loved' },
  { book: 'philippians', chapter: 4, verse: 6, theme: 'Anxiety into prayer' },
  { book: 'psalms', chapter: 34, verse: 18, theme: 'Near to the brokenhearted' },
  { book: 'revelation', chapter: 21, verse: 4, theme: 'Every tear wiped away' },
  { book: 'galatians', chapter: 5, verse: 22, theme: 'Fruit of the Spirit' },
  { book: 'psalms', chapter: 121, verse: 1, theme: 'Lift your eyes' },
  { book: 'deuteronomy', chapter: 31, verse: 6, theme: 'Strong and courageous' },
  { book: 'psalms', chapter: 62, verse: 1, theme: 'A soul at rest' },
  { book: 'john', chapter: 14, verse: 27, theme: 'Peace, not as the world gives' },
  { book: 'romans', chapter: 15, verse: 13, theme: 'Abound in hope' },
  { book: 'psalms', chapter: 103, verse: 2, theme: 'Do not forget' },
  { book: 'isaiah', chapter: 43, verse: 19, theme: 'A new thing' },
  { book: 'matthew', chapter: 5, verse: 14, theme: 'Light of the world' },
  { book: '1thessalonians', chapter: 5, verse: 16, theme: 'Rejoice always' },
  { book: 'psalms', chapter: 34, verse: 18, theme: 'Near to the brokenhearted' },
  { book: 'isaiah', chapter: 43, verse: 19, theme: 'A new thing' },
  { book: 'matthew', chapter: 5, verse: 14, theme: 'Light of the world' },
  { book: '1thessalonians', chapter: 5, verse: 16, theme: 'Rejoice always' },
  { book: 'psalms', chapter: 34, verse: 18, theme: 'Near to the brokenhearted' },
  { book: 'isaiah', chapter: 43, verse: 19, theme: 'A new thing' },
  { book: 'matthew', chapter: 5, verse: 14, theme: 'Light of the world' },
  { book: '1thessalonians', chapter: 5, verse: 16, theme: 'Rejoice always' },
  { book: 'psalms', chapter: 34, verse: 18, theme: 'Near to the brokenhearted' },
  { book: 'isaiah', chapter: 43, verse: 19, theme: 'A new thing' },
  { book: 'matthew', chapter: 5, verse: 14, theme: 'Light of the world' },
  { book: '1thessalonians', chapter: 5, verse: 16, theme: 'Rejoice always' },
]);

export function verseOfTheDay(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date - start) / 86400000);
  return DAILY_VERSES[((day % DAILY_VERSES.length) + DAILY_VERSES.length) % DAILY_VERSES.length];
}

export const TOPICS = Object.freeze([
  {
    id: 'stillness',
    title: 'Stillness',
    subtitle: 'For the noise inside and out',
    description: 'The world asks for your attention. These words invite you to set it down for a moment.',
    tone: 'sage',
    icon: 'leaf',
    refs: [
      { book: 'psalms', chapter: 46, verse: 10 },
      { book: 'psalms', chapter: 62, verse: 1 },
      { book: 'mark', chapter: 6, verse: 31 },
      { book: 'isaiah', chapter: 30, verse: 15 },
    ],
  },
  {
    id: 'courage',
    title: 'Courage',
    subtitle: 'When the next step feels too large',
    description: 'Courage is rarely loud. Sometimes it is simply the next faithful step, taken with company.',
    tone: 'gold',
    icon: 'sun',
    refs: [
      { book: 'joshua', chapter: 1, verse: 9 },
      { book: 'isaiah', chapter: 41, verse: 10 },
      { book: '2timothy', chapter: 1, verse: 7 },
      { book: 'psalms', chapter: 27, verse: 14 },
    ],
  },
  {
    id: 'hope',
    title: 'Hope',
    subtitle: 'When the horizon is hard to see',
    description: 'Hope does not deny the dark. It remembers that morning is coming.',
    tone: 'sky',
    icon: 'dawn',
    refs: [
      { book: 'romans', chapter: 15, verse: 13 },
      { book: 'lamentations', chapter: 3, verse: 22 },
      { book: 'jeremiah', chapter: 29, verse: 11 },
      { book: 'romans', chapter: 8, verse: 25 },
    ],
  },
  {
    id: 'grief',
    title: 'Grief',
    subtitle: 'Words for the days that ache',
    description: 'There is no shortcut through sorrow. These passages make room for it, and sit beside you in it.',
    tone: 'rose',
    icon: 'still-water',
    refs: [
      { book: 'psalms', chapter: 34, verse: 18 },
      { book: 'matthew', chapter: 5, verse: 4 },
      { book: 'psalms', chapter: 147, verse: 3 },
      { book: 'revelation', chapter: 21, verse: 4 },
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    subtitle: 'For ordinary, overlooked gifts',
    description: 'Gratitude is a way of seeing. These verses help you notice what is already in your hands.',
    tone: 'clay',
    icon: 'wheat',
    refs: [
      { book: 'psalms', chapter: 103, verse: 2 },
      { book: '1thessalonians', chapter: 5, verse: 18 },
      { book: 'colossians', chapter: 3, verse: 15 },
      { book: 'psalms', chapter: 118, verse: 24 },
    ],
  },
  {
    id: 'love',
    title: 'Love',
    subtitle: 'The shape of a life given away',
    description: 'Scripture describes love less as a feeling and more as a practice: patient, brave, and unhurried.',
    tone: 'rose',
    icon: 'heart',
    refs: [
      { book: '1corinthians', chapter: 13, verse: 4 },
      { book: '1john', chapter: 4, verse: 19 },
      { book: 'john', chapter: 15, verse: 12 },
      { book: 'songofsolomon', chapter: 8, verse: 7 },
    ],
  },
  {
    id: 'wisdom',
    title: 'Wisdom',
    subtitle: 'For decisions without a map',
    description: 'Wisdom is not having every answer. It is learning to walk attentively, with humility and light.',
    tone: 'moss',
    icon: 'compass',
    refs: [
      { book: 'proverbs', chapter: 3, verse: 5 },
      { book: 'james', chapter: 1, verse: 5 },
      { book: 'psalms', chapter: 119, verse: 105 },
      { book: 'ecclesiastes', chapter: 3, verse: 1 },
    ],
  },
  {
    id: 'rest',
    title: 'Rest',
    subtitle: 'Permission to lay it down',
    description: 'You are not a machine. Rest is not a reward for finishing; it is a gift woven into the beginning.',
    tone: 'sage',
    icon: 'moon',
    refs: [
      { book: 'matthew', chapter: 11, verse: 28 },
      { book: 'psalms', chapter: 4, verse: 8 },
      { book: 'exodus', chapter: 33, verse: 14 },
      { book: 'isaiah', chapter: 40, verse: 31 },
    ],
  },
  {
    id: 'identity',
    title: 'Identity',
    subtitle: 'Before you were known by anyone',
    description: 'Your worth is not a verdict to be earned. These passages speak of a love that begins before you do.',
    tone: 'gold',
    icon: 'fingerprint',
    refs: [
      { book: 'psalms', chapter: 139, verse: 14 },
      { book: 'ephesians', chapter: 2, verse: 10 },
      { book: 'isaiah', chapter: 43, verse: 1 },
      { book: 'galatians', chapter: 2, verse: 20 },
    ],
  },
  {
    id: 'forgiveness',
    title: 'Forgiveness',
    subtitle: 'Letting go, again and again',
    description: 'Mercy is not amnesia. It is the freedom to begin again without being defined by what came before.',
    tone: 'sky',
    icon: 'waves',
    refs: [
      { book: '1john', chapter: 1, verse: 9 },
      { book: 'colossians', chapter: 3, verse: 13 },
      { book: 'micah', chapter: 7, verse: 18 },
      { book: 'psalms', chapter: 103, verse: 12 },
    ],
  },
]);

export const TOPIC_MAP = new Map(TOPICS.map((topic) => [topic.id, topic]));

export const STORY = Object.freeze([
  {
    id: 'creation',
    numeral: 'I',
    title: 'Creation',
    subtitle: 'Out of nothing, light',
    book: 'genesis',
    chapter: 1,
    description: 'Before there was time, there was intention. The story opens with a world called good.',
    tone: 'sage',
  },
  {
    id: 'fall',
    numeral: 'II',
    title: 'The Fracture',
    subtitle: 'A garden, and a choice',
    book: 'genesis',
    chapter: 3,
    description: 'The world we know: beautiful, wounded, and longing to be made whole.',
    tone: 'rose',
  },
  {
    id: 'call',
    numeral: 'III',
    title: 'The Call',
    subtitle: 'A promise begins with a step',
    book: 'genesis',
    chapter: 12,
    description: 'God asks Abraham to leave everything familiar, for a future he cannot yet see.',
    tone: 'gold',
  },
  {
    id: 'exodus',
    numeral: 'IV',
    title: 'Exodus',
    subtitle: 'Freedom through the water',
    book: 'exodus',
    chapter: 14,
    description: 'A people enslaved, a sea unmoved, and a deliverance no one could engineer.',
    tone: 'sky',
  },
  {
    id: 'covenant',
    numeral: 'V',
    title: 'The Covenant',
    subtitle: 'Words to live by',
    book: 'deuteronomy',
    chapter: 6,
    description: 'Freedom takes shape as a way of life: love God, remember, and teach the next generation.',
    tone: 'clay',
  },
  {
    id: 'david',
    numeral: 'VI',
    title: 'The Shepherd King',
    subtitle: 'The smallest brother is chosen',
    book: '1samuel',
    chapter: 16,
    description: 'God looks past the outward. A shepherd boy is anointed, and the kingdom turns on humility.',
    tone: 'moss',
  },
  {
    id: 'prophets',
    numeral: 'VII',
    title: 'The Prophets',
    subtitle: 'Truth spoken into the night',
    book: 'isaiah',
    chapter: 6,
    description: 'Holy vision meets human resistance. The prophets call a wandering people home.',
    tone: 'rose',
  },
  {
    id: 'exile',
    numeral: 'VIII',
    title: 'Exile & Hope',
    subtitle: 'A letter to the displaced',
    book: 'jeremiah',
    chapter: 29,
    description: 'In a strange land, the people are told to plant gardens, build lives, and wait on hope.',
    tone: 'gold',
  },
  {
    id: 'incarnation',
    numeral: 'IX',
    title: 'The Word Made Flesh',
    subtitle: 'God enters the room',
    book: 'john',
    chapter: 1,
    description: 'The story narrows to a manger, a mother, and a child who is the light of the world.',
    tone: 'sky',
  },
  {
    id: 'cross',
    numeral: 'X',
    title: 'The Cross',
    subtitle: 'Love, poured out',
    book: 'john',
    chapter: 19,
    description: 'The hour toward which everything has been moving — and the moment the world goes dark.',
    tone: 'rose',
  },
  {
    id: 'resurrection',
    numeral: 'XI',
    title: 'Resurrection',
    subtitle: 'The garden is open',
    book: 'john',
    chapter: 20,
    description: 'The tomb is empty. Grief becomes wonder, and fear becomes a commission.',
    tone: 'sage',
  },
  {
    id: 'newness',
    numeral: 'XII',
    title: 'All Things New',
    subtitle: 'A city without a night',
    book: 'revelation',
    chapter: 21,
    description: 'The story ends not in escape, but in a homecoming. Every tear wiped away.',
    tone: 'sky',
  },
]);

export const STORY_MAP = new Map(STORY.map((item) => [item.id, item]));

/* ------------------------------------------------------------------ */
/* Reading plans                                                       */
/* ------------------------------------------------------------------ */

function ref(book, chapter) {
  return { book, chapter };
}

function dayFromRefs(label, readings, title) {
  return { label, readings, title: title || '' };
}

function generatePsalms30() {
  const days = [];
  for (let day = 1; day <= 30; day += 1) {
    const chapters = [day, day + 30, day + 60, day + 90, day + 120];
    days.push(
      dayFromRefs(
        `Day ${day}`,
        chapters.map((chapter) => ref('psalms', chapter)),
        chapters.map((chapter) => `Psalm ${chapter}`).join(' · '),
      ),
    );
  }
  return days;
}

function generateJohn21() {
  return Array.from({ length: 21 }, (_, index) =>
    dayFromRefs(`Day ${index + 1}`, [ref('john', index + 1)], `John ${index + 1}`),
  );
}

function generateBibleYear() {
  const all = [];
  for (const book of BOOKS) {
    for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
      all.push(ref(book.slug, chapter));
    }
  }
  const days = 365;
  const base = Math.floor(all.length / days);
  const extra = all.length % days;
  let cursor = 0;
  const result = [];
  for (let day = 1; day <= days; day += 1) {
    const count = base + (day <= extra ? 1 : 0);
    const readings = all.slice(cursor, cursor + count);
    cursor += count;
    result.push(
      dayFromRefs(
        `Day ${day}`,
        readings,
        readings.length <= 2
          ? readings.map((reading) => `${getBook(reading.book)?.short || reading.book} ${reading.chapter}`).join(' · ')
          : '',
      ),
    );
  }
  return result;
}

const stillnessDays = [
  ['The Shepherd', [ref('psalms', 23)]],
  ['Be still', [ref('psalms', 46)]],
  ['Come and rest', [ref('matthew', 11)]],
  ['A soul at rest', [ref('psalms', 62)]],
  ['Quiet strength', [ref('isaiah', 30)]],
  ['A desert place', [ref('mark', 6)]],
  ['All things new', [ref('revelation', 21)]],
].map(([title, readings], index) => dayFromRefs(`Day ${index + 1}`, readings, title));

const storyDays = STORY.map((item, index) =>
  dayFromRefs(`Day ${index + 1}`, [ref(item.book, item.chapter)], item.title),
);

const wisdomRefs = [
  ['proverbs', 1],
  ['proverbs', 3],
  ['proverbs', 4],
  ['proverbs', 8],
  ['proverbs', 10],
  ['proverbs', 15],
  ['proverbs', 22],
  ['ecclesiastes', 1],
  ['ecclesiastes', 3],
  ['ecclesiastes', 12],
  ['job', 1],
  ['job', 38],
  ['james', 1],
  ['james', 3],
];
const wisdomDays = wisdomRefs.map(([book, chapter], index) =>
  dayFromRefs(`Day ${index + 1}`, [ref(book, chapter)], `${getBook(book)?.name || book} ${chapter}`),
);

export const PLANS = Object.freeze([
  {
    id: 'stillness',
    title: 'Seven Days of Stillness',
    subtitle: 'A week to slow down',
    description: 'Seven passages, one week. A gentle on-ramp for a hurried soul.',
    duration: '7 days',
    tone: 'sage',
    icon: 'leaf',
    featured: false,
    days: stillnessDays,
  },
  {
    id: 'john',
    title: 'The Life of Jesus',
    subtitle: 'The Gospel of John, chapter by chapter',
    description: 'Twenty-one days in the Gospel that begins in eternity and ends in a garden.',
    duration: '21 days',
    tone: 'gold',
    icon: 'sun',
    featured: false,
    days: generateJohn21(),
  },
  {
    id: 'psalms30',
    title: 'Thirty Days in the Psalms',
    subtitle: 'Five psalms each day',
    description: 'Prayer, protest, praise, and everything in between. Let the Psalms give you words.',
    duration: '30 days',
    tone: 'sky',
    icon: 'waves',
    featured: false,
    days: generatePsalms30(),
  },
  {
    id: 'story',
    title: 'The Whole Story',
    subtitle: 'Twelve movements through Scripture',
    description: 'From creation to new creation, trace the arc of the Bible in twelve readings.',
    duration: '12 days',
    tone: 'rose',
    icon: 'compass',
    featured: false,
    days: storyDays,
  },
  {
    id: 'wisdom',
    title: 'Words to Live By',
    subtitle: 'Fourteen days in the wisdom books',
    description: 'Proverbs, Ecclesiastes, Job, and James on living well in a world that resists easy answers.',
    duration: '14 days',
    tone: 'clay',
    icon: 'wheat',
    featured: false,
    days: wisdomDays,
  },
  {
    id: 'bible-year',
    title: 'The Bible in a Year',
    subtitle: 'Every chapter, in three hundred and sixty-five days',
    description: 'A steady, unforced journey through the whole library — about three chapters a day.',
    duration: '365 days',
    tone: 'moss',
    icon: 'book',
    featured: true,
    days: generateBibleYear(),
  },
]);

export const PLAN_MAP = new Map(PLANS.map((plan) => [plan.id, plan]));

export function getPlan(planId) {
  return PLAN_MAP.get(planId) || null;
}

export function planChapterCount(plan) {
  return plan.days.reduce((total, day) => total + day.readings.length, 0);
}

export function totalChapters() {
  return BOOKS.reduce((total, book) => total + book.chapters, 0);
}

export function dailyReadingTime(words) {
  return Math.max(1, Math.round(words / 190));
}
