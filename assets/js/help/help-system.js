/* assets/js/help/help-system.js — نظام المساعدة السياقي (نوافذ منبثقة) */
(function (global) {
  'use strict';

  var DOM = global.DOM;
  var el = DOM.el;

  var HelpSystem = (function () {
    var modalRoot, lastFocused;

    function init() {
      modalRoot = DOM.$('#modal-root');
      global.EventBus.on('help:requested', function (data) {
        open(data.topic || 'global');
      });
    }

    function open(topic) {
      lastFocused = document.activeElement;
      showSkeletonModal();
      global.DataLoader.loadHelp(topic)
        .then(function (help) { renderModal(help); })
        .catch(function () {
          renderModal({ title: 'المساعدة', articles: [{ heading: 'تعذّر التحميل', body: ['لم نتمكّن من تحميل محتوى المساعدة، حاول لاحقًا.'] }] });
        });
    }

    function showSkeletonModal() {
      DOM.clear(modalRoot);
      var overlay = el('div', { class: 'modal-overlay' }, [
        el('div', { class: 'modal' }, [
          el('div', { class: 'modal__header' }, [el('h2', { class: 'modal__title', text: 'جارٍ التحميل...' })]),
          el('div', { class: 'modal__body skeleton-screen' }, [
            el('div', { class: 'skeleton skeleton-line skeleton-line--title' }),
            el('div', { class: 'skeleton skeleton-line' }),
            el('div', { class: 'skeleton skeleton-line' }),
            el('div', { class: 'skeleton skeleton-line skeleton-line--short' })
          ])
        ])
      ]);
      modalRoot.appendChild(overlay);
    }

    function renderModal(help) {
      DOM.clear(modalRoot);

      var closeBtn = el('button', { class: 'btn btn--icon modal__close', 'aria-label': 'إغلاق المساعدة' }, ['✕']);
      var body = el('div', { class: 'modal__body help-article' });

      (help.articles || []).forEach(function (article) {
        if (article.heading) body.appendChild(el('h4', { text: article.heading }));
        (article.body || []).forEach(function (para) { body.appendChild(el('p', { text: para })); });
        if (article.list) {
          var ul = el('ul');
          article.list.forEach(function (item) { ul.appendChild(el('li', { text: item })); });
          body.appendChild(ul);
        }
      });

      var modal = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': help.title || 'مساعدة' }, [
        el('div', { class: 'modal__header' }, [
          el('h2', { class: 'modal__title' }, ['❓ ', el('span', { text: help.title || 'المساعدة' })]),
          closeBtn
        ]),
        body
      ]);

      var overlay = el('div', { class: 'modal-overlay' }, [modal]);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
      closeBtn.addEventListener('click', close);
      document.addEventListener('keydown', onKeydown);

      modalRoot.appendChild(overlay);
      closeBtn.focus();
    }

    function onKeydown(e) {
      if (e.key === 'Escape') close();
    }

    function close() {
      DOM.clear(modalRoot);
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    return { init: init, open: open };
  })();

  global.HelpSystem = HelpSystem;
})(window);
