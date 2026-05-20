/* ============================================================
   GLOBAL — Scroll reveals, header scroll class, FAQ accordion
   ============================================================ */
(function () {
  'use strict';

  /* ── Scroll-reveal observer ── */
  function initReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => io.observe(el));
  }

  /* ── Header scroll class ── */
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let ticking = false;
    function update() {
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  /* ── Mobile nav toggle ── */
  function initMobileNav() {
    const btn = document.querySelector('.header__menu-btn');
    const nav = document.querySelector('.header__nav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));

      if (!open) {
        nav.style.cssText = `
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 68px; left: 0; right: 0;
          background: var(--c-bg);
          border-bottom: 1px solid var(--c-divider);
          padding: 1.5rem 2rem 2rem;
          gap: 1.25rem;
          z-index: 99;
          box-shadow: var(--shadow-md);
          animation: accordion-open 0.22s var(--ease-out);
        `;
      } else {
        nav.removeAttribute('style');
      }
    });
  }

  /* ── FAQ accordion ── */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach((item) => {
      const trigger = item.querySelector('.faq-item__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        /* Close all */
        items.forEach((i) => {
          i.classList.remove('is-open');
          const t = i.querySelector('.faq-item__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        /* Toggle current */
        if (!isOpen) {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ── Cart count update ── */
  function updateCartCount() {
    const countEl = document.querySelector('.header__cart-count');
    if (!countEl) return;

    fetch('/cart.js')
      .then((r) => r.json())
      .then((cart) => {
        const count = cart.item_count;
        countEl.textContent = count;
        countEl.style.display = count > 0 ? 'flex' : 'none';
      })
      .catch(() => {});
  }

  /* ── Add-to-cart form intercept ── */
  function initCartForm() {
    const form = document.querySelector('[data-product-form]');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('[data-add-to-cart]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Adding…';
      }

      const data = new FormData(form);

      fetch('/cart/add.js', { method: 'POST', body: data })
        .then((r) => r.json())
        .then(() => {
          updateCartCount();
          if (btn) {
            btn.textContent = 'Added! ♥';
            setTimeout(() => {
              btn.disabled = false;
              btn.textContent = btn.dataset.defaultText || 'Add to Cart';
            }, 2000);
          }
        })
        .catch(() => {
          if (btn) { btn.disabled = false; btn.textContent = 'Try again'; }
        });
    });
  }

  /* ── Boot ── */
  function init() {
    initReveal();
    initHeaderScroll();
    initMobileNav();
    initFAQ();
    updateCartCount();
    initCartForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
