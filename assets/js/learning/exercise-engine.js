/* assets/js/learning/exercise-engine.js — محرك التمارين التفاعلية */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;

  /**
   * بناء تمرين تفاعلي.
   * exercise: { type: 'multiple-choice'|'fill-blank'|'code-completion', prompt, options?, answer, hint?, explanation? }
   * onSolved: callback عند الحل الصحيح
   */
  function build(exercise, onSolved) {
    // الدرس يمرّر القسم بـ type:'exercise' والنوع الفعلي في exType
    var type = exercise.exType || (exercise.type !== 'exercise' ? exercise.type : null) || 'multiple-choice';
    var solved = false;

    var container = el('section', { class: 'exercise', 'aria-label': 'تمرين تفاعلي' });
    container.appendChild(el('div', { class: 'exercise__label' }, ['✍️ ', el('span', { text: 'جرّب بنفسك' })]));
    container.appendChild(el('p', { class: 'exercise__prompt', text: exercise.prompt }));

    var feedback = el('div', { class: 'exercise__feedback', role: 'status', 'aria-live': 'polite' });

    function showFeedback(correct) {
      feedback.className = 'exercise__feedback is-visible ' + (correct ? 'is-correct' : 'is-wrong');
      feedback.textContent = correct
        ? '🎉 أحسنت! إجابة صحيحة. ' + (exercise.explanation || '')
        : '🤔 ليست صحيحة بعد، لا تقلق! ' + (exercise.hint ? 'تلميح: ' + exercise.hint : 'حاول مرة أخرى.');
      if (correct && !solved) {
        solved = true;
        if (typeof onSolved === 'function') onSolved();
        if (global.EventBus) global.EventBus.emit('exercise:solved', {});
      }
    }

    if (type === 'multiple-choice') {
      buildMultipleChoice(container, exercise, feedback, showFeedback);
    } else {
      buildInput(container, exercise, feedback, showFeedback, type);
    }

    container.appendChild(feedback);
    return container;
  }

  function buildMultipleChoice(container, exercise, feedback, showFeedback) {
    var options = exercise.options || [];
    var selected = -1;
    var checked = false;
    var optsEl = el('div', { class: 'exercise__options' });
    var optionEls = [];

    options.forEach(function (opt, idx) {
      var optEl = el('label', { class: 'exercise__option' }, [
        el('input', { type: 'radio', name: 'ex-' + Math.random().toString(36).slice(2), value: idx }),
        el('span', { text: opt })
      ]);
      optEl.querySelector('input').addEventListener('change', function () {
        if (checked) return;
        selected = idx;
        optionEls.forEach(function (e) { e.classList.remove('is-selected'); });
        optEl.classList.add('is-selected');
      });
      optionEls.push(optEl);
      optsEl.appendChild(optEl);
    });
    container.appendChild(optsEl);

    var checkBtn = el('button', { class: 'btn btn--primary' }, ['تحقّق من الإجابة']);
    checkBtn.addEventListener('click', function () {
      if (selected === -1) {
        feedback.className = 'exercise__feedback is-visible is-wrong';
        feedback.textContent = 'الرجاء اختيار إجابة أولًا 🙂';
        return;
      }
      var correct = selected === exercise.answer;
      checked = correct;
      optionEls[selected].classList.add(correct ? 'is-correct' : 'is-wrong');
      if (correct) optionEls[exercise.answer].classList.add('is-correct');
      showFeedback(correct);
    });
    container.appendChild(el('div', { class: 'exercise__actions' }, [checkBtn]));
  }

  function buildInput(container, exercise, feedback, showFeedback, type) {
    var isCode = type === 'code-completion';
    var field = isCode
      ? el('textarea', { class: 'exercise__textarea', placeholder: 'اكتب الكود هنا...', 'aria-label': 'حقل إدخال الكود' })
      : el('input', { class: 'exercise__input', type: 'text', placeholder: 'اكتب إجابتك هنا...', 'aria-label': 'حقل إدخال الإجابة' });
    container.appendChild(field);

    var checkBtn = el('button', { class: 'btn btn--primary' }, ['تحقّق']);
    checkBtn.addEventListener('click', function () {
      var value = String(field.value || '').trim();
      if (!value) {
        feedback.className = 'exercise__feedback is-visible is-wrong';
        feedback.textContent = 'الرجاء كتابة إجابة أولًا 🙂';
        return;
      }
      var answers = Array.isArray(exercise.answer) ? exercise.answer : [exercise.answer];
      var normalized = value.replace(/\s+/g, ' ').toLowerCase();
      var correct = answers.some(function (a) {
        return String(a).replace(/\s+/g, ' ').toLowerCase() === normalized;
      });
      showFeedback(correct);
    });
    container.appendChild(el('div', { class: 'exercise__actions' }, [checkBtn]));
  }

  global.ExerciseEngine = { build: build };
})(window);
