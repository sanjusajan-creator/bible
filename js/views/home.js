import {
  DAILY_VERSES,
  PLANS,
  STORY,
  TOPICS,
  VERSIONS,
  bookDisplayName,
  getBook,
  getVersion,
  planChapterCount,
  readerPath,
  referenceLabel,
  verseOfTheDay,
} from '../data.js';
import { getVerse } from '../api.js';
import { getState, lastReading, libraryCounts, planState, readingStreak } from '../store.js';
import {
  escapeHTML,
  formatLongDate,
  heroArt,
  icon,
  logomark,
  ornament,
  toast,
} from '../ui.js';

function versionShort(versionId) {
  return getVersion(versionId).short;
}

function renderVerseCard({ item, text, versionId, loading = false, error = '' }) {
  const version = getVersion(versionId);
  const ref = referenceLabel(item.book, item.chapter, item.verse, version.short);
  const bookLabel = bookDisplayName(item.book, item.chapter);

  if (loading) {
    return `<div class="verse-of-day is-loading" aria-live="polite" aria-busy="true">
      <div class="vod-top"><span class="vod-label">${icon('sparkles', { size: 14 })} Verse of the day</span><span class="vod-date">${escapeHTML(formatLongDate())}</span></div>
      <div class="skeleton skeleton--quote"></div>
      <div class="skeleton skeleton--quote skeleton--short"></div>
      <div class="skeleton skeleton--meta"></div>
    </div>`;
  }

  if (error) {
    return `<div class="verse-of-day verse-of-day--error" aria-live="polite">
      <div class="vod-top"><span class="vod-label">${icon('sparkles', { size: 14 })} Verse of the day</span><span class="vod-date">${escapeHTML(formatLongDate())}</span></div>
      <p class="vod-error">The library is quiet right now. Check your connection and try again.</p>
      <button type="button" class="text-button" data-retry-daily>${icon('refresh', { size: 14 })} Try again</button>
    </div>`;
  }

  return `<div class="verse-of-day" aria-live="polite">
    <div class="vod-top">
      <span class="vod-label">${icon('sparkles', { size: 14 })} Verse of the day</span>
      <span class="vod-date">${escapeHTML(formatLongDate())}</span>
    </div>
    <blockquote class="vod-quote">“${escapeHTML(text)}”</blockquote>
    <div class="vod-foot">
      <div>
        <span class="vod-ref">${escapeHTML(ref)}</span>
        <span class="vod-theme">${escapeHTML(item.theme || '')}</span>
      </div>
      <a class="vod-link" href="${readerPath(item.book, item.chapter, { verse: item.verse, version: version.id })}" aria-label="Read ${escapeHTML(ref)}">${icon('arrow-right', { size: 16 })}</a>
    </div>
    <button type="button" class="vod-refresh" data-refresh-daily aria-label="Show another verse" title="Another verse">${icon('refresh', { size: 14 })}</button>
  </div>`;
}

function planCard(plan, index) {
  const state = planState(plan.id);
  const completed = state?.completedDays?.length || 0;
  const total = plan.days.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return `<a class="plan-mini" href="#/plans/${plan.id}" data-tone="${plan.tone}" data-reveal style="--i:${index}">
    <div class="plan-mini-top">
      <span class="plan-mini-icon">${icon(plan.icon, { size: 18 })}</span>
      <span class="plan-mini-duration">${escapeHTML(plan.duration)}</span>
    </div>
    <h3 class="plan-mini-title">${escapeHTML(plan.title)}</h3>
    <p class="plan-mini-copy">${escapeHTML(plan.subtitle)}</p>
    ${completed > 0 ? `
      <div class="plan-mini-progress">
        <span style="width:${percent}%"></span>
      </div>
      <div class="plan-mini-meta">${completed} of ${total} days complete</div>
    ` : `
      <div class="plan-mini-meta">${planChapterCount(plan)} chapter${planChapterCount(plan) === 1 ? '' : 's'} · Begin when ready</div>
    `}
    <span class="plan-mini-arrow">${icon('arrow-up-right', { size: 16 })}</span>
  </a>`;
}

function statMarkup({ label, value, note, iconName }) {
  return `<div class="rhythm-stat">
    <span class="rhythm-icon">${icon(iconName, { size: 16 })}</span>
    <div>
      <span class="rhythm-label">${escapeHTML(label)}</span>
      <strong>${escapeHTML(value)}</strong>
      <small>${escapeHTML(note)}</small>
    </div>
  </div>`;
}

