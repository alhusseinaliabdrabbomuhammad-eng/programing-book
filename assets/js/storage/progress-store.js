/* assets/js/storage/progress-store.js — تخزين تقدّم التعلّم في localStorage */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'programming-book:progress:v1';
  var SETTINGS_KEY = 'programming-book:settings:v1';

  var ProgressStore = (function () {
    var state = load();
    var settings = loadSettings();

    function defaultState() {
      return {
        lessons: {},   // "python/lesson-1": { completed: true, completedAt: ts }
        quizzes: {},   // "python": { score, total, percent, takenAt }
        timeSpent: 0,  // بالدقائق (تقديري)
        streak: { count: 0, lastDate: null },
        firstVisit: true
      };
    }

    function defaultSettings() {
      return { theme: 'dark', tourDone: false };
    }

    function load() {
      try {
        var raw = global.localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState();
        var parsed = JSON.parse(raw);
        return Object.assign(defaultState(), parsed);
      } catch (err) {
        console.warn('[ProgressStore] تعذّرت قراءة التقدّم:', err);
        return defaultState();
      }
    }

    function loadSettings() {
      try {
        var raw = global.localStorage.getItem(SETTINGS_KEY);
        return raw ? Object.assign(defaultSettings(), JSON.parse(raw)) : defaultSettings();
      } catch (err) {
        return defaultSettings();
      }
    }

    function persist() {
      try {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.warn('[ProgressStore] تعذّر حفظ التقدّم:', err);
      }
    }

    function persistSettings() {
      try {
        global.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (err) {
        console.warn('[ProgressStore] تعذّر حفظ الإعدادات:', err);
      }
    }

    function lessonKey(lang, lessonId) { return lang + '/' + lessonId; }

    function isLessonCompleted(lang, lessonId) {
      var k = lessonKey(lang, lessonId);
      return !!(state.lessons[k] && state.lessons[k].completed);
    }

    function markLessonCompleted(lang, lessonId) {
      var k = lessonKey(lang, lessonId);
      if (state.lessons[k] && state.lessons[k].completed) return;
      state.lessons[k] = { completed: true, completedAt: Date.now() };
      updateStreak();
      persist();
      if (global.EventBus) {
        global.EventBus.emit('lesson:completed', { lang: lang, lessonId: lessonId });
        global.EventBus.emit('progress:updated', getStats());
      }
    }

    function saveQuizResult(lang, result) {
      state.quizzes[lang] = {
        score: result.score,
        total: result.total,
        percent: Math.round((result.score / result.total) * 100),
        takenAt: Date.now()
      };
      updateStreak();
      persist();
      if (global.EventBus) {
        global.EventBus.emit('quiz:completed', { lang: lang, result: state.quizzes[lang] });
        global.EventBus.emit('progress:updated', getStats());
      }
    }

    function getQuizResult(lang) { return state.quizzes[lang] || null; }

    function addTime(minutes) {
      state.timeSpent += minutes;
      persist();
    }

    function updateStreak() {
      var today = new Date().toISOString().slice(0, 10);
      var last = state.streak.lastDate;
      if (last === today) return;
      var yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      state.streak.count = last === yesterday ? state.streak.count + 1 : 1;
      state.streak.lastDate = today;
    }

    /** عدد الدروس المكتملة للغة معينة */
    function completedCount(lang) {
      var count = 0;
      Object.keys(state.lessons).forEach(function (k) {
        if (k.indexOf(lang + '/') === 0 && state.lessons[k].completed) count++;
      });
      return count;
    }

    function langProgress(lang, totalLessons) {
      var done = completedCount(lang);
      return {
        completed: done,
        total: totalLessons,
        percent: totalLessons ? Math.round((done / totalLessons) * 100) : 0,
        quizPassed: !!(state.quizzes[lang] && state.quizzes[lang].percent >= 60)
      };
    }

    function getStats() {
      var langs = global.Format ? global.Format.langKeys() : ['python', 'java', 'cpp', 'html', 'css', 'javascript'];
      var totalLessons = langs.length * 20;
      var totalDone = 0;
      langs.forEach(function (l) { totalDone += completedCount(l); });
      return {
        totalLessons: totalLessons,
        totalCompleted: totalDone,
        overallPercent: Math.round((totalDone / totalLessons) * 100),
        streak: state.streak.count,
        timeSpent: state.timeSpent,
        quizzesTaken: Object.keys(state.quizzes).length
      };
    }

    function isFirstVisit() { return !settings.tourDone; }
    function setTourDone() { settings.tourDone = true; persistSettings(); }

    function getTheme() { return settings.theme; }
    function setTheme(theme) { settings.theme = theme; persistSettings(); }

    function reset() {
      state = defaultState();
      persist();
      if (global.EventBus) global.EventBus.emit('progress:updated', getStats());
    }

    return {
      isLessonCompleted: isLessonCompleted,
      markLessonCompleted: markLessonCompleted,
      saveQuizResult: saveQuizResult,
      getQuizResult: getQuizResult,
      addTime: addTime,
      completedCount: completedCount,
      langProgress: langProgress,
      getStats: getStats,
      isFirstVisit: isFirstVisit,
      setTourDone: setTourDone,
      getTheme: getTheme,
      setTheme: setTheme,
      reset: reset
    };
  })();

  global.ProgressStore = ProgressStore;
})(window);
