/**
 * CODEQUEST – MENTOR CORE
 * Persistent mentor selection, portrait state, dialogue text, and voice matching.
 */
(function() {
  const STORAGE_KEYS = window.CODEQUEST_MENTOR_STORAGE_KEYS || {
    mentorId: 'codequest_selected_mentor',
    aiMuted: 'codequest_ai_muted'
  };

  const mentorProfiles = window.CODEQUEST_MENTOR_PROFILES || [];

  const defaultDialogue = 'Pick a mentor and start learning. The portrait will change when the tutor talks, gets happy, or reacts to an error.';

  const state = {
    mentorId: mentorProfiles[0] ? mentorProfiles[0].id : 'clara',
    mood: 'idle',
    talking: false,
    aiMuted: false,
    voices: [],
    voiceAssignments: {},
    voicesSignature: '',
    dialogueText: defaultDialogue
  };
  const storage = window.CQ_STORAGE;

  function voiceKey(voice) {
    return ((voice && (voice.voiceURI || voice.name || '')) || '').toLowerCase();
  }

  function buildVoicesSignature(voices) {
    return (voices || []).map((voice) => voiceKey(voice) + '|' + ((voice.lang || '').toLowerCase())).join('||');
  }

  const FEMALE_MARKERS = ['female', 'woman', 'girl', 'zira', 'samantha', 'jenny', 'aria', 'serena', 'victoria', 'amy', 'fiona', 'hazel', 'emma', 'luna', 'sara', 'olivia', 'joanna', 'kendra', 'kimberly', 'ivy', 'mia', 'nicole', 'eva', 'haruka', 'heami', 'huihui', 'yaoyao', 'ayumi', 'ingrid', 'helene', 'caroline', 'maria', 'elsa', 'katja', 'allison', 'susan', 'michelle', 'heather', 'linda', 'nancy', 'roz', 'asja', 'paulina', 'nuntiya', 'suthinan', 'elena', 'irina', 'hortense', 'sabina', 'ivona', 'lucy', 'megan', 'amy2'];
  const MALE_MARKERS = ['male', 'man', 'boy', 'david', 'guy', 'alex', 'daniel', 'ryan', 'takumi', 'jun', 'kenji', 'ichiro', 'hiro', 'mark', 'brian', 'george', 'james', 'john', 'matthew', 'justin', 'joey', 'arthur'];

  function voiceName(voice) {
    return ((voice && voice.name) || '').toLowerCase();
  }

  function hasAnyMarker(text, markers) {
    return markers.some((marker) => text.includes(marker));
  }

  function isMaleCodedVoice(voice) {
    return hasAnyMarker(voiceName(voice), MALE_MARKERS);
  }

  function isFemaleCodedVoice(voice) {
    return hasAnyMarker(voiceName(voice), FEMALE_MARKERS);
  }

  function safeGetStorage(key, fallback) {
    if (storage && storage.getString) {
      return storage.getString(key, fallback);
    }
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function safeSetStorage(key, value) {
    if (storage && storage.setString) {
      storage.setString(key, value);
      return;
    }
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

  function getDialogueText() {
    return state.dialogueText;
  }

  function setMentorDialogueText(text) {
    state.dialogueText = (text || '').toString() || defaultDialogue;
    syncMentorDisplay();
    return state.dialogueText;
  }

  function syncMentorDisplay() {
    const profile = getMentorProfile(state.mentorId);
    const activeMood = getActiveMood();
    const portrait = portraitFor(profile, activeMood);

    document.querySelectorAll('[data-mentor-portrait]').forEach((node) => {
      node.src = portrait;
      node.alt = profile.label + ' ' + activeMood + ' portrait';
    });

    document.querySelectorAll('[data-mentor-dialogue-name]').forEach((node) => {
      node.textContent = profile.label;
    });

    document.querySelectorAll('[data-mentor-dialogue-text]').forEach((node) => {
      node.textContent = state.dialogueText;
    });

    document.querySelectorAll('[data-mentor-dialogue]').forEach((node) => {
      node.classList.toggle('is-talking', activeMood === 'talking');
      node.classList.toggle('is-happy', activeMood === 'happy');
      node.classList.toggle('is-sad', activeMood === 'sad');
    });

    document.querySelectorAll('[data-mentor-option]').forEach((button) => {
      const selected = button.dataset.mentorId === profile.id;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-checked', selected ? 'true' : 'false');
    });

    if (window.syncAiMuteButton) {
      window.syncAiMuteButton();
    }
  }

  function refreshVoices() {
    if (!window.speechSynthesis || typeof window.speechSynthesis.getVoices !== 'function') return;
    state.voices = window.speechSynthesis.getVoices() || [];
    const nextSignature = buildVoicesSignature(state.voices);
    if (state.voicesSignature !== nextSignature) {
      state.voicesSignature = nextSignature;
      state.voiceAssignments = {};
    }
  }

  function scoreVoiceForProfile(voice, profile, fallbackHints) {
    const loweredHints = (profile ? profile.voiceHints : fallbackHints || []).map((hint) => String(hint).toLowerCase());
    const loweredLangHints = profile ? profile.langHints.map((hint) => String(hint).toLowerCase()) : [];
    const preferredHintGroups = Array.isArray(profile && profile.preferredVoiceHintGroups)
      ? profile.preferredVoiceHintGroups
      : [];
    const preferredHints = preferredHintGroups.reduce((acc, group) => acc.concat(group || []), []).map((hint) => String(hint).toLowerCase());
    const isFemaleProfile = !!(profile && profile.gender === 'female');
    const isMaleProfile = !!(profile && profile.gender === 'male');

    const name = (voice.name || '').toLowerCase();
    const lang = (voice.lang || '').toLowerCase();
    let score = 0;

    if (voice.localService) score += 2;
    if (!voice.default) score += 1;
    if (name.includes('natural') || name.includes('neural') || name.includes('enhanced') || name.includes('premium')) score += 5;
    if (name.includes('google') || name.includes('espeak') || name.includes('robot') || name.includes('tts')) score -= 4;
    if (name.includes('microsoft')) score += 1;

    loweredHints.forEach((hint) => {
      if (name.includes(hint)) score += 4;
    });
    preferredHints.forEach((hint) => {
      if (name.includes(hint)) score += 5;
    });
    loweredLangHints.forEach((hint) => {
      if (lang.startsWith(hint)) score += 2;
    });

    if (isFemaleProfile) {
      if (FEMALE_MARKERS.some((marker) => name.includes(marker))) score += 3;
      if (MALE_MARKERS.some((marker) => name.includes(marker))) score -= 8;
    }
    if (isMaleProfile) {
      if (MALE_MARKERS.some((marker) => name.includes(marker))) score += 3;
      if (FEMALE_MARKERS.some((marker) => name.includes(marker))) score -= 8;
    }

    return score;
  }

  function allocateDistinctVoicesForMentors(mentorIds, voicePool, assignmentMap, usedKeys) {
    mentorIds.forEach((mentorId) => {
      const profile = getMentorProfile(mentorId);
      const pool = (voicePool.length ? voicePool : state.voices);

      const preferredGroups = Array.isArray(profile && profile.preferredVoiceHintGroups)
        ? profile.preferredVoiceHintGroups
        : [];

      for (const group of preferredGroups) {
        const choice = pool.find((voice) => {
          const key = voiceKey(voice);
          if (usedKeys.has(key)) return false;
          const name = voiceName(voice);
          return (group || []).some((hint) => name.includes(String(hint).toLowerCase()));
        });
        if (choice) {
          const key = voiceKey(choice);
          assignmentMap[mentorId] = key;
          usedKeys.add(key);
          return;
        }
      }

      const scored = pool
        .map((voice) => ({ voice, score: scoreVoiceForProfile(voice, profile, []) }))
        .sort((left, right) => right.score - left.score);

      if (!scored.length) return;

      let choice = scored.find((item) => !usedKeys.has(voiceKey(item.voice)) && item.score > -1000);
      if (!choice) choice = scored.find((item) => !usedKeys.has(voiceKey(item.voice)));
      if (!choice) choice = scored[0];

      const key = voiceKey(choice.voice);
      assignmentMap[mentorId] = key;
      usedKeys.add(key);
    });
  }

  function ensureDeterministicMentorVoiceAssignments() {
    refreshVoices();
    if (!state.voices.length) return;

    const mentorIds = mentorProfiles.map((profile) => profile.id).filter(Boolean);
    if (!mentorIds.length) return;

    const femaleMentorIds = mentorProfiles.filter((profile) => profile.gender === 'female').map((profile) => profile.id);
    const maleMentorIds = mentorProfiles.filter((profile) => profile.gender === 'male').map((profile) => profile.id);

    const allKeys = new Set(state.voices.map((voice) => voiceKey(voice)));
    const assignedKeys = mentorIds.map((id) => state.voiceAssignments[id]).filter(Boolean);
    const hasAllAssigned = assignedKeys.length === mentorIds.length;
    const hasFemalePairDistinct = !state.voiceAssignments.clara || !state.voiceAssignments.scarlet || state.voiceAssignments.clara !== state.voiceAssignments.scarlet;
    const hasMalePairDistinct = !state.voiceAssignments.client || !state.voiceAssignments.kenji || state.voiceAssignments.client !== state.voiceAssignments.kenji;
    const keyToVoice = Object.fromEntries(state.voices.map((voice) => [voiceKey(voice), voice]));
    const femaleHasNonMaleOption = state.voices.some((voice) => !isMaleCodedVoice(voice));
    const maleHasNonFemaleOption = state.voices.some((voice) => !isFemaleCodedVoice(voice));
    const claraVoice = keyToVoice[state.voiceAssignments.clara || ''];
    const scarletVoice = keyToVoice[state.voiceAssignments.scarlet || ''];
    const clientVoice = keyToVoice[state.voiceAssignments.client || ''];
    const kenjiVoice = keyToVoice[state.voiceAssignments.kenji || ''];
    const femalePairGenderSafe = !femaleHasNonMaleOption || ((!claraVoice || !isMaleCodedVoice(claraVoice)) && (!scarletVoice || !isMaleCodedVoice(scarletVoice)));
    const malePairGenderSafe = !maleHasNonFemaleOption || ((!clientVoice || !isFemaleCodedVoice(clientVoice)) && (!kenjiVoice || !isFemaleCodedVoice(kenjiVoice)));
    const femaleCodedPoolForCheck = state.voices.filter((voice) => isFemaleCodedVoice(voice) && !isMaleCodedVoice(voice));
    const nonMalePoolForCheck = state.voices.filter((voice) => !isMaleCodedVoice(voice));
    const maleCodedPoolForCheck = state.voices.filter((voice) => isMaleCodedVoice(voice) && !isFemaleCodedVoice(voice));
    const nonFemalePoolForCheck = state.voices.filter((voice) => !isFemaleCodedVoice(voice));
    const femalePoolForCheck = femaleCodedPoolForCheck.length >= femaleMentorIds.length ? femaleCodedPoolForCheck : nonMalePoolForCheck;
    const malePoolForCheck = maleCodedPoolForCheck.length >= maleMentorIds.length ? maleCodedPoolForCheck : nonFemalePoolForCheck;
    const femaleDistinctPossible = new Set(femalePoolForCheck.map((voice) => voiceKey(voice))).size >= femaleMentorIds.length;
    const maleDistinctPossible = new Set(malePoolForCheck.map((voice) => voiceKey(voice))).size >= maleMentorIds.length;

    const hasValidExistingAssignments = mentorIds.every((id) => state.voiceAssignments[id] && allKeys.has(state.voiceAssignments[id]))
      && hasAllAssigned
      && (!femaleDistinctPossible || hasFemalePairDistinct)
      && (!maleDistinctPossible || hasMalePairDistinct)
      && femalePairGenderSafe
      && malePairGenderSafe;
    if (hasValidExistingAssignments) return;

    const femaleCodedPool = state.voices.filter((voice) => isFemaleCodedVoice(voice) && !isMaleCodedVoice(voice));
    const nonMalePool = state.voices.filter((voice) => !isMaleCodedVoice(voice));
    const maleCodedPool = state.voices.filter((voice) => isMaleCodedVoice(voice) && !isFemaleCodedVoice(voice));
    const nonFemalePool = state.voices.filter((voice) => !isFemaleCodedVoice(voice));

    const femalePool = femaleCodedPool.length >= femaleMentorIds.length ? femaleCodedPool : nonMalePool;
    const malePool = maleCodedPool.length >= maleMentorIds.length ? maleCodedPool : nonFemalePool;

    const assignmentMap = {};
    const usedFemaleKeys = new Set();
    const usedMaleKeys = new Set();

    allocateDistinctVoicesForMentors(femaleMentorIds, femalePool, assignmentMap, usedFemaleKeys);
    allocateDistinctVoicesForMentors(maleMentorIds, malePool, assignmentMap, usedMaleKeys);

    // Fallback for any mentor not yet assigned.
    mentorIds.forEach((mentorId) => {
      if (assignmentMap[mentorId]) return;
      const profile = getMentorProfile(mentorId);
      const scored = state.voices
        .map((voice) => ({ voice, score: scoreVoiceForProfile(voice, profile, []) }))
        .sort((left, right) => right.score - left.score);
      if (!scored.length) return;
      const localUsed = profile && profile.gender === 'female' ? usedFemaleKeys : profile && profile.gender === 'male' ? usedMaleKeys : new Set();
      let choice = scored.find((item) => !localUsed.has(voiceKey(item.voice)));
      if (!choice) choice = scored[0];
      assignmentMap[mentorId] = voiceKey(choice.voice);
      localUsed.add(assignmentMap[mentorId]);
    });

    state.voiceAssignments = assignmentMap;
  }

  function pickVoiceFromHints(profile, fallbackHints) {
    refreshVoices();
    if (!state.voices.length) return null;

    if (profile && profile.id === 'scarlet') {
      ensureDeterministicMentorVoiceAssignments();
      const blockedKeys = new Set([
        state.voiceAssignments.clara,
        state.voiceAssignments.client,
        state.voiceAssignments.kenji
      ].filter(Boolean));

      const scarletPreferredGroups = Array.isArray(profile.preferredVoiceHintGroups)
        ? profile.preferredVoiceHintGroups
        : [];

      for (const group of scarletPreferredGroups) {
        const choice = state.voices.find((voice) => {
          const key = voiceKey(voice);
          const name = voiceName(voice);
          if (blockedKeys.has(key)) return false;
          if (isMaleCodedVoice(voice)) return false;
          if (!isFemaleCodedVoice(voice)) return false;
          return (group || []).some((hint) => name.includes(String(hint).toLowerCase()));
        });
        if (choice) {
          state.voiceAssignments.scarlet = voiceKey(choice);
          return choice;
        }
      }

      const femaleAlternative = state.voices.find((voice) => {
        const key = voiceKey(voice);
        if (blockedKeys.has(key)) return false;
        if (isMaleCodedVoice(voice)) return false;
        return isFemaleCodedVoice(voice);
      });
      if (femaleAlternative) {
        state.voiceAssignments.scarlet = voiceKey(femaleAlternative);
        return femaleAlternative;
      }

      // If we cannot find a distinct female-coded voice, do not force a non-female voice.
      return null;
    }

    if (profile && profile.id) {
      ensureDeterministicMentorVoiceAssignments();
      const assignedKey = state.voiceAssignments[profile.id];
      if (assignedKey) {
        const assignedVoice = state.voices.find((voice) => voiceKey(voice) === assignedKey);
        if (assignedVoice) return assignedVoice;
      }
    }

    const scoredFallback = state.voices
      .map((voice) => ({ voice, score: scoreVoiceForProfile(voice, profile, fallbackHints || []) }))
      .sort((left, right) => right.score - left.score);
    return scoredFallback.length ? scoredFallback[0].voice : state.voices[0];
  }

  function pickAiVoice() {
    refreshVoices();
    if (!state.voices.length) return null;

    const syntheticHints = ['zira', 'david', 'microsoft', 'google', 'amazon', 'synth', 'tts', 'robot'];
    const scored = state.voices.map((voice) => {
      const name = (voice.name || '').toLowerCase();
      let score = 0;
      if (voice.default) score -= 1;
      if (voice.localService) score += 1;
      syntheticHints.forEach((hint) => {
        if (name.includes(hint)) score += 1;
      });
      if (name.includes('natural') || name.includes('neural') || name.includes('premium')) score -= 3;
      return { voice, score };
    }).sort((left, right) => right.score - left.score);

    return scored.length ? scored[0].voice : null;
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
    console.log('mentor-core setSelectedMentorId called with:', mentorId);
    state.mentorId = getMentorProfile(mentorId).id;
    console.log('mentor-core state.mentorId set to:', state.mentorId);
    safeSetStorage(STORAGE_KEYS.mentorId, state.mentorId);
    syncMentorDisplay();
    return state.mentorId;
  }

  function getSelectedMentorProfile() {
    return getMentorProfile(state.mentorId);
  }

  function getMentorIntroText(mentorId) {
    const profile = getMentorProfile(mentorId || state.mentorId);
    return profile.intro || ('Hi, I am ' + profile.label + '. I will guide you through CodeQuest step by step.');
  }

  function setAiMuted(muted) {
    state.aiMuted = !!muted;
    safeSetStorage(STORAGE_KEYS.aiMuted, state.aiMuted ? '1' : '0');
    if (state.aiMuted && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (window.syncAiMuteButton) {
      window.syncAiMuteButton();
    }
    return state.aiMuted;
  }

  function getAiMuted() {
    return state.aiMuted;
  }

  function initCore() {
    state.mentorId = getMentorProfile(safeGetStorage(STORAGE_KEYS.mentorId, state.mentorId)).id;
    state.aiMuted = safeGetStorage(STORAGE_KEYS.aiMuted, '0') === '1';
    state.dialogueText = defaultDialogue;
    syncMentorDisplay();
  }

  window.getSelectedMentorProfile = getSelectedMentorProfile;
  window.getSelectedMentorId = function() { 
    console.log('mentor-core getSelectedMentorId returning:', state.mentorId);
    return state.mentorId; 
  };
  window.setSelectedMentorId = setSelectedMentorId;
  window.setMentorMood = setMentorMood;
  window.setMentorTalking = setMentorTalking;
  window.setMentorDialogueText = setMentorDialogueText;
  window.getMentorTalking = function() { return state.talking; };
  window.getMentorPortraitState = getActiveMood;
  window.getMentorDialogueText = getDialogueText;
  window.getMentorIntroText = getMentorIntroText;
  window.getMentorVoiceForProfile = function(profile) {
    const prof = profile || getSelectedMentorProfile();
    // Special handling for Scarlet - force a female voice
    if (prof && prof.id === 'scarlet') {
      refreshVoices();
      if (!state.voices.length) return null;
      
      // Get blocked voices (other mentors)
      const blockedKeys = new Set([
        state.voiceAssignments.clara,
        state.voiceAssignments.client,
        state.voiceAssignments.kenji
      ].filter(Boolean));
      
      // Find any female voice not used by other mentors
      const femaleVoice = state.voices.find((voice) => {
        const key = voiceKey(voice);
        if (blockedKeys.has(key)) return false;
        if (isMaleCodedVoice(voice)) return false;
        return isFemaleCodedVoice(voice);
      });
      
      if (femaleVoice) {
        state.voiceAssignments.scarlet = voiceKey(femaleVoice);
        return femaleVoice;
      }
      
      // If no distinct female voice, try ANY female voice (even if used by others)
      const anyFemaleVoice = state.voices.find((voice) => {
        if (isMaleCodedVoice(voice)) return false;
        return isFemaleCodedVoice(voice);
      });
      
      if (anyFemaleVoice) {
        return anyFemaleVoice;
      }
      
      // Last resort: return null to let the speak function handle it
      return null;
    }
    
    return pickVoiceFromHints(prof, []);
  };
  window.getAiVoiceForHelper = pickAiVoice;
  window.getAiMuted = getAiMuted;
  window.setAiMuted = setAiMuted;
  window.toggleAiMuted = function() { return setAiMuted(!state.aiMuted); };
  window.syncMentorDisplay = syncMentorDisplay;

  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = refreshVoices;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCore, { once: true });
  } else {
    initCore();
  }
})();