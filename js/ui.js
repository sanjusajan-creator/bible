import { LANGUAGES, VERSIONS, getVersionsByLanguage } from './data.js';
import { getFavoriteLanguages, toggleFavoriteLanguage } from './store.js';

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const ICONS = {
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  'arrow-up-right': '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  'arrow-down': '<path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bookmark: '<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  'bookmark-filled': '<path fill="currentColor" d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  highlighter: '<path d="m12 19 7-7a2.1 2.1 0 0 0-3-3l-7 7-1 4 4-1Z"/><path d="m3 21 5-5"/><path d="m15 5 4 4"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  headphones: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M21 14h-3a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2Z"/>',
  play: '<path d="m7 4 13 8-13 8Z"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  sliders: '<path d="M4 6h8"/><path d="M18 6h2"/><circle cx="15" cy="6" r="2.2"/><path d="M4 12h2"/><path d="M12 12h8"/><circle cx="9" cy="12" r="2.2"/><path d="M4 18h10"/><path d="M20 18h0"/><circle cx="17" cy="18" r="2.2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z"/><path d="M2 21c0-3 1.9-5.5 4-6"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.2 7.8-2.4 6-6 2.4 2.4-6Z"/>',
  'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2Z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7Z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4"/><path d="m8.6 13.5 6.8 4"/>',
  external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
  sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M19 17v4"/><path d="M17 19h4"/>',
  maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/>',
  minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/>',
  waves: '<path d="M2 7c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 13c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/><path d="M2 19c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>',
  wheat: '<path d="M12 22V8"/><path d="M12 12C9 12 7 10 7 7c3 0 5 2 5 5Z"/><path d="M12 12c3 0 5-2 5-5-3 0-5 2-5 5Z"/><path d="M12 17c-2.5 0-4.5-1.8-4.5-4.5 2.5 0 4.5 1.8 4.5 4.5Z"/><path d="M12 17c2.5 0 4.5-1.8 4.5-4.5-2.5 0-4.5 1.8-4.5 4.5Z"/>',
  fingerprint: '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.59-2.32.71-4.4.71-7.02a6 6 0 0 0-12 0c0 .5 0 .98.02 1.45"/><path d="M2 12h2a10 10 0 0 1 20 0c0 1.24-.1 2.42-.3 3.56"/><path d="M5 12a7 7 0 0 1 14 0c0 1.28-.08 2.44-.24 3.5"/>',
  dawn: '<path d="M12 2v4"/><path d="m5.2 6.2 2.8 2.8"/><path d="m18.8 6.2-2.8 2.8"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M6 18a6 6 0 0 1 12 0"/><path d="M2 22h20"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'more-horizontal': '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  library: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  circle: '<circle cx="12" cy="12" r="9"/>',
  'circle-dot': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>',
  type: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  'layout-grid': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  quote: '<path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7a3 3 0 0 1-3 3"/><path d="M19 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7a3 3 0 0 1-3 3"/>',
  'corner-down-right': '<path d="m15 10 5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4Z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5Z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/>',
  'still-water': '<path d="M3 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2"/><path d="M3 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2"/><path d="M3 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2"/>',
  'bookmark-check': '<path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><path d="m9 10 2 2 4-4"/>',
  route: '<circle cx="6" cy="19" r="2"/><path d="M6 17V7a4 4 0 0 1 4-4h5"/><path d="m13 1 4 2-4 2"/><circle cx="18" cy="5" r="2" fill="currentColor" stroke="none"/>',
};

