/**
 * CODEQUEST – EDITOR
 * Line numbers, tab key, auto-brackets, scroll sync
 */
(function() {

  const codeInput   = document.getElementById('code-input');
  const lineNumbers = document.getElementById('line-numbers');

  /* ── Line numbers ── */
  function updateLineNumbers() {
    const lines = codeInput.value.split('\n').length;
    const count = Math.max(lines, 10);
    let out = '';
    for (let i = 1; i <= count; i++) out += i + '\n';
    lineNumbers.textContent = out;
    // Sync scroll
    lineNumbers.scrollTop = codeInput.scrollTop;
  }

  codeInput.addEventListener('input', updateLineNumbers);
  codeInput.addEventListener('scroll', () => {
    lineNumbers.scrollTop = codeInput.scrollTop;
  });

  /* ── Tab key → 2 spaces ── */
  codeInput.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = this.selectionStart;
      const end = this.selectionEnd;
      this.value = this.value.substring(0, s) + '  ' + this.value.substring(end);
      this.selectionStart = this.selectionEnd = s + 2;
      updateLineNumbers();
      return;
    }

    /* Ctrl/Cmd + Enter → run */
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('runBtn').click();
      return;
    }

    /* Enter → auto-indent */
    if (e.key === 'Enter') {
      e.preventDefault();
      const s = this.selectionStart;
      const textBefore = this.value.substring(0, s);
      const lastLine = textBefore.split('\n').pop();
      const indent = lastLine.match(/^(\s*)/)[1];
      const extraIndent = /[{(<]$/.test(lastLine.trim()) ? '  ' : '';
      const insertion = '\n' + indent + extraIndent;
      this.value = textBefore + insertion + this.value.substring(this.selectionEnd);
      this.selectionStart = this.selectionEnd = s + insertion.length;
      updateLineNumbers();
      return;
    }
  });

  /* ── Auto-close pairs ── */
  const OPEN  = { '(': ')', '[': ']', '{': '}' };
  const CLOSE = new Set([')', ']', '}']);
  const QUOTE = new Set(['"', "'"]);

  codeInput.addEventListener('keydown', function(e) {
    const s = this.selectionStart;
    const sel = this.selectionStart !== this.selectionEnd;
    const nextChar = this.value[s];

    // Skip over existing closer
    if (!sel && (CLOSE.has(e.key) || QUOTE.has(e.key)) && nextChar === e.key) {
      e.preventDefault();
      this.selectionStart = this.selectionEnd = s + 1;
      return;
    }

    // Insert matching pair
    const closer = OPEN[e.key];
    if (closer) {
      e.preventDefault();
      const before = this.value.substring(0, s);
      const selected = this.value.substring(s, this.selectionEnd);
      const after = this.value.substring(this.selectionEnd);
      this.value = before + e.key + selected + closer + after;
      this.selectionStart = this.selectionEnd = s + 1;
      updateLineNumbers();
      return;
    }

    // Quote pairs
    if (QUOTE.has(e.key)) {
      e.preventDefault();
      const before = this.value.substring(0, s);
      const selected = this.value.substring(s, this.selectionEnd);
      const after = this.value.substring(this.selectionEnd);
      this.value = before + e.key + selected + e.key + after;
      this.selectionStart = this.selectionEnd = s + 1;
      updateLineNumbers();
    }
  });

  /* Expose for game.js */
  window.editorUpdateLineNumbers = updateLineNumbers;

})();
