/**
 * CODEQUEST – MENTOR UI
 * Mentor picker, avatar badge, and bottom-right AI helper.
 */
(function() {
  const state = {
    aiOpen: false,
    voicePickerOpen: false,
    selectedMentorId: null,
    closingForGame: false,   // true when closing to START the game (not Back)
    elements: {}
  };

  function getVoiceProfile(mentorId) {
    const profiles = window.CODEQUEST_MENTOR_PROFILES || [];
    const profile = profiles.find((profile) => profile.id === mentorId) || profiles[0] || null;
    return profile;
  }

  function getActivePickerMentorId() {
    if (window.getSelectedMentorId) {
      const currentId = window.getSelectedMentorId();
      if (currentId) {
        state.selectedMentorId = currentId;
        return currentId;
      }
    }
    if (state.selectedMentorId) return state.selectedMentorId;
    if (window.__codequestSelectedMentorId) return window.__codequestSelectedMentorId;
    const selectedButton = state.elements.voicePicker
      ? state.elements.voicePicker.querySelector('[data-tts-option].selected, [data-tts-option][aria-checked="true"]')
      : null;
    if (selectedButton && selectedButton.dataset.mentorId) return selectedButton.dataset.mentorId;
    return 'clara';
  }

  function getVoiceIntro(profile) {
    if (!profile) return 'Pick a mentor to hear a short introduction before you start.';
    if (window.getMentorIntroText) return window.getMentorIntroText(profile.id);
    return profile.intro || ('Hi, I am ' + profile.label + '.');
  }

  function syncAiMuteButton() {
    const button = state.elements.aiMuteBtn;
    if (!button) return;
    const muted = window.getAiMuted ? window.getAiMuted() : false;
    button.textContent = muted ? '🔇' : '🔊';
    button.title = muted ? 'Unmute AI voice' : 'Mute AI voice';
  }

  function syncMentorBadge() {
    if (window.syncMentorDisplay) window.syncMentorDisplay();
    syncVoicePicker();
  }

  function syncVoicePicker() {
    const panel = state.elements.voicePicker;
    if (!panel) return;
    const selectedId = getActivePickerMentorId();
    panel.querySelectorAll('[data-tts-option]').forEach((button) => {
      const selected = button.dataset.mentorId === selectedId;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
    });
  }

  function commitVoiceSelection(mentorId, speak) {
    const profile = getVoiceProfile(mentorId);
    if (!profile) return;

    state.selectedMentorId = profile.id;
    window.__codequestSelectedMentorId = profile.id;
    window.__isScarletSelected = (profile.id === 'scarlet');

    if (window.setSelectedMentorId) {
      window.setSelectedMentorId(profile.id);
    }

    document.querySelectorAll('[data-mentor-portrait]').forEach((node) => {
      node.src = profile.icon;
      node.alt = profile.label + ' portrait';
    });

    const intro = getVoiceIntro(profile);
    if (window.setMentorMood) window.setMentorMood('idle');
    if (window.setMentorDialogueText) window.setMentorDialogueText(intro);
    if (speak && window.speakMentorText) {
      if (window.getTtsMuted && window.setTtsMuted && window.getTtsMuted()) {
        window.setTtsMuted(false);
      }
      window.speakMentorText(intro);
    }

    syncVoicePicker();
    syncMentorBadge();
    if (window.syncMentorDisplay) window.syncMentorDisplay();
  }

  function openVoicePicker() {
    if (!state.elements.voicePicker) {
      state.elements.voicePicker = document.getElementById('tts-picker');
    }
    if (!state.elements.voicePicker) return;

    state.closingForGame = false;
    state.voicePickerOpen = true;
    state.selectedMentorId = getActivePickerMentorId();
    syncMentorBadge();
    state.elements.voicePicker.classList.add('open');
    state.elements.voicePicker.setAttribute('aria-hidden', 'false');
    state.elements.voicePicker.style.opacity = '1';
    state.elements.voicePicker.style.pointerEvents = 'auto';
    state.elements.voicePicker.style.visibility = 'visible';
    syncVoicePicker();
  }

  function closeVoicePicker() {
    try {
      if (!state.elements.voicePicker) return;
      console.log('[Mentor] closeVoicePicker called');
      
      state.voicePickerOpen = false;
      state.elements.voicePicker.classList.remove('open');
      state.elements.voicePicker.setAttribute('aria-hidden', 'true');
      state.elements.voicePicker.style.opacity = '';
      state.elements.voicePicker.style.pointerEvents = '';
      state.elements.voicePicker.style.visibility = '';

      // Only restore the hero/homescreen when the user pressed Back (not Start Game)
      if (!state.closingForGame) {
        console.log('[Mentor] Restoring hero');
        setTimeout(() => {
          try {
            if (window.showHeroHome) {
              window.showHeroHome();
            } else {
              var splash = document.getElementById('splash');
              if (splash) {
                splash.classList.remove('hidden');
                splash.style.opacity = '1';
              }
            }
          } catch (e) {
            console.log('[Mentor] Error restoring hero:', e.message);
          }
        }, 0);
      }
      // Reset flag for next time
      state.closingForGame = false;
    } catch (e) {
      console.error('[Mentor] Error in closeVoicePicker:', e);
    }
  }

  function openAiPanel() {
    if (!state.elements.aiPanel) return;
    state.aiOpen = true;
    state.elements.aiPanel.classList.add('open');
    state.elements.aiPanel.setAttribute('aria-hidden', 'false');
    if (state.elements.aiInput) state.elements.aiInput.focus();
    if (state.elements.aiMessages && !state.elements.aiMessages.childElementCount) {
      addAiMessage('bot', 'Hi, I am the AI helper. Ask me for a hint or tell me the level you are stuck on.');
    }
  }

  function closeAiPanel() {
    if (!state.elements.aiPanel) return;
    state.aiOpen = false;
    state.elements.aiPanel.classList.remove('open');
    state.elements.aiPanel.setAttribute('aria-hidden', 'true');
  }

  function toggleAiPanel() {
    if (state.aiOpen) closeAiPanel();
    else openAiPanel();
  }

  function addAiMessage(role, text) {
    if (!state.elements.aiMessages) return null;
    const message = document.createElement('div');
    message.className = 'ai-message ' + (role === 'user' ? 'user' : 'bot');
    message.textContent = text;
    state.elements.aiMessages.appendChild(message);
    state.elements.aiMessages.scrollTop = state.elements.aiMessages.scrollHeight;
    return message;
  }

  function speakAiText(text) {
    if (window.getAiMuted && window.getAiMuted()) return;
    if (!text || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = window.getAiVoiceForHelper ? window.getAiVoiceForHelper() : null;
      if (voice) utterance.voice = voice;
      utterance.rate = 1.06;
      utterance.pitch = 0.72;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }

  function buildAiContext() {
    const levelTitle = document.getElementById('level-title');
    const instructions = document.getElementById('instructions');
    const title = levelTitle ? levelTitle.textContent : 'current level';
    const task = instructions ? (instructions.textContent || '').replace(/\s+/g, ' ').trim() : '';
    return { title, task };
  }

  function fallbackAiReply(userText) {
    const prompt = (userText || '').toLowerCase();
    const context = buildAiContext();
    if (prompt.includes('html') || context.title.toLowerCase().includes('html')) {
      return 'Check the required tag name, then compare your markup to the instructions. If you are stuck, ask me for the exact structure.';
    }
    if (prompt.includes('css') || context.title.toLowerCase().includes('css')) {
      return 'Focus on selector, property, and value. The fastest fix is usually a missing colon, brace, or class name.';
    }
    if (prompt.includes('javascript') || prompt.includes('js')) {
      return 'Look for the event or function the task asks for, then match the variable and method names exactly.';
    }
    return 'Tell me the level name or paste the code you are trying to write, and I will give you a targeted hint.';
  }

  async function fetchAiReply(userText) {
    const endpoint = window.CODEQUEST_AI_ENDPOINT || window.CODEQUEST_AI_API_URL || '';
    const apiKey = window.CODEQUEST_AI_API_KEY || '';
    if (!endpoint) return fallbackAiReply(userText);

    const context = buildAiContext();
    const requestBody = {
      model: window.CODEQUEST_AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are the CodeQuest AI helper. Answer briefly, clearly, and with coding-specific help. Keep replies under 90 words when possible.' },
        { role: 'system', content: 'Current level: ' + context.title + '. Instructions: ' + context.task },
        { role: 'user', content: userText }
      ],
      temperature: 0.4
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: 'Bearer ' + apiKey } : {})
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error('AI request failed with status ' + response.status);

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content
      || data?.output_text
      || data?.message
      || data?.text
      || '';
    return (reply || fallbackAiReply(userText)).toString().trim();
  }

  async function handleAiSubmit(userText) {
    const cleanText = (userText || '').trim();
    if (!cleanText) return;
    addAiMessage('user', cleanText);
    if (state.elements.aiInput) state.elements.aiInput.value = '';
    if (state.elements.aiStatus) state.elements.aiStatus.textContent = 'Thinking...';
    let replyText = '';
    try {
      replyText = await fetchAiReply(cleanText);
    } catch (e) {
      replyText = fallbackAiReply(cleanText);
    }
    addAiMessage('bot', replyText);
    if (state.elements.aiStatus) state.elements.aiStatus.textContent = window.getAiMuted && window.getAiMuted() ? 'Muted' : 'Ready';
    speakAiText(replyText);
  }

  function initMentorPicker() {
    document.querySelectorAll('[data-mentor-option]').forEach((button) => {
      button.addEventListener('click', () => {
        const mentorId = button.getAttribute('data-mentor-id') || button.dataset.mentorId;
        commitVoiceSelection(mentorId, true);
      });
    });
    syncMentorBadge();
  }

  function initVoicePicker() {
    state.elements.voicePicker = document.getElementById('tts-picker');
    state.elements.voicePickerContinue = document.querySelector('[data-tts-continue]');
    state.elements.voicePickerBack = document.querySelector('[data-tts-back]');

    if (!state.elements.voicePicker) return;

    state.elements.voicePicker.querySelectorAll('[data-tts-option]').forEach((button) => {
      button.addEventListener('click', () => {
        try {
          const mentorId = button.getAttribute('data-mentor-id') || button.dataset.mentorId;
          commitVoiceSelection(mentorId, true);
        } catch (e) {
          console.error('[Mentor] Error in mentor selection:', e);
        }
      });
    });

    // Start Game — set flag so closeVoicePicker does NOT restore hero
    state.elements.voicePickerContinue?.addEventListener('click', (event) => {
      try {
        console.log('[Mentor] Start Game button clicked');
        event.preventDefault();
        event.stopPropagation();
        
        const selectedButton = state.elements.voicePicker.querySelector('[data-tts-option].selected, [data-tts-option][aria-checked="true"]');
        const mentorId = selectedButton
          ? (selectedButton.getAttribute('data-mentor-id') || selectedButton.dataset.mentorId)
          : getActivePickerMentorId();
        console.log('[Mentor] Selected mentor:', mentorId);
        
        if (mentorId) {
          console.log('[Mentor] Committing voice selection');
          commitVoiceSelection(mentorId, false);
        }
        
        console.log('[Mentor] Setting closingForGame flag');
        state.closingForGame = true;
        
        console.log('[Mentor] Closing voice picker');
        closeVoicePicker();
        
        // Delay game start to prevent blocking
        console.log('[Mentor] Scheduling game start');
        setTimeout(() => {
          console.log('[Mentor] Starting game now');
          if (window.startCodeQuestGame) {
            try {
              window.startCodeQuestGame();
            } catch (e) {
              console.error('[Mentor] Error starting game:', e);
            }
          } else {
            console.error('[Mentor] startCodeQuestGame not found!');
          }
        }, 50);
      } catch (e) {
        console.error('[Mentor] Error in Start Game handler:', e);
      }
    });

    // Back button — closingForGame stays false → hero will be restored
    state.elements.voicePickerBack?.addEventListener('click', (event) => {
      try {
        console.log('[Mentor] Back button clicked');
        event.preventDefault();
        event.stopPropagation();
        
        state.closingForGame = false;
        console.log('[Mentor] Closing voice picker');
        closeVoicePicker();
        console.log('[Mentor] Back action completed');
      } catch (e) {
        console.error('[Mentor] Error in Back button handler:', e);
      }
    });

    // Backdrop click → same as Back
    state.elements.voicePicker.addEventListener('click', (event) => {
      if (event.target === state.elements.voicePicker) {
        state.closingForGame = false;
        closeVoicePicker();
      }
    });

    syncVoicePicker();
  }

  function initAiUi() {
    state.elements = {
      ...state.elements,
      launcher: document.getElementById('ai-launcher'),
      panel: document.getElementById('ai-panel'),
      messages: document.getElementById('ai-messages'),
      form: document.getElementById('ai-form'),
      input: document.getElementById('ai-input'),
      sendBtn: document.getElementById('ai-send-btn'),
      muteBtn: document.getElementById('ai-mute-btn'),
      closeBtn: document.getElementById('ai-close-btn'),
      status: document.getElementById('ai-status')
    };

    if (!state.elements.launcher || !state.elements.panel) return;

    syncAiMuteButton();

    state.elements.launcher.addEventListener('click', toggleAiPanel);
    state.elements.closeBtn?.addEventListener('click', closeAiPanel);
    state.elements.muteBtn?.addEventListener('click', () => {
      if (window.toggleAiMuted) window.toggleAiMuted();
      syncAiMuteButton();
    });
    state.elements.form?.addEventListener('submit', (event) => {
      event.preventDefault();
      handleAiSubmit(state.elements.input ? state.elements.input.value : '');
    });
    state.elements.input?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAiPanel();
    });
  }

  function init() {
    initMentorPicker();
    initVoicePicker();
    initAiUi();
    const currentMentorId = window.getSelectedMentorId ? window.getSelectedMentorId() : 'clara';
    const profile = getVoiceProfile(currentMentorId);
    if (profile) {
      document.querySelectorAll('[data-mentor-portrait]').forEach((node) => {
        node.src = profile.icon;
        node.alt = profile.label + ' portrait';
      });
    }
    if (window.syncMentorDisplay) window.syncMentorDisplay();
    syncMentorBadge();
  }

  window.syncAiMuteButton = syncAiMuteButton;
  window.openTtsVoicePicker = openVoicePicker;
  window.closeTtsVoicePicker = closeVoicePicker;
  window.openAiHelper = openAiPanel;
  window.closeAiHelper = closeAiPanel;
  window.toggleAiHelper = toggleAiPanel;
  window.sendAiHelperMessage = handleAiSubmit;
  window.addAiHelperMessage = addAiMessage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
