/* assets/js/utils/format.js — أدوات تنسيق عربية */
(function (global) {
  'use strict';

  var AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  /** تحويل الأرقام الإنجليزية إلى عربية */
  function toArabicDigits(value) {
    return String(value).replace(/[0-9]/g, function (d) { return AR_DIGITS[Number(d)]; });
  }

  /** تنسيق نسبة مئوية */
  function percent(value) {
    var v = Math.max(0, Math.min(100, Math.round(value)));
    return toArabicDigits(v) + '٪';
  }

  /** تنسيق مدة بالدقائق إلى نص عربي */
  function duration(minutes) {
    var m = Math.round(minutes);
    if (m < 60) return toArabicDigits(m) + ' دقيقة';
    var h = Math.floor(m / 60);
    var rem = m % 60;
    return toArabicDigits(h) + ' ساعة' + (rem ? ' و' + toArabicDigits(rem) + ' دقيقة' : '');
  }

  /** عنوان اللغة بالعربية */
  var LANG_META = {
    python: { name: 'بايثون', icon: '🐍', desc: 'لغة بسيطة وقوية للمبتدئين والمحترفين' },
    java: { name: 'جافا', icon: '☕', desc: 'لغة كائنية التوجه للتطبيقات الكبيرة' },
    cpp: { name: 'سي++', icon: '⚙️', desc: 'لغة سريعة وقريبة من العتاد' },
    html: { name: 'إتش تي إم إل', icon: '🏗️', desc: 'لغة بناء هيكل صفحات الويب' },
    css: { name: 'سي إس إس', icon: '🎨', desc: 'لغة تنسيق وتصميم صفحات الويب' },
    javascript: { name: 'جافاسكربت', icon: '📜', desc: 'لغة تفاعل صفحات الويب' }
  };

  function langName(key) { return (LANG_META[key] || {}).name || key; }
  function langIcon(key) { return (LANG_META[key] || {}).icon || '📘'; }
  function langDesc(key) { return (LANG_META[key] || {}).desc || ''; }
  function langKeys() { return Object.keys(LANG_META); }

  global.Format = {
    toArabicDigits: toArabicDigits,
    percent: percent,
    duration: duration,
    langName: langName,
    langIcon: langIcon,
    langDesc: langDesc,
    langKeys: langKeys,
    LANG_META: LANG_META
  };
})(window);
