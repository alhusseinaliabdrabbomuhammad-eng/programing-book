/* assets/js/learning/syntax-highlighter.js — تلوين صياغة أساسي (tokenization) */
(function (global) {
  'use strict';

  var KEYWORDS = {
    python: ['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'from', 'as',
      'class', 'try', 'except', 'finally', 'with', 'lambda', 'and', 'or', 'not', 'is', 'None',
      'True', 'False', 'pass', 'break', 'continue', 'global', 'nonlocal', 'yield', 'raise', 'del'],
    java: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static',
      'final', 'void', 'int', 'double', 'float', 'char', 'boolean', 'long', 'short', 'byte', 'new',
      'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'this',
      'super', 'abstract', 'try', 'catch', 'finally', 'throw', 'throws', 'import', 'package', 'true', 'false', 'null'],
    cpp: ['int', 'double', 'float', 'char', 'bool', 'void', 'long', 'short', 'unsigned', 'const',
      'constexpr', 'class', 'struct', 'public', 'private', 'protected', 'return', 'if', 'else', 'for',
      'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'delete', 'virtual', 'template',
      'typename', 'namespace', 'using', 'try', 'catch', 'throw', 'true', 'false', 'nullptr', 'auto'],
    javascript: ['var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
      'switch', 'case', 'break', 'continue', 'new', 'class', 'extends', 'super', 'this', 'try',
      'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'async', 'await', 'yield',
      'import', 'export', 'default', 'true', 'false', 'null', 'undefined'],
    html: [],
    css: []
  };

  var BUILTINS = {
    python: ['print', 'input', 'len', 'range', 'int', 'str', 'float', 'bool', 'list', 'dict', 'set', 'tuple', 'type', 'open'],
    java: ['System', 'String', 'Scanner', 'ArrayList', 'HashMap', 'Math', 'Integer', 'Double'],
    cpp: ['cout', 'cin', 'endl', 'std', 'vector', 'string'],
    javascript: ['console', 'document', 'window', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number', 'parseInt', 'parseFloat', 'fetch', 'setTimeout', 'setInterval'],
    html: [],
    css: []
  };

  var esc = function (s) { return global.DOM.escapeHtml(s); };

  /** تلوين سطر برمجي واحد، يُعيد HTML */
  function highlightLine(line, lang) {
    if (lang === 'html') return highlightHtml(line);
    if (lang === 'css') return highlightCss(line);
    return highlightGeneric(line, lang);
  }

  function highlightGeneric(line, lang) {
    var keywords = KEYWORDS[lang] || [];
    var builtins = BUILTINS[lang] || [];
    var result = '';
    var i = 0;
    var n = line.length;

    while (i < n) {
      var ch = line[i];

      /* التعليقات */
      if ((lang === 'python' && ch === '#') ||
          ((lang === 'javascript' || lang === 'java' || lang === 'cpp') && ch === '/' && line[i + 1] === '/')) {
        result += '<span class="tok-comment">' + esc(line.slice(i)) + '</span>';
        break;
      }

      /* النصوص */
      if (ch === '"' || ch === "'" || ch === '`') {
        var quote = ch;
        var j = i + 1;
        while (j < n && line[j] !== quote) {
          if (line[j] === '\\') j++;
          j++;
        }
        result += '<span class="tok-string">' + esc(line.slice(i, j + 1)) + '</span>';
        i = j + 1;
        continue;
      }

      /* الأرقام */
      if (/[0-9]/.test(ch)) {
        var k = i;
        while (k < n && /[0-9._]/.test(line[k])) k++;
        result += '<span class="tok-number">' + esc(line.slice(i, k)) + '</span>';
        i = k;
        continue;
      }

      /* المعرّفات والكلمات المفتاحية */
      if (/[A-Za-z_$]/.test(ch)) {
        var m = i;
        while (m < n && /[A-Za-z0-9_$]/.test(line[m])) m++;
        var word = line.slice(i, m);
        var after = line[m];
        if (keywords.indexOf(word) !== -1) {
          result += '<span class="tok-keyword">' + esc(word) + '</span>';
        } else if (builtins.indexOf(word) !== -1) {
          result += '<span class="tok-builtin">' + esc(word) + '</span>';
        } else if (after === '(') {
          result += '<span class="tok-function">' + esc(word) + '</span>';
        } else {
          result += esc(word);
        }
        i = m;
        continue;
      }

      /* المعاملات */
      if (/[+\-*/%=<>!&|^~?:.]/.test(ch)) {
        result += '<span class="tok-operator">' + esc(ch) + '</span>';
        i++;
        continue;
      }

      result += esc(ch);
      i++;
    }
    return result;
  }

  function highlightHtml(line) {
    var out = esc(line);
    out = out.replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<span class="tok-keyword">$2</span>');
    out = out.replace(/([a-zA-Z-]+)(=)(&quot;[^&]*&quot;)/g,
      '<span class="tok-function">$1</span><span class="tok-operator">$2</span><span class="tok-string">$3</span>');
    return out;
  }

  function highlightCss(line) {
    var out = esc(line);
    out = out.replace(/([a-zA-Z-]+)(\s*:\s*)/g, '<span class="tok-function">$1</span><span class="tok-operator">$2</span>');
    out = out.replace(/(\{|\})/g, '<span class="tok-operator">$1</span>');
    out = out.replace(/(#[0-9a-fA-F]{3,8})/g, '<span class="tok-number">$1</span>');
    return out;
  }

  global.SyntaxHighlighter = { highlightLine: highlightLine };
})(window);
