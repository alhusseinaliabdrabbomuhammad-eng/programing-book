/* assets/js/ui/dashboard.js — اللوحة الرئيسية */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;

  var Dashboard = (function () {
    function render(target) {
      DOM.clear(target);
      var stats = global.ProgressStore.getStats();

      target.appendChild(el('header', { class: 'page-header' }, [
        el('div', { class: 'page-header__eyebrow' }, ['📚 ', el('span', { text: 'كتاب البرمجة' })]),
        el('h1', { class: 'page-header__title', text: 'أهلًا بك في رحلة تعلّم البرمجة! 👋' }),
        el('p', { class: 'page-header__subtitle lead', text: 'ابدأ من الصفر مع ست لغات برمجة، خطوة بخطوة، بأسلوب بسيط ومشوّق. اختر لغتك الأولى وانطلق!' })
      ]));

      /* الإحصائيات */
      target.appendChild(el('div', { class: 'stats-grid' }, [
        statCard(global.Format.percent(stats.overallPercent), 'نسبة التقدّم الكلّي'),
        statCard(global.Format.toArabicDigits(stats.totalCompleted) + ' / ' + global.Format.toArabicDigits(stats.totalLessons), 'الدروس المكتملة'),
        statCard(global.Format.toArabicDigits(stats.streak), 'سلسلة أيام التعلّم 🔥'),
        statCard(global.Format.toArabicDigits(stats.quizzesTaken), 'الاختبارات المنجزة')
      ]));

      /* بطاقات اللغات */
      target.appendChild(el('h2', {}, ['اختر لغة برمجة لتبدأ 🚀']));
      var grid = el('div', { class: 'cards-grid' });
      global.Format.langKeys().forEach(function (key) {
        grid.appendChild(buildLangCard(key));
      });
      target.appendChild(grid);

      target.appendChild(el('aside', { class: 'callout callout--tip' }, [
        el('span', { class: 'callout__icon', text: '💡' }),
        el('div', { class: 'callout__body' }, [
          el('div', { class: 'callout__title', text: 'لا تقلق إن كنت مبتدئًا تمامًا!' }),
          el('p', { class: 'callout__text', text: 'كل درس مكتوب بلغة بسيطة وأمثلة من الحياة اليومية. تقدّم على راحتك، وكل خطأ هو جزء طبيعي من التعلّم.' })
        ])
      ]));
    }

    function statCard(value, label) {
      return el('div', { class: 'card stat-card' }, [
        el('div', { class: 'stat-card__value', text: value }),
        el('div', { class: 'stat-card__label', text: label })
      ]);
    }

    function buildLangCard(key) {
      var progress = global.ProgressStore.langProgress(key, 20);
      var card = el('article', {
        class: 'card lang-card',
        tabindex: '0',
        role: 'button',
        'aria-label': 'ابدأ تعلّم ' + global.Format.langName(key)
      }, [
        el('div', { class: 'lang-card__icon', text: global.Format.langIcon(key) }),
        el('h3', { class: 'lang-card__name', text: global.Format.langName(key) }),
        el('p', { class: 'lang-card__desc', text: global.Format.langDesc(key) }),
        el('div', { class: 'progress-bar' }, el('div', { class: 'progress-bar__fill', style: 'width:' + progress.percent + '%' })),
        el('div', { class: 'progress-text', text: global.Format.toArabicDigits(progress.completed) + ' / ٢٠ درس مكتمل' + (progress.quizPassed ? ' • اجتزت الاختبار 🏆' : '') })
      ]);

      function goto() { global.location.hash = '/' + key + '/lesson-1'; }
      card.addEventListener('click', goto);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(); }
      });
      return card;
    }

    return { render: render };
  })();

  global.Dashboard = Dashboard;
})(window);
