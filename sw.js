/* sw.js — عامل الخدمة: التخزين المسبق للأصول والعمل دون اتصال */
'use strict';

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `programming-book-${CACHE_VERSION}`;

/* الأصول الثابتة الحرجة التي تُخزَّن مسبقًا */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',

  './assets/css/core/variables.css',
  './assets/css/core/reset.css',
  './assets/css/core/typography.css',
  './assets/css/core/themes.css',
  './assets/css/layout/navbar.css',
  './assets/css/layout/sidebar.css',
  './assets/css/layout/main.css',
  './assets/css/layout/statusbar.css',
  './assets/css/components/buttons.css',
  './assets/css/components/cards.css',
  './assets/css/components/code-block.css',
  './assets/css/components/callouts.css',
  './assets/css/components/exercises.css',
  './assets/css/components/visualizer.css',
  './assets/css/components/quiz.css',
  './assets/css/components/modal.css',
  './assets/css/components/skeleton.css',
  './assets/css/components/tour.css',

  './assets/js/utils/dom.js',
  './assets/js/utils/format.js',
  './assets/js/core/event-bus.js',
  './assets/js/storage/progress-store.js',
  './assets/js/storage/data-loader.js',
  './assets/js/learning/syntax-highlighter.js',
  './assets/js/learning/visualizer.js',
  './assets/js/learning/exercise-engine.js',
  './assets/js/learning/lesson-engine.js',
  './assets/js/learning/quiz-engine.js',
  './assets/js/ui/sidebar.js',
  './assets/js/ui/navbar.js',
  './assets/js/ui/statusbar.js',
  './assets/js/ui/dashboard.js',
  './assets/js/help/help-system.js',
  './assets/js/help/onboarding-tour.js',
  './assets/js/core/router.js',
  './assets/js/core/app.js',

  './data/help/global.json',
  './data/help/sidebar.json',
  './data/help/visualizer.json'
];

/* أضف خرائط الطريق وبيانات الدروس والاختبارات للتخزين المسبق */
const LANGS = ['python', 'java', 'cpp', 'html', 'css', 'javascript'];
LANGS.forEach((lang) => {
  PRECACHE_ASSETS.push(`./data/roadmaps/${lang}.json`);
  PRECACHE_ASSETS.push(`./data/lessons/${lang}/quiz.json`);
  for (let i = 1; i <= 20; i++) {
    PRECACHE_ASSETS.push(`./data/lessons/${lang}/lesson-${i}.json`);
  }
});

/* التثبيت: تخزين الأصول مسبقًا (تجاهل ما يفشل حتى لا يُفشِل التثبيت) */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] تعذّر تخزين:', url, err && err.message);
          })
        )
      );
      return self.skipWaiting();
    })
  );
});

/* التفعيل: حذف الذاكرات المؤقتة القديمة */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('programming-book-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ).then(() => self.clients.claim())
    )
  );
});

/* الجلب: الذاكرة المؤقتة أولًا ثم الشبكة (cache-first) */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          /* احتياطي: إعادة الصفحة الرئيسية لطلبات التنقّل */
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('غير متوفر دون اتصال', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        });
    })
  );
});
