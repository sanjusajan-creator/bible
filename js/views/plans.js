import {
  PLANS,
  bookDisplayName,
  getBook,
  getVersion,
  planChapterCount,
  readerPath,
} from '../data.js';
import { getState, planState, readingStreak, startedPlans } from '../store.js';
import { escapeHTML, icon, ornament, progressRing } from '../ui.js';

function planStats(plan) {
  const state = planState(plan.id);
  const completed = state?.completedDays?.length || 0;
  const total = plan.days.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const nextDay = plan.days.findIndex((_, index) => !(state?.completedDays || []).includes(index + 1));
  return {
    started: Boolean(state),
    completed,
    total,
    percent,
    nextDay: nextDay < 0 ? null : nextDay + 1,
  };
}

function dayHref(plan, dayNumber, readingIndex = 0) {
  const reading = plan.days[dayNumber - 1]?.readings[readingIndex];
  if (!reading) return `#/plans/${plan.id}`;
  return readerPath(reading.book, reading.chapter, { plan: plan.id, day: dayNumber });
}

function planCard(plan, index) {
  const stats = planStats(plan);
  const chapters = planChapterCount(plan);

  return `<a class="plan-card" href="#/plans/${plan.id}" data-tone="${plan.tone}" data-reveal style="--i:${index}">
    <div class="plan-card-top">
      <span class="plan-card-icon">${icon(plan.icon, { size: 20 })}</span>
      <span class="plan-card-duration">${escapeHTML(plan.duration)}</span>
    </div>
    <div class="plan-card-copy">
      <p class="plan-card-chapters">${chapters} chapter${chapters === 1 ? '' : 's'}</p>
      <h2>${escapeHTML(plan.title)}</h2>
      <p class="plan-card-subtitle">${escapeHTML(plan.subtitle)}</p>
      <p class="plan-card-description">${escapeHTML(plan.description)}</p>
    </div>
    <div class="plan-card-foot">
      ${stats.started ? `
        <div class="plan-card-progress">
          <div class="plan-card-progress-bar"><span style="width:${stats.percent}%"></span></div>
          <span>${stats.completed} of ${stats.total} days</span>
        </div>
      ` : `
        <span class="plan-card-begin">${icon('book-open', { size: 14 })} Begin when ready</span>
      `}
      <span class="plan-card-arrow">${icon('arrow-up-right', { size: 17 })}</span>
    </div>
  </a>`;
}

function featuredCard(plan) {
  const stats = planStats(plan);
  const chapters = planChapterCount(plan);
  return `<a class="plan-feature" href="#/plans/${plan.id}" data-tone="${plan.tone}" data-reveal>
    <span class="plan-feature-orbit plan-feature-orbit--one" aria-hidden="true"></span>
    <span class="plan-feature-orbit plan-feature-orbit--two" aria-hidden="true"></span>
    <div class="plan-feature-copy">
      <p class="eyebrow">The long, unhurried road</p>
      <h2>${escapeHTML(plan.title)}</h2>
      <p class="plan-feature-subtitle">${escapeHTML(plan.subtitle)}</p>
      <p class="plan-feature-description">${escapeHTML(plan.description)}</p>
      <span class="plan-feature-meta">${icon('book', { size: 15 })} ${chapters} chapters ${icon('calendar', { size: 15 })} ${escapeHTML(plan.duration)}</span>
    </div>
    <div class="plan-feature-aside">
      ${progressRing(stats.percent, { size: 116, stroke: 4, label: stats.started ? `${stats.completed}/${stats.total}` : '365' })}
      <span class="plan-feature-cta">${stats.started ? 'Continue the journey' : 'Begin the journey'} ${icon('arrow-right', { size: 16 })}</span>
    </div>
  </a>`;
}

function startedCard(entry) {
  const plan = PLANS.find((item) => item.id === entry.id);
  if (!plan) return '';
  const stats = planStats(plan);
  if (!stats.nextDay) {
    return `<a class="plan-started-card" href="#/plans/${plan.id}" data-tone="${plan.tone}">
      <span class="plan-started-icon">${icon('check-circle', { size: 21 })}</span>
      <span class="plan-started-copy">
        <strong>${escapeHTML(plan.title)}</strong>
        <span>Every day complete — a journey finished</span>
      </span>
      <span class="plan-started-arrow">${icon('arrow-right', { size: 16 })}</span>
    </a>`;
  }
  const nextDay = plan.days[stats.nextDay - 1];
  return `<a class="plan-started-card" href="${dayHref(plan, stats.nextDay)}" data-tone="${plan.tone}" data-plan-continue="${plan.id}">
    <span class="plan-started-icon">${icon(plan.icon, { size: 21 })}</span>
    <span class="plan-started-copy">
      <strong>${escapeHTML(plan.title)}</strong>
      <span>Up next · Day ${stats.nextDay}${nextDay?.title ? ` — ${escapeHTML(nextDay.title)}` : ''}</span>
    </span>
    <span class="plan-started-progress">
      <span><i style="width:${stats.percent}%"></i></span>
      <em>${stats.percent}%</em>
    </span>
    <span class="plan-started-arrow">${icon('arrow-right', { size: 16 })}</span>
  </a>`;
}

