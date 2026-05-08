// Tiny partial loader.
// Usage: <div data-component="card-thumbnail" data-title="Hello"></div>
// Each data-* attribute (besides data-component) is substituted into {{name}}
// placeholders inside the loaded partial. Recurses for nested partials.

(function () {
  const COMPONENTS_PATH = '../components/';

  function substitute(html, data) {
    let out = html;
    for (const [key, value] of Object.entries(data)) {
      if (key === 'component') continue;
      out = out.split(`{{${key}}}`).join(value);
    }
    // Strip any unused {{placeholders}} so they don't render literally.
    return out.replace(/\{\{[a-zA-Z0-9_-]+\}\}/g, '');
  }

  async function loadInto(el) {
    const name = el.dataset.component;
    if (!name) return;
    try {
      const res = await fetch(COMPONENTS_PATH + name + '.html', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.text();
      const filled = substitute(raw, el.dataset);

      const tpl = document.createElement('template');
      tpl.innerHTML = filled.trim();
      const frag = tpl.content.cloneNode(true);

      // Copy non-template data-* attributes (e.g. data-active) onto the first
      // root element so partial CSS/JS can react to them.
      const firstEl = frag.firstElementChild;
      if (firstEl) {
        for (const [key, value] of Object.entries(el.dataset)) {
          if (key === 'component') continue;
          if (!firstEl.hasAttribute(`data-${key}`)) {
            firstEl.setAttribute(`data-${key}`, value);
          }
        }
      }

      el.replaceWith(frag);
    } catch (err) {
      console.error(`[partials] failed to load "${name}"`, err);
      el.innerHTML = `<div class="p-4 text-sm text-red-600 border border-red-300 rounded">Missing partial: ${name}</div>`;
    }
  }

  async function loadAll(root = document) {
    const placeholders = Array.from(root.querySelectorAll('[data-component]'));
    if (!placeholders.length) return;
    await Promise.all(placeholders.map(loadInto));
    // Recurse — newly-injected partials may themselves contain placeholders.
    await loadAll(document);
    document.dispatchEvent(new CustomEvent('partials:loaded'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadAll());
  } else {
    loadAll();
  }
})();
