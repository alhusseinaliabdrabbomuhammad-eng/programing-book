/* assets/js/learning/visualizer.js — متتبّع الكود المرئي (خطوة بخطوة) */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;
  var H = global.SyntaxHighlighter;

  /**
   * بناء متتبّع مرئي من بيانات الدرس.
   * data: { lang, code: [..], hasCallStack, steps: [{ line, description, memory:[{name,value,updated}], output, callStack:[] }] }
   */
  function build(data) {
    var lang = data.lang || 'python';
    var codeLines = data.code || [];
    var steps = data.steps || [];
    var current = 0;
    var timer = null;

    var container = el('section', { class: 'visualizer', 'aria-label': 'متتبّع الكود المرئي' });

    /* الترويسة */
    container.appendChild(el('div', { class: 'visualizer__header' }, [
      el('div', { class: 'visualizer__title' }, ['🔍 ', el('span', { text: 'متتبّع الكود — شاهد كيف يفكّر الحاسوب' })])
    ]));

    /* الجسم: الكود + اللوحات */
    var codeEl = el('pre', { class: 'visualizer__code' });
    codeLines.forEach(function (line, idx) {
      codeEl.appendChild(el('div', { class: 'vis-code-line', dataset: { line: idx + 1 } }, [
        el('span', { class: 'vis-code-line__num', text: idx + 1 }),
        el('span', { class: 'vis-code-line__content', html: H.highlightLine(line, lang) })
      ]));
    });

    var memoryPanel = el('div', { class: 'vis-panel' }, [
      el('div', { class: 'vis-panel__title', text: '🧠 الذاكرة (المتغيرات)' }),
      el('div', { class: 'memory-host' })
    ]);
    var outputPanel = el('div', { class: 'vis-panel' }, [
      el('div', { class: 'vis-panel__title', text: '🖥️ مخرجات البرنامج' }),
      el('div', { class: 'vis-output', text: '' })
    ]);
    var panels = [memoryPanel, outputPanel];

    var callStackPanel = null;
    if (data.hasCallStack) {
      callStackPanel = el('div', { class: 'vis-panel' }, [
        el('div', { class: 'vis-panel__title', text: '📚 مكدّس الاستدعاء' }),
        el('div', { class: 'call-stack' })
      ]);
      panels.push(callStackPanel);
    }

    var panelsEl = el('div', { class: 'visualizer__panels' }, panels);
    container.appendChild(el('div', { class: 'visualizer__body' }, [codeEl, panelsEl]));

    /* وصف الخطوة */
    var descEl = el('div', { class: 'vis-step-desc' }, [
      el('span', { class: 'vis-step-desc__icon', text: '👉' }),
      el('span', { class: 'vis-step-desc__text', text: '' })
    ]);
    container.appendChild(descEl);

    /* أزرار التحكم */
    var btnFirst = el('button', { class: 'btn btn--small', title: 'البداية', 'aria-label': 'الذهاب إلى أول خطوة' }, ['⏮']);
    var btnPrev = el('button', { class: 'btn', 'aria-label': 'الخطوة السابقة' }, ['◀ السابق']);
    var counter = el('span', { class: 'vis-step-counter' });
    var btnNext = el('button', { class: 'btn btn--primary', 'aria-label': 'الخطوة التالية' }, ['التالي ▶']);
    var btnPlay = el('button', { class: 'btn', 'aria-label': 'تشغيل تلقائي' }, ['▶ تشغيل']);
    var btnReset = el('button', { class: 'btn btn--ghost', title: 'إعادة', 'aria-label': 'إعادة التشغيل من البداية' }, ['↺']);

    container.appendChild(el('div', { class: 'visualizer__controls' },
      [btnFirst, btnPrev, counter, btnNext, btnPlay, btnReset]));

    function renderStep() {
      var step = steps[current] || {};

      /* تظليل السطر */
      DOM.$all('.vis-code-line', codeEl).forEach(function (lineEl) {
        var ln = Number(lineEl.dataset.line);
        lineEl.classList.toggle('is-active', ln === step.line);
      });

      /* الذاكرة */
      var memHost = DOM.$('.memory-host', memoryPanel);
      DOM.clear(memHost);
      var mem = step.memory || [];
      if (mem.length === 0) {
        memHost.appendChild(el('p', { class: 'progress-text', text: 'لا توجد متغيّرات بعد.' }));
      } else {
        var table = el('table', { class: 'memory-table' });
        table.appendChild(el('thead', {}, el('tr', {}, [
          el('th', { text: 'الاسم' }), el('th', { text: 'القيمة' })
        ])));
        var tbody = el('tbody');
        mem.forEach(function (v) {
          tbody.appendChild(el('tr', { class: v.updated ? 'is-updated' : '' }, [
            el('td', { class: 'mem-name', text: v.name }),
            el('td', { class: 'mem-value', text: String(v.value) })
          ]));
        });
        table.appendChild(tbody);
        memHost.appendChild(table);
      }

      /* المخرجات */
      DOM.$('.vis-output', outputPanel).textContent = step.output || '';

      /* مكدّس الاستدعاء */
      if (callStackPanel) {
        var stackHost = DOM.$('.call-stack', callStackPanel);
        DOM.clear(stackHost);
        // قد يأتي مكدّس الاستدعاء كمصفوفة إطارات أو كنصّ مفرد — ندعم الحالتين
        var frames = step.callStack;
        if (typeof frames === 'string') {
          frames = frames.split('\n').map(function (f) { return f.trim(); }).filter(Boolean);
        }
        if (!Array.isArray(frames)) frames = [];
        frames.forEach(function (frame) {
          stackHost.appendChild(el('div', { class: 'call-stack__frame', text: frame }));
        });
      }

      /* الوصف */
      DOM.$('.vis-step-desc__text', descEl).textContent = step.description || '';

      /* العدّاد والأزرار */
      counter.textContent = 'الخطوة ' + global.Format.toArabicDigits(current + 1) +
        ' من ' + global.Format.toArabicDigits(steps.length);
      btnPrev.disabled = current === 0;
      btnFirst.disabled = current === 0;
      btnNext.disabled = current === steps.length - 1;
    }

    function go(idx) {
      current = Math.max(0, Math.min(steps.length - 1, idx));
      renderStep();
    }

    function stopPlay() {
      if (timer) { clearInterval(timer); timer = null; btnPlay.textContent = '▶ تشغيل'; }
    }

    btnFirst.addEventListener('click', function () { stopPlay(); go(0); });
    btnPrev.addEventListener('click', function () { stopPlay(); go(current - 1); });
    btnNext.addEventListener('click', function () { stopPlay(); go(current + 1); });
    btnReset.addEventListener('click', function () { stopPlay(); go(0); });
    btnPlay.addEventListener('click', function () {
      if (timer) { stopPlay(); return; }
      btnPlay.textContent = '⏸ إيقاف';
      timer = setInterval(function () {
        if (current >= steps.length - 1) { stopPlay(); return; }
        go(current + 1);
      }, 1400);
    });

    renderStep();
    return container;
  }

  global.Visualizer = { build: build };
})(window);
