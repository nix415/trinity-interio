/* ════════════════════════════════════════════════════════
   TRINITY INTERIOR DESIGN — Shared Navigation Script
   Handles: scroll-aware bg, mobile menu, active link,
            scroll reveal on every page
════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ── Detect current page for active link ───────────────
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const target = href.split('/').pop();
    if (target === current || (current === '' && target === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // ── Nav scroll background ─────────────────────────────
  const nav = document.getElementById('main-nav');
  if (nav && !nav.classList.contains('solid')) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile menu ───────────────────────────────────────
  const toggle    = document.getElementById('nav-toggle');
  const mobileNav = document.getElementById('nav-mobile');
  if (!toggle || !mobileNav) return;

  let open = false;

  function openMenu() {
    open = true;
    toggle.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileNav.style.display = 'flex';
    requestAnimationFrame(() => mobileNav.classList.add('open'));
    document.body.style.overflow = 'hidden';
    const bars = toggle.querySelectorAll('span');
    bars[0].style.transform = 'translateY(6px) rotate(45deg)';
    bars[1].style.opacity   = '0';
    bars[2].style.transform = 'translateY(-6px) rotate(-45deg)';
  }

  function closeMenu() {
    open = false;
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { if (!open) mobileNav.style.display = ''; }, 400);
    const bars = toggle.querySelectorAll('span');
    bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
  }

  toggle.addEventListener('click', () => open ? closeMenu() : openMenu());

  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ── Scroll reveal ─────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in-view'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => obs.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }
})();
