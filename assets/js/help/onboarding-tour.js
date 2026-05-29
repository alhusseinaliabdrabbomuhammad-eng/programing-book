/* assets/js/help/onboarding-tour.js — جولة تعريفية للزائر الأول (٨ خطوات) */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;

  var OnboardingTour = (function () {
    var root, current = 0;

    var steps = [
      { selector: '.navbar__logo', title: 'مرحبًا بك في كتاب البرمجة! 👋', text: 'هذه جولة سريعة من ٨ خطوات لتتعرّف على التطبيق. هذا هو شعار التطبيق، اضغطه دائمًا للعودة للرئيسية.' },
      { selector: '#lang-nav', title: 'لغات البرمجة الست 🌐', text: 'من هنا تختار اللغة التي تريد تعلّمها: بايثون، جافا، سي++، إتش تي إم إل، سي إس إس، وجافاسكربت.' },
      { selector: '#sidebar', title: 'القائمة الجانبية 🗺️', text: 'تظهر هنا على اليمين خارطة الطريق: عشرون درسًا لكل لغة بالإضافة إلى اختبار نهائي. علامة ✅ تعني أنك أكملت الدرس.' },
      { selector: '#main-content', title: 'منطقة المحتوى 📖', text: 'هنا تُعرض الدروس بأسلوب بسيط: شروحات، أمثلة برمجية، تمارين، ومتتبّع كود مرئي.' },
      { selector: '#theme-toggle', title: 'تبديل السمة 🌙', text: 'هل تفضّل الوضع الفاتح أم الداكن؟ اضغط هنا لتبديل مظهر التطبيق حسب راحة عينيك.' },
      { selector: '#global-help', title: 'المساعدة دائمًا متاحة ❓', text: 'كلما احتجت مساعدة، اضغط هذا الزر أو علامات [!] المنتشرة في التطبيق لتحصل على شرح للسياق الحالي.' },
      { selector: '#statusbar', title: 'شريط الحالة 📊', text: 'في الأسفل تتابع تقدّمك الكلّي وسلسلة أيام التعلّم، وتعرف أن التطبيق يعمل حتى دون اتصال بالإنترنت.' },
      { selector: '.navbar__sidebar-toggle', title: 'أنت جاهز للبدء! 🚀', text: 'يمكنك إظهار أو إخفاء القائمة من هذا الزر. الآن اختر لغتك الأولى وابدأ رحلتك. بالتوفيق!' }
    ];

    function init() {
      root = DOM.$('#tour-root');
      global.EventBus.on('tour:start', start);
    }

    function start() {
      current = 0;
      renderStep();
    }

    function renderStep() {
      DOM.clear(root);
      var step = steps[current];
      var targetEl = DOM.$(step.selector);
      if (!targetEl) { next(); return; }

      var rect = targetEl.getBoundingClientRect();

      var backdrop = el('div', { class: 'tour-backdrop' });
      var highlight = el('div', { class: 'tour-highlight' });
      highlight.style.top = (rect.top - 6) + 'px';
      highlight.style.left = (rect.left - 6) + 'px';
      highlight.style.width = (rect.width + 12) + 'px';
      highlight.style.height = (rect.height + 12) + 'px';

      var isLast = current === steps.length - 1;
      var nextBtn = el('button', { class: 'btn btn--primary' }, [isLast ? 'إنهاء الجولة ✓' : 'التالي ◀']);
      nextBtn.addEventListener('click', isLast ? finish : next);
      var skipBtn = el('button', { class: 'btn btn--ghost' }, ['تخطّي الجولة']);
      skipBtn.addEventListener('click', finish);

      var tooltip = el('div', { class: 'tour-tooltip', role: 'dialog', 'aria-label': step.title }, [
        el('div', { class: 'tour-tooltip__step', text: 'الخطوة ' + global.Format.toArabicDigits(current + 1) + ' من ' + global.Format.toArabicDigits(steps.length) }),
        el('h3', { class: 'tour-tooltip__title', text: step.title }),
        el('p', { class: 'tour-tooltip__text', text: step.text }),
        el('div', { class: 'tour-tooltip__actions' }, [skipBtn, nextBtn])
      ]);

      backdrop.addEventListener('click', finish);
      root.appendChild(backdrop);
      root.appendChild(highlight);
      root.appendChild(tooltip);

      /* وضع التلميح */
      var top = rect.bottom + 12;
      if (top + 200 > global.innerHeight) top = Math.max(12, rect.top - 220);
      var left = Math.min(Math.max(12, rect.left), global.innerWidth - 340);
      tooltip.style.top = top + 'px';
      tooltip.style.left = left + 'px';
      nextBtn.focus();
    }

    function next() { current++; if (current >= steps.length) finish(); else renderStep(); }

    function finish() {
      DOM.clear(root);
      global.ProgressStore.setTourDone();
    }

    return { init: init, start: start };
  })();

  global.OnboardingTour = OnboardingTour;
})(window);
