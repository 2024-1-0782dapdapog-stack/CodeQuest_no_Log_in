/**
 * CODEQUEST – GAME CONTROLLER v2
 * Draggable vertical + horizontal resizers
 * 50/50 default split, friendly UX
 */
(function() {

  /* ─────────────────────────────────────────
     ELEMENTS
     ───────────────────────────────────────── */
  const el = {
    splash:       document.getElementById('splash'),
    app:          document.getElementById('app'),
    startBtn:     document.getElementById('startBtn'),
    homeBtn:      document.getElementById('homeBtn'),
    musicToggleBtn: document.getElementById('musicToggleBtn'),
    ttsToggleBtn: document.getElementById('ttsToggleBtn'),

    progressFill: document.getElementById('progress-bar-fill'),
    levelNum:     document.getElementById('level-num'),
    xpText:       document.getElementById('xp-text'),

    chapterBadge:   document.getElementById('chapter-badge'),
    levelTitle:     document.getElementById('level-title'),
    instructions:   document.getElementById('instructions'),
    hintBtn:        document.getElementById('hintBtn'),
    hintText:       document.getElementById('hint-text'),
    editorFilename: document.getElementById('editor-filename'),
    codeInput:      document.getElementById('code-input'),
    feedback:       document.getElementById('feedback'),
    feedbackText:   document.getElementById('feedback-text'),
    feedbackMentor: document.getElementById('feedback-mentor'),
    prevBtn:        document.getElementById('prevBtn'),
    runBtn:         document.getElementById('runBtn'),
    nextBtn:        document.getElementById('nextBtn'),
    resetBtn:       document.getElementById('resetBtn'),
    levelMapToggle: document.getElementById('level-map-toggle'),
    levelMapArrow:  document.getElementById('level-map-arrow'),
    levelMap:       document.getElementById('level-map'),
    levelDots:      document.getElementById('level-dots'),

    previewFrame: document.getElementById('preview-frame'),
    previewTabs:  document.querySelectorAll('.tab-btn'),
    htmlView:     document.getElementById('html-view'),
    cssView:      document.getElementById('css-view'),
    jsView:       document.getElementById('js-view'),

    winModal:    document.getElementById('win-modal'),
    winTitle:    document.getElementById('win-title'),
    winMessage:  document.getElementById('win-message'),
    winXpNum:    document.getElementById('win-xp-num'),
    winEmoji:    document.getElementById('win-emoji'),
    winMentor:   document.getElementById('win-mentor'),
    winNext:     document.getElementById('win-next'),
    finalModal:  document.getElementById('final-modal'),
    finalMentor: document.getElementById('final-mentor'),
    finalRestart:document.getElementById('final-restart'),

    leftPanel:    document.getElementById('left-panel'),
    vResizer:     document.getElementById('v-resizer'),
    hResizer:     document.getElementById('h-resizer'),
    instrPanel:   document.getElementById('instructions-panel'),
    layout:       document.getElementById('layout'),
  };

  /* ─────────────────────────────────────────
     GAME STATE
     ───────────────────────────────────────── */
  let currentLevel = 0;
  let totalXP = 0;
  let hintShown = false;
  let attemptCount = 0;
  const LEVEL_SPOTLIGHT_STORAGE_KEY = 'codequest_instruction_spotlights_seen';
  let seenInstructionSpotlights = new Set();

  try {
    const rawSeen = localStorage.getItem(LEVEL_SPOTLIGHT_STORAGE_KEY);
    if (rawSeen) {
      JSON.parse(rawSeen).forEach((levelId) => seenInstructionSpotlights.add(levelId));
    }
  } catch (e) {}

  function getPlainTextFromHtml(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html || '';
    return (temp.textContent || temp.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function getLineCount(text) {
    return (text || '').split('\n').length;
  }

  function lineSummary(code, needle) {
    const lines = (code || '').split('\n');
    const normalizedNeedle = needle.toLowerCase();
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(normalizedNeedle)) return i + 1;
    }
    return null;
  }

  function formatLineTip(lineNumber, text) {
    return lineNumber ? 'Line ' + lineNumber + ': ' + text : text;
  }

  function markInstructionSpotlightSeen(levelId) {
    if (!seenInstructionSpotlights.has(levelId)) {
      seenInstructionSpotlights.add(levelId);
      try {
        localStorage.setItem(LEVEL_SPOTLIGHT_STORAGE_KEY, JSON.stringify(Array.from(seenInstructionSpotlights)));
      } catch (e) {}
    }
  }

  function buildLevelMentorSpeech(level) {
    const chapterGuides = {
      HTML: 'Use HTML tags to structure content. Common tools are headings, paragraphs, images, links, and attributes like class, id, src, and alt.',
      CSS: 'Use CSS selectors and properties to style the page. You will often use color, margin, padding, font size, display, and alignment rules.',
      JS: 'Use JavaScript to add behavior. You will usually work with variables, functions, events, and DOM methods like querySelector and addEventListener.'
    };

    const taskText = getPlainTextFromHtml(level.instructions).slice(0, 220);
    return [
      'Level ' + level.id + '. ' + level.title + '.',
      taskText,
      chapterGuides[level.chapter] || 'Follow the instruction and test your code with the Run button.'
    ].join(' ');
  }

  function speakMentor(text) {
    if (!window.speakMentorText) return;
    if (document.getElementById('mentor-tour-overlay')) return;
    window.speakMentorText(text);
  }

  function buildSmartDebugTip(level, code) {
    const task = getPlainTextFromHtml(level.instructions).toLowerCase();
    const src = (code || '').trim();

    if (level.chapter === 'HTML') {
      if (!/[<>]/.test(src)) return formatLineTip(1, 'Use real HTML tags like <h1>, <p>, <img>, or <a> instead of plain text.');
      if ((src.match(/</g) || []).length !== (src.match(/>/g) || []).length) {
        return formatLineTip(Math.max(1, getLineCount(src)), 'Check your angle brackets. A tag might be incomplete.');
      }
      const targets = ['h1', 'p', 'img', 'a', 'ul', 'li'];
      for (const t of targets) {
        if (task.includes('<' + t) && !new RegExp('<\\s*' + t + '\\b', 'i').test(src)) {
          const line = lineSummary(src, '<' + t) || 1;
          return formatLineTip(line, 'This level likely needs a <' + t + '> element. Add it and run again.');
        }
      }
      return formatLineTip(1, 'Check spelling of tag names and required attributes like src, alt, href, class, or id.');
    }

    if (level.chapter === 'CSS') {
      if (!/[{}]/.test(src)) return formatLineTip(1, 'CSS needs selector blocks like h1 { color: red; }.');
      if ((src.match(/{/g) || []).length !== (src.match(/}/g) || []).length) return formatLineTip(getLineCount(src), 'You may have an unmatched { or } in your CSS.');
      if (/\{[^}]*[a-z-]+\s+[^:;]+;/.test(src)) return formatLineTip(lineSummary(src, '{') || 1, 'A CSS property is missing a colon. Use property: value;');
      if (task.includes('color') && !/\bcolor\s*:/.test(src)) return formatLineTip(lineSummary(src, '{') || 1, 'Try adding a color property, since the task seems to require it.');
      if (task.includes('background') && !/\bbackground(-color)?\s*:/.test(src)) return formatLineTip(lineSummary(src, '{') || 1, 'Try adding a background or background-color rule.');
      return formatLineTip(1, 'Check selector names and property syntax: selector { property: value; }.');
    }

    try {
      new Function(src);
    } catch (err) {
      const lineMatch = err.message.match(/line (\d+)/i);
      const lineNumber = lineMatch ? Number(lineMatch[1]) : null;
      return formatLineTip(lineNumber || 1, 'JavaScript syntax issue: ' + err.message);
    }
    if (/console\.log/.test(task) && !/console\.log\s*\(/.test(src)) return 'This task likely expects console.log(...).';
    if (task.includes('function') && !/function\s+\w+\s*\(|=>/.test(src)) return 'This level may require creating a function.';
    if (/queryselector|addEventlistener/.test(task) && !/querySelector|addEventListener/.test(src)) {
      return 'Try using DOM methods like querySelector(...) or addEventListener(...).';
    }
    return 'Your logic is close. Re-check variable names, punctuation, and required output from the instructions.';
  }

  /* ─────────────────────────────────────────
     DRAGGABLE RESIZERS
     ───────────────────────────────────────── */

  /* Vertical resizer – changes left panel width */
  (function initVResizer() {
    let dragging = false;
    let startX, startW;

    el.vResizer.addEventListener('mousedown', (e) => {
      dragging = true;
      startX = e.clientX;
      startW = el.leftPanel.getBoundingClientRect().width;
      document.body.classList.add('dragging-v');
      el.vResizer.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const layoutW = el.layout.getBoundingClientRect().width;
      const newW = startW + (e.clientX - startX);
      const minW = 280;
      const maxW = layoutW * 0.75;
      const clampedW = Math.max(minW, Math.min(newW, maxW));
      const pct = (clampedW / layoutW) * 100;
      el.leftPanel.style.width = pct + '%';
      document.documentElement.style.setProperty('--left-w', pct + '%');
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('dragging-v');
      el.vResizer.classList.remove('dragging');
    });

    // Touch support
    el.vResizer.addEventListener('touchstart', (e) => {
      dragging = true;
      startX = e.touches[0].clientX;
      startW = el.leftPanel.getBoundingClientRect().width;
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const layoutW = el.layout.getBoundingClientRect().width;
      const newW = startW + (e.touches[0].clientX - startX);
      const clampedW = Math.max(280, Math.min(newW, layoutW * 0.75));
      el.leftPanel.style.width = (clampedW / layoutW * 100) + '%';
    }, { passive: true });

    document.addEventListener('touchend', () => { dragging = false; });
  })();

  /* Horizontal resizer – changes instructions vs editor split */
  (function initHResizer() {
    let dragging = false;
    let startY, startH;

    el.hResizer.addEventListener('mousedown', (e) => {
      dragging = true;
      startY = e.clientY;
      startH = el.instrPanel.getBoundingClientRect().height;
      document.body.classList.add('dragging-h');
      el.hResizer.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const panelH = el.leftPanel.getBoundingClientRect().height;
      const newH = startH + (e.clientY - startY);
      const minH = 100;
      const maxH = panelH - 200;
      const clampedH = Math.max(minH, Math.min(newH, maxH));
      const pct = (clampedH / panelH) * 100;
      el.instrPanel.style.height = pct + '%';
      document.documentElement.style.setProperty('--top-h', pct + '%');
    });

    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove('dragging-h');
      el.hResizer.classList.remove('dragging');
    });

    el.hResizer.addEventListener('touchstart', (e) => {
      dragging = true;
      startY = e.touches[0].clientY;
      startH = el.instrPanel.getBoundingClientRect().height;
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const panelH = el.leftPanel.getBoundingClientRect().height;
      const newH = startH + (e.touches[0].clientY - startY);
      const clampedH = Math.max(100, Math.min(newH, panelH - 200));
      el.instrPanel.style.height = (clampedH / panelH * 100) + '%';
    }, { passive: true });

    document.addEventListener('touchend', () => { dragging = false; });
  })();

  /* ─────────────────────────────────────────
     PROGRESS PERSISTENCE
     ───────────────────────────────────────── */
  function saveProgress() {
    try {
      localStorage.setItem('codequest_v2', JSON.stringify({
        currentLevel, totalXP,
        completedLevels: STATE.completedLevels,
        userName: STATE.userName,
        html: STATE.html, css: STATE.css, js: STATE.js
      }));
    } catch(e) {}
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem('codequest_v2');
      if (!raw) return;
      const d = JSON.parse(raw);
      currentLevel = Math.min(d.currentLevel || 0, LEVELS.length - 1);
      totalXP = d.totalXP || 0;
      STATE.completedLevels = d.completedLevels || [];
      if (d.userName) STATE.userName = d.userName;
      if (d.html) STATE.html = d.html;
      if (d.css)  STATE.css  = d.css;
      if (d.js)   STATE.js   = d.js;
    } catch(e) {}
  }

  /* ─────────────────────────────────────────
     TASK 2: SPEAK BUTTON – Scarlet TTS
     NEW: Injects a speak button into the instructions panel
     ───────────────────────────────────────── */
  function injectSpeakButton(level) {
    // Remove any existing speak row
    const existing = document.getElementById('speak-btn-row');
    if (existing) existing.remove();

    const row = document.createElement('div');
    row.id = 'speak-btn-row';

    const btn = document.createElement('button');
    btn.className = 'btn-speak';
    btn.type = 'button';
    btn.innerHTML = '📖 Read Instructions';
    btn.title = 'Have your mentor read the instructions aloud';

    btn.addEventListener('click', () => {
      const speechText = buildLevelMentorSpeech(level);
      if (window.speakMentorText) {
        btn.classList.add('speaking');
        btn.textContent = '📖 Reading…';
        window.speakMentorText(speechText);
        // Reset button after estimated speech duration (rough: ~120 wpm)
        const words = speechText.split(' ').length;
        const ms = Math.max(2000, (words / 2) * 1000);
        setTimeout(() => {
          btn.classList.remove('speaking');
          btn.innerHTML = '📖 Read Instructions';
        }, ms);
      } else {
        // TASK 2 FALLBACK: direct SpeechSynthesis using best female voice
        speakFallback(speechText);
      }
    });

    row.appendChild(btn);

    // Insert just above the hint area
    const hintArea = document.getElementById('hint-area');
    if (hintArea) {
      hintArea.parentNode.insertBefore(row, hintArea);
    } else {
      el.instructions.parentNode.appendChild(row);
    }
  }

  /* NEW TASK 2: Fallback direct TTS using best available female voice */
  function speakFallback(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      // Prefer a female-sounding voice
      const FEMALE_NAMES = ['female', 'woman', 'zira', 'samantha', 'aria', 'jenny', 'victoria', 'fiona', 'amy', 'emma', 'olivia', 'joanna', 'kendra', 'kimberly'];
      utterance.voice = voices.find(v =>
        FEMALE_NAMES.some(n => v.name.toLowerCase().includes(n))
      ) || voices[0] || null;
      utterance.rate = 0.96;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('speakFallback error:', e);
    }
  }

  /* ─────────────────────────────────────────
     RENDER LEVEL
     ───────────────────────────────────────── */
  function renderLevel(idx) {
    const level = LEVELS[idx];
    hintShown = false;
    attemptCount = 0;

    // Chapter badge
    const badgeMap = { HTML: 'badge-html', CSS: 'badge-css', JS: 'badge-js' };
    el.chapterBadge.className = badgeMap[level.chapter];
    el.chapterBadge.textContent = level.chapter + ' · Level ' + level.id;
    
    const userName = STATE.userName || 'Your Name';
    el.levelTitle.textContent = level.title.replace(/Your Name/g, userName);
    el.instructions.innerHTML = level.instructions.replace(/Your Name/g, userName);
    el.editorFilename.textContent = level.filename;

    // NEW TASK 2: Inject Speak button below instructions
    injectSpeakButton(level);

    // Run button chapter color
    el.runBtn.className = 'btn-run btn-' + level.chapter.toLowerCase();

    // Hint reset — hints.js manages button label and copy button
    el.hintText.classList.add('hidden');
    el.hintText.textContent = (level.hint || '').replace(/Your Name/g, userName);
    if (window.CQ_HINTS && window.CQ_HINTS.resetHintUI) {
      window.CQ_HINTS.resetHintUI();
    }

    // Editor
    let starter = (level.starterCode || '').replace(/Your Name/g, userName);
    // If we're building on the same file, use the actual progress from previous levels
    if (idx > 0) {
      const prev = LEVELS[idx - 1];
      if (prev.filename === level.filename && STATE.completedLevels.includes(prev.id)) {
        // Use the accumulated state for this chapter instead of hardcoded starter
        // (Level 7 is an exception as it requires a fresh start for the full HTML shell)
        if (level.id !== 7) {
          if (level.chapter === 'HTML') starter = STATE.html;
          if (level.chapter === 'CSS')  starter = STATE.css;
          if (level.chapter === 'JS')   starter = STATE.js;

          // Keep any helpful guiding comments from the original starter code
          const comment = (level.starterCode || '').match(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/.*$/m);
          if (comment && !starter.includes(comment[0])) {
            starter = starter.trim() + '\n\n' + comment[0];
          }
        }
      }
    }
    el.codeInput.value = starter;
    if (window.editorUpdateLineNumbers) window.editorUpdateLineNumbers();

    // Feedback reset
    setFeedback('', 'neutral');
    if (window.setMentorMood) window.setMentorMood('idle');

    // Nav
    el.prevBtn.disabled = idx === 0;
    el.nextBtn.disabled = !STATE.completedLevels.includes(level.id);

    // Topbar
    el.levelNum.textContent = level.id;
    updateProgressBar();
    updateXP();
    renderLevelDots();
    renderPreview();
    
    // DISABLED: Always read instructions via TTS - this was causing freezes
    // if (window.showInstructionSpotlight) {
    //   window.showInstructionSpotlight(buildLevelMentorSpeech(level), '#instructions-panel');
    // } else if (window.flashTutorialFocus) {
    //   window.flashTutorialFocus('#instructions-panel');
    // }

    // Scroll instructions to top
    const scroll = document.getElementById('instructions-scroll');
    if (scroll) scroll.scrollTop = 0;

    // Glow level pill
    if (el.levelNum) {
      const pill = document.getElementById('level-pill');
      if (pill) {
        pill.classList.remove('glow');
        void pill.offsetWidth;
        pill.classList.add('glow');
        setTimeout(() => pill.classList.remove('glow'), 700);
      }
    }

    // Focus editor
    setTimeout(() => el.codeInput.focus(), 50);
  }

  /* ─────────────────────────────────────────
     PREVIEW BUILDER
     ───────────────────────────────────────── */
  function buildDoc(extraCss, extraJs) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My Portfolio</title>
