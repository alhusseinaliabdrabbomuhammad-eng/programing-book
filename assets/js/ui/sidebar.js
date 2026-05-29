/* assets/js/ui/sidebar.js — القائمة الجانبية (شجرة خارطة الطريق) */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;

  var Sidebar = (function () {
    var bodyEl, titleEl, currentLang = null, currentLessonId = null;

    function init() {
      bodyEl = DOM.$('#sidebar-body');
      titleEl = DOM.$('#sidebar-title');

      global.EventBus.on('route:changed', function (route) {
        currentLessonId = route.lessonId || (route.view === 'quiz' ? 'quiz' : null);
        if (route.lang && route.lang !== currentLang) {
          loadRoadmap(route.lang);
        } else {
          highlightActive();
        }
        if (!route.lang) {
          renderDashboardHint();
        }
      });

      global.EventBus.on('lesson:completed', function () { highlightActive(); refreshStatuses(); });
      global.EventBus.on('quiz:completed', function () { refreshStatuses(); });
    }

    function renderDashboardHint() {
      currentLang = null;
      titleEl.textContent = 'خارطة الطريق';
      DOM.clear(bodyEl);
      bodyEl.appendChild(el('p', { class: 'sidebar__hint', text: 'اختر لغة برمجة من الأعلى لعرض دروسها العشرين والاختبار النهائي.' }));
    }

    function loadRoadmap(lang) {
      currentLang = lang;
      titleEl.textContent = global.Format.langIcon(lang) + ' ' + global.Format.langName(lang);
      showSkeleton();
      global.DataLoader.loadRoadmap(lang)
        .then(function (roadmap) { renderRoadmap(lang, roadmap); })
        .catch(function (err) {
          console.error(err);
          DOM.clear(bodyEl);
          bodyEl.appendChild(el('p', { class: 'sidebar__hint', text: 'تعذّر تحميل خارطة الطريق.' }));
        });
    }

    function showSkeleton() {
      DOM.clear(bodyEl);
      var sk = el('div', { class: 'skeleton-screen' });
      for (var i = 0; i < 8; i++) sk.appendChild(el('div', { class: 'skeleton skeleton-line' }));
      bodyEl.appendChild(sk);
    }

    function renderRoadmap(lang, roadmap) {
      DOM.clear(bodyEl);
      var groups = roadmap.groups || [{ title: 'الدروس', lessons: roadmap.lessons || [] }];

      groups.forEach(function (group, gi) {
        var listEl = el('div', { class: 'roadmap-group__list', role: 'list' });
        (group.lessons || []).forEach(function (lesson) {
          listEl.appendChild(buildLessonLink(lang, lesson));
        });

        var headerBtn = el('button', { class: 'roadmap-group__header', 'aria-expanded': 'true' }, [
          el('span', { text: group.title }),
          el('span', { class: 'roadmap-group__chevron', text: '▾' })
        ]);

        var groupEl = el('div', { class: 'roadmap-group', 'aria-expanded': 'true' }, [headerBtn, listEl]);
        headerBtn.addEventListener('click', function () {
          var open = groupEl.getAttribute('aria-expanded') === 'true';
          groupEl.setAttribute('aria-expanded', String(!open));
          headerBtn.setAttribute('aria-expanded', String(!open));
        });
        bodyEl.appendChild(groupEl);
      });

      /* رابط الاختبار النهائي */
      var quizLink = el('a', {
        class: 'lesson-link is-quiz',
        href: '#/' + lang + '/quiz',
        dataset: { lessonId: 'quiz' }
      }, [
        el('span', { class: 'lesson-link__status', text: '🏁' }),
        el('span', { class: 'lesson-link__title', text: 'الاختبار النهائي' })
      ]);
      bodyEl.appendChild(quizLink);

      refreshStatuses();
      highlightActive();
    }

    function buildLessonLink(lang, lesson) {
      var link = el('a', {
        class: 'lesson-link',
        href: '#/' + lang + '/' + lesson.id,
        dataset: { lessonId: lesson.id }
      }, [
        el('span', { class: 'lesson-link__status' }),
        el('span', { class: 'lesson-link__num', text: global.Format.toArabicDigits(lesson.number) }),
        el('span', { class: 'lesson-link__title', text: lesson.title })
      ]);
      return link;
    }

    function refreshStatuses() {
      if (!currentLang) return;
      DOM.$all('.lesson-link', bodyEl).forEach(function (link) {
        var id = link.dataset.lessonId;
        if (id === 'quiz') {
          var res = global.ProgressStore.getQuizResult(currentLang);
          link.querySelector('.lesson-link__status').textContent = res ? '🏆' : '🏁';
          return;
        }
        var done = global.ProgressStore.isLessonCompleted(currentLang, id);
        var status = link.querySelector('.lesson-link__status');
        if (status) status.textContent = done ? '✅' : '⚪';
      });
    }

    function highlightActive() {
      DOM.$all('.lesson-link', bodyEl).forEach(function (link) {
        link.setAttribute('aria-current', link.dataset.lessonId === currentLessonId ? 'true' : 'false');
      });
    }

    return { init: init };
  })();

  global.Sidebar = Sidebar;
})(window);