export function render(root) {
  const state = getState();
  const version = getVersion(state.version);
  const started = startedPlans().filter((entry) => PLANS.some((plan) => plan.id === entry.id));
  const featured = PLANS.find((plan) => plan.featured);
  const standardPlans = PLANS.filter((plan) => !plan.featured);
  const streak = readingStreak();

  root.innerHTML = `
    <section class="page-hero plans-hero">
      <div class="shell page-hero-inner">
        <div class="page-hero-copy">
          <p class="eyebrow" data-reveal><span class="eyebrow-mark"></span>Reading plans</p>
          <h1 class="page-title" data-reveal>A rhythm,<br /><em>not a race.</em></h1>
          <p class="page-lede" data-reveal>Choose a path and let it carry you. Miss a day? Begin again. The Word is patient, and so is this place.</p>
          <div class="page-hero-actions" data-reveal>
            <a class="btn btn--primary" href="#/read/psalms/23">Read freely ${icon('book-open', { size: 16 })}</a>
            <a class="btn btn--ghost" href="#/explore">Explore Scripture</a>
          </div>
          <p class="plans-hero-note" data-reveal>${icon('sun', { size: 14 })} ${streak ? `${streak}-day reading rhythm · ${version.short}` : `Reading in ${version.short} · Begin whenever you are ready`}</p>
        </div>
        <div class="plans-hero-art" aria-hidden="true" data-reveal>
          <span class="plans-hero-halo"></span>
          <span class="plans-hero-ring plans-hero-ring--one"></span>
          <span class="plans-hero-ring plans-hero-ring--two"></span>
          <span class="plans-hero-arch"></span>
          <span class="plans-hero-word">Rhythm</span>
          <span class="plans-hero-subword">one day at a time</span>
          <span class="plans-hero-dot plans-hero-dot--one"></span>
          <span class="plans-hero-dot plans-hero-dot--two"></span>
        </div>
      </div>
    </section>

    ${started.length ? `
      <section class="shell section plan-started-section">
        <div class="section-head" data-reveal>
          <div>
            <p class="eyebrow">Your rhythm</p>
            <h2>Pick up where you left off.</h2>
          </div>
          <span class="section-aside">${started.length} plan${started.length === 1 ? '' : 's'} in motion</span>
        </div>
        <div class="plan-started-grid">
          ${started.map(startedCard).join('')}
        </div>
      </section>
    ` : ''}

    <section class="shell section plan-library-section">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">Find your pace</p>
          <h2>Six ways to begin.</h2>
        </div>
        <p class="section-aside">A week, a season, or a year. Every plan can be started at any time.</p>
      </div>
      <div class="plan-grid">
        ${standardPlans.map(planCard).join('')}
      </div>
      ${featured ? featuredCard(featured) : ''}
    </section>

    <section class="shell closing-invite closing-invite--small" data-reveal>
      ${ornament()}
      <p class="eyebrow">No pressure, only presence</p>
      <h2>You do not have to finish<br /><em>to be faithful.</em></h2>
      <p class="closing-ref">A few quiet minutes count.</p>
      <div class="closing-actions">
        <a class="btn btn--primary" href="#/read/psalms/23">Open the reader ${icon('arrow-right', { size: 16 })}</a>
        <a class="btn btn--ghost" href="#/search">Search for a word</a>
      </div>
    </section>
  `;

  const onRootClick = (event) => {
    const continueLink = event.target.closest('[data-plan-continue]');
    if (!continueLink) return;
    // The plan begins when the reader is opened; plan detail handles the rest.
    const planId = continueLink.getAttribute('data-plan-continue');
    const plan = PLANS.find((item) => item.id === planId);
    if (!plan) return;
    const stats = planStats(plan);
    if (stats.nextDay) {
      const href = dayHref(plan, stats.nextDay);
      event.preventDefault();
      location.hash = href;
    }
  };

  root.addEventListener('click', onRootClick);

  return {
    cleanup() {
      root.removeEventListener('click', onRootClick);
    },
  };
}
