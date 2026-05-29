/* assets/js/storage/data-loader.js — تحميل ملفات JSON بكسل (lazy) مع تخزين مؤقت */
(function (global) {
  'use strict';

  var DataLoader = (function () {
    var cache = {};
    var inFlight = {};

    /** جلب JSON من مسار مع تخزين مؤقت في الذاكرة */
    function fetchJson(path) {
      if (cache[path]) return Promise.resolve(cache[path]);
      if (inFlight[path]) return inFlight[path];

      var promise = fetch(path)
        .then(function (res) {
          if (!res.ok) {
            throw new Error('فشل تحميل الملف (' + res.status + '): ' + path);
          }
          return res.json();
        })
        .then(function (data) {
          cache[path] = data;
          delete inFlight[path];
          return data;
        })
        .catch(function (err) {
          delete inFlight[path];
          throw err;
        });

      inFlight[path] = promise;
      return promise;
    }

    function loadRoadmap(lang) {
      return fetchJson('data/roadmaps/' + lang + '.json');
    }

    function loadLesson(lang, lessonId) {
      return fetchJson('data/lessons/' + lang + '/' + lessonId + '.json');
    }

    function loadQuiz(lang) {
      return fetchJson('data/lessons/' + lang + '/quiz.json');
    }

    function loadHelp(topic) {
      return fetchJson('data/help/' + topic + '.json');
    }

    return {
      loadRoadmap: loadRoadmap,
      loadLesson: loadLesson,
      loadQuiz: loadQuiz,
      loadHelp: loadHelp,
      fetchJson: fetchJson
    };
  })();

  global.DataLoader = DataLoader;
})(window);
