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
    scope.querySelectorAll('.app-sidebar[data-active], nav[data-active]').forEach((nav) => {
      const active = nav.dataset.active;
      if (!active) return;
      nav.querySelectorAll(`[data-nav="${active}"]`).forEach((l) => l.classList.add('is-active'));
    });
  }

  function bindCarousels(scope) {
    scope.querySelectorAll('[data-carousel]').forEach((track) => {
      if (track.__carouselBound) return;
      track.__carouselBound = true;
      const id = track.dataset.carousel;
      const slideWidth = () => {
        const first = track.firstElementChild;
        if (!first) return 240;
        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 16);
        return first.getBoundingClientRect().width + (isFinite(gap) ? gap : 16);
      };
      document.querySelectorAll(`[data-carousel-prev="${id}"]`).forEach((btn) => {
        btn.addEventListener('click', () => track.scrollBy({ left: -slideWidth(), behavior: 'smooth' }));
      });
      document.querySelectorAll(`[data-carousel-next="${id}"]`).forEach((btn) => {
        btn.addEventListener('click', () => track.scrollBy({ left: slideWidth(), behavior: 'smooth' }));
      });
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
    bindCarousels(scope);
    applyNavActive(scope);
  }

  document.addEventListener('partials:loaded', () => init(document));
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init(document));
  } else {
    init(document);
  }
})();
