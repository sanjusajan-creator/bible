# Selah

**Scripture, unhurried.**

Selah is a quiet, editorial Bible reader for the web. It pairs the public-domain and openly licensed chapter texts from the [Free Use Bible API](https://bible.helloao.org) with a warm, print-inspired interface built for slow reading rather than rapid clicking.

No build step, no framework, no account. Open the app and read.

---

## Run it locally

Requires Node.js 18 or newer.

```bash
npm start
```

Then open **http://localhost:4173**.

To use a different port:

```bash
# macOS / Linux
PORT=5000 npm start

# Windows PowerShell
$env:PORT=5000; npm start
```

The included `server.mjs` is a small dependency-free static server with SPA fallback and path traversal protection. There is nothing to install and nothing to compile.

---

## What is inside

### Reading
- All 66 books of the Protestant canon, chapter by chapter.
- Deep links such as `#/read/john/3?verse=16&version=en-kjv`.
- Verse selection with four highlight colours, bookmarks, margin notes, copy, and native share.
- Read-aloud with pause, resume, and stop using the browser’s speech synthesis voices.
- Focus mode that clears the page back to the text.
- Reading progress, chapter navigation, and a quiet end-of-chapter reflection.
- Adjustable typeface, text size, line height, verse numbers, and three themes: Daylight, Parchment, and Nightfall.

### Discovery
- **Explore** — ten curated doorways into Scripture, plus the full library with testament filters and instant book search.
- **Search** — a reference jump box for passages like `John 3:16` or `Romans 8:28–30`, and keyword search across every verse of a chosen book.
- **Topics** — collected passages for stillness, courage, grief, hope, gratitude, love, wisdom, rest, identity, and forgiveness.
- **The story** — twelve movements from creation to new creation.

### Your library
- Saved verses, highlights, notes, and reading history, kept together under **Library**.
- Six reading plans, from a seven-day pause to the whole Bible in a year.
- Per-plan progress, day completion, and a reading card that follows you into the reader.
- Undo for removed items, JSON export, and a clear-library action.
- Everything is stored locally in `localStorage` under `selah.v1`. Nothing is sent to a server.

### Craft
- Fraunces, Newsreader, and Manrope, with a warm ivory, forest, and gold palette.
- Hand-drawn sunrise arch artwork, paper grain, and restrained motion.
- Responsive from small phones to wide desktops, with a mobile bottom navigation bar and off-canvas reader library.
- Keyboard-friendly dialogs, focus management, skip link, reduced-motion support, and semantic landmarks.

---

## Translations

Selah includes **247 translations across 134 languages** from the Free Use Bible API, filtered for complete (or near-complete) Bibles. Every language with at least one qualifying translation appears in the translation browser, grouped by language with sticky headings.

Translation can be changed from the header, the reader toolbar, or the settings drawer. Your place is preserved.

The translation browser supports live search across language names, native names, and translation metadata. RTL scripts (Arabic, Hebrew, etc.) and CJK scripts (Chinese, Japanese, Korean) are fully supported with appropriate fonts loaded from Google Fonts.

---

## Keyboard shortcuts

| Action | Key |
| --- | --- |
| Search anywhere | `/` |
| Previous chapter | `←` |
| Next chapter | `→` |
| Focus mode | `F` |
| Listen aloud | `L` |
| Close a panel or dialog | `Esc` |

Verse cards are focusable: press `Enter` or `Space` to open the verse actions.

---

## Project structure

```text
.
├── index.html            App shell, header, footer, overlay roots
├── server.mjs            Dependency-free static server
├── favicon.svg           Sunrise arch mark
├── css/
│   ├── styles.css        Import entry point
│   ├── tokens.css        Design tokens, base, header, footer
│   ├── home.css          Home page and preview components
│   ├── reader.css        Reader layout, chapter typography, sidebar
│   ├── reader-actions.css  Verse toolbar, listen dock, focus mode
│   ├── discovery.css     Explore, topic, search, and library views
│   ├── plans.css         Plan index and plan detail
│   ├── pages.css         Shared page heroes, not-found, reflections
│   ├── overlays.css      Settings drawer, modals, toasts
│   └── responsive.css    Breakpoints from 1180px down to 380px
└── js/
    ├── main.js           Entry point
    ├── app.js            Hash router, chrome, settings, dialogs
    ├── api.js            Chapter fetching, caching, text cleanup, search
    ├── data.js           Canon, translations, topics, story, plans
    ├── store.js          Preferences and library persistence
    ├── ui.js             Icons, logomark, modals, toasts, formatters
    └── views/            One module per route
```

The app uses native ES modules and hash-based routing, so it works from any static host without rewrite rules. `server.mjs` also serves unknown paths as `index.html` for convenience.

---

## Scripture API

Chapter data, audio, timings, and cross-references are served by the [Free Use Bible API](https://bible.helloao.org):

```text
https://bible.helloao.org/api/available_translations.json
https://bible.helloao.org/api/{version}/books.json
https://bible.helloao.org/api/{version}/{book}/{chapter}.json
https://bible.helloao.org/api/{version}/{book}/{chapter}.{reader}.audioTimings.json
https://bible.helloao.org/api/d/open-cross-ref/{book}/{chapter}.json
```

Responses are cached in memory for the session and by the browser for repeat visits. The API is a free, open project; if you fork or deploy Selah, consider supporting or mirroring it.

**Attribution:** Scripture data from the [Free Use Bible API](https://bible.helloao.org). Translations are public domain or openly licensed.

---

## Privacy

- No analytics, tracking pixels, or accounts.
- Saved verses, notes, highlights, history, and reading plans live only in your browser.
- Network requests go to the Free Use Bible API (helloao), Google Fonts, and audio CDN. There is no application backend.
- **Export library** in the settings drawer downloads a JSON copy of your data. **Clear library** removes saved content and plans while keeping appearance settings.

Speech synthesis is provided by your operating system and never sends the text to a third-party service from Selah.

---

## Known limitations

- An internet connection is required to load chapter text and web fonts for the first time.
- Read-aloud voice quality and availability depend on the voices installed on your device.
- The upstream API is community-maintained; occasional chapter errors or slow responses are handled with a fallback source and a friendly retry state.

---

*Read slowly. Return often.*
