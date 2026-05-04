(function () {
  'use strict';

  var storage = window.CQ_STORAGE;

  function safeJsonParse(raw) {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function getStoredProgress() {
    if (window.CQ_STATE && window.CQ_STATE.data) return window.CQ_STATE.data;
    if (storage && storage.getJSON) {
      return storage.getJSON('codequest_v2', {}) || {};
    }
    return safeJsonParse(localStorage.getItem('codequest_v2')) || {};
  }

  function getUserName() {
    if (window.CQ_USER && window.CQ_USER.displayName) return window.CQ_USER.displayName;
    var progress = getStoredProgress();
    if (progress.displayName) return progress.displayName;
    if (progress.user && progress.user.displayName) return progress.user.displayName;
    return 'CodeQuest Graduate';
  }

  function downloadTextFile(filename, content, type) {
    try {
      var blob = new Blob([content], { type: type || 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 0);
    } catch (e) {
      console.error('[CERT] download error:', e);
    }
  }

  function buildCertificateHtml() {
    var name = getUserName();
    var date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    var certId = 'CQ-' + Date.now().toString(36).toUpperCase();

    var safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CodeQuest Certificate – ${safeName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Nunito:wght@400;600;700;800&family=Lato:ital,wght@0,300;0,400;1,300&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1a1f2e;
    font-family: 'Nunito', sans-serif;
    padding: 30px 20px;
  }

  .page {
    width: min(820px, 100%);
    background: #ffffff;
    position: relative;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
  }

  /* ── Outer gold border frame ── */
  .frame-outer {
    padding: 18px;
    background: linear-gradient(135deg, #c9a84c 0%, #f5e17a 30%, #c9a84c 50%, #f5e17a 70%, #b8922e 100%);
  }

  .frame-inner {
    padding: 16px;
    background: #1a2744;
  }

  .frame-content {
    padding: 44px 52px 40px;
    background: linear-gradient(160deg, #f8f9fc 0%, #eef1f8 50%, #f0f3fa 100%);
    position: relative;
    overflow: hidden;
  }

  /* ── Watermark ── */
  .frame-content::before {
    content: 'CQ';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Cinzel', serif;
    font-size: 22rem;
    font-weight: 700;
    color: rgba(26, 39, 68, 0.04);
    pointer-events: none;
    user-select: none;
    line-height: 1;
    letter-spacing: -0.05em;
  }

  /* ── Corner ornaments ── */
  .corner {
    position: absolute;
    width: 60px;
    height: 60px;
  }
  .corner svg { width: 100%; height: 100%; }
  .corner-tl { top: 20px; left: 20px; }
  .corner-tr { top: 20px; right: 20px; transform: scaleX(-1); }
  .corner-bl { bottom: 20px; left: 20px; transform: scaleY(-1); }
  .corner-br { bottom: 20px; right: 20px; transform: scale(-1); }

  /* ── Header strip ── */
  .cert-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 20px;
    position: relative;
    z-index: 1;
  }

  .cert-logo-text {
    font-family: 'Cinzel', serif;
    font-size: 1.55rem;
    font-weight: 700;
    color: #1a2744;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .cert-logo-text span {
    color: #c9a84c;
  }

  .divider-line {
    height: 2px;
    background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    margin: 0 0 22px;
    position: relative;
    z-index: 1;
  }

  /* ── Certificate of Completion heading ── */
  .cert-of-text {
    text-align: center;
    font-family: 'Lato', sans-serif;
    font-size: 0.78rem;
    font-weight: 300;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #4a5568;
    margin-bottom: 6px;
    position: relative;
    z-index: 1;
  }

  .cert-title {
    text-align: center;
    font-family: 'Cinzel', serif;
    font-size: 2.1rem;
    font-weight: 700;
    color: #1a2744;
    letter-spacing: 0.04em;
    margin-bottom: 22px;
    position: relative;
    z-index: 1;
  }

  /* ── Awarded to ── */
  .cert-awarded {
    text-align: center;
    font-family: 'Lato', sans-serif;
    font-size: 0.8rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #718096;
    margin-bottom: 8px;
    position: relative;
    z-index: 1;
  }

  /* ── Recipient name ── */
  .cert-name {
    text-align: center;
    font-family: 'Cinzel', serif;
    font-size: 2.6rem;
    font-weight: 600;
    color: #1a2744;
    letter-spacing: 0.02em;
    padding: 10px 0 12px;
    margin-bottom: 12px;
    border-bottom: 2px solid #c9a84c;
    border-top: 2px solid #c9a84c;
    position: relative;
    z-index: 1;
  }

  /* ── Body text ── */
  .cert-body {
    text-align: center;
    font-family: 'Lato', sans-serif;
    font-size: 0.92rem;
    font-weight: 400;
    color: #4a5568;
    line-height: 1.8;
    margin: 16px auto;
    max-width: 520px;
    position: relative;
    z-index: 1;
  }

  .cert-body strong {
    color: #1a2744;
    font-weight: 700;
  }

  /* ── Track badges ── */
  .cert-tracks {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    margin: 20px 0;
    position: relative;
    z-index: 1;
  }

  .cert-track {
    padding: 6px 18px;
    border-radius: 4px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .track-html { background: #fff0f0; border: 1.5px solid #e53e3e; color: #c53030; }
  .track-css  { background: #ebf8ff; border: 1.5px solid #3182ce; color: #2b6cb0; }
  .track-js   { background: #fffff0; border: 1.5px solid #d69e2e; color: #b7791f; }

  /* ── Signatures row ── */
  .cert-sigs {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 30px;
    padding-top: 10px;
    position: relative;
    z-index: 1;
    gap: 20px;
  }

  .cert-sig {
    flex: 1;
    text-align: center;
  }

  .sig-line {
    border-top: 1.5px solid #a0aec0;
    margin-bottom: 6px;
  }

  .sig-label {
    font-family: 'Lato', sans-serif;
    font-size: 0.7rem;
    font-weight: 300;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #718096;
  }

  .sig-value {
    font-family: 'Nunito', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    color: #2d3748;
    margin-top: 2px;
  }

  /* ── Seal ── */
  .cert-seal {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 0 0 110px;
  }

  .seal-circle {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    border: 3px solid #c9a84c;
    background: linear-gradient(135deg, #1a2744 0%, #2d4a8a 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 2px #c9a84c, 0 0 0 6px rgba(201,168,76,0.2);
  }

  .seal-icon { font-size: 1.6rem; line-height: 1; }

  .seal-text {
    font-family: 'Cinzel', serif;
    font-size: 0.42rem;
    font-weight: 700;
    color: #f5e17a;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-top: 3px;
  }

  /* ── Footer strip ── */
  .cert-footer-strip {
    background: #1a2744;
    padding: 10px 52px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
  }

  .cert-footer-strip span {
    font-family: 'Nunito', sans-serif;
    font-size: 0.65rem;
    color: rgba(255,255,255,0.45);
    letter-spacing: 0.08em;
  }

  .cert-footer-strip .cert-id {
    color: #c9a84c;
    font-weight: 700;
    font-family: 'Courier New', monospace;
    font-size: 0.6rem;
  }

  /* ── Print ── */
  @media print {
    body { background: white; padding: 0; }
    .page { box-shadow: none; }
  }

  /* ── Download button (only shown in browser, not printed) ── */
  .print-btn {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #c9a84c, #f5e17a);
    color: #1a2744;
    border: none;
    border-radius: 8px;
    font-family: 'Nunito', sans-serif;
    font-size: 0.9rem;
    font-weight: 800;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(201,168,76,0.4);
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .print-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,168,76,0.5); }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>

<div class="page">
  <div class="frame-outer">
    <div class="frame-inner">
      <div class="frame-content">

        <!-- Corner ornaments -->
        <div class="corner corner-tl">
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 55 L5 5 L55 5" stroke="#c9a84c" stroke-width="2.5" fill="none"/>
            <path d="M5 45 L5 15 L15 5" stroke="#c9a84c" stroke-width="1" fill="none" opacity="0.5"/>
            <circle cx="5" cy="5" r="3" fill="#c9a84c"/>
            <circle cx="5" cy="55" r="2" fill="#c9a84c" opacity="0.6"/>
            <circle cx="55" cy="5" r="2" fill="#c9a84c" opacity="0.6"/>
          </svg>
        </div>
        <div class="corner corner-tr">
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 55 L5 5 L55 5" stroke="#c9a84c" stroke-width="2.5" fill="none"/>
            <path d="M5 45 L5 15 L15 5" stroke="#c9a84c" stroke-width="1" fill="none" opacity="0.5"/>
            <circle cx="5" cy="5" r="3" fill="#c9a84c"/>
            <circle cx="5" cy="55" r="2" fill="#c9a84c" opacity="0.6"/>
            <circle cx="55" cy="5" r="2" fill="#c9a84c" opacity="0.6"/>
          </svg>
        </div>
        <div class="corner corner-bl">
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 55 L5 5 L55 5" stroke="#c9a84c" stroke-width="2.5" fill="none"/>
            <path d="M5 45 L5 15 L15 5" stroke="#c9a84c" stroke-width="1" fill="none" opacity="0.5"/>
            <circle cx="5" cy="5" r="3" fill="#c9a84c"/>
            <circle cx="5" cy="55" r="2" fill="#c9a84c" opacity="0.6"/>
            <circle cx="55" cy="5" r="2" fill="#c9a84c" opacity="0.6"/>
          </svg>
        </div>
        <div class="corner corner-br">
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 55 L5 5 L55 5" stroke="#c9a84c" stroke-width="2.5" fill="none"/>
            <path d="M5 45 L5 15 L15 5" stroke="#c9a84c" stroke-width="1" fill="none" opacity="0.5"/>
            <circle cx="5" cy="5" r="3" fill="#c9a84c"/>
            <circle cx="5" cy="55" r="2" fill="#c9a84c" opacity="0.6"/>
            <circle cx="55" cy="5" r="2" fill="#c9a84c" opacity="0.6"/>
          </svg>
        </div>

        <!-- Header -->
        <div class="cert-header">
          <div class="cert-logo-text">Code<span>Quest</span></div>
        </div>

        <div class="divider-line"></div>

        <p class="cert-of-text">This is to certify that</p>
        <h1 class="cert-title">Certificate of Completion</h1>

        <p class="cert-awarded">has been awarded to</p>

        <div class="cert-name">${safeName}</div>

        <p class="cert-body">
          for successfully completing all <strong>24 levels</strong> of the
          <strong>CodeQuest Web Development Program</strong>, demonstrating
          proficiency in building complete, responsive websites from scratch
          using industry-standard technologies.
        </p>

        <!-- Track badges -->
        <div class="cert-tracks">
          <span class="cert-track track-html">🏗 HTML · Levels 1–7</span>
          <span class="cert-track track-css">🎨 CSS · Levels 8–14</span>
          <span class="cert-track track-js">⚡ JavaScript · Levels 15–24</span>
        </div>

        <!-- Signatures -->
        <div class="cert-sigs">
          <div class="cert-sig">
            <div class="sig-line"></div>
            <div class="sig-label">Date Issued</div>
            <div class="sig-value">${date}</div>
          </div>

          <div class="cert-seal">
            <div class="seal-circle">
              <div class="seal-icon">🏆</div>
              <div class="seal-text">CERTIFIED</div>
            </div>
          </div>

          <div class="cert-sig">
            <div class="sig-line"></div>
            <div class="sig-label">Credential</div>
            <div class="sig-value">Web Development Fundamentals</div>
          </div>
        </div>

      </div><!-- end frame-content -->
    </div><!-- end frame-inner -->
  </div><!-- end frame-outer -->

  <!-- Footer strip -->
  <div class="cert-footer-strip">
    <span>CodeQuest · Web Development Program</span>
    <span class="cert-id">${certId}</span>
    <span>verify.codequest.dev</span>
  </div>
</div>

<button class="print-btn" onclick="window.print()">🖨 Print / Save as PDF</button>

</body>
</html>`;
  }

  function stripOuterDocument(html) {
    if (!html || typeof html !== 'string') return '';
    var bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) return bodyMatch[1].trim();
    return html
      .replace(/<!doctype[^>]*>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      .trim();
  }

  function getState() {
    if (window.CQ_STATE && window.CQ_STATE.data) return window.CQ_STATE.data;
    if (window.STATE && (window.STATE.html || window.STATE.css || window.STATE.js)) return window.STATE;
    var stored = getStoredProgress();
    if (stored && (stored.html || stored.css || stored.js)) return stored;
    return { html: '', css: '', js: '' };
  }

  function downloadCertificate() {
    var html = buildCertificateHtml();
    downloadTextFile('CodeQuest-Certificate.html', html, 'text/html');
  }

  function downloadPortfolioFiles() {
    var state = getState();
    var htmlBody = stripOuterDocument(state.html || '');
    var css = state.css || '';
    var js = state.js || '';

    var merged = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>My Portfolio – Built with CodeQuest</title>\n<style>\n' + css + '\n</style>\n</head>\n<body>\n' + htmlBody + '\n<script>\n' + js.replace(/<\/script>/gi, '<\\/script>') + '\n<\/script>\n</body>\n</html>';

    downloadTextFile('portfolio.html', merged, 'text/html');
    setTimeout(function () { downloadTextFile('style.css', css, 'text/css'); }, 300);
    setTimeout(function () { downloadTextFile('script.js', js, 'application/javascript'); }, 600);
  }

  function setupButtonHandlers() {
    var certBtn = document.getElementById('cq-download-cert-btn');
    var filesBtn = document.getElementById('cq-download-files-btn');
    if (certBtn) {
      certBtn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); downloadCertificate(); };
    }
    if (filesBtn) {
      filesBtn.onclick = function (e) { e.preventDefault(); e.stopPropagation(); downloadPortfolioFiles(); };
    }
  }

  function watchFinalModal() {
    var finalModal = document.getElementById('final-modal');
    if (!finalModal) return;
    var observer = new MutationObserver(function () {
      if (!finalModal.classList.contains('hidden')) {
        setTimeout(setupButtonHandlers, 50);
      }
    });
    observer.observe(finalModal, { attributes: true, attributeFilter: ['class'] });
  }

  function init() {
    setupButtonHandlers();
    watchFinalModal();
    setTimeout(setupButtonHandlers, 200);
  }

  window.CQ_CERTS = { downloadCertificate: downloadCertificate, downloadPortfolioFiles: downloadPortfolioFiles };
  window.downloadCertificateNow = downloadCertificate;
  window.downloadPortfolioFilesNow = downloadPortfolioFiles;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
