(function () {
  'use strict';

  var STORAGE_KEY = 'codequest_v2';
  var storage = window.CQ_STORAGE;

  var defaults = {
    currentLevel: 0,
    totalXP: 0,
    html: '',
    css: '',
    js: '',
    userName: 'Your Name',
    completedLevels: []
  };

  var data = Object.assign({}, defaults);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function initDefaults(initial) {
    defaults = Object.assign({}, defaults, clone(initial || {}));
    reset(false);
  }

  function save() {
    if (storage && storage.setJSON) {
      storage.setJSON(STORAGE_KEY, data);
      return;
    }
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function load() {
    if (storage && storage.getJSON) {
      var saved = storage.getJSON(STORAGE_KEY, null);
      if (saved) {
        Object.assign(data, clone(defaults), saved);
        if (!Array.isArray(data.completedLevels)) data.completedLevels = [];
      }
      return data;
    }
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return data;
      var stored = JSON.parse(raw);
      Object.assign(data, clone(defaults), stored);
      if (!Array.isArray(data.completedLevels)) data.completedLevels = [];
    } catch (e) {}
    return data;
  }

  function reset(shouldSave) {
    Object.keys(data).forEach(function (key) { delete data[key]; });
    Object.assign(data, clone(defaults));
    if (shouldSave !== false) save();
    return data;
  }

  function setProgress(currentLevel, totalXP) {
    data.currentLevel = currentLevel;
    data.totalXP = totalXP;
    save();
  }

  function updateCode(chapter, code) {
    if (chapter === 'HTML') data.html = code;
    if (chapter === 'CSS') data.css = (data.css + '\n' + code).trim();
    if (chapter === 'JS') data.js = (data.js + '\n' + code).trim();
    save();
  }

  function completeLevel(level) {
    if (!data.completedLevels.includes(level.id)) {
      data.completedLevels.push(level.id);
      data.totalXP += level.xp || 0;
      save();
      return true;
    }
    save();
    return false;
  }

  function setUserName(name) {
    if (name) data.userName = String(name).trim();
    save();
  }

  window.CQ_STATE = {
    data: data,
    initDefaults: initDefaults,
    load: load,
    save: save,
    reset: reset,
    setProgress: setProgress,
    updateCode: updateCode,
    completeLevel: completeLevel,
    setUserName: setUserName,
    storageKey: STORAGE_KEY
  };
})();
