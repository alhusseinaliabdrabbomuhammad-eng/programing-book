/* assets/js/ui/navbar.js — شريط التنقّل العلوي */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;

  var Navbar = (function () {
    var navEl, currentLang = null;

    function init() {
      navEl = DOM.$('#lang-nav');
      renderLangs();
      bindActions();

      global.EventBus.on('route:changed', function (route) {
        setActiveLang(route.lang || null);
      });
      global.EventBus.on('theme:changed', function (theme) {
        var btn = DOM.$('#theme-toggle');
        if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
      });
    }

    function renderLangs() {
      DOM.clear(navEl);
      global.Format.langKeys().forEach(function (key) {
        var btn = el('button', {
          class: 'lang-btn',
          dataset: { lang: key },
          'aria-label': 'دروس لغة ' + global.Format.langName(key)
        }, [
          el('span', { class: 'lang-btn__icon', text: global.Format.langIcon(key) }),
          el('span', { class: 'lang-btn__label', text: global.Format.langName(key) })
        ]);
        btn.addEventListener('click', function () {
          global.location.hash = '/' + key + '/lesson-1';
        });
        navEl.appendChild(btn);
      });
    }

    function setActiveLang(lang) {
      currentLang = lang;
      DOM.$all('.lang-btn', navEl).forEach(function (b) {
        b.setAttribute('aria-current', b.dataset.lang === lang ? 'true' : 'false');
      });
    }

    function bindActions() {
      DOM.$('#home-btn').addEventListener('click', function () { global.location.hash = '/dashboard'; });
      DOM.$('#sidebar-toggle').addEventListener('click', function () {
        var layout = DOM.$('.layout');
        var collapsed = layout.classList.toggle('sidebar-collapsed');
        this.setAttribute('aria-expanded', String(!collapsed));
      });
      DOM.$('#theme-toggle').addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme') || 'dark';
        var next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        global.ProgressStore.setTheme(next);
        global.EventBus.emit('theme:changed', next);
      });
      DOM.$('#global-help').addEventListener('click', function () {
        global.EventBus.emit('help:requested', { topic: 'global' });
      });
      DOM.$('#sidebar-help').addEventListener('click', function () {
        global.EventBus.emit('help:requested', { topic: 'sidebar' });
      });
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      var btn = DOM.$('#theme-toggle');
      if (btn) btn.textContent = theme === 'dark' ? '🌙' : '☀️';
    }

    return { init: init, applyTheme: applyTheme };
  })();

  global.Navbar = Navbar;
})(window);
