(() => {
  'use strict';

  function bindMenu() {
    const button = document.getElementById('menu-toggle');
    const nav = document.getElementById('site-nav');
    if (!button || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    }
    button.setAttribute('aria-controls', nav.id);
    setOpen(false);
    button.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', event => {
      if (!button.contains(event.target) && !nav.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        button.focus();
      }
    });
    const desktop = window.matchMedia('(min-width: 751px)');
    desktop.addEventListener('change', event => {
      if (event.matches) setOpen(false);
    });
  }

  function bindTheme() {
    const button = document.getElementById('theme-toggle');
    const key = 'vinod-site-theme';
    let theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    try {
      const saved = localStorage.getItem(key);
      if (saved === 'light' || saved === 'dark') theme = saved;
    } catch { /* A local preview can still switch themes without storage. */ }

    function apply() {
      document.documentElement.dataset.theme = theme;
      if (!button) return;
      const dark = theme === 'dark';
      button.setAttribute('aria-label', 'Dark mode');
      button.setAttribute('aria-pressed', String(dark));
      button.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
      const label = button.querySelector('[data-theme-label]');
      if (label) label.textContent = button.title;
    }
    apply();
    button?.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      apply();
      try { localStorage.setItem(key, theme); } catch { /* Use the in-page choice. */ }
    });
  }

  function bindSearch() {
    const dialog = document.getElementById('site-search');
    const open = document.getElementById('search-open');
    const close = document.getElementById('search-close');
    const query = document.getElementById('search-query');
    const results = document.getElementById('search-results');
    if (!dialog || !open || !close || !query || !results) return;

    open.setAttribute('aria-haspopup', 'dialog');
    open.setAttribute('aria-controls', dialog.id);
    query.setAttribute('aria-controls', results.id);
    results.setAttribute('aria-live', 'polite');
    const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase().replace(/[-‐‑–—]/g, ' ');

    function render() {
      const words = normalize(query.value).trim().split(/\s+/).filter(Boolean);
      const fragment = document.createDocumentFragment();
      const pages = Array.isArray(window.profilePages) ? window.profilePages : [];
      const prefix = (document.body.dataset.prefix || '').replace(/\/?$/, '/');
      const base = prefix === '/' ? '' : prefix;
      for (const page of pages) {
        const terms = Array.isArray(page.terms) ? page.terms.join(' ') : page.terms;
        const content = normalize([page.title, page.description, terms].join(' '));
        if (!words.every(word => content.includes(word))) continue;
        const item = document.createElement('li');
        const link = document.createElement('a');
        const path = String(page.url || '').replace(/^\/+/, '');
        link.href = base + (path || 'index.html');
        link.textContent = page.title;
        item.append(link);
        if (page.description) {
          const description = document.createElement('small');
          description.textContent = page.description;
          item.append(description);
        }
        fragment.append(item);
      }
      if (!fragment.childElementCount) {
        const message = document.createElement('li');
        message.textContent = 'No matching pages.';
        fragment.append(message);
      }
      results.replaceChildren(fragment);
    }

    query.addEventListener('input', render);
    open.addEventListener('click', () => {
      if (dialog.open) return;
      query.value = '';
      render();
      dialog.showModal();
      query.focus();
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => open.focus());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  }

  function start() {
    bindMenu();
    bindTheme();
    bindSearch();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
