/**
 * CODEQUEST – TUTORIAL CONTENT
 * Onboarding step copy kept separate from the tutorial behavior.
 */
(function() {
  window.CODEQUEST_TUTORIAL_STEPS = [
    {
      selector: '#homeBtn',
      text: 'This is the Home button. Use it to go back to the start screen whenever you want.'
    },
    {
      selector: '#musicToggleBtn',
      text: 'Need some music? This button turns the Lo-Fi beats on or off while you code.'
    },
    {
      selector: '#ttsToggleBtn',
      text: 'This is your Mentor Voice button. You can mute or unmute your guide here.'
    },
    {
      selector: '#level-pill',
      text: 'This shows your current level. You are on a journey through 24 levels!'
    },
    {
      selector: '#xp-badge',
      text: 'These are your XP stars! You earn them by finishing levels. Watch them grow as you learn!'
    },
    {
      selector: '#instructions-panel',
      text: 'Always read this part first! It tells you exactly what to do for each level.',
      code: `<!-- Example: Making a button -->
<button>Click me!</button>`
    },
    {
      selector: '#editor-wrap',
      text: 'This is your workspace. This is where you will type your real website code!'
    },
    {
      selector: '#action-row',
      text: 'Click "Run Code" to see if your answer is correct. Use the arrows to move between levels.'
    },
    {
      selector: '#preview-pane',
      text: 'This is your live website! You can see your changes appear here instantly.'
    }
  ];
})();