import {
  PLANS,
  bookDisplayName,
  getBook,
  getPlan,
  planChapterCount,
  readerPath,
} from '../data.js';
import {
  getState,
  isPlanDayComplete,
  planState,
  startPlan,
  togglePlanDay,
} from '../store.js';
import {
  escapeHTML,
  formatDate,
  icon,
  ornament,
  progressRing,
  toast,
} from '../ui.js';

function shortReading(reading) {
  const book = getBook(reading.book);
  return `${book?.short || reading.book} ${reading.chapter}`;
}

function readingHref(plan, dayNumber, reading) {
  return readerPath(reading.book, reading.chapter, { plan: plan.id, day: dayNumber });
}

function planProgress(plan) {
  const state = planState(plan.id);
  const completed = state?.completedDays?.length || 0;
  const total = plan.days.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const nextDay = plan.days.findIndex((_, index) => !(state?.completedDays || []).includes(index + 1));
  return {
    state,
    completed,
    total,
    percent,
    nextDay: nextDay < 0 ? null : nextDay + 1,
  };
}

function dayCta(plan, dayNumber, completed) {
  const day = plan.days[dayNumber - 1];
  if (!day) return '';
  return `<a class="plan-day-read" href="${readingHref(plan, dayNumber, day.readings[0])}" data-plan-reading>
    <span>${completed ? 'Read again' : 'Read day'} ${icon('arrow-right', { size: 15 })}</span>
  </a>`;
}

function dayRow(plan, day, index, progress) {
  const dayNumber = index + 1;
  const completed = isPlanDayComplete(plan.id, dayNumber);
  const isNext = progress.nextDay === dayNumber;
  const chapterCount = day.readings.length;
  const title = day.title || day.readings.map(shortReading).join(' · ');

  return `<article class="plan-day ${completed ? 'is-complete' : ''} ${isNext ? 'is-next' : ''}" data-day-row="${dayNumber}">
    <div class="plan-day-rail" aria-hidden="true">
      <span class="plan-day-number">${String(dayNumber).padStart(2, '0')}</span>
      <span class="plan-day-line"></span>
    </div>
    <div class="plan-day-main">
      <div class="plan-day-topline">
        <span class="plan-day-label">Day ${dayNumber}</span>
        ${isNext ? '<span class="plan-day-next">Up next</span>' : ''}
        <span class="plan-day-chapters">${chapterCount} chapter${chapterCount === 1 ? '' : 's'}</span>
      </div>
      <h3>${escapeHTML(title)}</h3>
      <div class="plan-day-readings">
        ${day.readings.map((reading) => `<a class="plan-reading-chip" href="${readingHref(plan, dayNumber, reading)}" data-plan-reading>${icon('book-open', { size: 13 })} ${escapeHTML(bookDisplayName(reading.book, reading.chapter))}</a>`).join('')}
      </div>
      <div class="plan-day-mobile-actions">
        ${dayCta(plan, dayNumber, completed)}
      </div>
    </div>
    <div class="plan-day-actions">
      ${dayCta(plan, dayNumber, completed)}
      <button type="button" class="plan-day-check ${completed ? 'is-complete' : ''}" data-plan-day-toggle data-day="${dayNumber}" aria-pressed="${completed}" aria-label="${completed ? `Mark Day ${dayNumber} incomplete` : `Mark Day ${dayNumber} complete`}">
        ${icon(completed ? 'check' : 'circle', { size: 15 })}
        <span>${completed ? 'Complete' : 'Mark done'}</span>
      </button>
    </div>
  </article>`;
}

