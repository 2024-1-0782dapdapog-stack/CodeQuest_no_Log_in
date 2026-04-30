/**
 * CODEQUEST – MENTOR UI
 * Voice guide selection, mentor portraits, and AI helper popup.
 */
(function() {
  const STORAGE_KEYS = {
    mentorId: 'codequest_selected_mentor',
    aiMuted: 'codequest_ai_muted'
  };

  const mentorProfiles = [
    {
      id: 'clara',
      label: 'Clara',
      voiceHints: ['zira', 'samantha', 'serena', 'female', 'clara'],
      langHints: ['en-us', 'en-gb'],
      rate: 0.98,
      pitch: 1.05,
      icon: 'Pixel Art/Clara/Clara_Icon.png',
      happy: 'Pixel Art/Clara/Clara_Happy.png',
      sad: 'Pixel Art/Clara/Clara_Sad.png',
      talking: 'Pixel Art/Clara/Clara_Talking.png'
    },
    {
      id: 'client',
      label: 'Client',
      voiceHints: ['david', 'male', 'alex', 'daniel', 'client'],
      langHints: ['en-us', 'en-gb'],
      rate: 0.95,
      pitch: 0.92,
      icon: 'Pixel Art/Client/Client_Icon.png',
      happy: 'Pixel Art/Client/Client_Happy.png',
      sad: 'Pixel Art/Client/Client_Sad.png',
      talking: 'Pixel Art/Client/Client_Talking.png'
    },
    {
      id: 'kenji',
      label: 'Kenji',
      voiceHints: ['kenji', 'japan', 'haruka', 'takumi', 'male'],
      langHints: ['ja', 'en-us'],
      rate: 0.92,
      pitch: 0.97,
      icon: 'Pixel Art/Kenji/Kenji_Icon.png',
      happy: 'Pixel Art/Kenji/Kenji_Happy.png',
      sad: 'Pixel Art/Kenji/Kenji_Sad.png',
      talking: 'Pixel Art/Kenji/Kenji_Talking.png'
    },
    {
      id: 'scarlet',
      label: 'Scarlet',
      voiceHints: ['scarlet', 'female', 'victoria', 'fiona', 'microsoft zira'],
      langHints: ['en-gb', 'en-us'],
      rate: 1.01,
      pitch: 1.12,
      icon: 'Pixel Art/Scarlet/Scarlet_Icon.png',
      happy: 'Pixel Art/Scarlet/Scarlet_Happy.png',
      sad: 'Pixel Art/Scarlet/Scarlet_Sad.png',
      talking: 'Pixel Art/Scarlet/Scarlet_Talking.png'
    }
  ];

  const state = {
    mentorId: 'clara',
    mood: 'idle',
    talking: false,
    aiMuted: false,
    aiOpen: false,
    voicesReady: false,
    voices: []
  };

  let elements = {};

  function safeGetStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function safeSetStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  function getMentorProfile(mentorId) {
    return mentorProfiles.find((profile) => profile.id === mentorId) || mentorProfiles[0];
  }

  function portraitFor(profile, mood) {
    const source = mood === 'talking'
      ? profile.talking
      : mood === 'happy'
        ? profile.happy
        : mood === 'sad'
          ? profile.sad
          : profile.icon;
    return encodeURI(source);
  }

  function getActiveMood() {
    return state.talking ? 'talking' : state.mood;
  }

  function syncMentorDisplay() {
    const profile = getMentorProfile(state.mentorId);
    const activeMood = getActiveMood();
    const portrait = portraitFor(profile, activeMood);

    document.querySelectorAll('[data-mentor-portrait]').forEach((node) => {
      node.src = portrait;
      node.alt = profile.label + ' ' + activeMood + ' portrait';
    });

    document.querySelectorAll('[data-mentor-option]').forEach((button) => {
      const selected = button.dataset.mentorId === profile.id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
    });

    if (elements.aiMuteBtn) {
      elements.aiMuteBtn.textContent = state.aiMuted ? '🔇' : '🔊';
      elements.aiMuteBtn.title = state.aiMuted ? 'Unmute AI voice' : 'Mute AI voice';
    }
  }

  function setMentorMood(mood) {
    state.mood = mood === 'happy' || mood === 'sad' ? mood : 'idle';
    syncMentorDisplay();
    return state.mood;
  }

  function setMentorTalking(talking) {
    state.talking = !!talking;
    syncMentorDisplay();
    return state.talking;
  }

  function setSelectedMentorId(mentorId) {
    state.mentorId = getMentorProfile(mentorId).id;
    safeSetStorage(STORAGE_KEYS.mentorId, state.mentorId);
    syncMentorDisplay();
    return state.mentorId;
  }

  function getSelectedMentorProfile() {
    return getMentorProfile(state.mentorId);
  }

  function refreshVoices() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== 'function') return;
    state.voices = window.speechSynthesis.getVoices() || [];
    state.voicesReady = state.voices.length > 0;
  }

  function pickSpeechVoice(profile) {
    refreshVoices();
    if (!state.voices.length) return null;

    const loweredHints = profile.voiceHints.map((hint) => hint.toLowerCase());
    const loweredLangHints = profile.langHints.map((hint) => hint.toLowerCase());

    const scored = state.voices.map((voice) => {
      const name = (voice.name || '').toLowerCase();
      const lang = (voice.lang || '').toLowerCase();
      let score = 0;
      loweredHints.forEach((hint) => {
        if (name.includes(hint)) score += 4;
      });
      loweredLangHints.forEach((hint) => {
        if (lang.startsWith(hint)) score += 2;
      });
      if (name.includes('microsoft')) score += 1;
      return { voice, score };
    }).sort((left, right) => right.score - left.score);

    return scored.length && scored[0].score > 0
      ? scored[0].voice
      : state.voices[0];
  }

  function pickAiVoice() {
    refreshVoices();
    if (!state.voices.length) return null;

    const syntheticHints = ['zira', 'david', 'microsoft', 'google', 'female', 'male'];
    const scored = state.voices.map((voice) => {
      const name = (voice.name || '').toLowerCase();
      let score = 0;
      syntheticHints.forEach((hint) => {
        if (name.includes(hint)) score += 1;
      });
      return { voice, score };
    }).sort((left, right) => right.score - left.score);

    return scored.length ? scored[0].voice : null;
  }

  function setAiMuted(muted) {
    state.aiMuted = !!muted;
    safeSetStorage(STORAGE_KEYS.aiMuted, state.aiMuted ? '1' : '0');
    if (state.aiMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    syncMentorDisplay();
    return state.aiMuted;
  }

  function getAiMuted() {
    return state.aiMuted;
  }

  function openAiPanel() {
    if (!elements.aiPanel) return;
    state.aiOpen = true;
    elements.aiPanel.classList.add('open');
    elements.aiPanel.setAttribute('aria-hidden', 'false');
    if (elements.aiInput) elements.aiInput.focus();
    if (elements.aiMessages && !elements.aiMessages.childElementCount) {
      addAiMessage('bot', 'Hi, I am the AI helper. Ask me for a hint or tell me the level you are stuck on.');
    }
  }

  function closeAiPanel() {
    if (!elements.aiPanel) return;
    state.aiOpen = false;
    elements.aiPanel.classList.remove('open');
    elements.aiPanel.setAttribute('aria-hidden', 'true');
  }

  function toggleAiPanel() {
    if (state.aiOpen) closeAiPanel();
    else openAiPanel();
  }

  function addAiMessage(role, text) {
    if (!elements.aiMessages) return null;
    const message = document.createElement('div');
    message.className = 'ai-message ' + (role === 'user' ? 'user' : 'bot');
    message.textContent = text;
    elements.aiMessages.appendChild(message);
    elements.aiMessages.scrollTop = elements.aiMessages.scrollHeight;
    return message;
  }

  function speakAiText(text) {
    if (state.aiMuted || !text || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickAiVoice();
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
    const endpoint = window.CODEQUEST_AI_ENDPOINT || window.CODEQUEST_AI_API_URL || safeGetStorage('codequest_ai_endpoint', '');
    const apiKey = window.CODEQUEST_AI_API_KEY || safeGetStorage('codequest_ai_api_key', '');

    if (!endpoint) return fallbackAiReply(userText);

    const context = buildAiContext();
    const requestBody = {
      model: window.CODEQUEST_AI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are the CodeQuest AI helper. Answer briefly, clearly, and with coding-specific help. Keep replies under 90 words when possible.'
        },
        {
          role: 'system',
          content: 'Current level: ' + context.title + '. Instructions: ' + context.task
        },
        {
          role: 'user',
          content: userText
        }
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

    if (!response.ok) {
      throw new Error('AI request failed with status ' + response.status);
    }

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
    if (elements.aiInput) elements.aiInput.value = '';
    if (elements.aiStatus) elements.aiStatus.textContent = 'Thinking...';

    let replyText = '';
    try {
      replyText = await fetchAiReply(cleanText);
    } catch (e) {
      replyText = fallbackAiReply(cleanText);
    }

    addAiMessage('bot', replyText);
    if (elements.aiStatus) elements.aiStatus.textContent = state.aiMuted ? 'Muted' : 'Ready';
    speakAiText(replyText);
  }

  function initMentorPicker() {
    document.querySelectorAll('[data-mentor-option]').forEach((button) => {
      button.addEventListener('click', () => {
        setSelectedMentorId(button.dataset.mentorId);
      });
    });
    syncMentorDisplay();
  }

  function initAiUi() {
    elements = {
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

    if (!elements.launcher || !elements.panel) return;

    state.aiMuted = safeGetStorage(STORAGE_KEYS.aiMuted, '0') === '1';
    syncMentorDisplay();

    elements.launcher.addEventListener('click', toggleAiPanel);
    elements.closeBtn?.addEventListener('click', closeAiPanel);
    elements.muteBtn?.addEventListener('click', () => setAiMuted(!state.aiMuted));
    elements.form?.addEventListener('submit', (event) => {
      event.preventDefault();
      handleAiSubmit(elements.input ? elements.input.value : '');
    });
    elements.input?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAiPanel();
    });

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }

    if (state.aiMuted) {
      elements.muteBtn.textContent = '🔇';
      elements.muteBtn.title = 'Unmute AI voice';
    }
  }

  function initMentorSelection() {
    state.mentorId = getMentorProfile(safeGetStorage(STORAGE_KEYS.mentorId, 'clara')).id;
    syncMentorDisplay();
  }

  window.getSelectedMentorProfile = getSelectedMentorProfile;
  window.getSelectedMentorId = function() { return state.mentorId; };
  window.setSelectedMentorId = setSelectedMentorId;
  window.setMentorMood = setMentorMood;
  window.setMentorTalking = setMentorTalking;
  window.getMentorTalking = function() { return state.talking; };
  window.getMentorPortraitState = getActiveMood;
  window.getMentorVoiceForProfile = pickSpeechVoice;
  window.getAiMuted = getAiMuted;
  window.setAiMuted = setAiMuted;
  window.toggleAiMuted = function() { return setAiMuted(!state.aiMuted); };
  window.openAiHelper = openAiPanel;
  window.closeAiHelper = closeAiPanel;
  window.toggleAiHelper = toggleAiPanel;
  window.sendAiHelperMessage = handleAiSubmit;
  window.addAiHelperMessage = addAiMessage;

  function init() {
    initMentorSelection();
    initMentorPicker();
    initAiUi();
    syncMentorDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();