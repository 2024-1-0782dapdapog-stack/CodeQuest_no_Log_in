(function () {
  'use strict';

  function safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function safeRemoveItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getString(key, fallback) {
    var value = safeGetItem(key);
    return value === null ? fallback : value;
  }

  function setString(key, value) {
    return safeSetItem(key, String(value));
  }

  function getJSON(key, fallback) {
    var raw = safeGetItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function setJSON(key, value) {
    try {
      return safeSetItem(key, JSON.stringify(value));
    } catch (e) {
      return false;
    }
  }

  window.CQ_STORAGE = {
    getString: getString,
    setString: setString,
    getJSON: getJSON,
    setJSON: setJSON,
    remove: safeRemoveItem
  };
})();