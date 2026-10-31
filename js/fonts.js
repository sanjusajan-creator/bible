/**
 * Script-aware web typography.
 *
 * Latin, Cyrillic, Greek, Arabic, Hebrew, and the major Indic, South-East
 * Asian, Caucasian, and Ethiopic scripts are declared in the main Google
 * Fonts request in index.html. The large CJK families are loaded only when a
 * reader actually chooses a Chinese, Japanese, or Korean translation, so the
 * rest of the app never pays for those files.
 */

const CJK_FONTS = {
  cmn: { family: 'Noto Serif SC', script: 'hans' },
  yue: { family: 'Noto Serif TC', script: 'hant' },
  nan: { family: 'Noto Serif TC', script: 'hant' },
  hak: { family: 'Noto Serif TC', script: 'hant' },
  lzh: { family: 'Noto Serif TC', script: 'hant' },
  jpn: { family: 'Noto Serif JP', script: 'jpn' },
  kor: { family: 'Noto Serif KR', script: 'kor' },
};

const loaded = new Set();

/** A small data attribute used by the reader to pick the right CJK face. */
export function scriptFor(langCode) {
  return CJK_FONTS[langCode]?.script || '';
}

/** Load the display face for a CJK language on first use. */
export function ensureLanguageFont(langCode) {
  const entry = CJK_FONTS[langCode];
  if (!entry || loaded.has(entry.family) || typeof document === 'undefined') return;
  loaded.add(entry.family);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${entry.family.replace(/ /g, '+')}:wght@400;600&display=swap`;
  link.dataset.selahFont = entry.family;
  document.head.appendChild(link);
}