<style>
*,*::before,*::after{box-sizing:border-box}
body{font-family:system-ui,sans-serif;margin:0;padding:0}
${STATE.css}
${extraCss || ''}
</style>
</head>
<body>
${STATE.html}
<script>
try{
${STATE.js}
${extraJs || ''}
}catch(err){
  const d=document.createElement('div');
  d.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#dc2626;color:#fff;font-family:monospace;padding:10px 16px;font-size:13px;z-index:9999';
  d.textContent='⚠ JS Error: '+err.message;
  document.body.appendChild(d);
}
<\/script>
</body>
</html>`;
  }

  function renderPreview(overrideCode) {
    const level = LEVELS[currentLevel];
    const code = overrideCode !== undefined ? overrideCode : el.codeInput.value;
    let doc;

    if (level.chapter === 'HTML') {
      // Wrap bare HTML in a minimal shell if it looks like a full doc, else wrap it
      if (/<!doctype/i.test(code) || /<html/i.test(code)) {
        doc = code;
      } else {
        doc = `<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0d1117;color:#e6edf3;line-height:1.75;min-height:100vh}
h1{font-size:2.4rem;font-weight:800;background:linear-gradient(135deg,#58a6ff,#bc8cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:6px}
h2{font-size:1.25rem;font-weight:600;color:#58a6ff;margin:20px 0 10px;padding-bottom:6px;border-bottom:1px solid #21262d}
h3{font-size:1rem;color:#e6edf3;margin-bottom:6px}
p{color:#8b949e;line-height:1.75;margin-bottom:12px}
a{color:#58a6ff;text-decoration:none}
a:hover{text-decoration:underline}
img{border-radius:50%;border:3px solid #58a6ff;box-shadow:0 0 18px rgba(88,166,255,0.35);display:block}
ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
li{background:rgba(88,166,255,0.1);color:#58a6ff;border:1px solid rgba(88,166,255,0.3);border-radius:20px;padding:4px 14px;font-size:0.82rem;font-weight:600}
nav{display:flex;gap:8px;margin-top:10px}
nav a{color:#8b949e;padding:6px 14px;border-radius:8px;border:1px solid transparent;font-size:0.85rem;transition:all 0.2s}
nav a:hover{color:#58a6ff;border-color:#58a6ff;background:rgba(88,166,255,0.08);text-decoration:none}
header{display:flex;align-items:center;gap:20px;padding:24px 5%;background:#161b22;border-bottom:1px solid #21262d;flex-wrap:wrap}
header div{flex:1}
main{max-width:860px;margin:0 auto;padding:40px 5%;display:flex;flex-direction:column;gap:32px}
section{background:#161b22;border:1px solid #21262d;border-radius:12px;padding:28px}
footer{background:#0d1117;border-top:1px solid #21262d;text-align:center;padding:28px;color:#484f58;font-size:0.85rem;margin-top:40px}
.project-card{background:#161b22;border:1px solid #21262d;border-radius:12px;padding:22px;transition:all 0.22s ease;cursor:pointer}
.project-card:hover{border-color:#58a6ff;transform:translateY(-3px);box-shadow:0 8px 24px rgba(88,166,255,0.14)}
.projects-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:14px}
#contact a{display:inline-block;margin-top:14px;padding:10px 24px;background:linear-gradient(135deg,#58a6ff,#bc8cff);color:#fff;border-radius:9px;font-weight:700;font-size:0.9rem;transition:all 0.22s;box-shadow:0 4px 16px rgba(88,166,255,0.28)}
#contact a:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(88,166,255,0.45);text-decoration:none}
</style>
</head><body>${code || '<p style="color:#484f58;padding:24px">Start typing HTML…</p>'}</body></html>`;
      }
    } else if (level.chapter === 'CSS') {
      doc = buildDoc(code, '');
    } else {
      doc = buildDoc('', code);
    }

    const blob = new Blob([doc], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    el.previewFrame.src = url;
    setTimeout(() => URL.revokeObjectURL(url), 4000);

    // Update code tabs
    el.htmlView.textContent = STATE.html;
    el.cssView.textContent  = STATE.css  + (level.chapter === 'CSS'  ? '\n\n/* ── Current ── */\n' + code : '');
    el.jsView.textContent   = STATE.js   + (level.chapter === 'JS'   ? '\n\n// ── Current ──\n' + code : '');
  }

  /* ─────────────────────────────────────────
     CHECK ANSWER
     ───────────────────────────────────────── */
  function checkAnswer() {
    const level = LEVELS[currentLevel];
    const code = el.codeInput.value.trim();

    if (!code) {
      setFeedback('✗ Nothing written yet! Check the task and write some code.', 'wrong');
      speakMentor('Try writing a first line of code. Start with the main element or rule requested in this level.');
      return;
    }

    attemptCount += 1;
    const pass = level.checkFn(code, STATE);

    if (pass) {
      // Persist code into shared state
      if (level.chapter === 'HTML') {
        STATE.html = code;
        // Extraction of user name from level 1 h1
        if (level.id === 1) {
          const match = code.match(/<h1[^>]*>([^<]+)<\/h1>/i);
          if (match && match[1]) {
            STATE.userName = match[1].trim();
          }
        }
      } else if (level.chapter === 'CSS') {
        STATE.css = (STATE.css + '\n' + code).trim();
      } else {
        STATE.js = (STATE.js + '\n' + code).trim();
      }

      if (!STATE.completedLevels.includes(level.id)) {
        STATE.completedLevels.push(level.id);
        totalXP += level.xp;
      }

      el.nextBtn.disabled = false;
      renderPreview(code);
      saveProgress();
      updateXP(true);
      if (window.setMentorMood) window.setMentorMood('happy');
      speakMentor('Great job. You passed level ' + level.id + '. ' + level.successMessage);
      showWinModal(level);

    } else {
      const tip = buildSmartDebugTip(level, code);
      setFeedback('✗ Not quite. Tip: ' + tip, 'wrong');
      if (window.setMentorMood) window.setMentorMood('sad');
      if (attemptCount >= 2 && level.hint) {
        speakMentor('Not quite yet. Tip: ' + tip + ' Extra hint: ' + level.hint);
      } else {
        speakMentor('Not quite yet. Tip: ' + tip);
      }
      const w = document.getElementById('editor-wrap');
      w.classList.remove('shake');
      void w.offsetWidth;
      w.classList.add('shake');
      setTimeout(() => w.classList.remove('shake'), 350);
    }
  }

  /* ─────────────────────────────────────────
     FEEDBACK
     ───────────────────────────────────────── */
  function setFeedback(msg, type) {
    /* clear old inline bar */
    if (el.feedback) el.feedback.className = 'feedback-dialogue fb-neutral';
    if (el.feedbackText) el.feedbackText.textContent = '';
    if (el.feedbackMentor) el.feedbackMentor.classList.add('hidden');

    if (type === 'wrong') {
      playErrorSound();
      if (window.showMentorFeedback) window.showMentorFeedback(msg);
    } else if (type === 'correct') {
      if (window.hideMentorFeedback) window.hideMentorFeedback();
    }
  }

  /* ─────────────────────────────────────────
     WIN MODAL
     ───────────────────────────────────────── */
  function showWinModal(level) {
    playSuccessSound();
    playConfetti();

    if (currentLevel === LEVELS.length - 1) {
      /* Final level – use existing final modal */
      const mentorProfile = window.getSelectedMentorProfile ? window.getSelectedMentorProfile() : null;
      if (mentorProfile && el.finalMentor) {
        el.finalMentor.src = mentorProfile.happy || mentorProfile.icon;
        el.finalMentor.alt = mentorProfile.label + ' final celebration portrait';
      }
      el.finalModal.classList.remove('hidden');
      // UPDATED: lock background interaction while modal is open
      document.body.classList.add('modal-open');
      if (window.CQ_CERTS && typeof window.CQ_CERTS.showDownloads === 'function') {
        setTimeout(function () {
          window.CQ_CERTS.showDownloads();
        }, 50);
      }
      return;
    }

    const emojis = { HTML: '🏗️', CSS: '🎨', JS: '⚡' };

    if (window.showMentorWin) {
      window.showMentorWin({
        emoji:   emojis[level.chapter] || '🎉',
        title:   'Level ' + level.id + ' Complete!',
        message: level.successMessage,
        xp:      level.xp,
        onContinue: function() {
          goToLevel(currentLevel + 1);
        }
      });
      return;
    }

    /* fallback to old modal */
    const mentorProfile = window.getSelectedMentorProfile ? window.getSelectedMentorProfile() : null;
    if (mentorProfile && el.winMentor) {
      el.winMentor.src = mentorProfile.happy || mentorProfile.icon;
      el.winMentor.alt = mentorProfile.label + ' celebration portrait';
    }
    el.winEmoji.textContent   = emojis[level.chapter] || '🎉';
    el.winTitle.textContent   = 'Level ' + level.id + ' Complete!';
    el.winMessage.textContent = level.successMessage;
    el.winXpNum.textContent   = level.xp;
    el.winModal.classList.remove('hidden');
    // UPDATED: lock background interaction while modal is open
    document.body.classList.add('modal-open');
  }

  /* ─────────────────────────────────────────
     PROGRESS BAR & XP
     ───────────────────────────────────────── */
  function updateProgressBar() {
    const pct = (currentLevel / (LEVELS.length - 1)) * 100;
    el.progressFill.style.width = pct + '%';
  }

  function updateXP(flash) {
    el.xpText.textContent = totalXP + ' XP';
    if (flash && el.xpText) {
      const badge = document.getElementById('xp-badge');
      if (badge) {
        badge.classList.remove('pop');
        void badge.offsetWidth;
        badge.classList.add('pop');
        setTimeout(() => badge.classList.remove('pop'), 600);
      }
    }
  }

  /* ─────────────────────────────────────────
     LEVEL MAP
     ───────────────────────────────────────── */
  function renderLevelDots() {
    el.levelDots.innerHTML = '';
    LEVELS.forEach((level, idx) => {
      const dot = document.createElement('div');
      const typeClass = { HTML: 'html-dot', CSS: 'css-dot', JS: 'js-dot' }[level.chapter];
      dot.className = 'level-dot ' + typeClass;
      dot.textContent = level.id;
      dot.title = level.id + ': ' + level.title;

      if (STATE.completedLevels.includes(level.id)) dot.classList.add('done');
      if (idx === currentLevel) dot.classList.add('current');

      const canJump = STATE.completedLevels.includes(level.id) || idx <= currentLevel;
      if (canJump) {
        dot.addEventListener('click', () => goToLevel(idx));
      } else {
        dot.style.opacity = '0.4';
        dot.style.cursor = 'not-allowed';
      }
      el.levelDots.appendChild(dot);
    });
  }

  /* ─────────────────────────────────────────
     NAVIGATION
     ───────────────────────────────────────── */
  function goToLevel(idx) {
    currentLevel = Math.max(0, Math.min(idx, LEVELS.length - 1));
    renderLevel(currentLevel);
    saveProgress();
  }

  /* ─────────────────────────────────────────
     FULL RESET
     ───────────────────────────────────────── */
  function fullReset() {
    currentLevel = 0;
    totalXP = 0;
    STATE.completedLevels = [];
    STATE.css  = `/* Beautiful dark portfolio base — this is your canvas! */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0d1117;color:#e6edf3;line-height:1.75}
h1{font-size:2.4rem;font-weight:800;background:linear-gradient(135deg,#58a6ff,#bc8cff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:6px}
h2{color:#58a6ff;border-bottom:1px solid #21262d;padding-bottom:6px;margin:20px 0 10px}
p{color:#8b949e;line-height:1.75;margin-bottom:12px}
a{color:#58a6ff;text-decoration:none}
img{border-radius:50%;border:3px solid #58a6ff;box-shadow:0 0 18px rgba(88,166,255,0.35)}
ul{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
li{background:rgba(88,166,255,0.1);color:#58a6ff;border:1px solid rgba(88,166,255,0.3);border-radius:20px;padding:4px 14px;font-size:0.82rem;font-weight:600}
nav{display:flex;gap:8px;margin-top:10px}
nav a{color:#8b949e;padding:6px 14px;border-radius:8px;border:1px solid transparent;font-size:0.85rem;transition:all 0.2s}
nav a:hover{color:#58a6ff;border-color:#58a6ff;background:rgba(88,166,255,0.08)}
header{display:flex;align-items:center;gap:20px;padding:24px 5%;background:#161b22;border-bottom:1px solid #21262d;flex-wrap:wrap}
header div{flex:1}
main{max-width:860px;margin:0 auto;padding:40px 5%;display:flex;flex-direction:column;gap:32px}
section{background:#161b22;border:1px solid #21262d;border-radius:12px;padding:28px}
footer{background:#0d1117;border-top:1px solid #21262d;text-align:center;padding:28px;color:#484f58;font-size:0.85rem;margin-top:40px}
.project-card{background:#161b22;border:1px solid #21262d;border-radius:12px;padding:22px;transition:all 0.22s ease;cursor:pointer}
.project-card:hover{border-color:#58a6ff;transform:translateY(-3px);box-shadow:0 8px 24px rgba(88,166,255,0.14)}
.projects-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:14px}
#contact a{display:inline-block;margin-top:14px;padding:10px 24px;background:linear-gradient(135deg,#58a6ff,#bc8cff);color:#fff;border-radius:9px;font-weight:700;font-size:0.9rem;transition:all 0.22s;box-shadow:0 4px 16px rgba(88,166,255,0.28)}
#contact a:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(88,166,255,0.45)}`;
    STATE.js   = 'console.log("Portfolio loading...");';
    STATE.html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Portfolio</title>
</head>
<body>
  <header>
    <img src="https://i.pravatar.cc/200" alt="Profile photo" style="width:70px;height:70px">
    <div>
      <h1>Your Name</h1>
      <h2 style="border:none;padding:0;margin:2px 0 0;font-size:1rem;font-weight:400;color:#8b949e">Web Developer</h2>
      <nav>
        <a href="#skills">Skills</a>
        <a href="#projects">Projects</a>
        <a href="#contact">Contact</a>
      </nav>
    </div>
  </header>
  <main>
    <section id="about">
      <h2>About Me</h2>
      <p>I love building websites and turning ideas into reality with code.</p>
    </section>
    <section id="skills">
      <h2>My Skills</h2>
      <ul>
        <li>HTML</li><li>CSS</li><li>JavaScript</li>
      </ul>
    </section>
    <section id="projects">
      <h2>Projects</h2>
      <div class="projects-grid">
        <div class="project-card"><h3>Portfolio Website</h3><p>A personal portfolio built from scratch.</p></div>
        <div class="project-card"><h3>Weather App</h3><p>Live weather with a clean UI.</p></div>
      </div>
    </section>
    <section id="contact">
      <h2>Get In Touch</h2>
      <p>Open to work and new opportunities.</p>
      <a href="mailto:you@example.com">✉ you@example.com</a>
    </section>
  </main>
  <footer><p>© 2024 Your Name · Built with code & coffee ☕</p></footer>
</body>
</html>`;
    localStorage.removeItem('codequest_v2');
  }

  /* ─────────────────────────────────────────
     EVENT BINDINGS
     ───────────────────────────────────────── */

  function beginGame() {
    try {
      console.log('[Game] beginGame() called');
      
      // Force remove modal-open class if it exists
      document.body.classList.remove('modal-open');
      document.body.classList.add('cq-game-mode');
      
      // Set mentor mood
      if (window.setMentorMood) {
        try {
          window.setMentorMood('idle');
        } catch (e) {}
      }
      
      // Hide hero
      const hero = document.getElementById('cq-hero');
      if (hero) hero.style.display = 'none';

      // SIMPLE: just show the app immediately
      console.log('[Game] Making app visible');
      if (el.app) {
        el.app.classList.remove('hidden');
        el.app.style.display = 'flex';
        el.app.style.opacity = '1';
        el.app.style.visibility = 'visible';
        el.app.style.pointerEvents = 'auto';
        el.app.style.zIndex = '100';
      }
      
      // Hide splash if it exists
      if (el.splash) {
        el.splash.classList.add('hidden');
        el.splash.style.display = 'none';
        el.splash.style.opacity = '0';
        el.splash.style.pointerEvents = 'none';
      }
      
      // Render the level (with timeout to prevent blocking)
      console.log('[Game] Rendering level');
      setTimeout(() => {
        try {
          renderLevel(currentLevel);
          console.log('[Game] Level rendered successfully');
        } catch (e) {
          console.error('[Game] renderLevel error:', e);
        }
      }, 10);
      
      // Start music (non-blocking)
      if (window.initYouTubeMusic) {
        try {
          window.initYouTubeMusic();
        } catch (e) {
          console.log('[Game] Music init error:', e.message);
        }
      }
      
      // Start tutorial (non-blocking, disabled for now since it causes freezes)
      if (window.startOnboardingTutorial) {
        setTimeout(() => {
          try {
            window.startOnboardingTutorial();
          } catch (e) {
            console.log('[Game] Tutorial error:', e.message);
          }
        }, 300);
      }
      
      console.log('[Game] Game started successfully');
    } catch (e) {
      console.error('[Game] Fatal error:', e);
      // Force the app visible no matter what
      if (el && el.app) {
        el.app.style.display = 'flex !important';
        el.app.style.opacity = '1 !important';
        el.app.style.visibility = 'visible !important';
      }
    }
  }

  window.startCodeQuestGame = beginGame;

  // Expose a small API so other modules (auth) can reload saved progress at runtime
  window.CQ_GAME = window.CQ_GAME || {};
  window.CQ_GAME.loadNow = function() {
    try {
      // reload progress from localStorage into game state
      loadProgress();
      // update XP badge if present
      try {
        var xpEl = document.getElementById('xp-text');
        if (xpEl) xpEl.textContent = (typeof totalXP !== 'undefined' ? String(totalXP) + ' XP' : xpEl.textContent);
      } catch (e) {}
      // re-render current level if app is visible
      try {
        renderLevel(currentLevel);
      } catch (e) {}
    } catch (e) {
      console.error('[Game] CQ_GAME.loadNow error:', e);
    }
  };

  // Splash start
  el.startBtn.addEventListener('click', () => {
    try {
      console.log('[Game] Start button clicked');
      if (window.openTtsVoicePicker) {
        console.log('[Game] Opening mentor picker');
        window.openTtsVoicePicker();
        return;
      }
      console.log('[Game] No mentor picker, starting game directly');
      beginGame();
    } catch (e) {
      console.error('[Game] Error in start button:', e);
      beginGame();
    }
  });

  // Home
  el.homeBtn.addEventListener('click', () => {
    el.app.classList.add('hidden');
    document.body.classList.remove('cq-game-mode');
    if (window.showHeroHome) {
      window.showHeroHome();
    } else {
      el.splash.classList.remove('hidden');
      el.splash.style.opacity = '1';
    }
    if (window.closeTtsVoicePicker) window.closeTtsVoicePicker();
    stopBackgroundMusic();
    if (window.stopOnboardingTutorial) window.stopOnboardingTutorial();
    if (window.setMentorMood) window.setMentorMood('idle');
    el.musicToggleBtn.textContent = '🎵';
    el.musicToggleBtn.title = 'Mute Music';
  });

  // Music toggle - Mute/Unmute Lo-Fi Girl
  el.musicToggleBtn.addEventListener('click', () => {
    const isMuted = toggleMusicMute();
    el.musicToggleBtn.textContent = isMuted ? '🔇' : '🎵';
    el.musicToggleBtn.title = isMuted ? 'Unmute Music' : 'Mute Music';
  });

  // TTS toggle - Mute/Unmute mentor voice
  el.ttsToggleBtn.addEventListener('click', () => {
    if (!window.toggleTtsMuted) return;
    const muted = window.toggleTtsMuted();
    el.ttsToggleBtn.classList.toggle('muted', !!muted);
    el.ttsToggleBtn.title = muted ? 'Unmute Mentor Voice' : 'Mute Mentor Voice';
    el.ttsToggleBtn.setAttribute('aria-label', muted ? 'Unmute Mentor Voice' : 'Mute Mentor Voice');
  });

  // Run code
  el.runBtn.addEventListener('click', () => {
    el.runBtn.classList.add('running');
    renderPreview();
    setTimeout(() => {
      checkAnswer();
      el.runBtn.classList.remove('running');
    }, 120);
  });

  // Prev / Next
  el.prevBtn.addEventListener('click', () => {
    if (currentLevel > 0) {
      playPreviousLevelSound();
      goToLevel(currentLevel - 1);
    }
  });
  el.nextBtn.addEventListener('click', () => {
    if (currentLevel < LEVELS.length - 1) {
      playNextLevelSound();
      goToLevel(currentLevel + 1);
    }
  });

  // Reset code
  el.resetBtn.addEventListener('click', () => {
    el.codeInput.value = LEVELS[currentLevel].starterCode || '';
    if (window.editorUpdateLineNumbers) window.editorUpdateLineNumbers();
    setFeedback('', 'neutral');
    renderPreview(el.codeInput.value);
    el.codeInput.focus();
  });

  // Hint — handled entirely by hints.js (point cost + copy button)

  // Level map toggle
  el.levelMapToggle.addEventListener('click', () => {
    const open = !el.levelMap.classList.contains('hidden');
    el.levelMap.classList.toggle('hidden', open);
    el.levelMapArrow.classList.toggle('open', !open);
  });

  // Preview tabs
  el.previewTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      el.previewTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      el.previewFrame.classList.toggle('hidden', tab !== 'preview');
      el.htmlView.classList.toggle('hidden', tab !== 'html');
      el.cssView.classList.toggle('hidden',  tab !== 'css');
      el.jsView.classList.toggle('hidden',   tab !== 'js');
    });
  });

  // Win → next level
  el.winNext.addEventListener('click', () => {
    el.winModal.classList.add('hidden');
    // UPDATED: restore interaction
    document.body.classList.remove('modal-open');
    goToLevel(currentLevel + 1);
  });
  // Click backdrop to close win modal
  el.winModal.addEventListener('click', (e) => {
    if (e.target === el.winModal) {
      el.winModal.classList.add('hidden');
      document.body.classList.remove('modal-open');
    }
  });

  // Final restart
  el.finalRestart.addEventListener('click', () => {
    el.finalModal.classList.add('hidden');
    // UPDATED: restore interaction
    document.body.classList.remove('modal-open');
    fullReset();
    renderLevel(0);
  });

  // Live preview while typing (debounced)
  let previewTimer;
  el.codeInput.addEventListener('input', () => {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => renderPreview(el.codeInput.value), 500);
  });

  /* ─────────────────────────────────────────
     INIT
     ───────────────────────────────────────── */
  if (window.getTtsMuted && el.ttsToggleBtn) {
    const muted = window.getTtsMuted();
    el.ttsToggleBtn.classList.toggle('muted', !!muted);
    el.ttsToggleBtn.title = muted ? 'Unmute Mentor Voice' : 'Mute Mentor Voice';
    el.ttsToggleBtn.setAttribute('aria-label', muted ? 'Unmute Mentor Voice' : 'Mute Mentor Voice');
  }
  initSmoothTransitions();
  loadProgress();

})();