export function render(root, route, ctx) {
  const plan = getPlan(route.planId);
  const state = getState();

  if (!plan) {
    root.innerHTML = `<section class="shell empty-page">
      <p class="eyebrow">Not in the library</p>
      <h1>That reading plan isn’t here.</h1>
      <p>Choose another path, or begin reading freely wherever you like.</p>
      <div class="closing-actions">
        <a class="btn btn--primary" href="#/plans">All reading plans ${icon('arrow-right', { size: 16 })}</a>
        <a class="btn btn--ghost" href="#/read/psalms/23">Open Psalm 23</a>
      </div>
    </section>`;
    return {};
  }

  const progress = planProgress(plan);
  const chapters = planChapterCount(plan);
  const nextDay = progress.nextDay ? plan.days[progress.nextDay - 1] : null;
  const firstHref = readingHref(plan, 1, plan.days[0].readings[0]);
  const nextHref = progress.nextDay
    ? readingHref(plan, progress.nextDay, plan.days[progress.nextDay - 1].readings[0])
    : firstHref;
  const others = PLANS.filter((item) => item.id !== plan.id).slice(0, 3);
  const startedLabel = progress.state?.startedAt
    ? `Started ${formatDate(progress.state.startedAt, { year: true })}`
    : 'Not started yet';

  root.innerHTML = `
    <section class="plan-detail-hero" data-tone="${plan.tone}">
      <div class="plan-detail-glow" aria-hidden="true"></div>
      <div class="shell">
        <a class="back-link" href="#/plans">${icon('arrow-left', { size: 15 })} All reading plans</a>
        <div class="plan-detail-hero-grid">
          <div class="plan-detail-intro">
            <span class="plan-detail-icon">${icon(plan.icon, { size: 28 })}</span>
            <p class="eyebrow">A reading plan · ${escapeHTML(plan.duration)}</p>
            <h1>${escapeHTML(plan.title)}</h1>
            <p class="plan-detail-subtitle">${escapeHTML(plan.subtitle)}</p>
            <p class="plan-detail-description">${escapeHTML(plan.description)}</p>
            <div class="plan-detail-meta">
              <span>${icon('book-open', { size: 14 })} ${chapters} chapter${chapters === 1 ? '' : 's'}</span>
              <span>${icon('calendar', { size: 14 })} ${plan.days.length} day${plan.days.length === 1 ? '' : 's'}</span>
              <span>${icon('clock', { size: 14 })} About ${Math.max(1, Math.round(chapters * 4 / plan.days.length))} min a day</span>
            </div>
          </div>

          <div class="plan-detail-progress">
            <div class="plan-detail-ring">
              ${progressRing(progress.percent, { size: 132, stroke: 4, label: `${progress.percent}%` })}
              <span class="plan-detail-ring-caption">${progress.completed} of ${progress.total} days</span>
            </div>
            <div class="plan-detail-progress-copy">
              <p class="eyebrow">${progress.completed && !progress.nextDay ? 'A journey completed' : 'Your place in the story'}</p>
              <h2>${progress.nextDay ? `Day ${progress.nextDay}` : 'Every day complete'}</h2>
              <p>${progress.nextDay
                ? escapeHTML(nextDay?.title || nextDay?.readings.map(shortReading).join(' · ') || 'The next reading is waiting.')
                : 'You have walked the whole path. Return whenever you like.'}</p>
              <a class="btn btn--primary" href="${nextHref}" data-plan-reading>
                ${progress.nextDay ? (progress.completed ? 'Continue the plan' : 'Begin the plan') : 'Read it again'}
                ${icon('arrow-right', { size: 16 })}
              </a>
              <span class="plan-detail-started">${icon('sun', { size: 13 })} ${escapeHTML(startedLabel)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="shell section plan-detail-section">
      <div class="plan-detail-layout">
        <div class="plan-days-column">
          <div class="section-head" data-reveal>
            <div>
              <p class="eyebrow">The path</p>
              <h2>One day at a time.</h2>
            </div>
            <span class="section-aside">${progress.completed} of ${progress.total} complete</span>
          </div>
          <div class="plan-days-list">
            ${plan.days.map((day, index) => dayRow(plan, day, index, progress)).join('')}
          </div>
        </div>

        <aside class="plan-side">
          <div class="plan-side-card" data-reveal>
            <p class="eyebrow">Keep going</p>
            <h3>A gentle rule for the road.</h3>
            <p>If you miss a day, do not try to catch up. Simply begin again where you are. The plan is a servant, never a master.</p>
            <div class="plan-side-rule"></div>
            <ul class="plan-side-list">
              <li>${icon('book-open', { size: 14 })} Read at your own pace</li>
              <li>${icon('check-circle', { size: 14 })} Mark a day when it is done</li>
              <li>${icon('leaf', { size: 14 })} Return as often as you like</li>
            </ul>
          </div>

          <div class="plan-side-card" data-reveal>
            <p class="eyebrow">Another path</p>
            <div class="plan-other-list">
              ${others.map((other) => `<a class="plan-other" href="#/plans/${other.id}" data-tone="${other.tone}">
                <span class="plan-other-icon">${icon(other.icon, { size: 16 })}</span>
                <span><strong>${escapeHTML(other.title)}</strong><small>${escapeHTML(other.duration)}</small></span>
                ${icon('arrow-right', { size: 14 })}
              </a>`).join('')}
            </div>
            <a class="text-link" href="#/plans">See all plans ${icon('arrow-right', { size: 14 })}</a>
          </div>
        </aside>
      </div>
    </section>

    <section class="shell closing-invite closing-invite--small" data-reveal>
      ${ornament()}
      <p class="eyebrow">${progress.nextDay ? 'The next step is small' : 'A word for the end'}</p>
      <h2>${progress.nextDay ? 'Today is enough.<br /><em>Begin there.</em>' : 'Well walked.<br /><em>Stay a while.</em>'}</h2>
      <div class="closing-actions">
        <a class="btn btn--primary" href="${nextHref}" data-plan-reading>${progress.nextDay ? `Open Day ${progress.nextDay}` : 'Begin again'} ${icon('arrow-right', { size: 16 })}</a>
        <a class="btn btn--ghost" href="#/read/psalms/23">Read freely instead</a>
      </div>
    </section>
  `;

  const onRootClick = (event) => {
    const readingLink = event.target.closest('[data-plan-reading]');
    if (readingLink) {
      startPlan(plan.id);
      return;
    }

    const toggle = event.target.closest('[data-plan-day-toggle]');
    if (toggle) {
      const dayNumber = Number(toggle.getAttribute('data-day'));
      const completed = togglePlanDay(plan.id, dayNumber);
      toast(completed ? `Day ${dayNumber} marked complete.` : `Day ${dayNumber} marked incomplete.`);
      ctx?.rerender?.({ preserveScroll: true });
    }
  };

  root.addEventListener('click', onRootClick);

  return {
    cleanup() {
      root.removeEventListener('click', onRootClick);
    },
  };
}
