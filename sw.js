var V = 'orion-v0.4';
var CORE = ['./', 'index.html', 'manifest.webmanifest', 'favicon.svg',
            'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { if (k !== V) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var url = new URL(r.url);

  if (url.origin === location.origin) {
    e.respondWith(
      fetch(r).then(function (res) {
        var copy = res.clone();
        caches.open(V).then(function (c) { c.put(r, copy); });
        return res;
      }).catch(function () {
        return caches.match(r).then(function (m) { return m || caches.match('index.html'); });
      })
    );
    return;
  }

  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(r).then(function (m) {
      return m || fetch(r).then(function (res) {
        var copy = res.clone();
        caches.open(V).then(function (c) { c.put(r, copy); });
        return res;
      });
    }));
  }
});
