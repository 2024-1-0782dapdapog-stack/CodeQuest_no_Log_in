(function () {
  'use strict';

  var FALLBACK_PORTRAITS = {
    clara: {
      icon: 'Pixel Art/Clara/Clara_Icon.png',
      happy: 'Pixel Art/Clara/Clara_Happy.png',
      sad: 'Pixel Art/Clara/Clara_Sad.png',
      talking: 'Pixel Art/Clara/Clara_Talking.png'
    },
    client: {
      icon: 'Pixel Art/Client/Client_Icon.png',
      happy: 'Pixel Art/Client/Client_Happy.png',
      sad: 'Pixel Art/Client/Client_Sad.png',
      talking: 'Pixel Art/Client/Client_Talking.png'
    },
    kenji: {
      icon: 'Pixel Art/Kenji/Kenji_Icon.png',
      happy: 'Pixel Art/Kenji/Kenji_Happy.png',
      sad: 'Pixel Art/Kenji/Kenji_Sad.png',
      talking: 'Pixel Art/Kenji/Kenji_Talking.png'
    },
    scarlet: {
      icon: 'Pixel Art/Scarlet/Scarlet_Icon.png',
      happy: 'Pixel Art/Scarlet/Scarlet_Happy.png',
      sad: 'Pixel Art/Scarlet/Scarlet_Sad.png',
      talking: 'Pixel Art/Scarlet/Scarlet_Talking.png'
    }
  };

  function getMentorId() {
    if (typeof window.getSelectedMentorId === 'function') {
      return String(window.getSelectedMentorId() || 'clara').toLowerCase();
    }
    return String(localStorage.getItem('codequest_selected_mentor') || 'clara').toLowerCase();
  }

  function getMood() {
    if (typeof window.getMentorPortraitState === 'function') {
      return window.getMentorPortraitState() || 'idle';
    }
    return 'idle';
  }

  function getProfileForMentor(mentorId) {
    var profiles = window.CODEQUEST_MENTOR_PROFILES;
    if (Array.isArray(profiles)) {
      for (var i = 0; i < profiles.length; i += 1) {
        var profile = profiles[i];
        if (profile && String(profile.id || '').toLowerCase() === mentorId) {
          return profile;
        }
      }
    }
    return FALLBACK_PORTRAITS[mentorId] || FALLBACK_PORTRAITS.clara;
  }

  function portraitFor(mentorId, mood) {
    var profile = getProfileForMentor(mentorId);
    var src = profile[mood] || profile.icon || '';
    return encodeURI(src);
  }

  function forcePortraitSync() {
    var mentorId = getMentorId();
    var mood = getMood();
    var src = portraitFor(mentorId, mood);

    var portraits = document.querySelectorAll('[data-mentor-portrait]');
    for (var i = 0; i < portraits.length; i += 1) {
      var img = portraits[i];
      if (img && img.getAttribute('src') !== src) {
        img.src = src;
      }
    }

    var happySrc = portraitFor(mentorId, 'happy');
    var winMentor = document.getElementById('win-mentor');
    var finalMentor = document.getElementById('final-mentor');

    if (winMentor) {
      winMentor.src = happySrc;
    }
    if (finalMentor) {
      finalMentor.src = happySrc;
    }
  }

  function fixFeedbackPortrait() {
    var feedback = document.getElementById('feedback');
    var feedbackMentor = document.getElementById('feedback-mentor');
    if (!feedback || !feedbackMentor) {
      return;
    }

    var update = function () {
      var mentorId = getMentorId();
      if (feedback.classList.contains('fb-wrong')) {
        feedbackMentor.src = portraitFor(mentorId, 'sad');
        feedbackMentor.classList.remove('hidden');
        return;
      }
      if (feedback.classList.contains('fb-correct')) {
        feedbackMentor.src = portraitFor(mentorId, 'happy');
        feedbackMentor.classList.remove('hidden');
        return;
      }
      feedbackMentor.classList.add('hidden');
    };

    var observer = new MutationObserver(update);
    observer.observe(feedback, {
      attributes: true,
      attributeFilter: ['class']
    });
    update();
  }

  function injectFixStyles() {
    if (document.getElementById('cq-mentor-fix-styles')) {
      return;
    }
    var style = document.createElement('style');
    style.id = 'cq-mentor-fix-styles';
    style.textContent = [
      '[data-mentor-portrait] { display: block !important; }',
      '#feedback.fb-neutral .feedback-mentor { display: none !important; }',
      '#feedback:not(.fb-neutral) .feedback-mentor { display: block !important; }',
      '#win-modal .modal-mentor,',
      '#final-modal .modal-mentor {',
      '  display: block !important;',
      '  max-width: 80px;',
      '  margin: 0 auto 10px;',
      '  border-radius: 50%;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function patchMentorSetters() {
    setTimeout(function () {
      if (typeof window.setMentorMood === 'function' && !window.setMentorMood.__patched) {
        var originalMood = window.setMentorMood;
        var wrappedMood = function () {
          var result = originalMood.apply(this, arguments);
          setTimeout(forcePortraitSync, 20);
          return result;
        };
        wrappedMood.__patched = true;
        window.setMentorMood = wrappedMood;
      }

      if (typeof window.setSelectedMentorId === 'function' && !window.setSelectedMentorId.__patched) {
        var originalMentor = window.setSelectedMentorId;
        var wrappedMentor = function () {
          var result = originalMentor.apply(this, arguments);
          setTimeout(forcePortraitSync, 20);
          return result;
        };
        wrappedMentor.__patched = true;
        window.setSelectedMentorId = wrappedMentor;
      }
    }, 400);
  }

  function watchModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) {
      return;
    }
    var observer = new MutationObserver(function () {
      if (!modal.classList.contains('hidden')) {
        setTimeout(forcePortraitSync, 30);
      }
    });
    observer.observe(modal, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function watchMentorPicker() {
    var grid = document.querySelector('.tts-picker-grid');
    if (!grid) {
      return;
    }
    grid.addEventListener('click', function () {
      setTimeout(forcePortraitSync, 80);
    });
  }

  function init() {
    injectFixStyles();
    forcePortraitSync();
    setTimeout(forcePortraitSync, 500);
    setTimeout(forcePortraitSync, 1000);
    setTimeout(forcePortraitSync, 2000);
    setTimeout(forcePortraitSync, 3500);

    fixFeedbackPortrait();
    patchMentorSetters();
    watchModal('win-modal');
    watchModal('final-modal');
    watchMentorPicker();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
