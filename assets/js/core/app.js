/* assets/js/core/app.js — نقطة انطلاق التطبيق */
(function (global) {
  'use strict';

  function boot() {
    /* تطبيق السمة المحفوظة */
    var theme = global.ProgressStore.getTheme();
    global.Navbar.applyTheme(theme);

    /* تهيئة الوحدات */
    global.Navbar.init();
    global.Sidebar.init();
    global.StatusBar.init();
    global.HelpSystem.init();
    global.OnboardingTour.init();
    global.Router.init();

    /* تسجيل عامل الخدمة للعمل دون اتصال */
    if ('serviceWorker' in global.navigator) {
      global.navigator.serviceWorker.register('sw.js').catch(function (err) {
        console.warn('[App] تعذّر تسجيل عامل الخدمة:', err);
      });
    }

    /* بدء الجولة التعريفية للزائر الأول */
    if (global.ProgressStore.isFirstVisit()) {
      setTimeout(function () { global.EventBus.emit('tour:start'); }, 700);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
