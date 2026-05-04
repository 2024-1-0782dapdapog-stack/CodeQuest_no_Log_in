(function () {
  'use strict';

  function result(ok, message) {
    return { ok: !!ok, message: message || '' };
  }

  function parseHtml(code) {
    var parser = new DOMParser();
    return parser.parseFromString(code || '', 'text/html');
  }

  function hasText(doc, selector) {
    var el = doc.querySelector(selector);
    return !!(el && el.textContent.trim());
  }

  function count(doc, selector) {
    return doc.querySelectorAll(selector).length;
  }

  function cssRules(code) {
    var style = document.createElement('style');
    style.textContent = code || '';
    document.head.appendChild(style);
    try {
      return Array.from(style.sheet ? style.sheet.cssRules : []);
    } catch (e) {
      return [];
    } finally {
      style.remove();
    }
  }

  function selectorRule(rules, selector) {
    selector = selector.toLowerCase().replace(/\s+/g, ' ').trim();
    return rules.find(function (rule) {
      return rule.selectorText && rule.selectorText.toLowerCase().replace(/\s+/g, ' ').split(',').map(function (s) {
        return s.trim();
      }).includes(selector);
    });
  }

  function hasDecl(rule, prop) {
    return !!(rule && rule.style && rule.style.getPropertyValue(prop));
  }

  function jsParses(code) {
    try {
      new Function(code || '');
      return true;
    } catch (e) {
      return false;
    }
  }

  function containsJs(code, pattern) {
    return pattern.test(code || '');
  }

  function validateHtml(level, code) {
    var doc = parseHtml(code);
    switch (level.id) {
      case 1: return result(hasText(doc, 'h1'), 'Add an h1 with visible text.');
      case 2: return result(hasText(doc, 'h1') && hasText(doc, 'h2') && hasText(doc, 'p'), 'Keep h1, then add h2 and p.');
      case 3: {
        var img = doc.querySelector('img[src][alt]');
        return result(!!img, 'Add an image with both src and alt attributes.');
      }
      case 4: {
        var activeQuest = window.CQ_QUESTS && window.CQ_QUESTS.getCurrent ? window.CQ_QUESTS.getCurrent().id : 'portfolio';
        var needsSkillsWord = activeQuest === 'portfolio';
        var hasRequiredHeading = hasText(doc, 'h2') && (!needsSkillsWord || /skill/i.test(doc.body.textContent));
        return result(hasRequiredHeading && count(doc, 'ul li') >= 3, 'Add a heading and at least three list items.');
      }
      case 5: return result(!!doc.querySelector('nav') && count(doc, 'nav a[href]') >= 2, 'Add a nav with at least two links.');
      case 6: return result(!!doc.querySelector('header') && !!doc.querySelector('main') && !!doc.querySelector('footer'), 'Use header, main, and footer sections.');
      case 7: return result(/<!doctype\s+html>/i.test(code) && !!doc.querySelector('html') && !!doc.querySelector('head title') && !!doc.querySelector('body'), 'Write a complete HTML document shell.');
      default: return result(false, 'Unknown HTML level.');
    }
  }

  function validateCss(level, code) {
    var rules = cssRules(code);
    var body = selectorRule(rules, 'body');
    switch (level.id) {
      case 8: return result(hasDecl(body, 'background-color') && hasDecl(body, 'color'), 'Set body background-color and color.');
      case 9: return result(!!selectorRule(rules, 'h1') && !!selectorRule(rules, 'h2'), 'Add h1 and h2 rules.');
      case 10: {
        var header = selectorRule(rules, 'header');
        var img = selectorRule(rules, 'header img');
        return result(header && header.style.display === 'flex' && hasDecl(img, 'border-radius'), 'Use flex on header and round the header image.');
      }
      case 11: return result(!!selectorRule(rules, 'nav') && !!selectorRule(rules, 'nav a') && !!selectorRule(rules, 'nav a:hover'), 'Style nav, nav a, and nav a:hover.');
      case 12: {
        var main = selectorRule(rules, 'main');
        return result(hasDecl(main, 'max-width') && /auto/.test(main.style.getPropertyValue('margin')) && !!selectorRule(rules, 'li'), 'Center main and style li badges.');
      }
      case 13: return result(!!selectorRule(rules, '.project-card') && !!selectorRule(rules, '.project-card:hover'), 'Add project-card and hover styles.');
      case 14: {
        var footer = selectorRule(rules, 'footer');
        return result(hasDecl(footer, 'background') || hasDecl(footer, 'background-color') ? hasDecl(footer, 'padding') : false, 'Style footer background and padding.');
      }
      default: return result(false, 'Unknown CSS level.');
    }
  }

  function validateJs(level, code) {
    if (!jsParses(code)) return result(false, 'Fix the JavaScript syntax first.');
    switch (level.id) {
      case 15: return result(containsJs(code, /console\.log\s*\(/) && containsJs(code, /\balert\s*\(/), 'Use console.log() and alert().');
      case 16: return result(containsJs(code, /\bconst\s+myName\s*=/) && containsJs(code, /\blet\s+myAge\s*=/), 'Create myName and myAge variables.');
      case 17: return result(containsJs(code, /document\.querySelector\s*\(\s*['"`]h1['"`]\s*\)/) && containsJs(code, /\.textContent\s*=/), 'Select h1 and set textContent.');
      case 18: return result(containsJs(code, /document\.querySelector/) && containsJs(code, /new\s+Date\s*\(\)\.getFullYear\s*\(/) && containsJs(code, /\.textContent\s*=/), 'Use Date().getFullYear() and update footer textContent.');
      case 19: {
        var activeQuest = window.CQ_QUESTS && window.CQ_QUESTS.getCurrent ? window.CQ_QUESTS.getCurrent().id : 'portfolio';
        var targetOk = activeQuest === 'mini'
          ? containsJs(code, /querySelector\s*\(\s*['"`]button['"`]\s*\)/)
          : containsJs(code, /querySelector\s*\(\s*['"`]header img['"`]\s*\)/);
        return result(targetOk && containsJs(code, /addEventListener\s*\(\s*['"`]click['"`]/), activeQuest === 'mini' ? 'Attach a click listener to the target button.' : 'Attach a click listener to the profile photo.');
      }
      case 20: return result(containsJs(code, /function\s+greetUser\s*\([^)]*\)/) && containsJs(code, /\breturn\b/) && containsJs(code, /console\.log\s*\([^)]*greetUser/), 'Define, call, and log greetUser().');
      case 21: return result(containsJs(code, /new\s+Date\s*\(\)\.getHours\s*\(/) && containsJs(code, /\bif\s*\(/) && containsJs(code, /\belse\b/), 'Use current hour with if/else.');
      case 22: return result(containsJs(code, /\bconst\s+mySkills\s*=\s*\[[\s\S]*?,[\s\S]*?,/) && containsJs(code, /\.forEach\s*\(/), 'Create a mySkills array and loop with forEach.');
      case 23: return result(containsJs(code, /createElement\s*\(\s*['"`]button['"`]\s*\)/) && containsJs(code, /classList\.toggle/) && containsJs(code, /addEventListener\s*\(\s*['"`]click['"`]/), 'Create a button that toggles a class on click.');
      case 24: return result(
        containsJs(code, /querySelector\s*\(\s*['"`]h1['"`]\s*\)/) &&
        containsJs(code, /\bconst\s+mySkills\s*=\s*\[/) &&
        containsJs(code, /\.forEach\s*\(/) &&
        containsJs(code, /classList\.toggle/) &&
        containsJs(code, /console\.log\s*\(/),
        'Combine h1 selection, skills loop, class toggle, and console.log.'
      );
      default: return result(false, 'Unknown JavaScript level.');
    }
  }

  function validate(level, code, state) {
    if (!level) return result(false, 'No level loaded.');
    if (level.chapter === 'HTML') return validateHtml(level, code, state);
    if (level.chapter === 'CSS') return validateCss(level, code, state);
    if (level.chapter === 'JS') return validateJs(level, code, state);
    return result(false, 'Unknown chapter.');
  }

  window.CQ_VALIDATORS = { validate: validate };
})();
