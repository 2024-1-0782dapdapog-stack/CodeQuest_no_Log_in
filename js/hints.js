(function () {
  'use strict';

  /* ── Constants ── */
  var STORAGE_KEY    = 'codequest_hint_points';
  var STARTING_POINTS = 100;
  var HINT_COST      = 150;   // flat cost to reveal any hint
  var WIN_REWARD     = 100;   // points earned every time a level is completed
  var TOAST_ID       = 'cq-active-toast';
  var storage        = window.CQ_STORAGE;

  /* ══════════════════════════════════════════════════════
     BALANCE  (localStorage-backed)
  ══════════════════════════════════════════════════════ */
  function readBalance() {
    var raw = storage && storage.getString
      ? storage.getString(STORAGE_KEY, null)
      : localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      writeBalance(STARTING_POINTS);
      return STARTING_POINTS;
    }
    var parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      writeBalance(STARTING_POINTS);
      return STARTING_POINTS;
    }
    return parsed;
  }

  function writeBalance(value) {
    if (storage && storage.setString) {
      storage.setString(STORAGE_KEY, value);
      return;
    }
    localStorage.setItem(STORAGE_KEY, String(value));
  }

  var balance = readBalance();
  var unlimitedHints = false;

  /* ══════════════════════════════════════════════════════
     BADGE  (#cq-points-badge in the topbar)
  ══════════════════════════════════════════════════════ */
  function ensureBadge() {
    if (document.getElementById('cq-points-badge')) return;

    var badge = document.createElement('div');
    badge.id = 'cq-points-badge';
    badge.innerHTML = '<span>💎</span><span id="cq-points-value">' + balance + '</span>';

    /* Insert before xp-badge so it sits nicely in the topbar-right */
    var xpBadge = document.getElementById('xp-badge');
    if (xpBadge && xpBadge.parentNode) {
      xpBadge.parentNode.insertBefore(badge, xpBadge);
    } else {
      var topbarRight = document.querySelector('.topbar-right');
      if (topbarRight) topbarRight.appendChild(badge);
    }
  }

  function updateBadge() {
    var el = document.getElementById('cq-points-value');
    if (el) el.textContent = balance;
  }

  function pulseBadge(cls) {
    var badge = document.getElementById('cq-points-badge');
    if (!badge) return;
    badge.classList.remove('pts-gain', 'pts-spend');
    void badge.offsetWidth; /* reflow to restart animation */
    badge.classList.add(cls);
    setTimeout(function () { badge.classList.remove(cls); }, 600);
  }

  /* ══════════════════════════════════════════════════════
     HINT COST
  ══════════════════════════════════════════════════════ */
  function getCurrentHintCost() {
    return HINT_COST; /* flat 150 pts for every hint */
  }

  function getBalanceLabel() {
    return balance + ' pts';
  }

  /* ══════════════════════════════════════════════════════
     TOAST
  ══════════════════════════════════════════════════════ */
  function showToast(msg, type, duration) {
    var old = document.getElementById(TOAST_ID);
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var toast = document.createElement('div');
    toast.id = TOAST_ID;
    toast.className = 'cq-toast cq-toast-' + (type || 'gain');
    toast.textContent = msg;
    document.body.appendChild(toast);

    /* Trigger transition on next frame */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('cq-toast-show');
      });
    });

    setTimeout(function () {
      toast.classList.remove('cq-toast-show');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration || 2200);
  }

  /* ══════════════════════════════════════════════════════
     COPY BUTTON  (injected inside #hint-text when shown)
  ══════════════════════════════════════════════════════ */
  function injectCopyButton() {
    var hintText = document.getElementById('hint-text');
    if (!hintText) return;
    if (document.getElementById('cq-hint-copy-btn')) return;

    hintText.classList.add('has-copy-btn');

    var btn = document.createElement('button');
    btn.id = 'cq-hint-copy-btn';
    btn.type = 'button';
    btn.title = 'Copy hint';
    btn.innerHTML = '<span class="cq-copy-icon">⧉</span>';

    btn.addEventListener('click', function () {
      /* Grab the text content, excluding the button's own text */
      var text = hintText.innerText || hintText.textContent || '';
      /* Strip leading/trailing whitespace that the button label might add */
      text = text.trim();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          btn.classList.add('copied');
          btn.innerHTML = '<span class="cq-copy-icon">✓</span>';
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.innerHTML = '<span class="cq-copy-icon">⧉</span>';
          }, 1800);
        }).catch(function () {
          fallbackCopy(text, btn);
        });
      } else {
        fallbackCopy(text, btn);
      }
    });

    hintText.insertBefore(btn, hintText.firstChild);
  }

  function fallbackCopy(text, btn) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.classList.add('copied');
      btn.innerHTML = '<span class="cq-copy-icon">✓</span>';
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.innerHTML = '<span class="cq-copy-icon">⧉</span>';
      }, 1800);
    } catch (e) {}
  }

  function removeCopyButton() {
    var btn = document.getElementById('cq-hint-copy-btn');
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn);
    var hintText = document.getElementById('hint-text');
    if (hintText) hintText.classList.remove('has-copy-btn');
  }

  /* ══════════════════════════════════════════════════════
     HINT BUTTON  label management
  ══════════════════════════════════════════════════════ */
  function setHintButtonLabel(button) {
    if (!button) return;

    var hintText = document.getElementById('hint-text');
    var visible = !!(hintText && !hintText.classList.contains('hidden'));
    var cost = getCurrentHintCost();

    if (unlimitedHints) {
      button.innerHTML = '💡 Show Hint <span class="hint-cost-tag">∞ FREE</span>';
      button.classList.remove('hint-locked');
      return;
    }

    if (visible) {
      button.textContent = '🙈 Hide Hint';
      button.classList.remove('hint-locked');
      return;
    }

    if (balance >= cost) {
      button.classList.remove('hint-locked');
      button.innerHTML = '💡 Show Hint <span class="hint-cost-tag">−' + cost + ' pts</span>';
    } else {
      button.classList.add('hint-locked');
      button.textContent = '🔒 Hint (need ' + cost + ' pts)';
    }
  }

  /* ══════════════════════════════════════════════════════
     HINT CLICK  handler
  ══════════════════════════════════════════════════════ */
  function hideHintAndRestore() {
    var hintText = document.getElementById('hint-text');
    if (hintText) hintText.classList.add('hidden');
    removeCopyButton();
    setHintButtonLabel(document.getElementById('hintBtn'));
  }

  function onHintClick() {
    var hintText = document.getElementById('hint-text');
    var hintBtn  = document.getElementById('hintBtn');
    if (!hintText || !hintBtn) return;

    /* Toggle off */
    if (!hintText.classList.contains('hidden')) {
      hideHintAndRestore();
      return;
    }

    var cost = getCurrentHintCost();

    if (!unlimitedHints && balance < cost) {
      showToast('🔒 Need ' + cost + ' pts to unlock this hint.', 'warn', 2400);
      setHintButtonLabel(hintBtn);
      return;
    }

    if (!unlimitedHints) {
      balance -= cost;
      writeBalance(balance);
      updateBadge();
      pulseBadge('pts-spend');
      showToast('✨ Hint unlocked! −' + cost + ' pts', 'spend', 1900);
    }

    hintText.classList.remove('hidden');
    injectCopyButton();
    setHintButtonLabel(hintBtn);
  }

  /* ══════════════════════════════════════════════════════
     WIRE UP  the hint button (clone to drop stale listeners)
  ══════════════════════════════════════════════════════ */
  function patchHintButtonListener() {
    var oldBtn = document.getElementById('hintBtn');
    if (!oldBtn || !oldBtn.parentNode) return;

    var newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.addEventListener('click', onHintClick);
    setHintButtonLabel(newBtn);
  }

  /* ══════════════════════════════════════════════════════
     ADD POINTS  (called on level win)
  ══════════════════════════════════════════════════════ */
  function addPoints(amount) {
    var value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    balance += value;
    writeBalance(balance);
    updateBadge();
    pulseBadge('pts-gain');
    showToast('💎 +' + value + ' pts earned!', 'gain', 1800);
    setHintButtonLabel(document.getElementById('hintBtn'));
  }

  /* ══════════════════════════════════════════════════════
     PATCH showMentorWin  — award WIN_REWARD (100 pts) on every level finish
  ══════════════════════════════════════════════════════ */
  function patchShowMentorWin() {
    if (typeof window.showMentorWin !== 'function' || window.showMentorWin.__cqHintsPatched) return;

    var original = window.showMentorWin;
    window.showMentorWin = function (opts) {
      /* Always give the flat WIN_REWARD; ignore opts.xp to avoid double-counting */
      addPoints(WIN_REWARD);
      return original.apply(this, arguments);
    };
    window.showMentorWin.__cqHintsPatched = true;
  }

  /* ══════════════════════════════════════════════════════
     OBSERVE level title changes to re-wire the hint button
  ══════════════════════════════════════════════════════ */
  function observeLevelChanges() {
    var levelTitle = document.getElementById('level-title');
    if (!levelTitle) return;

    var observer = new MutationObserver(function () {
      /* Hide any open hint when the level changes */
      hideHintAndRestore();
      setTimeout(patchHintButtonListener, 100);
    });

    observer.observe(levelTitle, { childList: true, characterData: true, subtree: true });
  }

  /* ══════════════════════════════════════════════════════
     PUBLIC API  (backwards-compatible)
  ══════════════════════════════════════════════════════ */
  function getBalance() { return balance; }

  function resetPoints() {
    balance = STARTING_POINTS;
    writeBalance(balance);
    updateBadge();
    setHintButtonLabel(document.getElementById('hintBtn'));
  }

  function setUnlimitedHints(val) {
    unlimitedHints = false; /* always disabled */
    setHintButtonLabel(document.getElementById('hintBtn'));
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function init() {
    ensureBadge();
    updateBadge();

    setTimeout(patchHintButtonListener, 100);
    setTimeout(patchShowMentorWin, 500);

    observeLevelChanges();

    window.CQ_HINTS = {
      addPoints:           addPoints,
      getBalance:          getBalance,
      getBalanceLabel:     getBalanceLabel,
      getCurrentHintCost:  getCurrentHintCost,
      resetPoints:         resetPoints,
      setUnlimitedHints:   setUnlimitedHints,
      resetHintUI:         function () {
        removeCopyButton();
        setHintButtonLabel(document.getElementById('hintBtn'));
      }
    };

    /* unlimitedHints is never granted from session — hints always cost points */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
