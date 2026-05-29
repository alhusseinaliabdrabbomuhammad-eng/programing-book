/* assets/js/core/event-bus.js — ناقل الأحداث المركزي (نشر/اشتراك) */
(function (global) {
  'use strict';

  var EventBus = (function () {
    var listeners = {};

    /** الاشتراك في حدث، يُعيد دالة لإلغاء الاشتراك */
    function on(event, callback) {
      if (typeof callback !== 'function') return function () {};
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
      return function off() {
        listeners[event] = (listeners[event] || []).filter(function (cb) { return cb !== callback; });
      };
    }

    /** الاشتراك لمرة واحدة */
    function once(event, callback) {
      var off = on(event, function (data) {
        off();
        callback(data);
      });
      return off;
    }

    /** نشر حدث مع بيانات */
    function emit(event, data) {
      (listeners[event] || []).slice().forEach(function (cb) {
        try {
          cb(data);
        } catch (err) {
          console.error('[EventBus] خطأ في معالج الحدث "' + event + '":', err);
        }
      });
    }

    return { on: on, once: once, emit: emit };
  })();

  global.EventBus = EventBus;
})(window);
