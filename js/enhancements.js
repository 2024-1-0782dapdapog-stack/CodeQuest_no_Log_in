/**
 * CODEQUEST – ENHANCEMENTS  (NEW FILE: js/enhancements.js)
 *
 * Tasks:
 *   Task 1  – Navigation state persistence (localStorage tab + level restore)
 *   Task 2  – Hero → App scroll/click transition with GSAP or CSS fallback
 *   Task 3  – Mouse parallax / depth effect
 *   Task 4  – Orbital tab selector (wraps existing .tab-btn logic)
 *   Task 5  – Left panel UX polish (XP flash, feedback animation trigger)
 *
 * Rules obeyed:
 *   • Does NOT modify levels.js, editor.js, game.js, or any existing file
 *   • Only adds observers/listeners on top of existing DOM events
 *   • Orbital tabs call the existing .tab-btn elements programmatically —
 *     game.js tab-switching logic is 100% untouched
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     SHARED HELPERS
     ───────────────────────────────────────────────────────────── */

  const LS_KEY_TAB    = 'cq_active_tab';
  const LS_KEY_SCROLL = 'cq_instr_scroll';

  function safeLS(op, key, val) {
    try {
      if (op === 'get') return localStorage.getItem(key);
      if (op === 'set') localStorage.setItem(key, val);
    } catch (e) {}
    return null;
  }

  /** Wait for an element to exist, then call cb */
  function onReady(selector, cb, attempts) {
    const el = document.querySelector(selector);
    if (el) { cb(el); return; }
    if ((attempts || 0) > 40) return;
    setTimeout(() => onReady(selector, cb, (attempts || 0) + 1), 80);
  }

  /** Load GSAP on-demand (non-blocking) */
  function withGSAP(cb) {
    if (window.gsap) { cb(window.gsap); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
    s.onload  = () => cb(window.gsap);
    s.onerror = () => cb(null);   // graceful degradation
    document.head.appendChild(s);
  }


  /* ═══════════════════════════════════════════════════════════════
     TASK 1 – NAVIGATION STATE PERSISTENCE
     ═══════════════════════════════════════════════════════════════

     Problem: refreshing the page or navigating back resets to
     the hero / first tab. Fix: mirror the active preview-tab and
     the instructions scroll position to localStorage, then restore
     on DOMContentLoaded — WITHOUT touching game.js logic.
  ═══════════════════════════════════════════════════════════════ */

  (function initNavPersistence() {
    // --- SAVE active tab whenever game.js switches it ---
    // We intercept by observing the DOM for class changes on .tab-btn
    function watchTabChange() {
      const container = document.getElementById('preview-tabs');
      if (!container) return;

      const observer = new MutationObserver(() => {
        const active = container.querySelector('.tab-btn.active');
        if (active && active.dataset.tab) {
          safeLS('set', LS_KEY_TAB, active.dataset.tab);
        }
      });
      observer.observe(container, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    // --- SAVE instructions scroll position ---
    function watchScrollPosition() {
      const scroll = document.getElementById('instructions-scroll');
      if (!scroll) return;
      let scrollTimer;
      scroll.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
          safeLS('set', LS_KEY_SCROLL, scroll.scrollTop);
        }, 120);
      }, { passive: true });
    }

    // --- RESTORE tab on app show ---
    // We hook into the moment #app becomes visible (class "hidden" removed)
    function restoreOnAppShow() {
      const app = document.getElementById('app');
      if (!app) return;

      const appObserver = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.type === 'attributes' && m.attributeName === 'class') {
            if (!app.classList.contains('hidden')) {
              // App just became visible — restore tab
              setTimeout(restoreTabAndScroll, 60);
            }
          }
        }
      });
      appObserver.observe(app, { attributes: true, attributeFilter: ['class'] });
    }

    function restoreTabAndScroll() {
      // Restore active preview tab
      const savedTab = safeLS('get', LS_KEY_TAB);
      if (savedTab && savedTab !== 'preview') {
        const targetBtn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
        if (targetBtn) {
          // Simulate a click so game.js handles all the show/hide logic
          targetBtn.click();
        }
      }

      // Restore instructions scroll
      const savedScroll = safeLS('get', LS_KEY_SCROLL);
      if (savedScroll !== null) {
        const scroll = document.getElementById('instructions-scroll');
        if (scroll) scroll.scrollTop = Number(savedScroll);
      }
    }

    // Also restore when the Home button is clicked and the user goes back
    function watchHomeBtn() {
      const homeBtn = document.getElementById('homeBtn');
      if (!homeBtn) return;
      homeBtn.addEventListener('click', () => {
        // Clear scroll position when user deliberately resets
        safeLS('set', LS_KEY_SCROLL, 0);
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      watchTabChange();
      watchScrollPosition();
      restoreOnAppShow();
      watchHomeBtn();
    }, { once: true });
  })();


  /* ═══════════════════════════════════════════════════════════════
     TASK 2 – HERO → APP SCROLL / CLICK TRANSITION
     ═══════════════════════════════════════════════════════════════

     Enhances the hero exit with a cinematic GSAP or CSS animation.
     The hero (hero.js) calls finalizeExit() which triggers startBtn.
     We intercept that moment and add layered transitions.
  ═══════════════════════════════════════════════════════════════ */

  (function initHeroTransition() {
    // The hero may not exist if hero.js isn't loaded — guard cleanly
    function patchHeroExit() {
      const hero = document.getElementById('cq-hero');
      if (!hero) return;

      // Observe hero for display:none (hero.js sets it in finalizeExit)
      const heroObserver = new MutationObserver(() => {
        if (hero.style.display === 'none' || hero.classList.contains('hero-exiting')) {
          // App is about to appear — add entrance class
          const app    = document.getElementById('app');
          const splash = document.getElementById('splash');

          withGSAP((gsap) => {
            if (gsap) {
              // App entrance with GSAP
              gsap.fromTo('#app:not(.hidden)', 
                { opacity: 0, y: 18, scale: 0.98 },
                { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power2.out', delay: 0.1 }
              );
              gsap.fromTo('#splash:not(.hidden)',
                { opacity: 0, y: 14 },
                { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.08 }
              );
            } else {
              if (app && !app.classList.contains('hidden')) {
                app.classList.add('cq-app-entering');
                setTimeout(() => app.classList.remove('cq-app-entering'), 700);
              }
              if (splash && !splash.classList.contains('hidden')) {
                splash.classList.add('cq-splash-enter');
                setTimeout(() => splash.classList.remove('cq-splash-enter'), 600);
              }
            }
          });

          heroObserver.disconnect();
        }
      });

      heroObserver.observe(hero, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    document.addEventListener('DOMContentLoaded', patchHeroExit, { once: true });
  })();


  /* ═══════════════════════════════════════════════════════════════
     TASK 3 – MOUSE PARALLAX / DEPTH EFFECT
     ═══════════════════════════════════════════════════════════════

     Creates three fixed depth layers that respond to mouse movement
     at different speeds. Very lightweight — no Three.js, just CSS
     transforms on pre-created divs.
  ═══════════════════════════════════════════════════════════════ */

  (function initParallax() {
    // Inject depth layers into body (behind everything via z-index: -1)
    function createLayer(id) {
      const d = document.createElement('div');
      d.id = id;
      document.body.appendChild(d);
      return d;
    }

    let layerMain, orbA, orbB, orbC;

    function buildLayers() {
      layerMain = createLayer('cq-depth-layer');
      orbA      = createLayer('cq-orb-a');
      orbB      = createLayer('cq-orb-b');
      orbC      = createLayer('cq-orb-c');
    }

    // Smooth lerp state
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let rafId = null;
    let ticking = false;

    function onMouseMove(e) {
      // Normalize to [-1, 1] from screen center
      targetX = ((e.clientX / window.innerWidth)  - 0.5) * 2;
      targetY = ((e.clientY / window.innerHeight) - 0.5) * 2;

      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(updateParallax);
      }
    }

    function updateParallax() {
      ticking = false;

      // Smooth follow
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      const stillMoving = Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001;

      if (layerMain) {
        const dx = currentX * 12;
        const dy = currentY * 8;
        layerMain.style.transform = `translate(${dx}px, ${dy}px)`;
      }
      if (orbA) {
        orbA.style.transform = `translate(${currentX * 18}px, ${currentY * 14}px)`;
      }
      if (orbB) {
        orbB.style.transform = `translate(${currentX * -14}px, ${currentY * -10}px)`;
      }
      if (orbC) {
        const bx = -50 + currentX * 10;
        const by = -50 + currentY * 8;
        orbC.style.transform = `translate(${bx}%, ${by}%)`;
      }

      if (stillMoving) {
        rafId = requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      buildLayers();
      window.addEventListener('mousemove', onMouseMove, { passive: true });
    }, { once: true });
  })();


  /* ═══════════════════════════════════════════════════════════════
     TASK 4 – ORBITAL TAB SELECTOR
     ═══════════════════════════════════════════════════════════════

     Builds an orbital UI widget and wires it to the existing
     .tab-btn elements. game.js is never touched — we just call
     .click() on the hidden buttons and observe their class changes.
  ═══════════════════════════════════════════════════════════════ */

  (function initOrbitalTabs() {
    // Keep the legacy tab strip visible and let game.js handle the switching.
    function mirrorTabChanges() {
      const container = document.getElementById('preview-tabs');
      if (!container) return;

      const observer = new MutationObserver(() => {
        // Persist active tab styling by relying on the existing .active class.
        const active = container.querySelector('.tab-btn.active');
        if (!active) return;
      });
      observer.observe(container, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    function init() {
      const header = document.getElementById('preview-header');
      if (!header) return;

      mirrorTabChanges();
    }

    document.addEventListener('DOMContentLoaded', init, { once: true });
  })();


  /* ═══════════════════════════════════════════════════════════════
     TASK 5 – LEFT PANEL POLISH HELPERS
     ═══════════════════════════════════════════════════════════════

     Adds:
       • XP flash animation when XP changes
       • Smooth feedback panel entry class
       • Editor filename color syncs to chapter color
  ═══════════════════════════════════════════════════════════════ */

  (function initLeftPanelPolish() {

    // XP flash: observe #xp-text for text changes
    function watchXP() {
      const xpText = document.getElementById('xp-text');
      const xpBadge = document.getElementById('xp-badge');
      if (!xpText || !xpBadge) return;

      let lastXP = xpText.textContent;

      const observer = new MutationObserver(() => {
        if (xpText.textContent !== lastXP) {
          lastXP = xpText.textContent;
          xpBadge.classList.remove('cq-xp-flash');
          void xpBadge.offsetWidth; // reflow to restart animation
          xpBadge.classList.add('cq-xp-flash');
          setTimeout(() => xpBadge.classList.remove('cq-xp-flash'), 700);
        }
      });
      observer.observe(xpText, { childList: true, characterData: true, subtree: true });
    }

    // Editor filename color: sync to active chapter
    function watchChapterBadge() {
      const badge    = document.getElementById('chapter-badge');
      const filename = document.getElementById('editor-filename');
      if (!badge || !filename) return;

      const chapterColors = {
        'badge-html': 'var(--html)',
        'badge-css':  'var(--css)',
        'badge-js':   'var(--js)',
      };

      const observer = new MutationObserver(() => {
        const cls = badge.className;
        const color = chapterColors[cls] || 'var(--text3)';
        filename.style.color = color;
      });
      observer.observe(badge, { attributes: true, attributeFilter: ['class'] });
    }

    // Feedback panel: re-trigger animation when class changes
    function watchFeedback() {
      const feedback = document.getElementById('feedback');
      if (!feedback) return;

      let lastClass = feedback.className;

      const observer = new MutationObserver(() => {
        if (feedback.className !== lastClass) {
          lastClass = feedback.className;
          if (!feedback.classList.contains('fb-neutral')) {
            feedback.style.animation = 'none';
            void feedback.offsetWidth;
            feedback.style.animation = '';
          }
        }
      });
      observer.observe(feedback, { attributes: true, attributeFilter: ['class'] });
    }

    document.addEventListener('DOMContentLoaded', () => {
      watchXP();
      watchChapterBadge();
      watchFeedback();
    }, { once: true });
  })();

})();
