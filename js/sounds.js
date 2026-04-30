/**
 * CODEQUEST – SOUND EFFECTS
 * Lo-fi girls YouTube background music + synth fallback, success/error sounds
 */
(function() {

  let audioContext;
  let bgMusicOscillators = [];
  let youtubePlayer = null;
  let musicMuted = false;

  function initAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  /* ── Load YouTube IFrame API ── */
  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    
    return new Promise((resolve, reject) => {
      // Set a timeout of 8 seconds - if YouTube API doesn't load, proceed with fallback
      const timeout = setTimeout(() => {
        reject(new Error('YouTube API load timeout'));
      }, 8000);
      
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onload = () => {
        clearTimeout(timeout);
        // Wait for API to be ready with another timeout
        const readyTimeout = setTimeout(() => {
          if (window.YT && window.YT.Player) {
            clearTimeout(readyTimeout);
            resolve();
          } else {
            reject(new Error('YouTube API not ready'));
          }
        }, 1000);
      };
      tag.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load YouTube API'));
      };
      document.head.appendChild(tag);
      
      // Also set up the global callback for when the API is ready
      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  }

  /* ── Initialize Hidden YouTube Player ── */
  window.initYouTubeMusic = function() {
    loadYouTubeAPI().then(() => {
      if (!youtubePlayer && window.YT && window.YT.Player) {
        try {
          // Create hidden container for YouTube player
          const container = document.createElement('div');
          container.id = 'yt-music-container';
          container.style.display = 'none';
          container.style.height = '0';
          container.style.width = '0';
          document.body.appendChild(container);

          // Create YouTube player with try-catch
          youtubePlayer = new YT.Player('yt-music-container', {
            height: '0',
            width: '0',
            videoId: 'jfKfPfyJRdk',
            events: {
              'onReady': (event) => {
                try {
                  // Auto-play the music
                  event.target.setVolume(35);
                  event.target.playVideo();
                  musicMuted = false;
                } catch (e) {
                  console.log('Could not play music:', e.message);
                }
              },
              'onStateChange': (event) => {
                try {
                  // Loop the video when it ends
                  if (event.data === YT.PlayerState.ENDED) {
                    event.target.playVideo();
                  }
                } catch (e) {
                  console.log('Could not loop music:', e.message);
                }
              },
              'onError': (event) => {
                console.log('YouTube player error:', event.data);
                youtubePlayer = null;
                playBackgroundMusic();
              }
            }
          });
        } catch (e) {
          console.log('Could not create YouTube player:', e.message);
          youtubePlayer = null;
          playBackgroundMusic();
        }
      } else if (youtubePlayer) {
        // Player already exists, just resume playback
        try {
          youtubePlayer.playVideo();
          musicMuted = false;
        } catch (e) {
          console.log('Could not resume music:', e.message);
        }
      }
    }).catch(() => {
      console.log('YouTube API failed, using synthesized music');
      playBackgroundMusic();
    });
  };

  /* ── Mute/Unmute Background Music ── */
  window.toggleMusicMute = function() {
    if (!youtubePlayer) return;
    
    musicMuted = !musicMuted;
    
    if (musicMuted) {
      youtubePlayer.mute();
    } else {
      youtubePlayer.unMute();
    }
    
    return musicMuted;
  };

  window.getMusicMuted = function() {
    return musicMuted;
  };

  /* ── Fallback: Synthesized Lo-Fi Music ── */
  window.playBackgroundMusic = function() {
    try {
      const ctx = initAudioContext();

      const playChord = (frequencies, startTime, duration, volume = 0.25) => {
        frequencies.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(volume / frequencies.length, startTime + 0.3);
          gain.gain.linearRampToValueAtTime(volume / frequencies.length, startTime + duration - 0.2);
          gain.gain.linearRampToValueAtTime(0, startTime + duration);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
          
          bgMusicOscillators.push(osc);
        });
      };

      const chords = [
        { 
          frequencies: [130.81, 164.81, 196, 246.94], // Cmaj7
          duration: 3.5
        },
        { 
          frequencies: [174.61, 220, 261.63, 329.63], // Fmaj7
          duration: 3.5
        },
        { 
          frequencies: [116.54, 146.83, 174.61, 220], // Bbmaj7
          duration: 3.5
        },
        { 
          frequencies: [98, 116.54, 146.83, 174.61],  // Gm7
          duration: 3.5
        },
      ];

      const loopDuration = chords.reduce((sum, chord) => sum + chord.duration, 0);

      const scheduleLoop = () => {
        let currentTime = ctx.currentTime;

        chords.forEach(chord => {
          playChord(chord.frequencies, currentTime, chord.duration, 0.12);
          currentTime += chord.duration;
        });

        setTimeout(scheduleLoop, loopDuration * 1000);
      };

      scheduleLoop();

    } catch (e) {
      console.log('Synth music failed:', e.message);
    }
  };

  window.stopBackgroundMusic = function() {
    if (youtubePlayer) {
      try {
        youtubePlayer.stopVideo();
      } catch (e) {}
    }
    
    bgMusicOscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {}
    });
    bgMusicOscillators = [];
  };

  /* ── Success Chime (ascending) ── */
  window.playSuccessSound = function() {
    try {
      const ctx = initAudioContext();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      const notes = [
        { freq: 523.25, time: 0 },     // C5
        { freq: 659.25, time: 0.15 },  // E5
        { freq: 784, time: 0.3 },      // G5
        { freq: 1046.5, time: 0.45 }   // C6
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);
        osc.connect(gain);
        osc.start(now + time);
        osc.stop(now + time + 0.15);
      });
    } catch (e) {
      console.log('Success sound failed:', e.message);
    }
  };

  /* ── Error Beep (descending) ── */
  window.playErrorSound = function() {
    try {
      const ctx = initAudioContext();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      const notes = [
        { freq: 800, time: 0 },
        { freq: 600, time: 0.1 },
        { freq: 400, time: 0.2 }
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);
        osc.connect(gain);
        osc.start(now + time);
        osc.stop(now + time + 0.1);
      });
    } catch (e) {
      console.log('Error sound failed:', e.message);
    }
  };

  /* ── Next Level Sound (ascending) ── */
  window.playNextLevelSound = function() {
    try {
      const ctx = initAudioContext();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      const notes = [
        { freq: 523.25, time: 0 },     // C5
        { freq: 659.25, time: 0.08 },  // E5
        { freq: 784, time: 0.16 }      // G5
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);
        osc.connect(gain);
        osc.start(now + time);
        osc.stop(now + time + 0.12);
      });
    } catch (e) {
      console.log('Next level sound failed:', e.message);
    }
  };

  /* ── Previous Level Sound (descending) ── */
  window.playPreviousLevelSound = function() {
    try {
      const ctx = initAudioContext();
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      const notes = [
        { freq: 659.25, time: 0 },     // E5
        { freq: 523.25, time: 0.08 },  // C5
        { freq: 392, time: 0.16 }      // G4
      ];

      notes.forEach(({ freq, time }) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);
        osc.connect(gain);
        osc.start(now + time);
        osc.stop(now + time + 0.12);
      });
    } catch (e) {
      console.log('Previous level sound failed:', e.message);
    }
  };

})();