export function icon(name, { size = 18, className = '', strokeWidth = 1.7 } = {}) {
  const body = ICONS[name] || ICONS.circle;
  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export function logomark({ size = 34, className = '' } = {}) {
  return `<svg class="logomark ${className}" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="18.5" stroke="currentColor" stroke-width="1.15"/>
    <circle cx="20" cy="16.2" r="5.2" fill="var(--gold)"/>
    <path d="M5.5 24.1c3.8-2.9 7.4-2.9 11.1 0 3.7 2.9 7.4 2.9 11.1 0 2.3-1.8 4.5-2.3 6.8-1.5" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/>
    <path d="M8.4 29.1c3.2-2.2 6.1-2.2 9.3 0 3.2 2.2 6.1 2.2 9.3 0 1.2-.8 2.4-1.2 3.5-1.1" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" opacity=".55"/>
  </svg>`;
}

export function heroArt() {
  return `<svg class="hero-illustration" viewBox="0 0 720 760" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="selah-sky" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="var(--hero-sky-1)"/>
        <stop offset="1" stop-color="var(--hero-sky-2)"/>
      </linearGradient>
      <radialGradient id="selah-haze" cx="50%" cy="50%" r="50%">
        <stop stop-color="var(--hero-sun-glow)" stop-opacity=".9"/>
        <stop offset="1" stop-color="var(--hero-sun-glow)" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="selah-sun" x1="0" y1="0" x2="0.8" y2="1">
        <stop stop-color="var(--hero-sun-1)"/>
        <stop offset="1" stop-color="var(--hero-sun-2)"/>
      </linearGradient>
      <linearGradient id="selah-water" x1="0" y1="0" x2="0" y2="1">
        <stop stop-color="var(--hero-hill-3)"/>
        <stop offset="1" stop-color="var(--hero-hill-4)"/>
      </linearGradient>
    </defs>
    <rect width="720" height="760" fill="url(#selah-sky)"/>
    <circle cx="445" cy="282" r="330" fill="url(#selah-haze)"/>
    <g class="hero-rings" stroke="var(--hero-line)" stroke-width="1" opacity=".62">
      <circle cx="445" cy="282" r="176"/>
      <circle cx="445" cy="282" r="216"/>
      <circle cx="445" cy="282" r="264"/>
      <circle cx="445" cy="282" r="318"/>
    </g>
    <circle class="hero-sun" cx="445" cy="282" r="122" fill="url(#selah-sun)"/>
    <g class="hero-birds" stroke="var(--hero-bird)" stroke-width="1.6" stroke-linecap="round" opacity=".7">
      <path d="M546 216c7-7 14-7 21 0 7-7 14-7 21 0"/>
      <path d="M597 252c4.5-4.5 9-4.5 13.5 0 4.5-4.5 9-4.5 13.5 0"/>
      <path d="M510 178c3.5-3.5 7-3.5 10.5 0 3.5-3.5 7-3.5 10.5 0" opacity=".65"/>
    </g>
    <path d="M0 506c116-48 215-20 332-38 128-20 251-54 388-2v294H0Z" fill="var(--hero-hill-1)" opacity=".72"/>
    <path d="M0 582c142-48 264-12 396-43 134-31 222-24 324 22v199H0Z" fill="var(--hero-hill-2)" opacity=".9"/>
    <path d="M0 650c151-42 277-2 413-32 123-27 215-12 307 34v108H0Z" fill="url(#selah-water)"/>
    <g stroke="var(--hero-water-line)" stroke-width="1" opacity=".28">
      <path d="M42 690c102-18 177-3 266-17 111-17 200-6 296 13"/>
      <path d="M96 719c93-12 162-1 248-12 96-13 165-2 250 11"/>
      <path d="M18 741c116-13 188 2 291-9 98-11 190 1 286 9"/>
    </g>
  </svg>`;
}

export function ornament() {
  return `<span class="ornament" aria-hidden="true"><span></span><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 0.8 7.6 4.4 11.2 6 7.6 7.6 6 11.2 4.4 7.6 0.8 6 4.4 4.4Z" fill="currentColor"/></svg><span></span></span>`;
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function escapeHTML(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightMatches(text, query) {
  const escaped = escapeHTML(text);
  if (!query || query.trim().length < 2) return escaped;
  try {
    const regex = new RegExp(`(${escapeRegExp(query.trim())})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  } catch {
    return escaped;
  }
}

export function formatDate(timestamp, options = {}) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const { year, ...rest } = options;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(year ? { year: 'numeric' } : {}),
    ...rest,
  }).format(date);
}

export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - new Date(timestamp).getTime();
  if (diff < 60_000) return 'Just now';
  if (diff < 3_600_000) {
    const mins = Math.floor(diff / 60_000);
    return `${mins} min ago`;
  }
  if (diff < 86_400_000) {
    const hours = Math.floor(diff / 3_600_000);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  if (diff < 172_800_000) return 'Yesterday';
  return formatDate(timestamp, { year: new Date(timestamp).getFullYear() !== new Date().getFullYear() });
}

export function formatLongDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function plural(count, singular, multiple = `${singular}s`) {
  return `${count} ${count === 1 ? singular : multiple}`;
}

export function debounce(fn, delay = 250) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

export function scrollToTop(behavior = 'instant') {
  window.scrollTo({ top: 0, left: 0, behavior });
}

export function setPageTitle(title) {
  document.title = title ? `${title} · Selah` : 'Selah — Scripture, unhurried';
}

/* ------------------------------------------------------------------ */
/* Clipboard & download                                                */
/* ------------------------------------------------------------------ */

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      const success = document.execCommand('copy');
      area.remove();
      return success;
    } catch {
      return false;
    }
  }
}

export function downloadFile(filename, content, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------------ */
/* Toast                                                               */
/* ------------------------------------------------------------------ */

let toastTimer = null;

export function toast(message, { actionLabel = '', onAction = null, duration = 4200, tone = 'default' } = {}) {
  const root = document.getElementById('toast-root');
  if (!root) return;
  clearTimeout(toastTimer);
  root.innerHTML = '';

  const el = document.createElement('div');
  el.className = `toast toast--${tone}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="toast-icon">${icon(tone === 'error' ? 'info' : 'check', { size: 15 })}</span><span class="toast-message"></span>`;
  el.querySelector('.toast-message').textContent = message;

  const dismiss = () => {
    clearTimeout(toastTimer);
    el.classList.remove('is-visible');
    setTimeout(() => el.remove(), 220);
  };

  if (actionLabel) {
    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'toast-action';
    action.textContent = actionLabel;
    action.addEventListener('click', () => {
      onAction?.();
      dismiss();
    });
    el.append(action);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'toast-close';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.innerHTML = icon('close', { size: 14 });
  close.addEventListener('click', dismiss);
  el.append(close);

  root.append(el);
  requestAnimationFrame(() => el.classList.add('is-visible'));
  toastTimer = setTimeout(dismiss, duration);
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

let activeModal = null;
let modalCounter = 0;

function focusables(container) {
  return [...container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => element.offsetParent !== null);
}

export function closeModal(reason = 'dismiss') {
  if (!activeModal) return;
  const { layer, previousFocus, keyHandler, onClose } = activeModal;
  activeModal = null;
  document.removeEventListener('keydown', keyHandler);
  layer.remove();
  document.body.classList.remove('modal-open');
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus({ preventScroll: true });
  }
  onClose?.(reason);
}

export function openModal({
  title = '',
  eyebrow = '',
  subtitle = '',
  content = '',
  footer = '',
  className = '',
  onMount,
  onClose,
  labelledBy = '',
  initialFocus = '',
} = {}) {
  closeModal('replaced');
  const root = document.getElementById('modal-root');
  if (!root) return null;

  const modalId = `modal-title-${++modalCounter}`;
  const previousFocus = document.activeElement;
  const layer = document.createElement('div');
  layer.className = 'modal-layer';
  layer.innerHTML = `
    <div class="modal ${className}" role="dialog" aria-modal="true" ${labelledBy ? `aria-labelledby="${labelledBy}"` : title || eyebrow ? `aria-labelledby="${modalId}"` : ''}>
      <div class="modal-glow" aria-hidden="true"></div>
      ${(title || eyebrow) ? `
        <header class="modal-head">
          <div>
            ${eyebrow ? `<p class="eyebrow">${escapeHTML(eyebrow)}</p>` : ''}
            ${title ? `<h2 class="modal-title" id="${modalId}">${escapeHTML(title)}</h2>` : ''}
            ${subtitle ? `<p class="modal-subtitle">${escapeHTML(subtitle)}</p>` : ''}
          </div>
          <button type="button" class="icon-btn modal-close" data-modal-close aria-label="Close dialog">${icon('close', { size: 18 })}</button>
        </header>` : ''}
      <div class="modal-body">${content}</div>
      ${footer ? `<footer class="modal-foot">${footer}</footer>` : ''}
    </div>`;

  const keyHandler = (event) => {
    if (!activeModal) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal('escape');
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables(layer);
    if (!items.length) {
      event.preventDefault();
      return;
    }
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

  root.append(layer);
  document.body.classList.add('modal-open');
  activeModal = { layer, previousFocus, keyHandler, onClose };

  layer.addEventListener('mousedown', (event) => {
    if (event.target === layer) closeModal('backdrop');
  });
  layer.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.addEventListener('click', () => closeModal('button'));
  });

  document.addEventListener('keydown', keyHandler);

  const close = (reason = 'dismiss') => closeModal(reason);
  onMount?.(layer, close);

  requestAnimationFrame(() => {
    layer.classList.add('is-visible');
    const target = initialFocus ? layer.querySelector(initialFocus) : focusables(layer)[0];
    target?.focus({ preventScroll: true });
  });

  return { element: layer, close };
}

/* ------------------------------------------------------------------ */
/* Common dialogs                                                      */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Translation browser                                                 */
/* ------------------------------------------------------------------ */

function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function versionMeta(version) {
  const parts = [];
  if (version.englishName && version.englishName !== version.name) parts.push(version.englishName);
  if (version.year) parts.push(String(version.year));
  parts.push(version.books === 66 ? 'Complete Bible' : `${version.books || '—'} books`);
  return parts.join(' · ');
}

/**
 * All translations, grouped beneath their language. Each language heading is
 * sticky inside the scroll area, so the translation list stays oriented while
 * the reader scrolls through 134 languages and 275 editions.
 */
export function translationBrowserMarkup(currentId, { className = '' } = {}) {
  const total = VERSIONS.length;
  const languageCount = LANGUAGES.length;
  const favoriteLanguages = getFavoriteLanguages();

  // Separate favorite and regular languages
  const favoriteGroups = [];
  const regularGroups = [];

  LANGUAGES.forEach((language) => {
    const versions = getVersionsByLanguage(language.code);
    if (!versions.length) return;
    const languageSearch = normalizeSearch(`${language.name} ${language.nativeName} ${language.code}`);
    const isFavoriteLanguage = favoriteLanguages.includes(language.code);
    const rows = versions.map((version) => {
      const current = version.id === currentId;
      const haystack = normalizeSearch([
        language.name,
        language.nativeName,
        language.code,
        version.name,
        version.short,
        version.englishName,
        version.year,
        version.id,
      ].join(' '));
      return `<button type="button" class="version-row ${current ? 'is-current' : ''}" data-version-id="${escapeHTML(version.id)}" data-search="${escapeHTML(haystack)}"${current ? ' aria-current="true"' : ''}>
        <span class="version-badge" data-tone="${escapeHTML(version.accent || 'sage')}">${escapeHTML(version.short)}</span>
        <span class="version-row-copy">
          <span class="version-row-name" dir="auto" lang="${escapeHTML(version.langCode)}">${escapeHTML(version.name)}</span>
          <span class="version-row-meta">${escapeHTML(versionMeta(version))}</span>
        </span>
        <span class="version-row-check">${current ? icon('check', { size: 16 }) : ''}</span>
      </button>`;
    }).join('');

    const groupHtml = `<section class="version-group ${isFavoriteLanguage ? 'is-favorite' : ''}" data-language-group="${escapeHTML(language.code)}" data-search="${escapeHTML(languageSearch)}">
      <header class="version-group-head">
        <span class="version-group-native" dir="${language.direction === 'rtl' ? 'rtl' : 'ltr'}" lang="${escapeHTML(language.code)}">${escapeHTML(language.nativeName)}</span>
        <span class="version-group-english">${escapeHTML(language.name)}</span>
        <span class="version-group-count">${versions.length}</span>
        <button type="button" class="version-fav-toggle" data-fav-toggle="${escapeHTML(language.code)}" aria-label="${isFavoriteLanguage ? 'Remove from favorites' : 'Add to favorites'}" aria-pressed="${isFavoriteLanguage}">
          ${icon(isFavoriteLanguage ? 'heart' : 'heart', { size: 14, className: isFavoriteLanguage ? 'is-favorite' : '', strokeWidth: isFavoriteLanguage ? 0 : 1.7 })}
        </button>
      </header>
      <div class="version-group-rows">${rows}</div>
    </section>`;

    if (isFavoriteLanguage) {
      favoriteGroups.push(groupHtml);
    } else {
      regularGroups.push(groupHtml);
    }
  });

  const allGroups = [...favoriteGroups, ...regularGroups].join('');

  return `<div class="version-browser ${className}" data-version-browser>
    <div class="version-browser-tools">
      <label class="version-search">
        ${icon('search', { size: 15 })}
        <input type="search" inputmode="search" autocomplete="off" spellcheck="false"
          placeholder="Search ${languageCount} languages, ${total} translations"
          data-version-search aria-label="Search languages and translations" />
        <button type="button" class="version-search-clear" data-version-clear aria-label="Clear translation search" hidden>${icon('close', { size: 13 })}</button>
      </label>
      <p class="version-browser-count" data-version-count aria-live="polite">${total} translations · ${languageCount} languages</p>
    </div>
    <div class="version-browser-scroll" data-version-scroll>
      <div class="version-browser-groups">${allGroups}</div>
      ${favoriteGroups.length > 0 && regularGroups.length > 0 ? '<hr class="version-groups-divider" aria-hidden="true" />' : ''}
      <p class="version-browser-empty" data-version-empty hidden>No language or translation matches that search. Try a shorter word, or clear the field to browse everything.</p>
    </div>
  </div>`;
}

/**
 * Wire the search field inside a rendered translation browser. The browser is
 * mounted directly, so it can live inside the drawer or a modal unchanged.
 */
export function mountTranslationBrowser(root, { scrollToCurrent = true } = {}) {
  const host = root.querySelector('[data-version-browser]');
  if (!host) return null;

  const input = host.querySelector('[data-version-search]');
  const clear = host.querySelector('[data-version-clear]');
  const count = host.querySelector('[data-version-count]');
  const empty = host.querySelector('[data-version-empty]');
  const scroll = host.querySelector('[data-version-scroll]');
  const groups = [...host.querySelectorAll('[data-language-group]')];
  const defaultCount = count?.textContent || '';

  const apply = () => {
    const query = normalizeSearch(input?.value || '');
    let visibleRows = 0;
    let visibleGroups = 0;

    groups.forEach((group) => {
      let groupRows = 0;
      group.querySelectorAll('[data-version-id]').forEach((row) => {
        const hit = !query || (row.dataset.search || '').includes(query);
        row.hidden = !hit;
        if (hit) groupRows += 1;
      });
      group.hidden = groupRows === 0;
      if (groupRows > 0) {
        visibleRows += groupRows;
        visibleGroups += 1;
      }
    });

    if (clear) clear.hidden = !query;
    if (empty) empty.hidden = visibleRows > 0;
    if (count) {
      count.textContent = query
        ? `${visibleRows} translation${visibleRows === 1 ? '' : 's'} · ${visibleGroups} language${visibleGroups === 1 ? '' : 's'}`
        : defaultCount;
    }
  };

  input?.addEventListener('input', apply);
  clear?.addEventListener('click', () => {
    if (!input) return;
    input.value = '';
    apply();
    input.focus();
  });

  apply();

  // Heart toggle buttons for favorite languages
  const favToggles = host.querySelectorAll('[data-fav-toggle]');
  favToggles.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const langCode = btn.getAttribute('data-fav-toggle');
      const newFavorites = toggleFavoriteLanguage(langCode);
      const isFav = newFavorites.includes(langCode);
      btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
      btn.setAttribute('aria-pressed', String(isFav));
      const heartIcon = btn.querySelector('.icon');
      if (heartIcon) {
        heartIcon.classList.toggle('is-favorite', isFav);
        heartIcon.setAttribute('stroke-width', isFav ? '0' : '1.7');
        // Update fill for filled heart
        if (isFav) {
          heartIcon.innerHTML = '<path fill="currentColor" d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>';
        } else {
          heartIcon.innerHTML = '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>';
        }
      }
    });
  });

  if (scrollToCurrent && scroll) {
    // Double rAF: wait for modal to become visible + laid out
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const row = host.querySelector('.version-row.is-current');
        if (!row) return;
        scroll.scrollTop = Math.max(0, row.offsetTop - scroll.clientHeight / 2 + row.offsetHeight / 2);
      });
    });
  }

  return { filter: apply, focus: () => input?.focus() };
}

export function openVersionPicker(currentId, onSelect) {
  const content = `
    ${translationBrowserMarkup(currentId)}
    <p class="modal-note">Every edition offered here is in the public domain. You can change translations at any time without losing your place.</p>`;

  openModal({
    eyebrow: 'Translation',
    title: 'Choose your voice',
    subtitle: 'The same story, in different rhythms.',
    content,
    className: 'modal--versions',
    initialFocus: '[data-version-search]',
    onMount(layer, close) {
      mountTranslationBrowser(layer);
      layer.querySelectorAll('[data-version-id]').forEach((button) => {
        button.addEventListener('click', () => {
          const versionId = button.getAttribute('data-version-id');
          onSelect?.(versionId);
          close();
        });
      });
    },
  });
}

export function openNoteEditor({ reference, verseText, existingNote = '', onSave, onDelete }) {
  const content = `
    <div class="note-context">
      <span class="note-context-ref">${escapeHTML(reference)}</span>
      <blockquote>${escapeHTML(verseText)}</blockquote>
    </div>
    <label class="field-label" for="note-textarea">Your reflection</label>
    <textarea id="note-textarea" class="note-textarea" rows="5" maxlength="4000" placeholder="What word or thought do you want to carry with you?"></textarea>
    <div class="note-actions">
      ${existingNote ? '<button type="button" class="text-button text-button--danger" data-delete-note>Delete note</button>' : '<span></span>'}
      <div class="note-action-group">
        <button type="button" class="btn btn--quiet" data-modal-close>Cancel</button>
        <button type="button" class="btn btn--primary" data-save-note>${icon('check', { size: 16 })} Save note</button>
      </div>
    </div>
    <p class="modal-note modal-note--small">Notes live only on this device. Press Ctrl + Enter to save.</p>`;

  const modal = openModal({
    eyebrow: 'A quiet thought',
    title: 'Write in the margin',
    content,
    className: 'modal--note',
    initialFocus: '#note-textarea',
    onMount(layer, close) {
      const textarea = layer.querySelector('#note-textarea');
      textarea.value = existingNote;

      const save = () => {
        onSave?.(textarea.value);
        close();
      };

      layer.querySelector('[data-save-note]')?.addEventListener('click', save);
      layer.querySelector('[data-delete-note]')?.addEventListener('click', () => {
        onDelete?.();
        close();
      });
      textarea.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          save();
        }
      });
    },
  });

  return modal;
}

export function confirmDialog({
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
} = {}) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const content = `<p class="confirm-message">${escapeHTML(message)}</p>`;
    const footer = `
      <button type="button" class="btn btn--quiet" data-cancel>${escapeHTML(cancelLabel)}</button>
      <button type="button" class="btn ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}" data-confirm>${escapeHTML(confirmLabel)}</button>`;

    const modal = openModal({
      title,
      content,
      footer,
      className: 'modal--confirm',
      initialFocus: '[data-cancel]',
      onClose() {
        finish(false);
      },
      onMount(layer, close) {
        layer.querySelector('[data-cancel]')?.addEventListener('click', () => {
          finish(false);
          close('cancel');
        });
        layer.querySelector('[data-confirm]')?.addEventListener('click', () => {
          finish(true);
          close('confirm');
        });
      },
    });

    if (!modal) finish(false);
  });
}

/* ------------------------------------------------------------------ */
/* Reading plan helpers                                                */
/* ------------------------------------------------------------------ */

export function progressRing(percent, { size = 76, stroke = 5, label = '' } = {}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = Math.max(0, Math.min(100, percent)) / 100 * circumference;
  return `<div class="progress-ring" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="var(--gold)" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference - dash}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
    </svg>
    <span class="progress-ring-label">${escapeHTML(label || `${Math.round(percent)}%`)}</span>
  </div>`;
}

export function applyRevealAnimation(root = document) {
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
