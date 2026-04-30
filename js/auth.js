(function () {
  'use strict';

  var USERS_DB = {
    admin: {
      password: 'admin123',
      displayName: 'Admin',
      email: 'admin@codequest.com',
      role: 'admin',
        unlimitedHints: true
    },
    student1: {
      password: 'pass123',
      displayName: 'Student One',
      email: 'student1@codequest.com',
      role: 'student',
      unlimitedHints: false
    },
    student2: {
      password: 'pass456',
      displayName: 'Student Two',
      email: 'student2@codequest.com',
      role: 'student',
      unlimitedHints: false
    }
  };

  var pendingAction = null;
  var interceptAttached = false;

  /* ── Error helpers ── */
  function showModalError(msg) {
    var err = document.getElementById('cq-login-error');
    if (!err) return;
    err.textContent = msg;
    err.style.display = 'block';
  }

  function clearModalError() {
    var err = document.getElementById('cq-login-error');
    if (!err) return;
    err.textContent = '';
    err.style.display = 'none';
  }

  /* ── Modal open / close ── */
  function openLoginModal() {
    var modal = document.getElementById('cq-login-modal');
    if (!modal) return;
    clearModalError();
    
    // Reset to Sign In mode (safely - switchAuthMode checks if elements exist)
    try {
      switchAuthMode('signin');
    } catch (e) {
      console.log('Could not switch auth mode:', e.message);
    }
    
    modal.style.display = 'flex';
    var inp = document.getElementById('cq-username-input');
    if (inp) setTimeout(function () { inp.focus(); }, 80);
  }

  function closeLoginModal() {
    var modal = document.getElementById('cq-login-modal');
    if (!modal) return;
    modal.style.display = 'none';
    clearModalError();
  }

  /* ── Dropdown ── */
  function closeDropdown() {
    var dd = document.getElementById('cq-user-dropdown');
    if (!dd) return;
    dd.classList.remove('open');
  }

  function toggleDropdown() {
    var dd = document.getElementById('cq-user-dropdown');
    if (!dd) return;
    if (dd.classList.contains('open')) {
      closeDropdown();
    } else {
      dd.classList.add('open');
    }
  }

  /* ── User button icon ── */
  function updateUserButton(user) {
    var btn = document.getElementById('cq-user-btn');
    if (!btn) return;
    if (user) {
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#34d399" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
      btn.classList.add('logged-in');
      btn.title = 'Signed in as ' + user.displayName;
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
      btn.classList.remove('logged-in');
      btn.title = 'Sign in';
    }
  }

  function updateDropdownUser(user) {
    var nameEl = document.getElementById('cq-dropdown-name');
    var emailEl = document.getElementById('cq-dropdown-email');
    if (nameEl) nameEl.textContent = user ? (user.displayName || 'Player') : 'Not signed in';
    if (emailEl) emailEl.textContent = user ? (user.email || '') : '';
  }

  /* ── Progress save / load (per-user localStorage) ── */
  function saveProgress() {
    if (!window.CQ_USER) return;
    var key = 'codequest_progress_' + window.CQ_USER.uid;
    var progress = localStorage.getItem('codequest_v2');
    var hints = localStorage.getItem('codequest_hint_points');
    if (progress) localStorage.setItem(key + '_progress', progress);
    if (hints)    localStorage.setItem(key + '_hints', hints);
  }

  function loadProgress() {
    if (!window.CQ_USER) return;
    var key = 'codequest_progress_' + window.CQ_USER.uid;
    var savedProgress = localStorage.getItem(key + '_progress');
    var savedHints    = localStorage.getItem(key + '_hints');
    // If there is per-user saved progress, restore it; otherwise clear global progress
    if (savedProgress) {
      localStorage.setItem('codequest_v2', savedProgress);
    } else {
      localStorage.removeItem('codequest_v2');
    }
    if (savedHints) {
      localStorage.setItem('codequest_hint_points', savedHints);
    } else {
      localStorage.removeItem('codequest_hint_points');
    }
  }

  /* ── Login ── */
  function login(username, password) {
    var key = (username || '').toLowerCase().trim();
    var user = USERS_DB[key];
    if (!user || user.password !== password) {
      showModalError('Incorrect username or password.');
      return;
    }
    clearModalError();
    window.CQ_USER = {
      uid: key,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      photoURL: null
    };
    localStorage.setItem('codequest_session', JSON.stringify(window.CQ_USER));
    loadProgress();
    // If the game is running, tell it to reload progress from localStorage
    try {
      if (window.CQ_GAME && typeof window.CQ_GAME.loadNow === 'function') {
        // small delay to let other modules settle
        setTimeout(function () { window.CQ_GAME.loadNow(); }, 40);
      }
    } catch (e) {}
    updateUserButton(window.CQ_USER);
    updateDropdownUser(window.CQ_USER);
    applyLoggedInState();
    closeLoginModal();
    // unlimited hints feature removed — hints now always cost points
    if (pendingAction) {
      var action = pendingAction;
      pendingAction = null;
      setTimeout(action, 60);
    }
  }

  /* ── Sign up ── */
  function signup(username, email, password, confirmPassword) {
    var key = (username || '').toLowerCase().trim();
    var emailTrimmed = (email || '').toLowerCase().trim();
    
    // Validation
    if (!key || key.length < 3) {
      showModalError('Username must be at least 3 characters.');
      return;
    }
    if (USERS_DB[key]) {
      showModalError('Username already taken. Please choose another.');
      return;
    }
    if (!emailTrimmed || !emailTrimmed.includes('@')) {
      showModalError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      showModalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      showModalError('Passwords do not match.');
      return;
    }
    
    // Create new user
    var displayName = username.charAt(0).toUpperCase() + username.slice(1);
    USERS_DB[key] = {
      password: password,
      displayName: displayName,
      email: emailTrimmed,
      role: 'student',
      unlimitedHints: false
    };
    
    clearModalError();
    // Auto-login after signup
    login(username, password);
  }

  /* ── Toggle sign in / sign up form ── */
  function switchAuthMode(mode) {
    var signinForm = document.getElementById('cq-signin-form');
    var signupForm = document.getElementById('cq-signup-form');
    var signinTab = document.getElementById('cq-signin-tab');
    var signupTab = document.getElementById('cq-signup-tab');
    
    if (!signinForm || !signupForm) return;
    
    clearModalError();
    
    if (mode === 'signup') {
      signinForm.style.display = 'none';
      signupForm.style.display = 'flex';
      signinTab.classList.remove('active');
      signupTab.classList.add('active');
      
      // Clear and focus first field in signup form
      var signupUsernameInput = document.getElementById('cq-signup-username-input');
      if (signupUsernameInput) {
        signupUsernameInput.value = '';
        setTimeout(function () { signupUsernameInput.focus(); }, 50);
      }
      document.getElementById('cq-email-input').value = '';
      document.getElementById('cq-signup-password-input').value = '';
      document.getElementById('cq-confirm-password-input').value = '';
    } else {
      signinForm.style.display = 'flex';
      signupForm.style.display = 'none';
      signinTab.classList.add('active');
      signupTab.classList.remove('active');
      
      // Clear and focus first field in signin form
      var usernameInput = document.getElementById('cq-username-input');
      if (usernameInput) {
        usernameInput.value = '';
        setTimeout(function () { usernameInput.focus(); }, 50);
      }
      document.getElementById('cq-password-input').value = '';
    }
  }

  /* ── Sign out ── */
  function signOut() {
    saveProgress();
    window.CQ_USER = null;
    localStorage.removeItem('codequest_session');
    closeDropdown();
    applyLoggedOutState();
    updateUserButton(null);
    updateDropdownUser(null);
    // ensure hints remain behind point system (no-op)
  }

  /* ── Logged-out / logged-in state ── */
  function applyLoggedOutState() {
    var startBtn = document.getElementById('startBtn');
    if (!startBtn) return;
    // DISABLED: Auth check blocking game startup
    // startBtn.disabled = true;
    // startBtn.style.opacity = '0.45';
    // startBtn.style.cursor = 'not-allowed';
    // startBtn.title = 'Please sign in to start playing';

    // if (!document.getElementById('cq-login-warning')) {
    //   var warn = document.createElement('p');
    //   warn.id = 'cq-login-warning';
    //   warn.textContent = '🔒 Please sign in to start playing';
    //   startBtn.insertAdjacentElement('afterend', warn);
    // }
  }

  function applyLoggedInState() {
    var startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.style.opacity = '';
      startBtn.style.cursor = '';
      startBtn.title = '';
    }
    var warn = document.getElementById('cq-login-warning');
    if (warn) warn.remove();
  }

  /* ── Restore session from localStorage ── */
  function restoreSession() {
    var raw = localStorage.getItem('codequest_session');
    if (!raw) {
      applyLoggedOutState();
      return;
    }
    try {
      var user = JSON.parse(raw);
      window.CQ_USER = user;
      loadProgress();
      updateUserButton(user);
      updateDropdownUser(user);
      applyLoggedInState();
      // unlimited hints removed; hints always cost points
    } catch (e) {
      localStorage.removeItem('codequest_session');
      applyLoggedOutState();
    }
  }

  /* ── Intercept start buttons ── */
  function attachStartInterceptors() {
    if (interceptAttached) return;
    var startBtn = document.getElementById('startBtn');
    if (!startBtn) return;

    startBtn.addEventListener('click', function (e) {
      if (!window.CQ_USER) {
        e.preventDefault();
        e.stopImmediatePropagation();
        pendingAction = function () { startBtn.click(); };
        openLoginModal();
      }
    }, true);

    /* hero CTA button (built by hero.js) — re-check after hero loads */
    setTimeout(function () {
      var heroCta = document.getElementById('hero-cta');
      if (heroCta && !heroCta.__cqAuthPatched) {
        heroCta.__cqAuthPatched = true;
        heroCta.addEventListener('click', function (e) {
          if (!window.CQ_USER) {
            e.preventDefault();
            e.stopImmediatePropagation();
            pendingAction = function () { heroCta.click(); };
            openLoginModal();
          }
        }, true);
      }
    }, 800);

    interceptAttached = true;
  }

  /* ── Build floating 👤 button ── */
  function buildUserButton() {
    if (document.getElementById('cq-user-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'cq-user-btn';
    btn.type = 'button';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
    btn.title = 'Sign in';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (window.CQ_USER) {
        toggleDropdown();
      } else {
        openLoginModal();
      }
    });
    document.body.appendChild(btn);
  }

  /* ── Build user dropdown ── */
  function buildDropdown() {
    if (document.getElementById('cq-user-dropdown')) return;
    var dd = document.createElement('div');
    dd.id = 'cq-user-dropdown';

    var name = document.createElement('div');
    name.id = 'cq-dropdown-name';
    name.textContent = 'Not signed in';

    var email = document.createElement('div');
    email.id = 'cq-dropdown-email';

    var signOutBtn = document.createElement('button');
    signOutBtn.id = 'cq-signout-btn';
    signOutBtn.type = 'button';
    signOutBtn.textContent = 'Sign Out';
    signOutBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      signOut();
    });

    dd.appendChild(name);
    dd.appendChild(email);
    dd.appendChild(signOutBtn);
    document.body.appendChild(dd);
  }

  /* ── Build login modal ── */
  function buildLoginModal() {
    if (document.getElementById('cq-login-modal')) return;

    var modal = document.createElement('div');
    modal.id = 'cq-login-modal';

    var card = document.createElement('div');
    card.id = 'cq-login-card';

    /* Close button */
    var close = document.createElement('button');
    close.id = 'cq-login-close';
    close.type = 'button';
    close.textContent = '✕';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', closeLoginModal);

    /* Logo */
    var logo = document.createElement('div');
    logo.id = 'cq-login-logo';
    logo.innerHTML = 'Code<span>Quest</span>';

    /* Subtitle */
    var sub = document.createElement('p');
    sub.id = 'cq-login-sub';
    sub.textContent = 'Sign in to keep your progress safe or switch accounts.';

    /* Tabs */
    var tabs = document.createElement('div');
    tabs.id = 'cq-login-tabs';

    var signinTab = document.createElement('button');
    signinTab.id = 'cq-signin-tab';
    signinTab.className = 'cq-login-tab active';
    signinTab.type = 'button';
    signinTab.textContent = 'Sign In';
    signinTab.addEventListener('click', function () { switchAuthMode('signin'); });

    var signupTab = document.createElement('button');
    signupTab.id = 'cq-signup-tab';
    signupTab.className = 'cq-login-tab';
    signupTab.type = 'button';
    signupTab.textContent = 'Sign Up';
    signupTab.addEventListener('click', function () { switchAuthMode('signup'); });

    tabs.appendChild(signinTab);
    tabs.appendChild(signupTab);

    /* ===== SIGN IN FORM ===== */
    var signinForm = document.createElement('div');
    signinForm.id = 'cq-signin-form';

    var usernameInput = document.createElement('input');
    usernameInput.id = 'cq-username-input';
    usernameInput.type = 'text';
    usernameInput.placeholder = 'Username';
    usernameInput.autocomplete = 'username';
    usernameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var passwordInput = document.getElementById('cq-password-input');
        login(usernameInput.value, passwordInput.value);
      }
    });

    var passwordInput = document.createElement('input');
    passwordInput.id = 'cq-password-input';
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.autocomplete = 'current-password';
    passwordInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        login(usernameInput.value, passwordInput.value);
      }
    });

    var submitBtn = document.createElement('button');
    submitBtn.id = 'cq-login-submit-btn';
    submitBtn.type = 'button';
    submitBtn.textContent = 'Sign In';
    submitBtn.addEventListener('click', function () {
      login(usernameInput.value, passwordInput.value);
    });

    signinForm.appendChild(usernameInput);
    signinForm.appendChild(passwordInput);
    signinForm.appendChild(submitBtn);

    /* ===== SIGN UP FORM ===== */
    var signupForm = document.createElement('div');
    signupForm.id = 'cq-signup-form';

    var signupUsernameInput = document.createElement('input');
    signupUsernameInput.id = 'cq-signup-username-input';
    signupUsernameInput.type = 'text';
    signupUsernameInput.placeholder = 'Username';
    signupUsernameInput.autocomplete = 'username';

    var signupEmailInput = document.createElement('input');
    signupEmailInput.id = 'cq-email-input';
    signupEmailInput.type = 'email';
    signupEmailInput.placeholder = 'Email';
    signupEmailInput.autocomplete = 'email';

    var signupPasswordInput = document.createElement('input');
    signupPasswordInput.id = 'cq-signup-password-input';
    signupPasswordInput.type = 'password';
    signupPasswordInput.placeholder = 'Password';
    signupPasswordInput.autocomplete = 'new-password';

    var confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.id = 'cq-confirm-password-input';
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.placeholder = 'Confirm Password';
    confirmPasswordInput.autocomplete = 'new-password';
    confirmPasswordInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        signup(signupUsernameInput.value, signupEmailInput.value, signupPasswordInput.value, confirmPasswordInput.value);
      }
    });

    var signupSubmitBtn = document.createElement('button');
    signupSubmitBtn.id = 'cq-signup-submit-btn';
    signupSubmitBtn.className = 'cq-login-submit-btn';
    signupSubmitBtn.type = 'button';
    signupSubmitBtn.textContent = 'Create Account';
    signupSubmitBtn.addEventListener('click', function () {
      signup(signupUsernameInput.value, signupEmailInput.value, signupPasswordInput.value, confirmPasswordInput.value);
    });

    signupForm.appendChild(signupUsernameInput);
    signupForm.appendChild(signupEmailInput);
    signupForm.appendChild(signupPasswordInput);
    signupForm.appendChild(confirmPasswordInput);
    signupForm.appendChild(signupSubmitBtn);

    /* Error */
    var err = document.createElement('p');
    err.id = 'cq-login-error';
    err.style.display = 'none';

    /* Note */
    var note = document.createElement('p');
    note.id = 'cq-login-note';
    note.textContent = 'Progress is automatically saved to this browser. Signing in lets you save it to your own account!';

    card.appendChild(close);
    card.appendChild(logo);
    card.appendChild(sub);
    card.appendChild(tabs);
    card.appendChild(signinForm);
    card.appendChild(signupForm);
    card.appendChild(err);
    card.appendChild(note);

    modal.appendChild(card);
    document.body.appendChild(modal);

    /* Backdrop click closes modal */
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeLoginModal();
    });
    card.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  /* ── Close dropdown when clicking outside ── */
  function initOutsideClick() {
    document.addEventListener('click', function (e) {
      var dd = document.getElementById('cq-user-dropdown');
      var btn = document.getElementById('cq-user-btn');
      if (!dd || !btn) return;
      if (!dd.contains(e.target) && e.target !== btn) {
        closeDropdown();
      }
    });
  }

  /* ── Auto-save ── */
  function initAutoSave() {
    window.addEventListener('beforeunload', saveProgress);
    setInterval(saveProgress, 90000);
  }

  /* ── Public API ── */
  window.CQ_AUTH = {
    signOut: signOut,
    getUser: function () { return window.CQ_USER; },
    saveNow: saveProgress,
    loadNow: loadProgress
  };

  /* ── Init ── */
  function init() {
    window.CQ_USER = null;
    buildUserButton();
    buildDropdown();
    buildLoginModal();
    initOutsideClick();
    initAutoSave();
    restoreSession();
    attachStartInterceptors();
    /* Re-check interceptors after hero.js injects its button */
    setTimeout(attachStartInterceptors, 500);
    setTimeout(restoreSession, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
