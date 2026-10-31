import {
  TOPICS,
  TOPIC_MAP,
  getBook,
  getVersion,
  readerPath,
  referenceLabel,
} from '../data.js';
import { getVerse } from '../api.js';
import { getState } from '../store.js';
import { copyText, escapeHTML, icon, ornament, toast } from '../ui.js';

function loadingCard() {
  return `<div class="topic-verse is-loading">
    <div class="skeleton skeleton--quote"></div>
    <div class="skeleton skeleton--quote skeleton--short"></div>
    <div class="skeleton skeleton--meta"></div>
  </div>`;
}

function verseCard(ref, verse, index, version, tone) {
  const book = getBook(ref.book);
  const reference = referenceLabel(ref.book, ref.chapter, ref.verse, version.short);
  return `<article class="topic-verse" data-tone="${tone}">
    <span class="topic-verse-number">${String(index + 1).padStart(2, '0')}</span>
    <blockquote class="topic-verse-quote">“${escapeHTML(verse.text)}”</blockquote>
    <footer class="topic-verse-footer">
      <div>
        <span class="topic-verse-ref">${escapeHTML(reference)}</span>
        <span class="topic-verse-book">${escapeHTML(book.name)} ${ref.chapter}</span>
      </div>
      <a class="topic-verse-link" href="${readerPath(ref.book, ref.chapter, { verse: ref.verse, version: version.id })}">Read in context ${icon('arrow-right', { size: 14 })}</a>
    </footer>
  </article>`;
}

function errorCard(ref, version) {
  return `<article class="topic-verse topic-verse--error">
    <p class="eyebrow">A quiet interruption</p>
    <p>This passage could not be loaded right now.</p>
    <div class="topic-error-actions">
      <button type="button" class="text-button" data-retry-topic>${icon('refresh', { size: 14 })} Try again</button>
      <a class="text-button" href="${readerPath(ref.book, ref.chapter, { verse: ref.verse, version: version.id })}">Open the chapter ${icon('arrow-right', { size: 14 })}</a>
    </div>
  </article>`;
}

export function render(root, route) {
  const topic = TOPIC_MAP.get(route.topicId);
  const state = getState();
  const version = getVersion(state.version);

  if (!topic) {
    root.innerHTML = `<section class="shell empty-page">
      <p class="eyebrow">Not in the collection</p>
      <h1>That path isn’t here.</h1>
      <p>Explore another season, or wander through the whole library.</p>
      <a class="btn btn--primary" href="#/explore">Back to Explore ${icon('arrow-right', { size: 16 })}</a>
    </section>`;
    return {};
  }

  const others = TOPICS.filter((item) => item.id !== topic.id).slice(0, 3);

  root.innerHTML = `
    <section class="topic-hero" data-tone="${topic.tone}">
      <div class="shell">
        <a class="back-link" href="#/explore">${icon('arrow-left', { size: 15 })} All topics</a>
        <div class="topic-hero-content">
          <span class="topic-hero-icon">${icon(topic.icon, { size: 30 })}</span>
          <p class="eyebrow">A collection for the season</p>
          <h1>${escapeHTML(topic.title)}</h1>
          <p class="topic-hero-subtitle">${escapeHTML(topic.subtitle)}</p>
          <p class="topic-hero-description">${escapeHTML(topic.description)}</p>
          <div class="topic-hero-meta">
            <span>${icon('book-open', { size: 14 })} ${topic.refs.length} passages</span>
            <span>${icon('clock', { size: 14 })} About ${Math.max(3, topic.refs.length * 2)} minutes</span>
            <span>${version.short}</span>
          </div>
        </div>
      </div>
      <span class="topic-hero-glow" aria-hidden="true"></span>
      <span class="topic-hero-watermark" aria-hidden="true">${escapeHTML(topic.title.slice(0, 2))}</span>
    </section>

    <section class="shell section topic-verses-section">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">Read slowly</p>
          <h2>Words to keep.</h2>
        </div>
        <button type="button" class="text-button" data-copy-topic>${icon('copy', { size: 14 })} Copy all references</button>
      </div>
      <div class="topic-verse-list" id="topic-verse-list">
        ${topic.refs.map(() => loadingCard()).join('')}
      </div>
    </section>

    <section class="shell section topic-next">
      <div class="section-head" data-reveal>
        <div>
          <p class="eyebrow">Keep wandering</p>
          <h2>Another way in.</h2>
        </div>
        <a class="text-link" href="#/explore">All topics ${icon('arrow-right', { size: 15 })}</a>
      </div>
      <div class="topic-next-grid">
        ${others.map((other) => `<a class="topic-next-card" href="#/explore/${other.id}" data-tone="${other.tone}">
          <span class="topic-next-icon">${icon(other.icon, { size: 20 })}</span>
          <div><h3>${escapeHTML(other.title)}</h3><p>${escapeHTML(other.subtitle)}</p></div>
          ${icon('arrow-up-right', { size: 16 })}
        </a>`).join('')}
      </div>
    </section>

    <section class="shell closing-invite closing-invite--small" data-reveal>
      ${ornament()}
      <p class="eyebrow">Go deeper</p>
      <h2>Let this be a beginning,<br /><em>not a checkmark.</em></h2>
      <div class="closing-actions">
        <a class="btn btn--primary" href="${readerPath(topic.refs[0].book, topic.refs[0].chapter, { verse: topic.refs[0].verse })}">Open the first passage ${icon('arrow-right', { size: 16 })}</a>
        <a class="btn btn--ghost" href="#/search">Search Scripture</a>
      </div>
    </section>
  `;

  const list = root.querySelector('#topic-verse-list');
  let destroyed = false;
  let token = 0;

  async function loadVerses() {
    const current = ++token;
    list.innerHTML = topic.refs.map(() => loadingCard()).join('');
    const results = await Promise.allSettled(
      topic.refs.map((ref) => getVerse(version.id, ref.book, ref.chapter, ref.verse)),
    );
    if (destroyed || current !== token) return;
    list.innerHTML = results
      .map((result, index) => result.status === 'fulfilled'
        ? verseCard(topic.refs[index], result.value, index, version, topic.tone)
        : errorCard(topic.refs[index], version))
      .join('');
  }

  const onRootClick = async (event) => {
    if (event.target.closest('[data-retry-topic]')) {
      loadVerses();
      return;
    }
    if (event.target.closest('[data-copy-topic]')) {
      const refs = topic.refs.map((ref) => referenceLabel(ref.book, ref.chapter, ref.verse)).join('\n');
      const ok = await copyText(refs);
      toast(ok ? 'References copied.' : 'Could not copy the references.', { tone: ok ? 'default' : 'error' });
    }
  };

  root.addEventListener('click', onRootClick);
  loadVerses();

  return {
    cleanup() {
      destroyed = true;
      token += 1;
      root.removeEventListener('click', onRootClick);
    },
  };
}
