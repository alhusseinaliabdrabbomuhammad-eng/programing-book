/* assets/js/core/router.js — توجيه بالتجزئة (#/...) */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;

  var Router = (function () {
    var view, validLangs;

    function init() {
      view = DOM.$('#app-view');
      validLangs = global.Format.langKeys();
      global.addEventListener('hashchange', handleRoute);
      handleRoute();
    }

    function parseHash() {
      var hash = (global.location.hash || '').replace(/^#/, '');
      if (!hash || hash === '/') return { view: 'dashboard' };
      var parts = hash.replace(/^\//, '').split('/');

      if (parts[0] === 'dashboard') return { view: 'dashboard' };

      var lang = parts[0];
      if (validLangs.indexOf(lang) === -1) return { view: 'notfound' };

      if (parts[1] === 'quiz') return { view: 'quiz', lang: lang };

      var lessonMatch = /^lesson-(\d+)$/.exec(parts[1] || '');
      if (lessonMatch) {
        var num = parseInt(lessonMatch[1], 10);
        if (num >= 1 && num <= 20) {
          return { view: 'lesson', lang: lang, lessonId: parts[1], lessonNumber: num };
        }
      }
      return { view: 'notfound', lang: lang };
    }

    function handleRoute() {
      var route = parseHash();
      global.EventBus.emit('route:changed', route);
      DOM.$('#main-content').focus();
      global.scrollTo(0, 0);

      switch (route.view) {
        case 'dashboard': global.Dashboard.render(view); break;
        case 'lesson': renderLesson(route); break;
        case 'quiz': renderQuiz(route); break;
        default: renderNotFound();
      }
    }

    function showLoading() {
      DOM.clear(view);
      var sk = el('div', { class: 'skeleton-screen' }, [
        el('div', { class: 'skeleton skeleton-line skeleton-line--title' }),
        el('div', { class: 'skeleton skeleton-line' }),
        el('div', { class: 'skeleton skeleton-line' }),
        el('div', { class: 'skeleton skeleton-block' }),
        el('div', { class: 'skeleton skeleton-line' }),
        el('div', { class: 'skeleton skeleton-line skeleton-line--short' })
      ]);
      view.appendChild(sk);
    }

    function renderLesson(route) {
      showLoading();
      global.DataLoader.loadLesson(route.lang, route.lessonId)
        .then(function (lesson) {
          var ctx = {
            lang: route.lang,
            lessonId: route.lessonId,
            lessonNumber: route.lessonNumber,
            prevRoute: route.lessonNumber > 1 ? '/' + route.lang + '/lesson-' + (route.lessonNumber - 1) : null,
            nextRoute: route.lessonNumber < 20
              ? '/' + route.lang + '/lesson-' + (route.lessonNumber + 1)
              : '/' + route.lang + '/quiz'
          };
          global.LessonEngine.render(view, lesson, ctx);
          global.ProgressStore.addTime(2);
        })
        .catch(function (err) { renderError(err, route); });
    }

    function renderQuiz(route) {
      showLoading();
      global.DataLoader.loadQuiz(route.lang)
        .then(function (quiz) { global.QuizEngine.render(view, quiz, { lang: route.lang }); })
        .catch(function (err) { renderError(err, route); });
    }

    function renderError(err, route) {
      console.error('[Router]', err);
      DOM.clear(view);
      view.appendChild(el('div', { class: 'error-box' }, [
        el('h2', { text: '😔 تعذّر تحميل المحتوى' }),
        el('p', { text: 'لم نتمكّن من تحميل هذا الدرس. قد لا يكون متوفّرًا بعد أو حدث خطأ في الشبكة.' }),
        el('a', { class: 'btn btn--primary', href: '#/dashboard' }, ['العودة إلى اللوحة الرئيسية'])
      ]));
    }

    function renderNotFound() {
      DOM.clear(view);
      view.appendChild(el('div', { class: 'error-box' }, [
        el('h2', { text: '🔍 الصفحة غير موجودة' }),
        el('p', { text: 'الرابط الذي طلبته غير صحيح.' }),
        el('a', { class: 'btn btn--primary', href: '#/dashboard' }, ['العودة إلى اللوحة الرئيسية'])
      ]));
    }

    return { init: init };
  })();

  global.Router = Router;
})(window);
