/**
 * CODEQUEST – ONBOARDING TUTORIAL
 * Intro card (portrait top-right, dialogue bottom-left, RPG style)
 * Feedback card (bottom-right, error = sad portrait, idle = sad)
 * Win card (center modal, happy portrait, idle = icon)
 */
(function() {
  const TOUR_ID = 'mentor-tour-overlay';
  const TTS_STORAGE_KEY = 'codequest_tts_muted';
  let overlay;
  let card;
  let arrow;
  let textEl;
  let nextBtn;
  let skipBtn;
  let spotlightOverlay;
  let spotlightCard;
  let spotlightArrow;
  let spotlightText;
  let spotlightSkipBtn;
  let spotlightCloseBtn;
  let spotlightTarget;
  let introPointsEl;
  let mentorCodeEl;

  let active = false;
  let stepIndex = 0;
  let currentTarget = null;
  let targetAdvanceHandler = null;
  let targetAdvanceCapture = false;
  let ttsMuted = false;
  let mentorSpeechToken = 0;

  try {
    ttsMuted = localStorage.getItem(TTS_STORAGE_KEY) === '1';
  } catch (e) {
    ttsMuted = false;
  }

  window.getTtsMuted = function() { return ttsMuted; };

  window.setTtsMuted = function(muted) {
    ttsMuted = !!muted;
    try { localStorage.setItem(TTS_STORAGE_KEY, ttsMuted ? '1' : '0'); } catch (e) {}
    if (ttsMuted) {
      mentorSpeechToken += 1;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (window.responsiveVoice) try { window.responsiveVoice.cancel(); } catch(e) {}
      if (window.setMentorTalking) window.setMentorTalking(false);
    }
    return ttsMuted;
  };

  window.toggleTtsMuted = function() { return window.setTtsMuted(!ttsMuted); };

  /* ── Sync talking class on the tour card ── */
  function syncTutorialTalkingState(talking) {
    if (!card) return;
    card.classList.toggle('is-talking', !!talking);
    /* swap portrait src: talking image when speaking, icon when idle */
    const portrait = card.querySelector('.mentor-tour-portrait');
    if (!portrait) return;
    const profile = window.getSelectedMentorProfile ? window.getSelectedMentorProfile() : null;
    if (!profile) return;
    portrait.src = talking ? encodeURI(profile.talking) : encodeURI(profile.icon);
  }

  /* ── Core speak function ── */
  window.speakMentorText = function(text) {
    if (window.setMentorDialogueText && text) window.setMentorDialogueText(text);
    if (ttsMuted || !text) {
      mentorSpeechToken += 1;
      if (window.setMentorTalking) window.setMentorTalking(false);
      syncTutorialTalkingState(false);
      return;
    }
    
    const mentorId = window.getSelectedMentorId ? window.getSelectedMentorId() : null;
    const isScarlet = mentorId === 'scarlet' || window.__isScarletSelected === true;
    const isClara   = mentorId === 'clara';
    const mentorProfile = window.getSelectedMentorProfile ? window.getSelectedMentorProfile() : null;

    // ── SCARLET: ResponsiveVoice "UK English Female" (British accent) ──────────
    // ResponsiveVoice free tier DOES have "UK English Female" reliably.
    if (isScarlet && window.responsiveVoice) {
      const speechToken = ++mentorSpeechToken;
      if (window.setMentorTalking) window.setMentorTalking(true);
      syncTutorialTalkingState(true);
      const rate = (mentorProfile && mentorProfile.rate) || 1.01;
      const pitch = (mentorProfile && mentorProfile.pitch) || 1.12;
      window.responsiveVoice.speak(text, 'UK English Female', {
        rate: rate, pitch: pitch, volume: 1,
        onstart: () => { if (speechToken !== mentorSpeechToken) return; if (window.setMentorTalking) window.setMentorTalking(true); syncTutorialTalkingState(true); },
        onend:   () => { if (speechToken !== mentorSpeechToken) return; if (window.setMentorTalking) window.setMentorTalking(false); syncTutorialTalkingState(false); },
        onerror: () => { if (speechToken !== mentorSpeechToken) return; if (window.setMentorTalking) window.setMentorTalking(false); syncTutorialTalkingState(false); }
      });
      return;
    }

    // ── CLARA: native Web Speech API — US female, different engine from Scarlet's RV ──
    if (isClara && window.speechSynthesis && window.SpeechSynthesisUtterance) {
      const speechToken = ++mentorSpeechToken;
      window.speechSynthesis.cancel();
      if (window.setMentorTalking) window.setMentorTalking(true);
      syncTutorialTalkingState(true);

      function doSpeakClara() {
        if (speechToken !== mentorSpeechToken) return; // cancelled meanwhile
        const voices = window.speechSynthesis.getVoices();
        const FEMALE = ['samantha','aria','jenny','zira','victoria','amy','fiona','serena','karen','moira','tessa','allison','ava','microsoft zira'];
        const MALE   = ['david','mark','alex','fred','bruce','ralph','junior','daniel','ryan','george','james'];
        const usV = voices.filter(v => /en[-_]us/i.test(v.lang));
        const picked =
          usV.find(v => FEMALE.some(h => v.name.toLowerCase().includes(h))) ||
          usV.find(v => !MALE.some(h => v.name.toLowerCase().includes(h))) ||
          voices.find(v => /^en/i.test(v.lang) && FEMALE.some(h => v.name.toLowerCase().includes(h))) ||
          (voices.length ? voices[0] : null);

        const u = new SpeechSynthesisUtterance(text);
        u.rate   = (mentorProfile && mentorProfile.rate)  || 0.96;
        u.pitch  = (mentorProfile && mentorProfile.pitch) || 1.1;
        u.volume = 1;
        if (picked) u.voice = picked;
        u.onstart = () => { if (speechToken !== mentorSpeechToken) return; if (window.setMentorTalking) window.setMentorTalking(true); syncTutorialTalkingState(true); };
        u.onend   = () => { if (speechToken !== mentorSpeechToken) return; if (window.setMentorTalking) window.setMentorTalking(false); syncTutorialTalkingState(false); };
        u.onerror = () => { if (speechToken !== mentorSpeechToken) return; if (window.setMentorTalking) window.setMentorTalking(false); syncTutorialTalkingState(false); };
        window.speechSynthesis.speak(u);
      }

      const voicesNow = window.speechSynthesis.getVoices();
      if (voicesNow && voicesNow.length > 0) {
        doSpeakClara();
      } else {
        // Voices not loaded yet — wait for the event, with a 2s timeout fallback
        const onVoicesReady = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady);
          doSpeakClara();
        };
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesReady);
        setTimeout(() => {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady);
          doSpeakClara(); // speak with whatever we have
        }, 2000);
      }
      return;
    }

    // ── OTHER MENTORS (Kenji, Client): native speech synthesis ───────────────
    // Use native speechSynthesis for other mentors
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      mentorSpeechToken += 1;
      if (window.setMentorTalking) window.setMentorTalking(false);
      syncTutorialTalkingState(false);
      return;
    }
    try {
      const speechToken = ++mentorSpeechToken;
      window.speechSynthesis.cancel();
      if (window.setMentorTalking) window.setMentorTalking(true);
      syncTutorialTalkingState(true);
      const u = new SpeechSynthesisUtterance(text);
      if (mentorProfile) {
        u.rate  = mentorProfile.rate  || 1;
        u.pitch = mentorProfile.pitch || 1;
        if (window.getMentorVoiceForProfile) u.voice = window.getMentorVoiceForProfile(mentorProfile);
      }
      u.volume = 1;
      u.onstart = () => {
        if (speechToken !== mentorSpeechToken) return;
        if (window.setMentorTalking) window.setMentorTalking(true);
        syncTutorialTalkingState(true);
      };
      u.onend = () => {
        if (speechToken !== mentorSpeechToken) return;
        if (window.setMentorTalking) window.setMentorTalking(false);
        syncTutorialTalkingState(false);
      };
      u.onerror = () => {
        if (speechToken !== mentorSpeechToken) return;
        if (window.setMentorTalking) window.setMentorTalking(false);
        syncTutorialTalkingState(false);
      };
      window.speechSynthesis.speak(u);
    } catch (e) {
      mentorSpeechToken += 1;
      if (window.setMentorTalking) window.setMentorTalking(false);
      syncTutorialTalkingState(false);
    }
  };

  /* ── Voices-ready guard ── */
  function speak(text) {
    const mentorId = window.getSelectedMentorId ? window.getSelectedMentorId() : null;
    const usesRV = (mentorId === 'scarlet' || mentorId === 'clara') && window.responsiveVoice;

    // If ResponsiveVoice is loaded but not yet initialised, wait a tick
    if (usesRV && window.responsiveVoice.voiceList && window.responsiveVoice.voiceList().length === 0) {
      setTimeout(() => window.speakMentorText(text), 600);
      return;
    }

    // For native speech, wait for voices to load
    if (!usesRV && window.speechSynthesis && window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', function onV() {
        window.speechSynthesis.removeEventListener('voiceschanged', onV);
        window.speakMentorText(text);
      }, { once: true });
      return;
    }
    window.speakMentorText(text);
  }

  const steps = window.CODEQUEST_TUTORIAL_STEPS || [];

  /* ════════════════════════════════════════════
     INTRO CARD — RPG style, portrait top-right
     ════════════════════════════════════════════ */
  function ensureUi() {
    if (overlay) return;

    const style = document.createElement('style');
    style.textContent = `
      /* ── Overlay ── */
      #mentor-tour-overlay {
        position: fixed;
        inset: 0;
        z-index: var(--cq-layer-modal, 400);
        background: rgba(3, 8, 20, 0.55);
        pointer-events: none;
        overflow: visible;
      }

      /* ── RPG dialogue card ── */
      #mentor-tour-card {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: min(94vw, 680px);
        background: linear-gradient(180deg, #f8ebbf 0%, #f0d48a 100%);
        border: 3px solid #8b5e34;
        border-radius: 22px;
        box-shadow: 0 24px 56px rgba(2,6,23,0.45), inset 0 0 0 3px rgba(255,247,214,0.8), 0 0 0 1px rgba(255,255,255,0.2);
        padding: 0;
        color: #5b4328;
        pointer-events: auto;
        z-index: calc(var(--cq-layer-modal, 400) + 2);
        isolation: isolate;
        overflow: hidden;
        animation: mentorTourPop 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      /* ── Inner border inset ── */
      #mentor-tour-card::before {
        content: '';
        position: absolute;
        inset: 8px;
        border-radius: 16px;
        border: 1px solid rgba(120,81,42,0.18);
        pointer-events: none;
        z-index: 0;
      }

      #mentor-tour-card::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.18) 22%, transparent 40%);
        transform: translateX(-120%);
        animation: mentorTourSheen 2.4s ease-in-out infinite;
        pointer-events: none;
        z-index: 0;
      }

      /* ── Portrait – top right ── */
      .mentor-tour-portrait {
        position: absolute;
        top: -20px;
        right: 10px;
        width: min(26vw, 182px);
        height: auto;
        image-rendering: pixelated;
        filter: drop-shadow(0 10px 18px rgba(2,6,23,0.30));
        transform-origin: bottom center;
        pointer-events: none;
        z-index: 10;
      }
      #mentor-tour-card.is-talking .mentor-tour-portrait {
        animation: mentorTourBob 0.7s ease-in-out infinite;
      }

      /* ── Body area – left of portrait ── */
      #mentor-tour-body {
        position: relative;
        z-index: 1;
        padding: 20px 20px 16px 20px;
        /* leave room on right for portrait */
        padding-right: calc(min(26vw, 182px) + 24px);
        min-height: 160px;
      }

      /* ── Name plate ── */
      #mentor-tour-nameplate {
        display: inline-flex;
        align-items: center;
        height: 38px;
        padding: 0 20px;
        margin-bottom: 12px;
        border-radius: 12px;
        background: linear-gradient(180deg, #9d7453 0%, #7a5438 100%);
        border: 2px solid #4f3420;
        color: #fff7e7;
        font-family: var(--font-mono, monospace);
        font-size: 1rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        box-shadow: 0 4px 0 rgba(79,52,32,0.30);
      }

      /* ── Dialogue bubble ── */
      #mentor-tour-copy {
        background: rgba(255,251,235,0.88);
        border: 2px solid rgba(122,84,56,0.2);
        border-radius: 14px;
        padding: 12px 16px;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5);
      }
      #mentor-tour-title {
        font-family: var(--font-mono, monospace);
        font-weight: 700;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #9d7453;
        margin: 0 0 5px 0;
      }
      #mentor-tour-text {
        margin: 0;
        color: #4a3520;
        line-height: 1.7;
        font-family: var(--font-mono, monospace);
        font-size: 0.88rem;
      }

      /* ── Example code block ── */
      .mentor-tour-code {
        margin-top: 10px;
        background: #0f1724;
        color: #e6eef8;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace;
        font-size: 0.78rem;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.04);
        max-height: 180px;
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .mentor-tour-points {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
        padding: 8px 12px;
        border-radius: 999px;
        background: linear-gradient(180deg, rgba(120,81,42,0.12), rgba(120,81,42,0.06));
        border: 1px solid rgba(120,81,42,0.22);
        color: #7a5438;
        font-family: var(--font-mono, monospace);
        font-size: 0.78rem;
        font-weight: 700;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.35);
      }
      .mentor-tour-points strong {
        color: #9d2d1f;
        font-size: 0.9rem;
      }

      /* ── Controls bar ── */
      #mentor-tour-controls {
        position: relative;
        z-index: 1;
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        padding: 10px 20px 16px 20px;
        border-top: 1px solid rgba(139,94,52,0.18);
        background: rgba(240,212,138,0.5);
      }
      .mentor-tour-btn {
        border: 1.5px solid #44536d;
        background: #182742;
        color: #e2e8f0;
        border-radius: 8px;
        padding: 8px 16px;
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        transition: background 0.15s;
      }
      .mentor-tour-btn:hover { background: #24375c; }
      .mentor-tour-btn.primary {
        background: #38bdf8;
        border-color: #0ea5e9;
        color: #06202b;
      }
      .mentor-tour-btn.primary:hover { background: #0ea5e9; }
      #mentor-skip { border-color: rgba(251,191,36,0.5); color: #fbbf24; }

      /* ── Arrow pointer ── */
      #mentor-tour-arrow {
        position: fixed;
        z-index: calc(var(--cq-layer-modal, 400) + 1);
        font-size: 34px;
        color: #fbbf24;
        text-shadow: 0 4px 12px rgba(0,0,0,0.45);
        transform: translateX(-50%);
        animation: mentorBounce 0.9s ease-in-out infinite;
        pointer-events: none;
      }

      /* ── Highlight ring ── */
      .mentor-highlight {
        position: relative;
        z-index: calc(var(--cq-layer-modal, 400) + 1) !important;
        box-shadow: 0 0 0 4px rgba(251,191,36,0.98), 0 0 0 10px rgba(251,191,36,0.28), 0 0 28px rgba(251,191,36,0.55) !important;
        border-radius: 10px !important;
        pointer-events: auto !important;
        animation: mentorHighlightPulse 1.15s ease-in-out infinite;
      }

      /* ── Keyframes ── */
      @keyframes mentorBounce {
        0%,100% { transform: translate(-50%,0); }
        50%      { transform: translate(-50%,6px); }
      }
      @keyframes mentorTourBob {
        0%,100% { transform: translateY(0) scale(1); }
        50%     { transform: translateY(-4px) scale(1.01); }
      }
      @keyframes mentorTourPop {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes mentorTourSheen {
        0%, 55% { transform: translateX(-120%); opacity: 0; }
        65% { opacity: 0.45; }
        100% { transform: translateX(120%); opacity: 0; }
      }
      @keyframes mentorHighlightPulse {
        0%, 100% {
          box-shadow: 0 0 0 4px rgba(251,191,36,0.98), 0 0 0 10px rgba(251,191,36,0.28), 0 0 28px rgba(251,191,36,0.55) !important;
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 0 5px rgba(251,191,36,1), 0 0 0 14px rgba(251,191,36,0.36), 0 0 38px rgba(251,191,36,0.75) !important;
          transform: scale(1.01);
        }
      }

      /* ── Mobile ── */
      @media (max-width: 640px) {
        #mentor-tour-card {
          left: 8px; right: 8px; top: auto; bottom: 8px;
          transform: none; width: auto;
        }
        #mentor-tour-body { padding-right: calc(min(24vw, 112px) + 16px); min-height: 130px; }
        .mentor-tour-portrait { width: min(24vw, 112px); top: -24px; }
        #mentor-tour-text { font-size: 0.8rem; }
      }
    `;
    document.head.appendChild(style);

    overlay = document.createElement('div');
    overlay.id = TOUR_ID;
    overlay.addEventListener('click', (e) => {
      if (!active) return;
      if (card && card.contains(e.target)) return;
      stopTour();
    });

    card = document.createElement('div');
    card.id = 'mentor-tour-card';
    card.setAttribute('data-mentor-dialogue', '');
    card.innerHTML = [
      '<img class="mentor-tour-portrait" data-mentor-portrait src="Pixel Art/Clara/Clara_Icon.png" alt="Mentor portrait">',
      '<div id="mentor-tour-body">',
      '  <div id="mentor-tour-nameplate" data-mentor-dialogue-name>Mentor</div>',
      '  <div id="mentor-tour-copy">',
      '    <p id="mentor-tour-title">Introduction</p>',
      '    <p id="mentor-tour-text" data-mentor-dialogue-text></p>',
      '    <pre id="mentor-tour-code" class="mentor-tour-code" style="display:none"><code></code></pre>',
      '    <div class="mentor-tour-points" id="mentor-tour-points" style="display:none">Hint points: <strong>200 pts</strong> power hints, and the XP badge in the top right tracks your level progress.</div>',
      '  </div>',
      '</div>',
      '<div id="mentor-tour-controls">',
      '  <button id="mentor-skip" class="mentor-tour-btn">Skip</button>',
      '  <button id="mentor-next" class="mentor-tour-btn primary">Next</button>',
      '</div>'
    ].join('');

    arrow = document.createElement('div');
    arrow.id = 'mentor-tour-arrow';

    document.documentElement.appendChild(overlay);
    document.documentElement.appendChild(card);
    document.documentElement.appendChild(arrow);

    /* sync AFTER card is in the DOM */
    if (window.syncMentorDisplay) window.syncMentorDisplay();
    syncTutorialTalkingState(window.getMentorTalking ? window.getMentorTalking() : false);

    textEl  = document.getElementById('mentor-tour-text');
    nextBtn = document.getElementById('mentor-next');
    skipBtn  = document.getElementById('mentor-skip');
    introPointsEl = document.getElementById('mentor-tour-points');
    mentorCodeEl = document.getElementById('mentor-tour-code');

    nextBtn.addEventListener('click', () => { stepIndex += 1; renderStep(); });
    skipBtn.addEventListener('click', stopTour);
  }

  function getMentorDisplayName() {
    const p = window.getSelectedMentorProfile ? window.getSelectedMentorProfile() : null;
    return p && p.label ? p.label : 'Mentor';
  }

  function clearTarget() {
    if (currentTarget) {
      currentTarget.classList.remove('mentor-highlight');
      if (targetAdvanceHandler) currentTarget.removeEventListener('click', targetAdvanceHandler, targetAdvanceCapture);
    }
    targetAdvanceHandler = null;
    targetAdvanceCapture = false;
    currentTarget = null;
  }

  function positionCard() {
    if (!card) return;
    card.style.left = '50%';
    card.style.top  = '50%';
    card.style.transform = 'translate(-50%, -50%)';
  }

  function positionArrow() {
    if (!currentTarget || !arrow) return;
    const rect = currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const above = rect.top > 60;
    arrow.textContent = above ? '↓' : '↑';
    arrow.style.left = cx + 'px';
    arrow.style.top  = above ? (rect.top - 38) + 'px' : (rect.bottom + 8) + 'px';
  }

  function renderStep() {
    if (stepIndex >= steps.length) { stopTour(); return; }
    clearTarget();

    // Remove any lingering hint copy button when navigating tutorial steps
    try {
      var lingeringCopy = document.getElementById('cq-hint-copy-btn');
      if (lingeringCopy && lingeringCopy.parentNode) lingeringCopy.parentNode.removeChild(lingeringCopy);
    } catch (e) {}

    const step   = steps[stepIndex];
    const target = document.querySelector(step.selector);
    if (!target) { stepIndex += 1; renderStep(); return; }

    currentTarget = target;
    currentTarget.classList.add('mentor-highlight');

    targetAdvanceHandler = () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      stepIndex += 1;
      renderStep();
    };
    targetAdvanceCapture = false;
    currentTarget.addEventListener('click', targetAdvanceHandler, targetAdvanceCapture);

    textEl.textContent = step.text;
    // show example code when provided by the step
    if (mentorCodeEl) {
      if (step.code) {
        const codeEl = mentorCodeEl.querySelector('code');
        try { codeEl.textContent = step.code; } catch (e) { codeEl.textContent = String(step.code); }
        mentorCodeEl.style.display = '';
      } else {
        mentorCodeEl.style.display = 'none';
      }
    }
    const nameplate = document.getElementById('mentor-tour-nameplate');
    if (nameplate) nameplate.textContent = getMentorDisplayName();
    if (introPointsEl) {
      // Only show hint points message on step 4 (hint points badge step)
      if (stepIndex === 4) {
        const hintBalance = window.CQ_HINTS && typeof window.CQ_HINTS.getBalance === 'function'
          ? window.CQ_HINTS.getBalance()
          : 200;
        introPointsEl.innerHTML = 'Hint points: <strong>' + hintBalance + ' pts</strong> power hints. You spend these to unlock hints when you get stuck, and earn more as you progress.';
        introPointsEl.style.display = '';
      } else {
        introPointsEl.style.display = 'none';
      }
    }
    const isLast = stepIndex === steps.length - 1;
    nextBtn.textContent = isLast ? 'Done' : 'Next';
    card.style.display = '';

    positionCard();
    positionArrow();
    speak(step.text);
  }

  function stopTour() {
    active = false;
    clearTarget();
    if (overlay) overlay.remove();
    if (card)    card.remove();
    if (arrow)   arrow.remove();
    overlay = card = arrow = textEl = nextBtn = skipBtn = null;
    if (window.speechSynthesis) { mentorSpeechToken += 1; window.speechSynthesis.cancel(); }
    if (window.setMentorTalking) window.setMentorTalking(false);
  }

  window.startOnboardingTutorial = function() {
    stopTour();
    ensureUi();
    active = true;
    stepIndex = 0;
    renderStep();
  };
  window.stopOnboardingTutorial = stopTour;

  /* ════════════════════════════════════════════════════════════
     FEEDBACK CARD  — bottom-right, red tones, sad/talking portrait
     ════════════════════════════════════════════════════════════ */

  let feedbackCard = null;
  let feedbackPortrait = null;
  let feedbackTextEl = null;
  let feedbackCloseEl = null;
  let feedbackSpeechToken = 0;

  function ensureFeedbackStyles() {
    if (document.getElementById('cq-feedback-style')) return;
    const s = document.createElement('style');
    s.id = 'cq-feedback-style';
    s.textContent = `
      #cq-feedback-card {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: min(92vw, 360px);
        background: linear-gradient(180deg, #3d1212 0%, #2a0a0a 100%);
        border: 2px solid #c0392b;
        border-radius: 18px;
        box-shadow: 0 12px 40px rgba(192,57,43,0.35), inset 0 0 0 1px rgba(255,100,80,0.12);
        display: flex;
        align-items: flex-end;
        gap: 0;
        overflow: visible;
        z-index: 9999;
        pointer-events: auto;
        animation: feedbackSlideIn 0.28s cubic-bezier(0.22,1,0.36,1);
      }
      @keyframes feedbackSlideIn {
        from { opacity:0; transform: translateY(24px) scale(0.96); }
        to   { opacity:1; transform: translateY(0) scale(1); }
      }

      /* portrait sits bottom-right of the card, peeking up */
      #cq-feedback-portrait {
        position: absolute;
        right: 12px;
        bottom: 0;
        width: 100px;
        height: auto;
        image-rendering: pixelated;
        filter: drop-shadow(0 -4px 10px rgba(192,57,43,0.5));
        transform-origin: bottom center;
        animation: fbIdle 1.6s ease-in-out infinite;
        pointer-events: none;
        z-index: 2;
      }
      #cq-feedback-card.fb-talking #cq-feedback-portrait {
        animation: fbTalk 0.75s ease-in-out infinite;
      }
      @keyframes fbIdle {
        0%,100% { transform: translateY(0) scale(1); }
        50%     { transform: translateY(-3px) scale(1.01); }
      }
      @keyframes fbTalk {
        0%,100% { transform: translateY(0) scale(1) rotate(-1deg); }
        50%     { transform: translateY(-5px) scale(1.02) rotate(1deg); }
      }

      #cq-feedback-body {
        flex: 1;
        padding: 14px 116px 14px 16px;
      }
      #cq-feedback-name {
        font-family: var(--font-mono, monospace);
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #f87171;
        margin-bottom: 5px;
      }
      #cq-feedback-text {
        font-family: var(--font-mono, monospace);
        font-size: 0.82rem;
        color: #fecaca;
        line-height: 1.6;
        margin: 0;
      }
      #cq-feedback-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 1px solid rgba(248,113,113,0.4);
        background: rgba(220,38,38,0.25);
        color: #fca5a5;
        font-size: 12px;
        font-weight: 900;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }
      #cq-feedback-close:hover { background: rgba(220,38,38,0.5); }
    `;
    document.head.appendChild(s);
  }

  function showFeedbackCard(text) {
    ensureFeedbackStyles();

    if (!feedbackCard) {
      feedbackCard = document.createElement('div');
      feedbackCard.id = 'cq-feedback-card';

      feedbackPortrait = document.createElement('img');
      feedbackPortrait.id = 'cq-feedback-portrait';

      const body = document.createElement('div');
      body.id = 'cq-feedback-body';

      const nameEl = document.createElement('div');
      nameEl.id = 'cq-feedback-name';

      feedbackTextEl = document.createElement('p');
      feedbackTextEl.id = 'cq-feedback-text';

      feedbackCloseEl = document.createElement('button');
      feedbackCloseEl.id = 'cq-feedback-close';
      feedbackCloseEl.textContent = '✕';
      feedbackCloseEl.addEventListener('click', hideFeedbackCard);

      body.appendChild(nameEl);
      body.appendChild(feedbackTextEl);
      feedbackCard.appendChild(feedbackCloseEl);
      feedbackCard.appendChild(feedbackPortrait);
      feedbackCard.appendChild(body);
    }

    const feedbackHost = document.body;
    if (feedbackCard.parentElement !== feedbackHost) {
      feedbackHost.appendChild(feedbackCard);
    }

    /* always show sad portrait at start (idle = sad) */
    const profile = window.getSelectedMentorProfile ? window.getSelectedMentorProfile() : null;
    feedbackPortrait.src   = profile ? encodeURI(profile.sad) : '';
    feedbackPortrait.alt   = profile ? profile.label + ' error portrait' : 'Mentor';
    const nameEl = document.getElementById('cq-feedback-name');
    if (nameEl) nameEl.textContent = profile ? profile.label : 'Mentor';

    feedbackTextEl.textContent = text;
    feedbackCard.classList.remove('fb-talking');
    feedbackCard.style.display = 'flex';

    /* speak feedback with talking animation */
    speakWithFeedbackAnimation(text, profile);
  }

  function speakWithFeedbackAnimation(text, profile) {
    if (ttsMuted || !text) return;
    
    // Check if Scarlet is selected - multiple sources for reliability
    const mentorId = window.getSelectedMentorId ? window.getSelectedMentorId() : null;
    const isScarlet = mentorId === 'scarlet' || window.__isScarletSelected === true || (profile && profile.id === 'scarlet');
    
    // SCARLET: ResponsiveVoice "UK English Female" (British)
    if (isScarlet && window.responsiveVoice) {
      try {
        const token = ++feedbackSpeechToken;
        const rate = (profile && profile.rate) || 1.01;
        const pitch = (profile && profile.pitch) || 1.12;
        if (feedbackCard) feedbackCard.classList.add('fb-talking');
        window.responsiveVoice.speak(text, 'UK English Female', {
          rate, pitch, volume: 1,
          onstart: () => { if (token !== feedbackSpeechToken || !feedbackCard) return; feedbackCard.classList.add('fb-talking'); },
          onend:   () => { if (token !== feedbackSpeechToken || !feedbackCard) return; feedbackCard.classList.remove('fb-talking'); },
          onerror: () => { if (token !== feedbackSpeechToken || !feedbackCard) return; feedbackCard.classList.remove('fb-talking'); }
        });
      } catch (e) {}
      return;
    }
    // CLARA: native Web Speech API (different engine + accent from Scarlet)
    const isClara = mentorId === 'clara' || (profile && profile.id === 'clara');
    if (isClara && window.speechSynthesis && window.SpeechSynthesisUtterance) {
      try {
        const token = ++feedbackSpeechToken;
        window.speechSynthesis.cancel();
        if (feedbackCard) feedbackCard.classList.add('fb-talking');
        const FH = ['samantha','aria','jenny','zira','victoria','amy','fiona','serena'];
        function doFbClara() {
          if (token !== feedbackSpeechToken) return;
          const voices = window.speechSynthesis.getVoices();
          const u = new SpeechSynthesisUtterance(text);
          u.rate = (profile && profile.rate) || 0.96; u.pitch = (profile && profile.pitch) || 1.1; u.volume = 1;
          u.voice = voices.find(v => /en[-_]us/i.test(v.lang) && FH.some(h => v.name.toLowerCase().includes(h)))
                 || voices.find(v => /^en/i.test(v.lang) && FH.some(h => v.name.toLowerCase().includes(h))) || null;
          u.onstart = () => { if (token !== feedbackSpeechToken || !feedbackCard) return; feedbackCard.classList.add('fb-talking'); };
          u.onend = u.onerror = () => { if (token !== feedbackSpeechToken || !feedbackCard) return; feedbackCard.classList.remove('fb-talking'); };
          window.speechSynthesis.speak(u);
        }
        const v = window.speechSynthesis.getVoices();
        if (v && v.length) { doFbClara(); }
        else { const fn = () => { window.speechSynthesis.removeEventListener('voiceschanged', fn); doFbClara(); }; window.speechSynthesis.addEventListener('voiceschanged', fn); setTimeout(() => { window.speechSynthesis.removeEventListener('voiceschanged', fn); doFbClara(); }, 2000); }
      } catch (e) {}
      return;
    }
    
    // Try meSpeak for Scarlet as backup
    if (isScarlet && window.meSpeak) {
      try {
        const rate = (profile?.rate || 1) * 100;
        
        if (feedbackCard) feedbackCard.classList.add('fb-talking');
        if (profile && feedbackPortrait) feedbackPortrait.src = encodeURI(profile.sad);
        
        // Use higher pitch for female sound
        const config = { speed: rate, pitch: 150 };
        const audioData = meSpeak.speak(text, config);
        if (audioData) {
          const audio = new Audio('data:audio/wav;base64,' + btoa(String.fromCharCode.apply(null, audioData)));
          audio.onended = () => {
            if (feedbackCard) feedbackCard.classList.remove('fb-talking');
            if (profile && feedbackPortrait) feedbackPortrait.src = encodeURI(profile.sad);
          };
          audio.onerror = () => {
            if (feedbackCard) feedbackCard.classList.remove('fb-talking');
            if (profile && feedbackPortrait) feedbackPortrait.src = encodeURI(profile.sad);
          };
          audio.play();
          return;
        }
      } catch (e) {
        console.log('SCARLET meSpeak feedback error:', e);
      }
    }
    
    // Use native speechSynthesis for other mentors
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    try {
      const token = ++feedbackSpeechToken;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (profile) {
        u.rate  = profile.rate  || 1;
        u.pitch = profile.pitch || 1;
        if (window.getMentorVoiceForProfile) u.voice = window.getMentorVoiceForProfile(profile);
      }
      u.volume = 1;
      u.onstart = () => {
        if (token !== feedbackSpeechToken || !feedbackCard) return;
        feedbackCard.classList.add('fb-talking');
        /* swap to sad portrait while talking */
        if (profile && feedbackPortrait) feedbackPortrait.src = encodeURI(profile.sad);
      };
      u.onend = u.onerror = () => {
        if (token !== feedbackSpeechToken || !feedbackCard) return;
        feedbackCard.classList.remove('fb-talking');
        /* back to sad idle when done */
        if (profile && feedbackPortrait) feedbackPortrait.src = encodeURI(profile.sad);
      };
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  function hideFeedbackCard() {
    if (feedbackCard) {
      feedbackCard.style.display = 'none';
      feedbackCard.classList.remove('fb-talking');
    }
    feedbackSpeechToken += 1;
  }

  /* expose so game.js can call it */
  window.showMentorFeedback = showFeedbackCard;
  window.hideMentorFeedback = hideFeedbackCard;

  /* ════════════════════════════════════════════════════════════
     WIN CARD — centered, happy portrait, talking when speaking
     ════════════════════════════════════════════════════════════ */

  let winCard = null;
  let winPortrait = null;
  let winSpeechToken = 0;

  function ensureWinStyles() {
    if (document.getElementById('cq-win-style')) return;
    const s = document.createElement('style');
    s.id = 'cq-win-style';
    s.textContent = `
      #cq-win-overlay {
        position: fixed;
        inset: 0;
        z-index: var(--cq-layer-modal, 400);
        background: rgba(3, 8, 20, 0.88);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 28px;
      }
      #cq-win-card {
        position: relative;
        width: min(94vw, 620px);
        background: linear-gradient(180deg, #f8ebbf 0%, #f0d48a 100%);
        border: 3px solid #8b5e34;
        border-radius: 22px;
        box-shadow: 0 24px 56px rgba(2,6,23,0.45), inset 0 0 0 3px rgba(255,247,214,0.8);
        overflow: hidden;
        animation: winPop 0.35s cubic-bezier(0.22,1,0.36,1);
      }
      @keyframes winPop {
        from { opacity:0; transform: scale(0.88); }
        to   { opacity:1; transform: scale(1); }
      }
      #cq-win-card::before {
        content:'';
        position:absolute;
        inset:8px;
        border-radius:16px;
        border:1px solid rgba(120,81,42,0.18);
        pointer-events:none;
      }

      /* portrait – top right */
      #cq-win-portrait {
        position: absolute;
        top: 42px;
        right: 14px;
        width: min(30vw, 220px);
        height: auto;
        image-rendering: pixelated;
        filter: drop-shadow(0 10px 18px rgba(2,6,23,0.28));
        transform-origin: bottom center;
        animation: winIdle 1.4s ease-in-out infinite;
        pointer-events: none;
        z-index: 10;
      }
      #cq-win-card.is-talking #cq-win-portrait {
        animation: winTalk 0.72s ease-in-out infinite;
      }
      @keyframes winIdle {
        0%,100% { transform: translateY(0) scale(1); }
        50%     { transform: translateY(-5px) scale(1.012); }
      }
      @keyframes winTalk {
        0%,100% { transform: translateY(0) scale(1) rotate(-1deg); }
        50%     { transform: translateY(-7px) scale(1.018) rotate(1.2deg); }
      }

      #cq-win-body {
        padding: 22px 20px 16px 20px;
        padding-right: calc(min(30vw, 220px) + 28px);
        min-height: 170px;
        position: relative;
        z-index: 1;
      }
      #cq-win-nameplate {
        display: inline-flex;
        align-items: center;
        height: 36px;
        padding: 0 18px;
        margin-bottom: 10px;
        border-radius: 10px;
        background: linear-gradient(180deg, #9d7453 0%, #7a5438 100%);
        border: 2px solid #4f3420;
        color: #fff7e7;
        font-family: var(--font-mono, monospace);
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        box-shadow: 0 4px 0 rgba(79,52,32,0.3);
      }
      #cq-win-copy {
        background: rgba(255,251,235,0.88);
        border: 2px solid rgba(122,84,56,0.2);
        border-radius: 14px;
        padding: 12px 16px;
      }
      #cq-win-emoji {
        font-size: 1.5rem;
        display: block;
        margin-bottom: 4px;
      }
      #cq-win-title {
        font-family: var(--font-mono, monospace);
        font-size: 1.1rem;
        font-weight: 700;
        color: #5b4328;
        margin: 0 0 6px 0;
      }
      #cq-win-message {
        font-family: var(--font-mono, monospace);
        font-size: 0.85rem;
        color: #7a5438;
        margin: 0 0 10px 0;
        line-height: 1.6;
      }
      #cq-win-xp {
        display: inline-block;
        background: #fbbf24;
        color: #451a03;
        font-weight: 700;
        font-size: 0.9rem;
        border-radius: 8px;
        padding: 4px 14px;
      }
      #cq-win-controls {
        display: flex;
        justify-content: flex-end;
        padding: 10px 20px 16px 20px;
        border-top: 1px solid rgba(139,94,52,0.18);
        background: rgba(240,212,138,0.5);
        position: relative;
        z-index: 1;
      }
      #cq-win-continue {
        border: 1.5px solid #0ea5e9;
        background: #38bdf8;
        color: #06202b;
        border-radius: 8px;
        padding: 9px 22px;
        font-weight: 700;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.15s;
      }
      #cq-win-continue:hover { background: #0ea5e9; }

      @media (max-width:640px) {
        #cq-win-body { padding-right: calc(min(30vw,130px)+16px); min-height:140px; }
        #cq-win-portrait { width: min(30vw,130px); top:24px; }
      }
    `;
    document.head.appendChild(s);
  }

  function showWinCard(options) {
    /* options: { emoji, title, message, xp, onContinue } */
    ensureWinStyles();

    /* remove old if exists */
    const old = document.getElementById('cq-win-overlay');
    if (old) old.remove();
    winCard = null;

    const ov = document.createElement('div');
    ov.id = 'cq-win-overlay';

    winCard = document.createElement('div');
    winCard.id = 'cq-win-card';

    winPortrait = document.createElement('img');
    winPortrait.id = 'cq-win-portrait';

    const body = document.createElement('div');
    body.id = 'cq-win-body';

    const nameplate = document.createElement('div');
    nameplate.id = 'cq-win-nameplate';

    const copy = document.createElement('div');
    copy.id = 'cq-win-copy';

    const emojiEl = document.createElement('span');
    emojiEl.id = 'cq-win-emoji';
    emojiEl.textContent = options.emoji || '🎉';

    const titleEl = document.createElement('p');
    titleEl.id = 'cq-win-title';
    titleEl.textContent = options.title || 'Level Complete!';

    const msgEl = document.createElement('p');
    msgEl.id = 'cq-win-message';
    msgEl.textContent = options.message || '';

    const xpEl = document.createElement('span');
    xpEl.id = 'cq-win-xp';
    xpEl.textContent = '+' + (options.xp || 0) + ' XP';

    copy.appendChild(emojiEl);
    copy.appendChild(titleEl);
    copy.appendChild(msgEl);
    copy.appendChild(xpEl);
    body.appendChild(nameplate);
    body.appendChild(copy);

    const controls = document.createElement('div');
    controls.id = 'cq-win-controls';
    const contBtn = document.createElement('button');
    contBtn.id = 'cq-win-continue';
    contBtn.textContent = 'Continue →';
    contBtn.addEventListener('click', () => {
      ov.remove();
      winCard = null;
      winSpeechToken += 1;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (window.responsiveVoice) try { window.responsiveVoice.cancel(); } catch(e) {}
      document.body.classList.remove('modal-open');
      // Restore left-panel and app stacking context
      const leftPanel = document.getElementById('left-panel');
      const app = document.getElementById('app');
      if (leftPanel) { leftPanel.style.zIndex = leftPanel.dataset.prevZ || ''; }
      if (app) { app.style.zIndex = app.dataset.prevZ || ''; }
      if (options.onContinue) options.onContinue();
    });
    controls.appendChild(contBtn);

    winCard.appendChild(winPortrait);
    winCard.appendChild(body);
    winCard.appendChild(controls);
    ov.appendChild(winCard);
    document.body.appendChild(ov);
    // Lock background and force left-panel below the overlay stacking context
    document.body.classList.add('modal-open');
    const leftPanel = document.getElementById('left-panel');
    const app = document.getElementById('app');
    if (leftPanel) { leftPanel.dataset.prevZ = leftPanel.style.zIndex; leftPanel.style.zIndex = '0'; }
    if (app) { app.dataset.prevZ = app.style.zIndex; app.style.zIndex = '0'; }

    /* set portrait: icon at start, swap to happy when speaking */
    const profile = window.getSelectedMentorProfile ? window.getSelectedMentorProfile() : null;
    nameplate.textContent = profile ? profile.label : 'Mentor';
    winPortrait.src = profile ? encodeURI(profile.icon) : '';
    winPortrait.alt = profile ? profile.label + ' portrait' : 'Mentor';

    /* speak the win message */
    const winText = (options.title || '') + '. ' + (options.message || '');
    speakWithWinAnimation(winText, profile);
  }

  function speakWithWinAnimation(text, profile) {
    if (ttsMuted || !text) return;
    
    // Check if Scarlet is selected - multiple sources for reliability
    const mentorId = window.getSelectedMentorId ? window.getSelectedMentorId() : null;
    const isScarlet = mentorId === 'scarlet' || window.__isScarletSelected === true || (profile && profile.id === 'scarlet');
    
    // SCARLET: ResponsiveVoice "UK English Female" (British accent)
    if (isScarlet && window.responsiveVoice) {
      try {
        const token = ++winSpeechToken;
        const rate = (profile && profile.rate) || 1.01;
        const pitch = (profile && profile.pitch) || 1.12;
        if (winCard) winCard.classList.add('is-talking');
        if (profile && winPortrait) winPortrait.src = encodeURI(profile.happy);
        window.responsiveVoice.speak(text, 'UK English Female', {
          rate, pitch, volume: 1,
          onstart: () => { if (token !== winSpeechToken || !winCard) return; winCard.classList.add('is-talking'); if (profile && winPortrait) winPortrait.src = encodeURI(profile.happy); },
          onend:   () => { if (token !== winSpeechToken || !winCard) return; winCard.classList.remove('is-talking'); if (profile && winPortrait) winPortrait.src = encodeURI(profile.icon); },
          onerror: () => { if (token !== winSpeechToken || !winCard) return; winCard.classList.remove('is-talking'); if (profile && winPortrait) winPortrait.src = encodeURI(profile.icon); }
        });
      } catch (e) {}
      return;
    }
    // CLARA: native Web Speech API (US accent, different engine from Scarlet)
    const isClara = mentorId === 'clara' || (profile && profile.id === 'clara');
    if (isClara && window.speechSynthesis && window.SpeechSynthesisUtterance) {
      try {
        const token = ++winSpeechToken;
        window.speechSynthesis.cancel();
        if (winCard) winCard.classList.add('is-talking');
        if (profile && winPortrait) winPortrait.src = encodeURI(profile.happy);
        const FH = ['samantha','aria','jenny','zira','victoria','amy','fiona','serena'];
        function doWinClara() {
          if (token !== winSpeechToken) return;
          const voices = window.speechSynthesis.getVoices();
          const u = new SpeechSynthesisUtterance(text);
          u.rate = (profile && profile.rate) || 0.96; u.pitch = (profile && profile.pitch) || 1.1; u.volume = 1;
          u.voice = voices.find(v => /en[-_]us/i.test(v.lang) && FH.some(h => v.name.toLowerCase().includes(h)))
                 || voices.find(v => /^en/i.test(v.lang) && FH.some(h => v.name.toLowerCase().includes(h))) || null;
          u.onstart = () => { if (token !== winSpeechToken || !winCard) return; winCard.classList.add('is-talking'); if (profile && winPortrait) winPortrait.src = encodeURI(profile.happy); };
          u.onend = u.onerror = () => { if (token !== winSpeechToken || !winCard) return; winCard.classList.remove('is-talking'); if (profile && winPortrait) winPortrait.src = encodeURI(profile.icon); };
          window.speechSynthesis.speak(u);
        }
        const v = window.speechSynthesis.getVoices();
        if (v && v.length) { doWinClara(); }
        else { const fn = () => { window.speechSynthesis.removeEventListener('voiceschanged', fn); doWinClara(); }; window.speechSynthesis.addEventListener('voiceschanged', fn); setTimeout(() => { window.speechSynthesis.removeEventListener('voiceschanged', fn); doWinClara(); }, 2000); }
      } catch (e) {}
      return;
    }
    
    // Try meSpeak for Scarlet as backup
    if (isScarlet && window.meSpeak) {
      try {
        const rate = (profile?.rate || 1) * 100;
        
        if (winCard) winCard.classList.add('is-talking');
        if (profile && winPortrait) winPortrait.src = encodeURI(profile.happy);
        
        // Use higher pitch for female sound
        const config = { speed: rate, pitch: 150 };
        const audioData = meSpeak.speak(text, config);
        if (audioData) {
          const audio = new Audio('data:audio/wav;base64,' + btoa(String.fromCharCode.apply(null, audioData)));
          audio.onended = () => {
            if (winCard) winCard.classList.remove('is-talking');
            if (profile && winPortrait) winPortrait.src = encodeURI(profile.icon);
          };
          audio.onerror = () => {
            if (winCard) winCard.classList.remove('is-talking');
            if (profile && winPortrait) winPortrait.src = encodeURI(profile.icon);
          };
          audio.play();
          return;
        }
      } catch (e) {
        console.log('SCARLET meSpeak win error:', e);
      }
    }
    
    // Try ResponsiveVoice for Scarlet
    if (isScarlet && window.responsiveVoice) {
      try {
        const token = ++winSpeechToken;
        const rate = profile?.rate || 1;
        const pitch = profile?.pitch || 1;
        
        if (winCard) winCard.classList.add('is-talking');
        if (profile && winPortrait) winPortrait.src = encodeURI(profile.happy);
        
        window.responsiveVoice.speak(text, 'UK English Female', {
          rate: rate,
          pitch: pitch,
          volume: 1,
          onstart: () => {
            if (token !== winSpeechToken || !winCard) return;
            winCard.classList.add('is-talking');
            if (profile && winPortrait) winPortrait.src = encodeURI(profile.happy);
          },
          onend: () => {
            if (token !== winSpeechToken || !winCard) return;
            winCard.classList.remove('is-talking');
            if (profile && winPortrait) winPortrait.src = encodeURI(profile.icon);
          },
          onerror: () => {
            if (token !== winSpeechToken || !winCard) return;
            winCard.classList.remove('is-talking');
            if (profile && winPortrait) winPortrait.src = encodeURI(profile.icon);
          }
        });
      } catch (e) {}
      return;
    }
    
    // Use native speechSynthesis for other mentors
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    try {
      const token = ++winSpeechToken;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (profile) {
        u.rate  = profile.rate  || 1;
        u.pitch = profile.pitch || 1;
        if (window.getMentorVoiceForProfile) u.voice = window.getMentorVoiceForProfile(profile);
      }
      u.volume = 1;
      u.onstart = () => {
        if (token !== winSpeechToken || !winCard) return;
        winCard.classList.add('is-talking');
        /* swap to happy while talking */
        if (profile && winPortrait) winPortrait.src = encodeURI(profile.happy);
      };
      u.onend = u.onerror = () => {
        if (token !== winSpeechToken || !winCard) return;
        winCard.classList.remove('is-talking');
        /* back to icon when done */
        if (profile && winPortrait) winPortrait.src = encodeURI(profile.icon);
      };
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  window.showMentorWin = showWinCard;

  /* ── Spotlight (unchanged, kept for game.js compatibility) ── */
  function stopInstructionSpotlight(skipVoice) {
    if (spotlightTarget) spotlightTarget.classList.remove('mentor-highlight');
    spotlightTarget = null;
    if (skipVoice && window.speechSynthesis) {
      mentorSpeechToken += 1;
      window.speechSynthesis.cancel();
      if (window.setMentorTalking) window.setMentorTalking(false);
    }
    if (spotlightOverlay) spotlightOverlay.remove();
    if (spotlightCard)    spotlightCard.remove();
    if (spotlightArrow)   spotlightArrow.remove();
    spotlightOverlay = spotlightCard = spotlightArrow = spotlightText = spotlightSkipBtn = spotlightCloseBtn = null;
  }

  window.showInstructionSpotlight = function(text, selector) {
    stopInstructionSpotlight();
    const target = document.querySelector(selector || '#instructions-panel');
    if (!target) return;
    target.classList.add('mentor-highlight');
    spotlightTarget = target;
    speak(text);
  };

  window.stopInstructionSpotlight = stopInstructionSpotlight;

  window.flashTutorialFocus = function(selector) {
    if (document.getElementById('mentor-tour-overlay')) return;
    const target = document.querySelector(selector);
    if (!target) return;
    target.classList.add('mentor-highlight');
    setTimeout(() => target.classList.remove('mentor-highlight'), 1600);
  };
})();
