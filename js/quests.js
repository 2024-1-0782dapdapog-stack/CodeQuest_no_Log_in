(function () {
  'use strict';

  var QUEST_KEY = 'codequest_selected_quest';
  var originalLevels = (window.LEVELS || []).map(cloneLevel);

  function cloneLevel(level) {
    var copy = {};
    Object.keys(level || {}).forEach(function (key) {
      copy[key] = level[key];
    });
    return copy;
  }

  function replaceLevels(levels) {
    if (!window.LEVELS) return;
    window.LEVELS.splice.apply(window.LEVELS, [0, window.LEVELS.length].concat(levels.map(cloneLevel)));
  }

  function defaultStateFor(type) {
    if (type === 'cafe') {
      return {
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Sunny Side Cafe</title>\n</head>\n<body>\n  <header>\n    <img src="https://placehold.co/200x200/f8c471/2d1b00?text=Cafe" alt="Cafe logo">\n    <div>\n      <h1>Sunny Side Cafe</h1>\n      <h2>Fresh coffee, warm pastries, friendly tables</h2>\n    </div>\n    <nav>\n      <a href="#menu">Menu</a>\n      <a href="#specials">Specials</a>\n      <a href="#contact">Visit</a>\n    </nav>\n  </header>\n  <main>\n    <p>A cozy neighborhood cafe serving breakfast, lunch, and good ideas.</p>\n    <h2 id="menu">Menu Favorites</h2>\n    <ul>\n      <li>Espresso</li>\n      <li>Blueberry Muffin</li>\n      <li>Avocado Toast</li>\n    </ul>\n    <section class="project-card"><h3>Morning Combo</h3><p>Coffee, pastry, and a quiet table by the window.</p></section>\n    <section class="project-card"><h3>Lunch Special</h3><p>Soup, sandwich, and iced tea for busy afternoons.</p></section>\n    <section id="contact" class="project-card"><h3>Visit Us</h3><p>Open daily from 7 AM to 6 PM.</p></section>\n  </main>\n  <footer><p>Open daily - Sunny Side Cafe</p></footer>\n</body>\n</html>',
        css: '* { box-sizing: border-box; margin: 0; padding: 0; }\nbody { background-color: #fff8ed; color: #2d1b00; font-family: sans-serif; line-height: 1.7; }',
        js: 'console.log("Cafe site loading...");',
        userName: 'Sunny Side Cafe',
        completedLevels: []
      };
    }

    if (type === 'mini') {
      return {
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Click Challenge</title>\n</head>\n<body>\n  <header>\n    <img src="https://placehold.co/200x200/60a5fa/08111f?text=GO" alt="Game token">\n    <div>\n      <h1>Click Challenge</h1>\n      <h2>A tiny browser game built with HTML, CSS, and JavaScript</h2>\n    </div>\n    <nav>\n      <a href="#rules">Rules</a>\n      <a href="#score">Score</a>\n      <a href="#play">Play</a>\n    </nav>\n  </header>\n  <main>\n    <p>Click the target, track your score, and make the page react.</p>\n    <h2 id="rules">Game Features</h2>\n    <ul>\n      <li>Score</li>\n      <li>Timer</li>\n      <li>Target Button</li>\n    </ul>\n    <section class="project-card" id="play"><h3>Target Zone</h3><p>Press the button when the game begins.</p><button>Click Target</button></section>\n    <section class="project-card" id="score"><h3>Scoreboard</h3><p>Score: 0</p></section>\n  </main>\n  <footer><p>Built for quick reflexes and clean code.</p></footer>\n</body>\n</html>',
        css: '* { box-sizing: border-box; margin: 0; padding: 0; }\nbody { background-color: #08111f; color: #e5f0ff; font-family: sans-serif; line-height: 1.7; }',
        js: 'console.log("Mini game loading...");',
        userName: 'Click Challenge',
        completedLevels: []
      };
    }

    return {
      html: window.STATE ? window.STATE.html : '',
      css: window.STATE ? window.STATE.css : '',
      js: window.STATE ? window.STATE.js : '',
      userName: 'Your Name',
      completedLevels: []
    };
  }

  function questCopy(type, level) {
    var copy = cloneLevel(level);
    if (type === 'portfolio') return copy;

    var cafe = type === 'cafe';
    var name = cafe ? 'Sunny Side Cafe' : 'Click Challenge';
    var role = cafe ? 'Neighborhood Cafe' : 'Mini Game';
    var desc = cafe
      ? 'Fresh coffee, warm pastries, and friendly tables every day.'
      : 'Click the target, track your score, and make the page react.';
    var img = cafe
      ? 'https://placehold.co/200x200/f8c471/2d1b00?text=Cafe'
      : 'https://placehold.co/200x200/60a5fa/08111f?text=GO';
    var imgAlt = cafe ? 'Cafe logo' : 'Game token';
    var listTitle = cafe ? 'Menu Favorites' : 'Game Features';
    var items = cafe
      ? ['Espresso', 'Blueberry Muffin', 'Avocado Toast']
      : ['Score', 'Timer', 'Target Button'];
    var navA = cafe ? 'Menu' : 'Rules';
    var navB = cafe ? 'Visit' : 'Play';
    var contact = cafe
      ? '<section id="contact"><h2>Visit Us</h2><p>Open daily from 7 AM to 6 PM.</p></section>'
      : '<section id="play"><h2>Play</h2><p><button>Click Target</button></p></section>';

    var htmlMini =
      '<img src="' + img + '" alt="' + imgAlt + '">\n' +
      '<h1>' + name + '</h1>\n' +
      '<h2>' + role + '</h2>\n' +
      '<p>' + desc + '</p>';
    var listBlock =
      '<h2>' + listTitle + '</h2>\n<ul>\n' +
      '  <li>' + items[0] + '</li>\n' +
      '  <li>' + items[1] + '</li>\n' +
      '  <li>' + items[2] + '</li>\n</ul>';
    var navBlock =
      '<nav>\n  <a href="#' + (cafe ? 'menu' : 'rules') + '">' + navA + '</a>\n' +
      '  <a href="#' + (cafe ? 'contact' : 'play') + '">' + navB + '</a>\n</nav>';
    var fullDoc =
      '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>' + name + '</title>\n</head>\n<body>\n  <header>\n    <img src="' + img + '" alt="' + imgAlt + '">\n    <h1>' + name + '</h1>\n    <h2>' + role + '</h2>\n    ' + navBlock.replace(/\n/g, '\n    ') + '\n  </header>\n\n  <main>\n    <p>' + desc + '</p>\n    <h2 id="' + (cafe ? 'menu' : 'rules') + '">' + listTitle + '</h2>\n    <ul>\n      <li>' + items[0] + '</li>\n      <li>' + items[1] + '</li>\n      <li>' + items[2] + '</li>\n    </ul>\n    ' + contact + '\n  </main>\n\n  <footer>\n    <p>' + (cafe ? 'Open daily - Sunny Side Cafe' : 'Built for quick reflexes and clean code') + '</p>\n  </footer>\n</body>\n</html>';

    if (copy.id === 1) {
      copy.title = cafe ? 'Name Your Cafe' : 'Name Your Mini Game';
      copy.instructions = '<p>Start this quest with the main title.</p><p><strong>Task:</strong> Write an <code>&lt;h1&gt;</code> for <strong>' + name + '</strong>.</p>';
      copy.hint = '<h1>' + name + '</h1>';
      copy.starterCode = '<!-- Add the main title below -->\n';
      copy.successMessage = cafe ? 'Your cafe has a name. The sign is officially on the door.' : 'Your game has a title. The start screen is waking up.';
    }
    if (copy.id === 2) {
      copy.title = cafe ? 'Add a Cafe Tagline' : 'Add a Game Description';
      copy.instructions = '<p>Add a smaller heading and a short description.</p><p><strong>Task:</strong> Keep the <code>&lt;h1&gt;</code>, then add an <code>&lt;h2&gt;</code> and a <code>&lt;p&gt;</code>.</p>';
      copy.hint = '<h1>' + name + '</h1>\n<h2>' + role + '</h2>\n<p>' + desc + '</p>';
      copy.starterCode = '<h1>' + name + '</h1>\n\n<!-- Add h2 and p below -->\n';
      copy.successMessage = cafe ? 'The cafe now has a clear vibe and welcome message.' : 'The game now explains itself to the player.';
    }
    if (copy.id === 3) {
      copy.title = cafe ? 'Add a Cafe Image' : 'Add a Game Token Image';
      copy.hint = htmlMini;
      copy.starterCode = '<!-- Add your img tag here, above the h1 -->\n\n<h1>' + name + '</h1>\n<h2>' + role + '</h2>\n<p>' + desc + '</p>\n';
    }
    if (copy.id === 4) {
      copy.title = cafe ? 'Build a Menu List' : 'Build a Feature List';
      copy.instructions = '<p>Lists are great for grouped content.</p><p><strong>Task:</strong> Add an <code>&lt;h2&gt;</code> and a <code>&lt;ul&gt;</code> with at least 3 <code>&lt;li&gt;</code> items.</p>';
      copy.hint = htmlMini + '\n\n' + listBlock;
      copy.starterCode = htmlMini + '\n\n<!-- Add your list below -->\n';
    }
    if (copy.id === 5) {
      copy.title = cafe ? 'Add Cafe Navigation' : 'Add Game Navigation';
      copy.hint = '<img src="' + img + '" alt="' + imgAlt + '">\n<h1>' + name + '</h1>\n<h2>' + role + '</h2>\n' + navBlock + '\n<p>' + desc + '</p>\n\n' + listBlock;
      copy.starterCode = htmlMini + '\n\n<!-- Add your nav with links here -->\n\n' + listBlock + '\n';
    }
    if (copy.id === 6) {
      copy.title = cafe ? 'Organize the Cafe Page' : 'Organize the Game Page';
      copy.hint = '<header>\n  <img src="' + img + '" alt="' + imgAlt + '">\n  <h1>' + name + '</h1>\n  <h2>' + role + '</h2>\n  ' + navBlock.replace(/\n/g, '\n  ') + '\n</header>\n\n<main>\n  <p>' + desc + '</p>\n\n  <h2 id="' + (cafe ? 'menu' : 'rules') + '">' + listTitle + '</h2>\n  <ul>\n    <li>' + items[0] + '</li>\n    <li>' + items[1] + '</li>\n    <li>' + items[2] + '</li>\n  </ul>\n</main>\n\n<footer>\n  <p>' + (cafe ? 'Open daily - Sunny Side Cafe' : 'Built for quick reflexes and clean code') + '</p>\n</footer>';
      copy.starterCode = '<!-- Wrap everything in header, main, and footer -->\n\n' + copy.hint.replace(/<\/?(header|main|footer)>/g, '') + '\n';
    }
    if (copy.id === 7) {
      copy.title = cafe ? 'Complete the Cafe Document' : 'Complete the Game Document';
      copy.hint = fullDoc;
      copy.successMessage = cafe ? 'Your cafe site has a complete HTML document.' : 'Your mini game has a complete HTML document.';
    }
    if (copy.id >= 8 && copy.id <= 14) {
      copy.successMessage = cafe ? copy.successMessage.replace(/portfolio|Portfolio/g, 'cafe site') : copy.successMessage.replace(/portfolio|Portfolio/g, 'mini game');
    }
    if (copy.id === 17) {
      copy.hint = "const heading = document.querySelector('h1');\nheading.textContent = \"" + name + "\";\n\nconsole.log(\"Heading changed to: \" + heading.textContent);";
    }
    if (copy.id === 18) {
      copy.hint = "const footer = document.querySelector('footer p');\nconst year = new Date().getFullYear();\nfooter.textContent = \"Updated in \" + year + \" - " + name + "\";\nfooter.style.color = \"#6e7681\";";
    }
    if (copy.id === 19 && !cafe) {
      copy.title = 'Click the Target Button';
      copy.instructions = '<p>Events make games interactive.</p><p><strong>Task:</strong> Add a click event listener that logs a message.</p>';
      copy.hint = "const target = document.querySelector('button');\n\ntarget.addEventListener('click', function() {\n  console.log(\"Target clicked!\");\n});";
    }
    if (copy.id === 20) {
      copy.hint = "function greetUser(name) {\n  return \"Welcome to " + name + "!\";\n}\n\nconsole.log(greetUser(\"" + (cafe ? 'Sunny Side Cafe' : 'Click Challenge') + "\"));";
    }
    if (copy.id === 22) {
      copy.hint = "const mySkills = [\"" + items[0] + "\", \"" + items[1] + "\", \"" + items[2] + "\", \"JavaScript\"];\n\nmySkills.forEach(function(skill) {\n  console.log(skill);\n});";
    }
    if (copy.id === 23) {
      copy.hint = "// Create toggle button\nconst btn = document.createElement('button');\nbtn.textContent = \"" + (cafe ? 'Toggle Specials' : 'Start Round') + "\";\ndocument.body.appendChild(btn);\n\nbtn.addEventListener('click', function() {\n  document.body.classList.toggle('light-mode');\n});";
    }
    if (copy.id === 24) {
      copy.title = cafe ? 'Final Level - Launch Your Cafe Site!' : 'Final Level - Finish Your Mini Game!';
      copy.instructions = '<p><strong>Final Level!</strong> Pull it all together.</p><p>Write JavaScript that updates the title, creates a <code>mySkills</code> array, uses <code>forEach</code>, toggles a class, and logs that the project loaded.</p>';
      copy.hint = 'console.log("' + name + ' loaded!");\n\nconst h1 = document.querySelector(\'h1\');\nif (h1) h1.textContent = "' + name + '";\n\nconst mySkills = ["' + items[0] + '", "' + items[1] + '", "' + items[2] + '", "JavaScript"];\nmySkills.forEach(function(skill) {\n  console.log(skill);\n});\n\ndocument.body.classList.toggle(\'light-mode\');';
      copy.successMessage = cafe ? 'You launched a complete cafe website with structure, style, and interaction.' : 'You built a playable mini game page with structure, style, and interaction.';
    }

    return copy;
  }

  var quests = {
    portfolio: {
      id: 'portfolio',
      label: 'Build a Portfolio',
      finalTitle: "You're a Web Developer!",
      finalMessage: "You completed all 24 levels and built a real website from scratch using HTML, CSS, and JavaScript. That's genuinely impressive!",
      levels: originalLevels,
      defaults: defaultStateFor('portfolio')
    },
    cafe: {
      id: 'cafe',
      label: 'Launch a Cafe Site',
      finalTitle: 'Your Cafe Site Is Live!',
      finalMessage: 'You completed all 24 levels and launched a cafe website with a menu, visit details, styling, and JavaScript polish.',
      levels: originalLevels.map(function (level) { return questCopy('cafe', level); }),
      defaults: defaultStateFor('cafe')
    },
    mini: {
      id: 'mini',
      label: 'Code a Mini Game',
      finalTitle: 'Your Mini Game Is Ready!',
      finalMessage: 'You completed all 24 levels and built a small browser game experience with HTML, CSS, and JavaScript.',
      levels: originalLevels.map(function (level) { return questCopy('mini', level); }),
      defaults: defaultStateFor('mini')
    }
  };

  function setFinalCopy(quest) {
    var modal = document.getElementById('final-modal');
    if (!modal || !quest) return;
    var title = modal.querySelector('h2');
    var message = modal.querySelector('p');
    if (title) title.textContent = quest.finalTitle;
    if (message) message.textContent = quest.finalMessage;
  }

  function applyQuest(id, options) {
    var quest = quests[id] || quests.portfolio;
    var reset = options && options.reset;
    replaceLevels(quest.levels);
    window.CQ_CURRENT_QUEST = quest;
    try { localStorage.setItem(QUEST_KEY, quest.id); } catch (e) {}
    if (window.CQ_STATE && window.CQ_STATE.initDefaults) {
      window.CQ_STATE.initDefaults(quest.defaults);
      if (reset) window.CQ_STATE.reset(true);
    }
    setFinalCopy(quest);
    document.dispatchEvent(new CustomEvent('cq:questchange', { detail: { quest: quest } }));
    return quest;
  }

  function resetCurrentState() {
    var quest = window.CQ_CURRENT_QUEST || quests.portfolio;
    if (window.CQ_STATE && window.CQ_STATE.initDefaults) {
      window.CQ_STATE.initDefaults(quest.defaults);
      window.CQ_STATE.reset(false);
      window.CQ_STATE.save();
    }
    return quest;
  }

  function getSavedQuestId() {
    try { return localStorage.getItem(QUEST_KEY) || 'portfolio'; } catch (e) { return 'portfolio'; }
  }

  window.CQ_QUESTS = {
    all: quests,
    selectQuest: applyQuest,
    resetCurrentState: resetCurrentState,
    getCurrent: function () { return window.CQ_CURRENT_QUEST || quests.portfolio; }
  };

  applyQuest(getSavedQuestId(), { reset: false });
})();
