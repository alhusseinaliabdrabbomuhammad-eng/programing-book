/* assets/js/utils/dom.js — أدوات مساعدة للتعامل مع DOM */
(function (global) {
  'use strict';

  /** اختصار querySelector */
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  /** اختصار querySelectorAll يُعيد مصفوفة */
  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  /**
   * إنشاء عنصر مع خصائص وأبناء.
   * @param {string} tag
   * @param {object} [attrs]
   * @param {Array|string|Node} [children]
   */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs && typeof attrs === 'object') {
      Object.keys(attrs).forEach(function (key) {
        var val = attrs[key];
        if (key === 'class' || key === 'className') {
          node.className = val;
        } else if (key === 'dataset') {
          Object.keys(val).forEach(function (d) { node.dataset[d] = val[d]; });
        } else if (key === 'html') {
          node.innerHTML = val;
        } else if (key === 'text') {
          node.textContent = val;
        } else if (key.indexOf('on') === 0 && typeof val === 'function') {
          node.addEventListener(key.slice(2).toLowerCase(), val);
        } else if (val !== null && val !== undefined && val !== false) {
          node.setAttribute(key, val === true ? '' : val);
        }
      });
    }
    appendChildren(node, children);
    return node;
  }

  function appendChildren(node, children) {
    if (children === null || children === undefined) return;
    if (Array.isArray(children)) {
      children.forEach(function (c) { appendChildren(node, c); });
    } else if (typeof children === 'string' || typeof children === 'number') {
      node.appendChild(document.createTextNode(String(children)));
    } else if (children instanceof Node) {
      node.appendChild(children);
    }
  }

  /** تفريغ محتوى عنصر بأمان */
  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  /** هروب نص HTML لمنع الحقن */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  global.DOM = { $: $, $all: $all, el: el, clear: clear, escapeHtml: escapeHtml };
})(window);
