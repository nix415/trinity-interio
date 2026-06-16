/* ════════════════════════════════════════════════════════════════
   TRINITY INTERIOR DESIGN — Transitions & Scroll Reveal
   Drop-in companion to nav.js and global.css.

   Covers:
   1. Page-enter  — body fades in on load (replaces abrupt paint)
   2. Page-exit   — curtain wipe fires before any internal link nav
   3. Scroll reveal — enhanced IntersectionObserver; auto-wires
      elements that carry data-reveal or live inside sections
      as headings / images / cards that don't already have .reveal
   4. Stagger     — auto-applies delay tokens to sibling groups
   5. Reduced-motion — all animations collapse to instant when
      prefers-reduced-motion: reduce is set
   6. Progress bar — thin bronze line at top of viewport on scroll
════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 0. Reduced-motion gate ─────────────────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. CSS custom-property bridge ─────────────────────────── *
   *  We inject one <style> block so all timing lives in JS-land
   *  too, keeping everything in sync without duplicating values.  */
  const EASE   = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const DUR_ENTER  = reducedMotion ? '0ms' : '680ms';
  const DUR_EXIT   = reducedMotion ? '0ms' : '340ms';
  const DUR_REVEAL = reducedMotion ? '0ms' : '750ms';

  /* ── 2. Inject transition styles ───────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Page enter / exit ─────────────────────────────────── */
    .trinity-page-enter {
      animation: trinityEnter ${DUR_ENTER} ${EASE} both;
    }
    .trinity-page-exit {
      animation: trinityExit ${DUR_EXIT} ${EASE} both;
      pointer-events: none;
    }
    @keyframes trinityEnter {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes trinityExit {
      from { opacity: 1; transform: translateY(0);    }
      to   { opacity: 0; transform: translateY(-8px); }
    }

    /* ── Curtain overlay ───────────────────────────────────── *
     * Sits fixed over viewport during exit; removed on new page  */
    #trinity-curtain {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: #0a0907;
      opacity: 0;
      pointer-events: none;
      transition: opacity ${DUR_EXIT} ${EASE};
      will-change: opacity;
    }
    #trinity-curtain.visible {
      opacity: 1;
      pointer-events: all;
    }

    /* ── Scroll reveal base ────────────────────────────────── *
     * Extends global.css .reveal; new variants added here.      */

    /* direction variants */
    [data-reveal="up"],
    [data-reveal] {
      opacity: 0;
      transform: translateY(32px);
      transition:
        opacity ${DUR_REVEAL} ${EASE},
        transform ${DUR_REVEAL} ${EASE};
    }
    [data-reveal="down"] {
      transform: translateY(-22px);
    }
    [data-reveal="left"] {
      transform: translateX(36px);
    }
    [data-reveal="right"] {
      transform: translateX(-36px);
    }
    [data-reveal="scale"] {
      transform: scale(0.96) translateY(20px);
    }
    [data-reveal="fade"] {
      transform: none;
    }
    [data-reveal="clip"] {
      opacity: 1;
      transform: none;
      clip-path: inset(0 0 100% 0);
      transition:
        clip-path ${DUR_REVEAL} ${EASE};
    }
    /* in-view state — same for all variants */
    [data-reveal].in-view {
      opacity: 1;
      transform: none;
      clip-path: none;
    }

    /* delay tokens — data-delay="1" … "6" maps to 100ms steps */
    [data-delay="1"] { transition-delay: 80ms;  }
    [data-delay="2"] { transition-delay: 160ms; }
    [data-delay="3"] { transition-delay: 240ms; }
    [data-delay="4"] { transition-delay: 320ms; }
    [data-delay="5"] { transition-delay: 400ms; }
    [data-delay="6"] { transition-delay: 480ms; }

    /* ── Progress bar ──────────────────────────────────────── */
    #trinity-progress {
      position: fixed;
      top: 0; left: 0;
      width: 0%;
      height: 2px;
      background: linear-gradient(90deg, #8a6840, #c9a87c, #b08a5e);
      z-index: 10000;
      opacity: 0;
      transition: opacity 300ms, width 60ms linear;
      pointer-events: none;
      transform-origin: left;
    }
    #trinity-progress.visible { opacity: 1; }
    #trinity-progress.complete { transition: opacity 500ms 200ms; opacity: 0; }

    /* ── Section-heading clip reveal ──────────────────────── *
     * Applied automatically to .section-heading when no
     * existing .reveal is present.                            */
    .t-heading-auto {
      overflow: hidden;
    }
    .t-heading-auto > .t-heading-inner {
      display: block;
      opacity: 0;
      transform: translateY(100%);
      transition:
        opacity ${DUR_REVEAL} ${EASE},
        transform ${DUR_REVEAL} ${EASE};
    }
    .t-heading-auto.in-view > .t-heading-inner {
      opacity: 1;
      transform: translateY(0);
    }

    /* ── Image reveal ──────────────────────────────────────── *
     * Parallax-lite: images drift upward as page scrolls.     */
    .t-img-auto {
      overflow: hidden;
    }
    .t-img-auto img,
    .t-img-auto .proj-img img {
      will-change: transform;
    }

    /* ── Staggered grid children ───────────────────────────── */
    .t-stagger-ready > * {
      opacity: 0;
      transform: translateY(28px);
      transition:
        opacity  ${DUR_REVEAL} ${EASE},
        transform ${DUR_REVEAL} ${EASE};
    }
    .t-stagger-ready.in-view > *:nth-child(1)  { opacity:1; transform:none; transition-delay:  0ms; }
    .t-stagger-ready.in-view > *:nth-child(2)  { opacity:1; transform:none; transition-delay: 80ms; }
    .t-stagger-ready.in-view > *:nth-child(3)  { opacity:1; transform:none; transition-delay:160ms; }
    .t-stagger-ready.in-view > *:nth-child(4)  { opacity:1; transform:none; transition-delay:240ms; }
    .t-stagger-ready.in-view > *:nth-child(5)  { opacity:1; transform:none; transition-delay:320ms; }
    .t-stagger-ready.in-view > *:nth-child(6)  { opacity:1; transform:none; transition-delay:400ms; }
    .t-stagger-ready.in-view > *:nth-child(7)  { opacity:1; transform:none; transition-delay:480ms; }
    .t-stagger-ready.in-view > *:nth-child(8)  { opacity:1; transform:none; transition-delay:560ms; }
    .t-stagger-ready.in-view > *:nth-child(n+9){ opacity:1; transform:none; transition-delay:600ms; }

    /* reduced-motion overrides */
    @media (prefers-reduced-motion: reduce) {
      [data-reveal], [data-reveal].in-view,
      .t-heading-auto > .t-heading-inner,
      .t-heading-auto.in-view > .t-heading-inner,
      .t-stagger-ready > *,
      .t-stagger-ready.in-view > * {
        opacity: 1 !important;
        transform: none !important;
        clip-path: none !important;
        transition-duration: 0.01ms !important;
        transition-delay: 0ms !important;
        animation-duration: 0.01ms !important;
      }
      #trinity-curtain { display: none !important; }
      #trinity-progress { display: none !important; }
    }
  `;
  document.head.appendChild(style);

  /* ── 3. Page-enter animation ───────────────────────────────── */
  function initPageEnter() {
    if (reducedMotion) return;
    // Wrap body content in enter class so new pages always fade in.
    // We use <main> or body itself — but body is available immediately.
    document.body.classList.add('trinity-page-enter');
    // Remove after animation so it doesn't interfere with exit
    document.body.addEventListener('animationend', () => {
      document.body.classList.remove('trinity-page-enter');
    }, { once: true });
  }

  /* ── 4. Curtain + Page-exit ────────────────────────────────── */
  function initPageExit() {
    if (reducedMotion) return;

    // Create curtain element once
    const curtain = document.createElement('div');
    curtain.id = 'trinity-curtain';
    document.body.appendChild(curtain);

    // Detect internal links — same origin, .html or /
    function isInternal(href) {
      if (!href) return false;
      // Skip anchors, mail, tel, js voids
      if (href.startsWith('#') || href.startsWith('mailto:') ||
          href.startsWith('tel:')  || href.startsWith('javascript:')) return false;
      // Check same origin
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return false;
        // Skip if same page
        if (url.pathname === window.location.pathname && !url.hash) return false;
        return true;
      } catch { return false; }
    }

    let navigating = false;

    document.addEventListener('click', function (e) {
      // Walk up the DOM in case click landed on a child of <a>
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!isInternal(href)) return;

      // Allow modifier keys (new tab etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      // Already firing
      if (navigating) return;

      e.preventDefault();
      navigating = true;

      // Play body exit + curtain fade
      document.body.classList.add('trinity-page-exit');
      curtain.classList.add('visible');

      setTimeout(() => {
        window.location.href = link.href || href;
      }, reducedMotion ? 0 : 320);
    }, true); // capture phase so lightbox/portfolio clicks are upstream

    // On back/forward — flash in normally
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        curtain.classList.remove('visible');
        document.body.classList.remove('trinity-page-exit');
        navigating = false;
        initPageEnter();
      }
    });
  }

  /* ── 5. Scroll progress bar ────────────────────────────────── */
  function initProgressBar() {
    if (reducedMotion) return;

    const bar = document.createElement('div');
    bar.id = 'trinity-progress';
    document.body.appendChild(bar);

    let rafId = null;
    let complete = false;

    function updateBar() {
      const scrollTop   = window.scrollY;
      const docHeight   = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = Math.min(100, (scrollTop / docHeight) * 100);
      bar.style.width = pct + '%';

      if (scrollTop > 80) {
        bar.classList.add('visible');
      } else {
        bar.classList.remove('visible');
      }

      if (pct >= 99.5 && !complete) {
        complete = true;
        bar.classList.add('complete');
        setTimeout(() => { bar.classList.remove('complete'); complete = false; }, 900);
      }
      rafId = null;
    }

    window.addEventListener('scroll', () => {
      if (!rafId) rafId = requestAnimationFrame(updateBar);
    }, { passive: true });
  }

  /* ── 6. Enhanced scroll reveal ─────────────────────────────── *
   *
   *  Layers on top of nav.js which already handles .reveal.
   *  This script additionally:
   *    a) observes [data-reveal] elements
   *    b) auto-wires section headings with heading-clip treatment
   *    c) auto-wires grid containers for stagger
   *    d) provides a richer threshold + rootMargin per element type
   */
  function initScrollReveal() {
    /* -- a) [data-reveal] elements ----------------------------- */
    const dataRevealEls = document.querySelectorAll('[data-reveal]');

    /* -- b) Auto-wire .section-heading without existing .reveal  */
    /*    Wrap inner text in a span so we can animate the clip.   */
    const headings = document.querySelectorAll(
      '.section-heading:not(.reveal):not([data-reveal]):not(.t-heading-auto)'
    );
    headings.forEach(h => {
      // Don't touch headings that are already set up
      if (h.querySelector('.t-heading-inner')) return;
      const inner = document.createElement('span');
      inner.className = 't-heading-inner';
      // Move all child nodes into inner span
      while (h.firstChild) inner.appendChild(h.firstChild);
      h.appendChild(inner);
      h.classList.add('t-heading-auto');
    });
    const headingEls = document.querySelectorAll('.t-heading-auto');

    /* -- c) Auto-wire stagger containers ----------------------- *
     *    Grids / flex rows with 2+ direct children that are cards,
     *    pillars, steps etc. — if they don't already have .reveal
     *    on each child individually.                              */
    const STAGGER_SELECTORS = [
      '.values-grid',
      '.team-grid',
      '.press-grid',
      '.pillars',
      '.process-steps',
      '.portfolio-secondary',
      '.service-row',
    ];
    STAGGER_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        // Only stagger if children don't already have .reveal
        const children = [...el.children];
        const alreadyTagged = children.some(c => c.classList.contains('reveal'));
        if (!alreadyTagged && children.length >= 2) {
          el.classList.add('t-stagger-ready');
        }
      });
    });
    const staggerEls = document.querySelectorAll('.t-stagger-ready');

    /* -- d) Image parallax-lite -------------------------------- *
     *    section images that aren't already reveal elements       */
    const imgContainers = document.querySelectorAll(
      '.studio-img:not(.reveal), .team-photo:not(.reveal), ' +
      '.home-studio-img:not(.reveal), .shop-hero-img:not(.reveal)'
    );
    imgContainers.forEach(el => el.classList.add('t-img-auto'));

    /* -- IntersectionObserver factory -------------------------- */
    function makeObserver(threshold, rootMargin, callback) {
      if (!('IntersectionObserver' in window)) {
        // Fallback: immediately reveal everything
        return { observe: (el) => callback([{ isIntersecting: true, target: el }]) };
      }
      return new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) callback([entry]);
        });
      }, { threshold, rootMargin });
    }

    /* [data-reveal] — standard fade-rise */
    if (dataRevealEls.length) {
      const obs = makeObserver(0.08, '0px 0px -60px 0px', entries => {
        entries.forEach(({ target }) => {
          target.classList.add('in-view');
          obs.unobserve ? obs.unobserve(target) : null;
        });
      });
      // Real observer needs proper unobserve
      if ('IntersectionObserver' in window) {
        const realObs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in-view'); realObs.unobserve(e.target); }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
        dataRevealEls.forEach(el => realObs.observe(el));
      } else {
        dataRevealEls.forEach(el => el.classList.add('in-view'));
      }
    }

    /* Heading clip reveal — fires earlier for drama */
    if (headingEls.length) {
      if ('IntersectionObserver' in window) {
        const hObs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in-view'); hObs.unobserve(e.target); }
          });
        }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
        headingEls.forEach(el => hObs.observe(el));
      } else {
        headingEls.forEach(el => el.classList.add('in-view'));
      }
    }

    /* Stagger containers — trigger at 5% so children start sooner */
    if (staggerEls.length) {
      if ('IntersectionObserver' in window) {
        const sObs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('in-view'); sObs.unobserve(e.target); }
          });
        }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });
        staggerEls.forEach(el => sObs.observe(el));
      } else {
        staggerEls.forEach(el => el.classList.add('in-view'));
      }
    }
  }

  /* ── 7. Page-hero eyebrow + h1 entrance ────────────────────── *
   *  Inner pages use .page-hero which has its own cinematic bg
   *  but the heading and eyebrow don't animate by default.
   *  We add a lightweight class-based entrance.                   */
  function initPageHeroEntrance() {
    if (reducedMotion) return;
    const hero = document.querySelector('.page-hero');
    if (!hero) return;

    const eyebrow = hero.querySelector('.page-hero-eyebrow');
    const h1      = hero.querySelector('h1');

    // Animate eyebrow
    if (eyebrow && !eyebrow.style.animation) {
      Object.assign(eyebrow.style, {
        opacity: '0',
        transform: 'translateY(14px)',
        animation: `trinityEnter 700ms ${EASE} 150ms both`,
      });
    }
    // Animate h1 — split by word if single-line, else animate whole
    if (h1 && !h1.style.animation) {
      Object.assign(h1.style, {
        opacity: '0',
        transform: 'translateY(20px)',
        animation: `trinityEnter 800ms ${EASE} 300ms both`,
      });
    }
  }

  /* ── 8. Smooth anchor scroll ───────────────────────────────── *
   *  In-page anchor clicks (href="#section") get smooth scroll.  */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });
  }

  /* ── 9. Intersection reveal for .page-hero-content lines ────── */
  function initHeroContentLines() {
    if (reducedMotion) return;
    // section-label lines inside sections that scroll in from below
    // — already handled by nav.js .reveal, but we enhance them
    // with a subtler left-drift for section-label items
    document.querySelectorAll('.section-label.reveal').forEach(el => {
      if (!el.hasAttribute('data-enhanced')) {
        el.setAttribute('data-enhanced', '1');
        el.style.transitionProperty = 'opacity, transform';
        el.style.transitionTimingFunction = EASE;
      }
    });
  }

  /* ── Init all on DOMContentLoaded ─────────────────────────── */
  function init() {
    initPageEnter();
    initPageExit();
    initProgressBar();
    initScrollReveal();
    initPageHeroEntrance();
    initAnchorScroll();
    initHeroContentLines();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
