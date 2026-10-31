import { icon, logomark, ornament } from '../ui.js';

export function render(root) {
  root.innerHTML = `
    <section class="not-found">
      <div class="not-found-art" aria-hidden="true">
        <span class="not-found-orbit not-found-orbit--one"></span>
        <span class="not-found-orbit not-found-orbit--two"></span>
        <span class="not-found-sun"></span>
        <span class="not-found-mark">${logomark({ size: 72 })}</span>
      </div>
      <div class="not-found-copy">
        <p class="eyebrow"><span class="eyebrow-mark"></span>Page not found</p>
        <h1>You have wandered<br /><em>off the path.</em></h1>
        <p>This page is not in the library. But there are sixty-six books waiting, and every one of them begins somewhere.</p>
        <div class="not-found-actions">
          <a class="btn btn--primary" href="#/">Return home ${icon('arrow-right', { size: 16 })}</a>
          <a class="btn btn--ghost" href="#/read/psalms/23">Open Psalm 23</a>
        </div>
      </div>
      <div class="not-found-footer">
        ${ornament()}
        <p>“Thy word is a lamp unto my feet.”</p>
        <span>Psalm 119:105</span>
      </div>
    </section>
  `;
  return {};
}
