/**
 * CODEQUEST – MENTOR DATA
 * Shared mentor profiles and storage keys.
 */
(function() {
  window.CODEQUEST_MENTOR_STORAGE_KEYS = {
    mentorId: 'codequest_selected_mentor',
    aiMuted: 'codequest_ai_muted'
  };

  window.CODEQUEST_MENTOR_PROFILES = [
    {
      id: 'clara',
      label: 'Clara',
      gender: 'female',
      voiceHints: ['clara', 'aria', 'jenny', 'samantha', 'serena', 'female', 'zira', 'victoria', 'fiona', 'amy', 'hazel', 'emma', 'luna', 'sara', 'olivia', 'joanna', 'kendra', 'kimberly', 'ivy', 'mia', 'nicole', 'eva', 'haruka', 'ingrid', 'helene', 'caroline', 'maria', 'elsa', 'katja', 'allison', 'susan', 'michelle', 'heather', 'linda', 'nancy', 'elena', 'irina', 'lucy', 'megan'],
      preferredVoiceHintGroups: [
        ['aria'],
        ['jenny'],
        ['samantha'],
        ['serena'],
        ['zira'],
        ['victoria'],
        ['olivia'],
        ['joanna'],
        ['kendra'],
        ['kimberly'],
        ['ivy'],
        ['mia'],
        ['nicole'],
        ['eva'],
        ['ingrid'],
        ['allison'],
        ['susan'],
        ['michelle'],
        ['elena']
      ],
      langHints: ['en-us', 'en-gb'],
      rate: 0.96,
      pitch: 1.1,
      intro: "Hi, I'm Clara. I'll walk with you step by step and keep things calm, clear, and friendly.",
      icon: 'Pixel Art/Clara/Clara_Icon.png',
      happy: 'Pixel Art/Clara/Clara_Happy.png',
      sad: 'Pixel Art/Clara/Clara_Sad.png',
      talking: 'Pixel Art/Clara/Clara_Talking.png'
    },
    {
      id: 'client',
      label: 'Client',
      gender: 'male',
      voiceHints: ['david', 'alex', 'daniel', 'ryan', 'male', 'client'],
      preferredVoiceHintGroups: [
        ['david'],
        ['guy'],
        ['alex'],
        ['daniel'],
        ['ryan']
      ],
      langHints: ['en-us', 'en-gb'],
      rate: 0.95,
      pitch: 0.92,
      intro: "Hi, I'm Client. I'll keep things clear and practical so you can stay focused on the code.",
      icon: 'Pixel Art/Client/Client_Icon.png',
      happy: 'Pixel Art/Client/Client_Happy.png',
      sad: 'Pixel Art/Client/Client_Sad.png',
      talking: 'Pixel Art/Client/Client_Talking.png'
    },
    {
      id: 'kenji',
      label: 'Kenji',
      gender: 'male',
      voiceHints: ['kenji', 'takumi', 'jun', 'ichiro', 'hiro', 'male', 'japan'],
      preferredVoiceHintGroups: [
        ['takumi'],
        ['kenji'],
        ['jun'],
        ['ichiro'],
        ['hiro']
      ],
      langHints: ['ja', 'en-us'],
      rate: 0.92,
      pitch: 0.97,
      intro: "Hi, I'm Kenji. I'll keep things steady and calm while you build confidence.",
      icon: 'Pixel Art/Kenji/Kenji_Icon.png',
      happy: 'Pixel Art/Kenji/Kenji_Happy.png',
      sad: 'Pixel Art/Kenji/Kenji_Sad.png',
      talking: 'Pixel Art/Kenji/Kenji_Talking.png'
    },
    {
      id: 'scarlet',
      label: 'Scarlet',
      gender: 'female',
      voiceHints: ['scarlet', 'victoria', 'fiona', 'zira', 'amy', 'female', 'microsoft zira', 'eva', 'haruka', 'heami', 'huihui', 'yaoyao', 'ayumi', 'ingrid', 'helene', 'caroline', 'maria', 'elsa', 'katja', 'allison', 'susan', 'michelle', 'heather', 'linda', 'nancy', 'roz', 'asja', 'paulina', 'nuntiya', 'suthinan', 'elena', 'irina', 'hortense', 'sabina', 'ivona', 'lucy', 'megan', 'amy2'],
      preferredVoiceHintGroups: [
        ['zira'],
        ['victoria'],
        ['fiona'],
        ['amy'],
        ['hazel'],
        ['emma'],
        ['luna'],
        ['sara'],
        ['eva'],
        ['haruka'],
        ['heami'],
        ['huihui'],
        ['yaoyao'],
        ['ingrid'],
        ['helene'],
        ['allison'],
        ['susan'],
        ['michelle'],
        ['elena'],
        ['irina']
      ],
      langHints: ['en-gb', 'en-us'],
      rate: 1.01,
      pitch: 1.12,
      intro: "Hi, I'm Scarlet. I'll keep your momentum up with a bright, energetic voice.",
      icon: 'Pixel Art/Scarlet/Scarlet_Icon.png',
      happy: 'Pixel Art/Scarlet/Scarlet_Happy.png',
      sad: 'Pixel Art/Scarlet/Scarlet_Sad.png',
      talking: 'Pixel Art/Scarlet/Scarlet_Talking.png'
    }
  ];
})();