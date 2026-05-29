/* assets/js/learning/quiz-engine.js — محرك الاختبارات النهائية */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;

  /**
   * عرض اختبار.
   * quiz: { title, questions: [{ type:'multiple-choice'|'true-false', prompt, options, answer, explanation }] }
   * ctx: { lang }
   */
  function render(target, quiz, ctx) {
    DOM.clear(target);
    var questions = quiz.questions || [];
    var idx = 0;
    var score = 0;
    var answered = false;

    target.appendChild(el('header', { class: 'page-header' }, [
      el('div', { class: 'page-header__eyebrow' }, [
        global.Format.langIcon(ctx.lang) + ' ',
        el('span', { text: 'الاختبار النهائي — ' + global.Format.langName(ctx.lang) })
      ]),
      el('h1', { class: 'page-header__title', text: quiz.title || 'الاختبار النهائي' }),
      el('p', { class: 'page-header__subtitle', text: 'أجب عن الأسئلة بهدوء، وستظهر لك النتيجة في النهاية. حظًّا موفّقًا! 🌟' })
    ]));

    var host = el('div', { class: 'quiz' });
    target.appendChild(host);

    function renderQuestion() {
      DOM.clear(host);
      answered = false;
      var q = questions[idx];
      var percent = Math.round((idx / questions.length) * 100);

      host.appendChild(el('div', { class: 'quiz__progress' }, [
        el('span', { text: 'السؤال ' + global.Format.toArabicDigits(idx + 1) + ' من ' + global.Format.toArabicDigits(questions.length) }),
        el('span', { text: 'النقاط: ' + global.Format.toArabicDigits(score) })
      ]));
      host.appendChild(el('div', { class: 'quiz__bar' }, el('div', { class: 'quiz__bar-fill', style: 'width:' + percent + '%' })));

      var options = q.type === 'true-false' ? ['صحيح', 'خطأ'] : (q.options || []);
      var optionEls = [];
      var optionsHost = el('div', { class: 'quiz-question__options' });

      options.forEach(function (opt, oi) {
        var optEl = el('button', { class: 'quiz-option', type: 'button' }, [
          el('span', { text: String.fromCharCode(0x0623 + 0) }), // placeholder removed below
          el('span', { text: opt })
        ]);
        DOM.clear(optEl);
        optEl.appendChild(el('span', { text: opt }));
        optEl.addEventListener('click', function () { selectAnswer(oi); });
        optionEls.push(optEl);
        optionsHost.appendChild(optEl);
      });

      var explanation = el('div', { class: 'quiz__explanation', role: 'status', 'aria-live': 'polite' }, [
        el('div', { class: 'quiz__explanation-title', text: '📘 الشرح' }),
        el('p', { text: q.explanation || '' })
      ]);

      var nextBtn = el('button', { class: 'btn btn--primary', disabled: true },
        [idx === questions.length - 1 ? 'عرض النتيجة 🏁' : 'السؤال التالي ◀']);
      nextBtn.addEventListener('click', function () {
        idx++;
        if (idx >= questions.length) { renderResult(); } else { renderQuestion(); }
      });

      host.appendChild(el('div', { class: 'quiz-question' }, [
        el('h3', { class: 'quiz-question__prompt', text: q.prompt }),
        optionsHost,
        explanation,
        el('div', { class: 'quiz__footer' }, [nextBtn])
      ]));

      function selectAnswer(choice) {
        if (answered) return;
        answered = true;
        var correctIdx = q.type === 'true-false' ? (q.answer === true || q.answer === 0 ? 0 : 1) : q.answer;
        var isCorrect = choice === correctIdx;
        if (isCorrect) score++;
        optionEls.forEach(function (e, i) {
          e.disabled = true;
          if (i === correctIdx) e.classList.add('is-correct');
          if (i === choice && !isCorrect) e.classList.add('is-wrong');
        });
        explanation.classList.add('is-visible');
        nextBtn.disabled = false;
      }
    }

    function renderResult() {
      DOM.clear(host);
      var percent = Math.round((score / questions.length) * 100);
      global.ProgressStore.saveQuizResult(ctx.lang, { score: score, total: questions.length });

      var emoji, message;
      if (percent >= 90) { emoji = '🏆'; message = 'ممتاز! أنت بطل البرمجة الحقيقي!'; }
      else if (percent >= 70) { emoji = '🎉'; message = 'رائع جدًّا! أداء قوي ومميّز.'; }
      else if (percent >= 60) { emoji = '👍'; message = 'جيد! نجحت، واصل التعلّم لتتقن أكثر.'; }
      else { emoji = '💪'; message = 'لا بأس! المراجعة مفتاح النجاح، حاول مجددًا وستتحسّن.'; }

      host.appendChild(el('div', { class: 'quiz-result card' }, [
        el('div', { class: 'quiz-result__emoji', text: emoji }),
        el('div', { class: 'quiz-result__score', text: global.Format.toArabicDigits(score) + ' / ' + global.Format.toArabicDigits(questions.length) + ' (' + global.Format.percent(percent) + ')' }),
        el('p', { class: 'quiz-result__message', text: message }),
        el('div', { class: 'quiz-result__actions' }, [
          el('button', { class: 'btn btn--primary', onclick: function () { idx = 0; score = 0; renderQuestion(); } }, ['🔁 إعادة الاختبار']),
          el('a', { class: 'btn', href: '#/' + ctx.lang + '/lesson-1' }, ['📖 مراجعة الدروس']),
          el('a', { class: 'btn btn--ghost', href: '#/dashboard' }, ['🏠 اللوحة الرئيسية'])
        ])
      ]));
    }

    renderQuestion();
  }

  global.QuizEngine = { render: render };
})(window);
