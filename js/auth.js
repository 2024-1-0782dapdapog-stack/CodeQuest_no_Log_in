(function () {
  'use strict';

  var USERS_DB = {};
  var USERS_STORAGE_KEY = 'codequest_users_v2';
  var LEGACY_USERS_STORAGE_KEY = 'codequest_users_v1';
  var SESSION_KEY = 'codequest_session';
  var storage = window.CQ_STORAGE;

  var pendingAction = null;
  var interceptAttached = false;

  function getString(key, fallback) {
    if (storage && storage.getString) return storage.getString(key, fallback);
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (e) {
      return fallback;
    }
  }

  function setString(key, value) {
    if (storage && storage.setString) return storage.setString(key, value);
    try {
      localStorage.setItem(key, String(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function getJSON(key, fallback) {
    if (storage && storage.getJSON) return storage.getJSON(key, fallback);
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function setJSON(key, value) {
    if (storage && storage.setJSON) return storage.setJSON(key, value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  function removeKey(key) {
    if (storage && storage.remove) return storage.remove(key);
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function normalizeUsername(username) {
    return (username || '').toLowerCase().trim();
  }

  function isValidUsername(username) {
    return /^[a-z0-9_]{3,24}$/.test(username);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function sha256Hex(input) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return Promise.resolve('plain:' + input);
    }
    var encoder = new TextEncoder();
    return window.crypto.subtle.digest('SHA-256', encoder.encode(input)).then(function (buffer) {
      var bytes = new Uint8Array(buffer);
      var hex = '';
      for (var i = 0; i < bytes.length; i += 1) {
        var part = bytes[i].toString(16);
        hex += part.length === 1 ? '0' + part : part;
      }
      return hex;
    }).catch(function () {
      return 'plain:' + input;
    });
  }

  function hashPassword(password) {
    return sha256Hex(String(password || ''));
  }

  function loadUsers() {
    var savedUsers = getJSON(USERS_STORAGE_KEY, null);
    if (!savedUsers) {
      var legacyUsers = getJSON(LEGACY_USERS_STORAGE_KEY, null);
      if (legacyUsers && typeof legacyUsers === 'object') {
        savedUsers = legacyUsers;
      }
    }

    if (!savedUsers || typeof savedUsers !== 'object') return;

    Object.keys(savedUsers).forEach(function (key) {
      USERS_DB[key] = savedUsers[key];
    });

    // Remove common demo accounts from older builds.
    ['admin', 'student1', 'student2'].forEach(function (legacyUser) {
      if (USERS_DB[legacyUser] && USERS_DB[legacyUser].email && /@codequest\.com$/i.test(USERS_DB[legacyUser].email)) {
        delete USERS_DB[legacyUser];
      }
    });

    saveUsers();
    removeKey(LEGACY_USERS_STORAGE_KEY);
  }

  function saveUsers() {
    setJSON(USERS_STORAGE_KEY, USERS_DB);
  }

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

  function openLoginModal() {
    var modal = document.getElementById('cq-login-modal');
    if (!modal) return;
    clearModalError();
    switchAuthMode('signin');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    var inp = document.getElementById('cq-username-input');
    if (inp) setTimeout(function () { inp.focus(); }, 80);
  }

  function closeLoginModal() {
    var modal = document.getElementById('cq-login-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    clearModalError();
  }

  function closeDropdown() {
    var dd = document.getElementById('cq-user-dropdown');
    if (!dd) return;
    dd.classList.remove('open');
  }

  function toggleDropdown() {
    var dd = document.getElementById('cq-user-dropdown');
    if (!dd) return;
    dd.classList.toggle('open');
  }

  function updateUserButton(user) {
    var btn = document.getElementById('cq-user-btn');
    if (!btn) return;
    if (user) {
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#34d399" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
      btn.classList.add('logged-in');
      btn.title = 'Signed in as ' + user.displayName;
      btn.setAttribute('aria-label', 'Signed in as ' + user.displayName);
    } else {
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
      btn.classList.remove('logged-in');
      btn.title = 'Sign in';
      btn.setAttribute('aria-label', 'Open sign in dialog');
    }
  }

  function updateDropdownUser(user) {
    var nameEl = document.getElementById('cq-dropdown-name');
    var emailEl = document.getElementById('cq-dropdown-email');
    if (nameEl) nameEl.textContent = user ? (user.displayName || 'Player') : 'Not signed in';
    if (emailEl) emailEl.textContent = user ? (user.email || '') : '';
  }

  function saveProgress() {
    if (!window.CQ_USER) return;
    var key = 'codequest_progress_' + window.CQ_USER.uid;
    var progress = getString('codequest_v2', null);
    var hints = getString('codequest_hint_points', null);
    if (progress) setString(key + '_progress', progress);
    if (hints) setString(key + '_hints', hints);
  }

  function loadProgress() {
    if (!window.CQ_USER) return;
    var key = 'codequest_progress_' + window.CQ_USER.uid;
    var savedProgress = getString(key + '_progress', null);
    var savedHints = getString(key + '_hints', null);
    if (savedProgress) setString('codequest_v2', savedProgress);
    else removeKey('codequest_v2');

    if (savedHints) setString('codequest_hint_points', savedHints);
    else removeKey('codequest_hint_points');
  }

  function verifyAndMaybeMigratePassword(key, user, providedPassword) {
    if (!user) return Promise.resolve(false);
    if (user.passwordHash) {
      return hashPassword(providedPassword).then(function (hashed) {
        return user.passwordHash === hashed;
      });
    }
    if (!user.password) return Promise.resolve(false);
    if (user.password !== providedPassword) return Promise.resolve(false);

    return hashPassword(providedPassword).then(function (hashed) {
      user.passwordHash = hashed;
      delete user.password;
      USERS_DB[key] = user;
      saveUsers();
      return true;
    });
  }

  function login(username, password) {
    var key = normalizeUsername(username);
    var user = USERS_DB[key];

    return verifyAndMaybeMigratePassword(key, user, password).then(function (ok) {
      if (!ok) {
        showModalError('Incorrect username or password.');
        return;
      }

      clearModalError();
      window.CQ_USER = {
        uid: key,
        displayName: user.displayName,
        email: user.email,
        role: user.role || 'student',
        photoURL: null
      };

      setJSON(SESSION_KEY, window.CQ_USER);
      loadProgress();

      try {
        if (window.CQ_GAME && typeof window.CQ_GAME.loadNow === 'function') {
          setTimeout(function () { window.CQ_GAME.loadNow(); }, 40);
        }
      } catch (e) {}

      updateUserButton(window.CQ_USER);
      updateDropdownUser(window.CQ_USER);
      applyLoggedInState();
      closeLoginModal();

      if (pendingAction) {
        var action = pendingAction;
        pendingAction = null;
        setTimeout(action, 60);
      }
    }).catch(function () {
      showModalError('Sign in failed. Please try again.');
    });
  }

  function signup(username, email, password, confirmPassword) {
    var key = normalizeUsername(username);
    var emailTrimmed = (email || '').toLowerCase().trim();

    if (!isValidUsername(key)) {
      showModalError('Username must be 3-24 chars (letters, numbers, underscore).');
      return Promise.resolve();
    }
    if (USERS_DB[key]) {
      showModalError('Username already taken. Please choose another.');
      return Promise.resolve();
    }
    if (!isValidEmail(emailTrimmed)) {
      showModalError('Please enter a valid email address.');
      return Promise.resolve();
    }
    if (!password || password.length < 8) {
      showModalError('Password must be at least 8 characters.');
      return Promise.resolve();
    }
    if (password !== confirmPassword) {
      showModalError('Passwords do not match.');
      return Promise.resolve();
    }

    return hashPassword(password).then(function (passwordHash) {
      var displayName = username.trim().charAt(0).toUpperCase() + username.trim().slice(1);
      USERS_DB[key] = {
        passwordHash: passwordHash,
        displayName: displayName,
        email: emailTrimmed,
        role: 'student',
        unlimitedHints: false
      };
      saveUsers();
      clearModalError();
      return login(username, password);
    }).catch(function () {
      showModalError('Could not create account. Please try again.');
    });
  }

  function switchAuthMode(mode) {
    var signinForm = document.getElementById('cq-signin-form');
    var signupForm = document.getElementById('cq-signup-form');
    var signinTab = document.getElementById('cq-signin-tab');
    var signupTab = document.getElementById('cq-signup-tab');
    if (!signinForm || !signupForm || !signinTab || !signupTab) return;

    clearModalError();

    if (mode === 'signup') {
      signinForm.style.display = 'none';
      signupForm.style.display = 'flex';
      signinTab.classList.remove('active');
      signupTab.classList.add('active');
      var signupUsernameInput = document.getElementById('cq-signup-username-input');
      if (signupUsernameInput) {
        signupUsernameInput.value = '';
        setTimeout(function () { signupUsernameInput.focus(); }, 50);
      }
      var emailInput = document.getElementById('cq-email-input');
      var passInput = document.getElementById('cq-signup-password-input');
      var confirmInput = document.getElementById('cq-confirm-password-input');
      if (emailInput) emailInput.value = '';
      if (passInput) passInput.value = '';
      if (confirmInput) confirmInput.value = '';
    } else {
      signinForm.style.display = 'flex';
      signupForm.style.display = 'none';
      signinTab.classList.add('active');
      signupTab.classList.remove('active');
      var usernameInput = document.getElementById('cq-username-input');
      if (usernameInput) {
        usernameInput.value = '';
        setTimeout(function () { usernameInput.focus(); }, 50);
      }
      var passwordInput = document.getElementById('cq-password-input');
      if (passwordInput) passwordInput.value = '';
    }
  }

  function signOut() {
    saveProgress();
    window.CQ_USER = null;
    removeKey(SESSION_KEY);
    closeDropdown();
    applyLoggedOutState();
    updateUserButton(null);
    updateDropdownUser(null);
  }

  function applyLoggedOutState() {
    var startBtn = document.getElementById('startBtn');
    if (!startBtn) return;
    startBtn.disabled = false;
  }

  function applyLoggedInState() {
    var startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.disabled = false;
    var warn = document.getElementById('cq-login-warning');
    if (warn) warn.remove();
  }

  function restoreSession() {
    var user = getJSON(SESSION_KEY, null);
    if (!user) {
      applyLoggedOutState();
      return;
    }

    window.CQ_USER = user;
    loadProgress();
    updateUserButton(user);
    updateDropdownUser(user);
    applyLoggedInState();
  }

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

    interceptAttached = true;
  }

  function attachHeroInterceptor() {
    var heroCta = document.getElementById('hero-cta');
    if (!heroCta || heroCta.__cqAuthPatched) return;
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

  function watchHeroInterceptor() {
    attachHeroInterceptor();
    if (document.getElementById('hero-cta')) return;

    var observer = new MutationObserver(function () {
      attachHeroInterceptor();
      if (document.getElementById('hero-cta')) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function buildUserButton() {
    if (document.getElementById('cq-user-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'cq-user-btn';
    btn.type = 'button';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z"/></svg>';
    btn.title = 'Sign in';
    btn.setAttribute('aria-label', 'Open sign in dialog');

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (window.CQ_USER) toggleDropdown();
      else openLoginModal();
    });

    document.body.appendChild(btn);
  }

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

  function buildLoginModal() {
    if (document.getElementById('cq-login-modal')) return;

    var modal = document.createElement('div');
    modal.id = 'cq-login-modal';
    modal.setAttribute('aria-hidden', 'true');

    var card = document.createElement('div');
    card.id = 'cq-login-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', 'Sign in dialog');

    var close = document.createElement('button');
    close.id = 'cq-login-close';
    close.type = 'button';
    close.textContent = 'X';
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', closeLoginModal);

    var logo = document.createElement('div');
    logo.id = 'cq-login-logo';
    logo.innerHTML = 'Code<span>Quest</span>';

    var sub = document.createElement('p');
    sub.id = 'cq-login-sub';
    sub.textContent = 'Create a local account to save progress in this browser.';

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

    var signinForm = document.createElement('div');
    signinForm.id = 'cq-signin-form';

    var usernameInput = document.createElement('input');
    usernameInput.id = 'cq-username-input';
    usernameInput.type = 'text';
    usernameInput.placeholder = 'Username';
    usernameInput.autocomplete = 'username';

    var passwordInput = document.createElement('input');
    passwordInput.id = 'cq-password-input';
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.autocomplete = 'current-password';

    usernameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') login(usernameInput.value, passwordInput.value);
    });
    passwordInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') login(usernameInput.value, passwordInput.value);
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

    var signupForm = document.createElement('div');
    signupForm.id = 'cq-signup-form';

    var signupUsernameInput = document.createElement('input');
    signupUsernameInput.id = 'cq-signup-username-input';
    signupUsernameInput.type = 'text';
    signupUsernameInput.placeholder = 'Username (letters, numbers, underscore)';
    signupUsernameInput.autocomplete = 'username';

    var signupEmailInput = document.createElement('input');
    signupEmailInput.id = 'cq-email-input';
    signupEmailInput.type = 'email';
    signupEmailInput.placeholder = 'Email';
    signupEmailInput.autocomplete = 'email';

    var signupPasswordInput = document.createElement('input');
    signupPasswordInput.id = 'cq-signup-password-input';
    signupPasswordInput.type = 'password';
    signupPasswordInput.placeholder = 'Password (8+ characters)';
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

    var err = document.createElement('p');
    err.id = 'cq-login-error';
    err.style.display = 'none';

    var note = document.createElement('p');
    note.id = 'cq-login-note';
    note.textContent = 'Accounts are stored locally in this browser. Use only for learning and demos.';

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

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeLoginModal();
    });
    card.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  function initOutsideClick() {
    document.addEventListener('click', function (e) {
      var dd = document.getElementById('cq-user-dropdown');
      var btn = document.getElementById('cq-user-btn');
      if (!dd || !btn) return;
      if (!dd.contains(e.target) && e.target !== btn) closeDropdown();
    });
  }

  function initAutoSave() {
    window.addEventListener('beforeunload', saveProgress);
    setInterval(saveProgress, 90000);
  }

  window.CQ_AUTH = {
    signOut: signOut,
    getUser: function () { return window.CQ_USER; },
    saveNow: saveProgress,
    loadNow: loadProgress
  };

  function init() {
    loadUsers();
    window.CQ_USER = null;
    buildUserButton();
    buildDropdown();
    buildLoginModal();
    initOutsideClick();
    initAutoSave();
    restoreSession();
    attachStartInterceptors();
    watchHeroInterceptor();
    setTimeout(attachStartInterceptors, 500);
    setTimeout(attachHeroInterceptor, 500);
    setTimeout(restoreSession, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
