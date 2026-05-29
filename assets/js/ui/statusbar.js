/* assets/js/ui/statusbar.js — شريط الحالة السفلي */
(function (global) {
  'use strict';

  var DOM = global.DOM;

  var StatusBar = (function () {
    function init() {
      update(global.ProgressStore.getStats());

      global.EventBus.on('progress:updated', function (stats) { update(stats); });
      global.EventBus.on('route:changed', function (route) { updateLocation(route); });
      global.EventBus.on('lesson:loaded', function (data) {
        DOM.$('#status-location').textContent = '📍 ' + global.Format.langName(data.lang) + ' • ' + data.title;
      });

      updateOnline();
      global.addEventListener('online', updateOnline);
      global.addEventListener('offline', updateOnline);
    }

    function update(stats) {
      DOM.$('#status-progress').textContent = '📊 التقدّم الكلّي: ' + global.Format.percent(stats.overallPercent);
      DOM.$('#status-streak').textContent = '🔥 سلسلة الأيام: ' + global.Format.toArabicDigits(stats.streak);
    }

    function updateLocation(route) {
      var locEl = DOM.$('#status-location');
      if (route.view === 'dashboard') locEl.textContent = '📍 اللوحة الرئيسية';
      else if (route.view === 'quiz') locEl.textContent = '📍 ' + global.Format.langName(route.lang) + ' • الاختبار النهائي';
    }

    function updateOnline() {
      var eln = DOM.$('#status-online');
      if (global.navigator.onLine) {
        eln.textContent = '🟢 متصل (جاهز دون اتصال أيضًا)';
      } else {
        eln.textContent = '🟠 دون اتصال — التطبيق يعمل بالكامل';
      }
    }

    return { init: init };
  })();

  global.StatusBar = StatusBar;
})(window);
