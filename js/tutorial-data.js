/**
 * CODEQUEST – TUTORIAL CONTENT
 * Onboarding step copy kept separate from the tutorial behavior.
 */
(function() {
  window.CODEQUEST_TUTORIAL_STEPS = [
    {
      selector: '#homeBtn',
      text: 'This is the home button. Tap it anytime to return to the start screen.'
    },
    {
      selector: '#musicToggleBtn',
      text: 'This music button mutes or unmutes the lofi stream while you code.'
    },
    {
      selector: '#ttsToggleBtn',
      text: 'This is the mentor voice button. Use it to mute or unmute text to speech guidance any time.'
    },
    {
      selector: '#level-pill',
      text: 'This shows your current level so you always know your progress through the game.'
    },
    {
      selector: '#cq-points-badge',
      text: 'This is your hint points badge in the top right. You spend these points to unlock hints when you get stuck, and you can earn more as you progress.'
    },
    {
      selector: '#xp-badge',
      text: 'This is your XP badge in the top right. It grows when you complete levels and shows how far you have progressed overall.'
    },
    {
      selector: '#instructions-panel',
      text: 'Read this panel first. It tells you exactly what to build, and the hint points in the top bar are what you spend to unlock help when you get stuck.',
      code: `<!-- Example: add a button that shows an alert -->
<button id="hello">Click me</button>
<script>
  document.getElementById('hello').addEventListener('click', function(){
    alert('Hello!');
  });
</script>`
    },
    {
      selector: '#editor-wrap',
      text: 'This is your coding box. Write your HTML, CSS, or JavaScript here.'
    },
    {
      selector: '#action-row',
      text: 'Use Back and Next to navigate levels, and Run Code to check your solution.'
    },
    {
      selector: '#preview-pane',
      text: 'This preview updates your website output so you can see your code live.'
    }
  ];
})();