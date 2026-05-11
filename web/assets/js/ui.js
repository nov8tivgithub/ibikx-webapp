// Shared UI behaviour. Runs after every partials:loaded event so newly
// injected DOM gets wired up too.

(function () {
  function bindTabs(scope) {
    scope.querySelectorAll('[data-tabs]').forEach((group) => {
      if (group.__tabsBound) return;
      group.__tabsBound = true;
      const buttons = group.querySelectorAll('[data-tab]');
      const panels = document.querySelectorAll(`[data-tab-panel][data-tab-group="${group.dataset.tabs}"]`);
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.tab;
          buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
          panels.forEach((p) => p.classList.toggle('hidden', p.dataset.tabPanel !== target));
        });
      });
    });
  }

  function bindHearts(scope) {
    scope.querySelectorAll('[data-heart]').forEach((el) => {
      if (el.__heartBound) return;
      el.__heartBound = true;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.toggle('is-active');
      });
    });
  }

  function bindModals(scope) {
    scope.querySelectorAll('[data-open-modal]').forEach((trigger) => {
      if (trigger.__modalBound) return;
      trigger.__modalBound = true;
      trigger.addEventListener('click', () => {
        const id = trigger.dataset.openModal;
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('hidden');
      });
    });
    scope.querySelectorAll('[data-close-modal]').forEach((btn) => {
      if (btn.__modalCloseBound) return;
      btn.__modalCloseBound = true;
      btn.addEventListener('click', () => {
        const modal = btn.closest('[data-modal]');
        if (modal) modal.classList.add('hidden');
      });
    });
  }

  function bindMobileMenu(scope) {
    scope.querySelectorAll('[data-mobile-menu-toggle]').forEach((btn) => {
      if (btn.__menuBound) return;
      btn.__menuBound = true;
      btn.addEventListener('click', () => {
        document.body.classList.toggle('mobile-menu-open');
      });
    });
  }

  function bindCopy(scope) {
    scope.querySelectorAll('[data-copy]').forEach((btn) => {
      if (btn.__copyBound) return;
      btn.__copyBound = true;
      btn.addEventListener('click', async () => {
        const value = btn.dataset.copy;
        try {
          await navigator.clipboard.writeText(value);
          const orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = orig), 1200);
        } catch {
          /* ignore */
        }
      });
    });
  }

  function bindPasswordEye(scope) {
    scope.querySelectorAll('[data-password-toggle]').forEach((btn) => {
      if (btn.__pwBound) return;
      btn.__pwBound = true;
      btn.addEventListener('click', () => {
        const input = btn.parentElement.querySelector('input');
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
      });
    });
  }

  function bindLanguagePills(scope) {
    scope.querySelectorAll('[data-lang-group]').forEach((group) => {
      if (group.__langBound) return;
      group.__langBound = true;
      const pills = group.querySelectorAll('[data-lang]');
      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          pills.forEach((p) => p.classList.toggle('is-active', p === pill));
        });
      });
    });
  }

  function bindFilterPills(scope) {
    scope.querySelectorAll('[data-pill-group]').forEach((group) => {
      if (group.__pillBound) return;
      group.__pillBound = true;
      const pills = group.querySelectorAll('[data-pill]');
      pills.forEach((pill) => {
        pill.addEventListener('click', () => {
          pills.forEach((p) => p.classList.toggle('is-active', p === pill));
        });
      });
    });
  }

  function bindMonthPicker(scope) {
    scope.querySelectorAll('[data-month-picker]').forEach((root) => {
      if (root.__monthBound) return;
      root.__monthBound = true;
      const display = document.querySelector(root.dataset.monthDisplay);
      const yearBtn = root.querySelector('[data-year-btn]');
      const yearOptions = root.querySelector('[data-year-options]');
      yearBtn?.addEventListener('click', () => yearOptions?.classList.toggle('hidden'));
      yearOptions?.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (yearBtn) yearBtn.textContent = btn.textContent;
          yearOptions.classList.add('hidden');
        });
      });
      root.querySelectorAll('[data-month]').forEach((btn) => {
        btn.addEventListener('click', () => {
          root.querySelectorAll('[data-month]').forEach((b) => b.classList.toggle('is-active', b === btn));
          if (display) display.textContent = `${btn.textContent} ${yearBtn?.textContent || ''}`.trim();
          const modal = root.closest('[data-modal]');
          if (modal) modal.classList.add('hidden');
        });
      });
    });
  }

  function applyNavActive(scope) {
    scope.querySelectorAll('[data-active]').forEach((nav) => {
      if (!nav.matches('.icon-sidebar, .liquid-nav, .app-sidebar, nav, header, aside')) return;
      const active = nav.dataset.active;
      if (!active) return;
      nav.querySelectorAll(`[data-nav="${active}"]`).forEach((l) => l.classList.add('is-active'));
    });
  }

  function bindShare(scope) {
    scope.querySelectorAll('[data-share]').forEach((el) => {
      if (el.__shareBound) return;
      el.__shareBound = true;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const title = el.dataset.shareTitle || document.title;
        const url = el.dataset.shareUrl || location.href;
        openShareDialog(title, url);
      });
    });
  }

  function openShareDialog(title, url) {
    document.querySelectorAll('.share-dialog').forEach((n) => n.remove());
    const text = encodeURIComponent(title);
    const eUrl = encodeURIComponent(url);
    const wrap = document.createElement('div');
    wrap.className = 'share-dialog fixed inset-0 z-[110] flex items-end sm:items-center justify-center';
    wrap.innerHTML = `
      <div class="share-backdrop absolute inset-0 bg-slate-900/60"></div>
      <div class="relative bg-white w-full sm:w-[26rem] sm:max-w-[92%] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Share this byte</h3>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">${title}</p>
          </div>
          <button class="share-close text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center" aria-label="Close">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
        </div>
        <div class="grid grid-cols-4 gap-3">
          <a target="_blank" rel="noopener" href="https://wa.me/?text=${text}%20${eUrl}" class="flex flex-col items-center gap-1.5">
            <span class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1s-.7.9-.8 1c-.2.2-.3.2-.6.1-1.6-.8-2.7-1.4-3.7-3.2-.3-.5.3-.5.8-1.5.1-.2 0-.3 0-.5l-.9-2c-.2-.5-.5-.5-.6-.5h-.5c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2.1 3.2 5 4.4 1.7.7 2.4.8 3.3.6.5-.1 1.6-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3z"/></svg></span>
            <span class="text-[11px] text-slate-600 font-medium">WhatsApp</span>
          </a>
          <a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${eUrl}" class="flex flex-col items-center gap-1.5">
            <span class="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M14 9V7c0-.6.4-1 1-1h2V3h-3a4 4 0 0 0-4 4v2H8v3h2v8h3v-8h2.5l.5-3H13z"/></svg></span>
            <span class="text-[11px] text-slate-600 font-medium">Facebook</span>
          </a>
          <a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?text=${text}&url=${eUrl}" class="flex flex-col items-center gap-1.5">
            <span class="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 5.8c-.7.3-1.5.6-2.4.7.9-.5 1.5-1.3 1.8-2.3-.8.5-1.7.8-2.7 1A4.2 4.2 0 0 0 11.5 9c0 .3 0 .6.1.9-3.5-.2-6.5-1.8-8.6-4.4-.4.6-.6 1.4-.6 2.2 0 1.5.7 2.8 1.9 3.5-.7 0-1.3-.2-1.9-.5v.1c0 2 1.4 3.7 3.4 4.1-.4.1-.7.1-1.1.1-.3 0-.5 0-.8-.1.5 1.7 2.1 2.9 3.9 2.9-1.4 1.1-3.2 1.7-5.2 1.7H2c1.8 1.2 4 1.9 6.3 1.9 7.5 0 11.6-6.2 11.6-11.6v-.5c.8-.6 1.5-1.3 2.1-2.1z"/></svg></span>
            <span class="text-[11px] text-slate-600 font-medium">Twitter</span>
          </a>
          <a target="_blank" rel="noopener" href="https://www.linkedin.com/sharing/share-offsite/?url=${eUrl}" class="flex flex-col items-center gap-1.5">
            <span class="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8 18H5v-9h3v9zM6.5 7.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM19 18h-3v-4.7c0-1.1-.4-1.9-1.4-1.9-.8 0-1.3.5-1.5 1-.1.2-.1.5-.1.8V18h-3v-9h3v1.3c.4-.6 1.1-1.5 2.6-1.5 1.9 0 3.4 1.3 3.4 4V18z"/></svg></span>
            <span class="text-[11px] text-slate-600 font-medium">LinkedIn</span>
          </a>
        </div>
        <div class="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100">
          <input type="text" readonly value="${url}" class="flex-1 bg-transparent text-xs text-slate-700 outline-none truncate" />
          <button class="share-copy px-3 py-1 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-50">Copy</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
    const close = () => wrap.remove();
    wrap.querySelector('.share-close').addEventListener('click', close);
    wrap.querySelector('.share-backdrop').addEventListener('click', close);
    wrap.querySelector('.share-copy').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      try {
        await navigator.clipboard.writeText(url);
        const orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = orig), 1200);
      } catch { /* ignore */ }
    });
  }

  function showLoader(label) {
    // Remove any existing loader first so we never stack multiples.
    document.querySelectorAll('.fullscreen-loader').forEach((n) => n.remove());
    const loader = document.createElement('div');
    loader.className = 'fullscreen-loader';
    loader.innerHTML =
      '<div class="loader-spinner"></div>' +
      (label ? '<p class="loader-text">' + label + '</p>' : '');
    document.body.appendChild(loader);
    return loader;
  }

  function bindPersonalise(scope) {
    scope.querySelectorAll('[data-personalise-go]').forEach((btn) => {
      if (btn.__personaliseBound) return;
      btn.__personaliseBound = true;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = btn.closest('[data-modal]');
        const kind = btn.dataset.kind || modal?.dataset.kind || 'card';
        if (modal) modal.classList.add('hidden');
        showLoader('Personalising your ' + kind + '…');
        setTimeout(() => {
          window.location.href = kind === 'video' ? 'personalised-video.html' : 'personalised-card.html';
        }, 1500);
      });
    });
  }

  // When the user navigates back (e.g. from personalised-card to card-details)
  // the browser may restore the page from the back-forward cache. Show a
  // brief transparent loader so the transition still feels active.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    document.querySelectorAll('.fullscreen-loader').forEach((n) => n.remove());
    const loader = showLoader('');
    setTimeout(() => loader.remove(), 700);
  });

  function bindCoverCarousels(scope) {
    scope.querySelectorAll('.cover-carousel').forEach((root) => {
      if (root.__coverBound) return;
      root.__coverBound = true;
      const slides = Array.from(root.querySelectorAll('.cover-slide'));
      const n = slides.length;
      if (!n) return;
      let active = 0;
      const positions = [
        'pos-active', 'pos-prev', 'pos-next',
        'pos-edge-l', 'pos-edge-r',
        'pos-edge2-l', 'pos-edge2-r',
        'pos-edge3-l', 'pos-edge3-r',
        'pos-hidden',
      ];
      // How many neighbours to show on each side of the active slide,
      // capped by what the carousel has room for circularly.
      function visibleRange() {
        const w = window.innerWidth;
        let target = 2;
        if (w >= 1536) target = 4;
        else if (w >= 1280) target = 3;
        return Math.min(target, Math.floor((n - 1) / 2));
      }
      function circOffset(i) {
        let off = i - active;
        if (off > n / 2) off -= n;
        if (off < -n / 2) off += n;
        return off;
      }
      function render() {
        const range = visibleRange();
        slides.forEach((slide, i) => {
          positions.forEach((c) => slide.classList.remove(c));
          const offset = circOffset(i);
          if (offset === 0) slide.classList.add('pos-active');
          else if (offset === -1) slide.classList.add('pos-prev');
          else if (offset === 1) slide.classList.add('pos-next');
          else if (offset === -2 && range >= 2) slide.classList.add('pos-edge-l');
          else if (offset === 2 && range >= 2) slide.classList.add('pos-edge-r');
          else if (offset === -3 && range >= 3) slide.classList.add('pos-edge2-l');
          else if (offset === 3 && range >= 3) slide.classList.add('pos-edge2-r');
          else if (offset === -4 && range >= 4) slide.classList.add('pos-edge3-l');
          else if (offset === 4 && range >= 4) slide.classList.add('pos-edge3-r');
          else slide.classList.add('pos-hidden');
        });
      }
      function next() { active = (active + 1) % n; render(); }
      function prev() { active = (active - 1 + n) % n; render(); }
      root.querySelector('.cover-prev')?.addEventListener('click', (e) => { e.preventDefault(); prev(); });
      root.querySelector('.cover-next')?.addEventListener('click', (e) => { e.preventDefault(); next(); });

      // Pointer-drag: swipe left/right (mouse or touch) to advance one slide.
      // Threshold is 50px — under that, treat as a tap so a non-active slide
      // can still be clicked to focus it (or active slide follows its href).
      let dragStartX = null;
      let dragDx = 0;
      let dragging = false;
      function onDown(e) {
        if (e.target.closest('.cover-prev, .cover-next')) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragStartX = e.clientX;
        dragDx = 0;
        dragging = false;
      }
      function onMove(e) {
        if (dragStartX === null) return;
        dragDx = e.clientX - dragStartX;
        if (!dragging && Math.abs(dragDx) > 8) {
          dragging = true;
          root.classList.add('is-dragging');
        }
      }
      function onUp() {
        if (dragStartX === null) return;
        const dx = dragDx;
        dragStartX = null;
        root.classList.remove('is-dragging');
        if (Math.abs(dx) > 50) {
          dx < 0 ? next() : prev();
        }
        // dragging stays true through the immediate click; reset on next tick.
        if (dragging) setTimeout(() => { dragging = false; }, 0);
      }
      root.addEventListener('pointerdown', onDown);
      root.addEventListener('pointermove', onMove);
      root.addEventListener('pointerup', onUp);
      root.addEventListener('pointercancel', onUp);
      root.addEventListener('pointerleave', onUp);
      // Suppress link navigation / focus-change when the pointer was dragging.
      root.addEventListener('click', (e) => {
        if (dragging) { e.preventDefault(); e.stopPropagation(); }
      }, true);

      slides.forEach((slide, i) => {
        slide.addEventListener('click', (e) => {
          if (dragging) return;
          if (i !== active) {
            e.preventDefault();
            active = i;
            render();
          }
        });
      });

      // Visible-range depends on viewport width — re-render on resize.
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(render, 120);
      });

      render();
    });
  }

  function bindScrollRows(scope) {
    const arrowSvg = (dir) => `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${dir === 'prev' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}"/></svg>`;
    scope.querySelectorAll('.scroll-row').forEach((row) => {
      if (row.__rowBound) {
        // Partials may have just injected new children — re-measure.
        row.__rowUpdate?.();
        return;
      }
      row.__rowBound = true;
      // Skip the language pill variant — short pills don't need scroll arrows.
      if (row.classList.contains('lang-row')) return;

      // Insert a relative wrapper so the arrows can be absolutely positioned
      // over the row without disturbing the existing layout.
      const wrap = document.createElement('div');
      wrap.className = 'scroll-row-wrap';
      row.parentNode.insertBefore(wrap, row);
      wrap.appendChild(row);

      const prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'scroll-row-arrow scroll-row-arrow-prev';
      prev.setAttribute('aria-label', 'Scroll left');
      prev.innerHTML = arrowSvg('prev');
      const next = document.createElement('button');
      next.type = 'button';
      next.className = 'scroll-row-arrow scroll-row-arrow-next';
      next.setAttribute('aria-label', 'Scroll right');
      next.innerHTML = arrowSvg('next');
      wrap.appendChild(prev);
      wrap.appendChild(next);

      function updateArrows() {
        const max = row.scrollWidth - row.clientWidth;
        const canScroll = max > 4;
        prev.classList.toggle('is-visible', canScroll && row.scrollLeft > 4);
        next.classList.toggle('is-visible', canScroll && row.scrollLeft < max - 4);
      }
      row.__rowUpdate = updateArrows;
      function step() {
        const child = row.firstElementChild;
        if (child) return child.offsetWidth + 16; // tile width + gap (1rem)
        return Math.max(row.clientWidth * 0.7, 200);
      }
      prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
      next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));
      row.addEventListener('scroll', updateArrows, { passive: true });

      // Mouse drag-to-scroll. Touch devices keep native overflow scrolling.
      let startX = 0, startScroll = 0, isDown = false, dragged = false;
      row.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse') return;
        if (e.button !== 0) return;
        if (e.target.closest('.scroll-row-arrow')) return;
        isDown = true; dragged = false;
        startX = e.clientX;
        startScroll = row.scrollLeft;
      });
      row.addEventListener('pointermove', (e) => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        if (!dragged && Math.abs(dx) > 5) {
          dragged = true;
          row.classList.add('is-dragging');
        }
        if (dragged) {
          row.scrollLeft = startScroll - dx;
          e.preventDefault();
        }
      });
      function endDrag() {
        if (!isDown) return;
        isDown = false;
        row.classList.remove('is-dragging');
        if (dragged) setTimeout(() => { dragged = false; }, 0);
      }
      row.addEventListener('pointerup', endDrag);
      row.addEventListener('pointercancel', endDrag);
      row.addEventListener('pointerleave', endDrag);
      row.addEventListener('click', (e) => {
        if (dragged) { e.preventDefault(); e.stopPropagation(); }
      }, true);

      // Images load asynchronously and change scrollWidth — re-check a few times.
      updateArrows();
      setTimeout(updateArrows, 150);
      setTimeout(updateArrows, 600);
      window.addEventListener('resize', updateArrows);
    });
  }

  function init(scope) {
    bindTabs(scope);
    bindHearts(scope);
    bindModals(scope);
    bindMobileMenu(scope);
    bindCopy(scope);
    bindPasswordEye(scope);
    bindLanguagePills(scope);
    bindFilterPills(scope);
    bindMonthPicker(scope);
    bindPersonalise(scope);
    bindShare(scope);
    bindCoverCarousels(scope);
    bindScrollRows(scope);
    applyNavActive(scope);
  }

  document.addEventListener('partials:loaded', () => init(document));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(document));
  } else {
    init(document);
  }
})();