export function render(root, route, ctx) {
  const state = getState();
  const version = getVersion(state.version);
  const counts = libraryCounts();
  const streak = readingStreak();
  const last = lastReading();
  const daily = verseOfTheDay();
  const featuredPlans = ['stillness', 'john', 'bible-year']
    .map((id) => PLANS.find((plan) => plan.id === id))
    .filter(Boolean);

  const continueHref = last
    ? readerPath(last.book, last.chapter, { version: last.version })
    : readerPath('psalms', 23);
  const continueTitle = last ? bookDisplayName(last.book, last.chapter) : 'Psalm 23';
  const continueMeta = last
    ? `Last opened in ${versionShort(last.version)} · ${counts.chapters} chapter${counts.chapters === 1 ? '' : 's'} explored`
    : 'The Shepherd’s psalm — a gentle place to begin.';

  root.innerHTML = `
    <section class="hero">
      <div class="shell hero-grid">
        <div class="hero-copy">
          <p class="eyebrow eyebrow--date" data-reveal>
            <span class="eyebrow-mark"></span>
            <span>${escapeHTML(formatLongDate())}</span>
          </p>
          <h1 class="hero-title" data-reveal>
            Scripture,<br /><em>unhurried.</em>
          </h1>
          <p class="hero-lede" data-reveal>
            A quiet place to read every chapter, linger over a verse, and carry a word with you into the day.
          </p>
          <div class="hero-actions" data-reveal>
            <a class="btn btn--primary" href="${continueHref}">
              <span>${last ? `Continue ${continueTitle}` : 'Begin with Psalm 23'}</span>
              <span class="btn-orb">${icon('arrow-right', { size: 16 })}</span>
            </a>
            <a class="btn btn--ghost" href="#/explore">Explore Scripture</a>
          </div>
          <div class="hero-meta" data-reveal>
            <span>${icon('book-open', { size: 15 })} 66 books</span>
            <span>1,189 chapters</span>
            <span>${VERSIONS.length} translations</span>
            <span>Always free</span>
          </div>
        </div>

        <div class="hero-art-wrap" data-reveal>
          <div class="hero-arch">
            <div class="hero-canvas">
              ${heroArt()}
              <span class="hero-arch-label">Be still · and know</span>
              <div id="daily-verse-card" class="daily-card-host">
                ${renderVerseCard({ item: daily, versionId: version.id, loading: true })}
              </div>
            </div>
            <span class="hero-art-caption">A place for the Word to land</span>
          </div>
          <div class="hero-floating-note">
            <span class="hero-floating-icon">${icon('leaf', { size: 15 })}</span>
            <span>Read slowly.<br /><em>Return often.</em></span>
          </div>
        </div>
      </div>
    </section>

    <section class="shell rhythm-section" aria-label="Your reading rhythm">
      <div class="rhythm-bar" data-reveal>
        ${statMarkup({
          label: 'Your rhythm',
          value: streak ? `${streak} day streak` : 'Begin today',
          note: streak ? 'A gentle habit is forming' : 'One chapter is enough',
          iconName: 'sun',
        })}
        ${statMarkup({
          label: 'Chapters opened',
          value: String(counts.chapters),
          note: counts.chapters ? 'Across your translations' : 'Every journey starts somewhere',
          iconName: 'book-open',
        })}
        ${statMarkup({
          label: 'Saved words',
          value: String(counts.bookmarks + counts.highlights + counts.notes),
          note: 'Verses, highlights & notes',
          iconName: 'bookmark',
        })}
        ${statMarkup({
          label: 'Reading in',
          value: version.name,
          note: `${version.year} · Public domain`,
          iconName: 'feather',
        })}
        <a class="rhythm-link" href="#/saved">
          <span>Your library</span>
          ${icon('arrow-up-right', { size: 16 })}
        </a>
      </div>
    </section>

    <section class="shell section section--continue">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">Return & rest</p>
          <h2>Pick up the thread.</h2>
        </div>
        <a class="text-link" href="#/plans">Find a reading rhythm ${icon('arrow-right', { size: 15 })}</a>
      </div>

      <div class="continue-grid">
        <a class="continue-panel" href="${continueHref}" data-reveal>
          <span class="continue-orbit continue-orbit--one" aria-hidden="true"></span>
          <span class="continue-orbit continue-orbit--two" aria-hidden="true"></span>
          <div class="continue-top">
            <span class="continue-kicker">${icon('bookmark', { size: 14 })} ${last ? 'Continue reading' : 'A place to begin'}</span>
            <span class="continue-version">${escapeHTML(versionShort(last?.version || version.id))}</span>
          </div>
          <h3 class="continue-title">${escapeHTML(continueTitle)}</h3>
          <p class="continue-copy">${escapeHTML(continueMeta)}</p>
          <span class="continue-cta">
            Open the chapter
            <span class="continue-cta-orb">${icon('arrow-right', { size: 16 })}</span>
          </span>
          <span class="continue-watermark">${icon('quote', { size: 160 })}</span>
        </a>

        <article class="practice-panel" data-reveal>
          <div class="practice-head">
            <p class="eyebrow">A practice for today</p>
            <span class="practice-leaf">${icon('leaf', { size: 24 })}</span>
          </div>
          <h3>Read one verse<br /><em>three times.</em></h3>
          <ol class="practice-steps">
            <li><span>01</span><div><strong>Read it slowly.</strong><p>Let the words arrive without rushing.</p></div></li>
            <li><span>02</span><div><strong>Notice one word.</strong><p>What catches your attention? Stay there.</p></div></li>
            <li><span>03</span><div><strong>Carry it with you.</strong><p>Return to it once before the day ends.</p></div></li>
          </ol>
          <a class="text-link" href="${readerPath('psalms', 23, { verse: 1 })}">Try it with Psalm 23:1 ${icon('arrow-right', { size: 15 })}</a>
        </article>
      </div>
    </section>

    <section class="shell section section--topics">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">Explore by season</p>
          <h2>A word for today.</h2>
        </div>
        <a class="text-link" href="#/explore">All topics & books ${icon('arrow-right', { size: 15 })}</a>
      </div>

      <div class="topic-preview-grid">
        ${TOPICS.slice(0, 4).map((topic, index) => `
          <a class="topic-preview" href="#/explore/${topic.id}" data-tone="${topic.tone}" data-reveal style="--i:${index}">
            <span class="topic-preview-icon">${icon(topic.icon, { size: 22 })}</span>
            <span class="topic-preview-num">${String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3>${escapeHTML(topic.title)}</h3>
              <p>${escapeHTML(topic.subtitle)}</p>
            </div>
            <span class="topic-preview-arrow">${icon('arrow-up-right', { size: 17 })}</span>
          </a>`).join('')}
      </div>
    </section>

    <section class="section section--plans">
      <div class="shell">
        <div class="section-head" data-reveal>
          <div>
            <p class="eyebrow">A rhythm, not a race</p>
            <h2>Make room for the Word.</h2>
          </div>
          <a class="text-link" href="#/plans">All reading plans ${icon('arrow-right', { size: 15 })}</a>
        </div>
        <div class="plans-preview">
          ${featuredPlans.map((plan, index) => planCard(plan, index)).join('')}
        </div>
      </div>
    </section>

    <section class="shell section section--story">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">The whole library</p>
          <h2>The story in twelve movements.</h2>
        </div>
        <a class="text-link" href="#/explore">Enter the story ${icon('arrow-right', { size: 15 })}</a>
      </div>

      <div class="story-scroller" data-reveal>
        ${STORY.map((item) => `
          <a class="story-preview" href="${readerPath(item.book, item.chapter, { version: version.id })}" data-tone="${item.tone}">
            <span class="story-preview-num">${escapeHTML(item.numeral)}</span>
            <div class="story-preview-body">
              <span class="story-preview-ref">${escapeHTML(getBook(item.book).name)} ${item.chapter}</span>
              <h3>${escapeHTML(item.title)}</h3>
              <p>${escapeHTML(item.subtitle)}</p>
            </div>
            <span class="story-preview-arrow">${icon('arrow-right', { size: 16 })}</span>
          </a>`).join('')}
      </div>
    </section>

    <section class="shell closing-invite" data-reveal>
      ${ornament()}
      <p class="eyebrow">There is no finish line</p>
      <h2>“Thy word is a lamp unto my feet,<br /><em>and a light unto my path.</em>”</h2>
      <p class="closing-ref">Psalm 119:105 · KJV</p>
      <div class="closing-actions">
        <a class="btn btn--primary" href="${continueHref}">Open the reader ${icon('arrow-right', { size: 16 })}</a>
        <a class="btn btn--ghost" href="#/plans/stillness">Start seven quiet days</a>
      </div>
    </section>
  `;

  let dailyOffset = 0;
  let requestToken = 0;
  let retryMarkup = '';

  async function loadDaily(offset = dailyOffset) {
    const token = ++requestToken;
    const item = DAILY_VERSES[(((verseOfTheDayIndex() + offset) % DAILY_VERSES.length) + DAILY_VERSES.length) % DAILY_VERSES.length];
    const host = root.querySelector('#daily-verse-card');
    if (!host) return;
    host.innerHTML = renderVerseCard({ item, versionId: version.id, loading: true });
    try {
      const verse = await getVerse(version.id, item.book, item.chapter, item.verse);
      if (token !== requestToken || !root.isConnected || !host.isConnected) return;
      host.innerHTML = renderVerseCard({ item, text: verse.text, versionId: version.id });
    } catch (error) {
      if (token !== requestToken || !host.isConnected) return;
      host.innerHTML = renderVerseCard({ item, versionId: version.id, error: true });
    }
  }

  function verseOfTheDayIndex() {
    const start = new Date(new Date().getFullYear(), 0, 0);
    return Math.floor((new Date() - start) / 86400000) % DAILY_VERSES.length;
  }

  const onRootClick = (event) => {
    const refresh = event.target.closest('[data-refresh-daily]');
    if (refresh) {
      event.preventDefault();
      dailyOffset += 1;
      loadDaily(dailyOffset);
      return;
    }
    const retry = event.target.closest('[data-retry-daily]');
    if (retry) {
      event.preventDefault();
      loadDaily(dailyOffset);
    }
  };

  root.addEventListener('click', onRootClick);
  loadDaily();

  return {
    cleanup() {
      requestToken += 1;
      root.removeEventListener('click', onRootClick);
    },
  };
}
