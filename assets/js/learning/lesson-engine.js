/* assets/js/learning/lesson-engine.js — محرك عرض الدروس الديناميكي */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;
  var H = global.SyntaxHighlighter;

  /**
   * عرض درس داخل عنصر هدف.
   * lesson: ملف JSON للدرس
   * ctx: { lang, lessonId, lessonNumber, nextRoute, prevRoute }
   */
  function render(target, lesson, ctx) {
    DOM.clear(target);
    var minInteractions = lesson.minInteractions || 1;
    var interactions = 0;
    var completeBtn;

    function bumpInteraction() {
      interactions++;
      if (interactions >= minInteractions && completeBtn) {
        completeBtn.disabled = false;
      }
    }

    /* الترويسة */
    target.appendChild(el('header', { class: 'page-header' }, [
      el('div', { class: 'page-header__eyebrow' }, [
        global.Format.langIcon(ctx.lang) + ' ',
        el('span', { text: global.Format.langName(ctx.lang) + ' • الدرس ' + global.Format.toArabicDigits(ctx.lessonNumber) + ' من ٢٠' })
      ]),
      el('h1', { class: 'page-header__title', text: lesson.title }),
      lesson.subtitle ? el('p', { class: 'page-header__subtitle', text: lesson.subtitle }) : null
    ]));

    /* الأقسام */
    (lesson.sections || []).forEach(function (section) {
      target.appendChild(renderSection(section, ctx, bumpInteraction));
    });

    /* تذييل: التنقّل وزر الإكمال */
    var alreadyDone = global.ProgressStore.isLessonCompleted(ctx.lang, ctx.lessonId);
    completeBtn = el('button', {
      class: 'btn btn--success btn--lg',
      disabled: alreadyDone ? null : true
    }, [alreadyDone ? '✓ تم إكمال الدرس' : '✅ إكمال الدرس']);

    if (alreadyDone) {
      completeBtn.classList.add('btn--success');
    }

    completeBtn.addEventListener('click', function () {
      global.ProgressStore.markLessonCompleted(ctx.lang, ctx.lessonId);
      completeBtn.textContent = '✓ تم إكمال الدرس';
      completeBtn.disabled = true;
      if (ctx.nextRoute) {
        setTimeout(function () { global.location.hash = ctx.nextRoute; }, 600);
      }
    });

    var nav = el('div', { class: 'lesson-nav' });
    if (ctx.prevRoute) {
      nav.appendChild(el('a', { class: 'btn', href: '#' + ctx.prevRoute }, ['▶ الدرس السابق']));
    }
    if (ctx.nextRoute) {
      nav.appendChild(el('a', { class: 'btn', href: '#' + ctx.nextRoute }, ['الدرس التالي ◀']));
    }

    target.appendChild(el('footer', { class: 'lesson-footer' }, [completeBtn, nav]));

    if (global.EventBus) {
      global.EventBus.emit('lesson:loaded', { lang: ctx.lang, lessonId: ctx.lessonId, title: lesson.title });
    }
  }

  function renderSection(section, ctx, bump) {
    switch (section.type) {
      case 'text': return renderText(section);
      case 'list': return renderList(section);
      case 'code': return renderCode(section, ctx.lang);
      case 'callout': return renderCallout(section);
      case 'visualizer': return renderVisualizer(section, ctx, bump);
      case 'exercise': return renderExercise(section, bump);
      default: return renderText(section);
    }
  }

  function renderText(section) {
    var wrap = el('section', { class: 'lesson-section' });
    if (section.heading) wrap.appendChild(el('h3', {}, [section.icon ? section.icon + ' ' : '', el('span', { text: section.heading })]));
    var paragraphs = Array.isArray(section.content) ? section.content : [section.content];
    paragraphs.forEach(function (p) {
      wrap.appendChild(el('p', { html: inlineFormat(p) }));
    });
    return wrap;
  }

  function renderList(section) {
    var wrap = el('section', { class: 'lesson-section' });
    if (section.heading) wrap.appendChild(el('h3', {}, [section.icon ? section.icon + ' ' : '', el('span', { text: section.heading })]));
    var listTag = section.ordered ? 'ol' : 'ul';
    var listEl = el(listTag, { class: section.ordered ? 'numbered' : 'bullets' });
    (section.items || []).forEach(function (item) {
      listEl.appendChild(el('li', { html: inlineFormat(item) }));
    });
    wrap.appendChild(listEl);
    return wrap;
  }

  function renderCode(section, defaultLang) {
    var lang = section.lang || defaultLang;
    var lines = Array.isArray(section.code) ? section.code : String(section.code || '').split('\n');
    var annotations = section.annotations || [];

    var block = el('section', { class: 'code-block' });
    var copyBtn = el('button', { class: 'code-copy-btn', 'aria-label': 'نسخ الكود' }, ['📋 نسخ']);
    block.appendChild(el('div', { class: 'code-block__header' }, [
      el('span', { class: 'code-block__lang', text: section.langLabel || lang }),
      copyBtn
    ]));

    var codeLines = el('pre', { class: 'code-lines', dir: 'ltr' });
    lines.forEach(function (line, idx) {
      var annotated = annotations.some(function (a) { return a.line === idx + 1; });
      codeLines.appendChild(el('div', { class: 'code-line' + (annotated ? ' is-annotated' : '') }, [
        el('span', { class: 'code-line__num', text: idx + 1 }),
        el('span', { class: 'code-line__content', html: H.highlightLine(line, lang) })
      ]));
    });

    var body = el('div', { class: 'code-block__body' }, [codeLines]);
    if (annotations.length) {
      var annoEl = el('div', { class: 'code-annotations' });
      annotations.forEach(function (a) {
        annoEl.appendChild(el('div', { class: 'code-annotation' }, [
          el('div', { class: 'code-annotation__line', text: 'سطر ' + a.line }),
          el('div', { class: 'code-annotation__text', text: a.text })
        ]));
      });
      body.appendChild(annoEl);
    }
    block.appendChild(body);

    copyBtn.addEventListener('click', function () {
      var text = lines.join('\n');
      copyToClipboard(text).then(function () {
        copyBtn.textContent = '✓ تم النسخ';
        copyBtn.classList.add('is-copied');
        setTimeout(function () { copyBtn.textContent = '📋 نسخ'; copyBtn.classList.remove('is-copied'); }, 1600);
      });
    });

    return block;
  }

  function copyToClipboard(text) {
    if (global.navigator.clipboard && global.navigator.clipboard.writeText) {
      return global.navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
    }
    return fallbackCopy(text);
  }
  function fallbackCopy(text) {
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  function renderCallout(section) {
    var variant = section.variant || 'tip';
    var icons = { tip: '💡', warning: '⚠️', critical: '🚨', extra: '✨' };
    var titles = { tip: 'نصيحة', warning: 'تنبيه', critical: 'مهم جدًّا', extra: 'معلومة إضافية' };
    return el('aside', { class: 'callout callout--' + variant, role: 'note' }, [
      el('span', { class: 'callout__icon', text: icons[variant] || '💡' }),
      el('div', { class: 'callout__body' }, [
        el('div', { class: 'callout__title', text: section.title || titles[variant] }),
        el('p', { class: 'callout__text', html: inlineFormat(section.content) })
      ])
    ]);
  }

  function renderVisualizer(section, ctx, bump) {
    var data = section.data || section;
    data.lang = data.lang || ctx.lang;
    var node = global.Visualizer.build(data);
    /* اعتبار فتح المتتبّع تفاعلًا */
    node.addEventListener('click', function once() { bump(); node.removeEventListener('click', once); });
    return node;
  }

  function renderExercise(section, bump) {
    return global.ExerciseEngine.build(section, function () { bump(); });
  }

  /** تنسيق نصي مضمّن: **عريض** و `code` */
  function inlineFormat(text) {
    if (text === null || text === undefined) return '';
    var safe = DOM.escapeHtml(String(text));
    safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
    safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/__([^_]+)__/g, '<em>$1</em>');
    return safe;
  }

  global.LessonEngine = { render: render };
})(window);
