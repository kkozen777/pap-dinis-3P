self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('pwa-cache-new').then((cache) => {
        return cache.addAll([
          './online.html',
          './offline.html',
          './script.js'
        ]);
      })
    );
    console.log('Service Worker instalado');
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });
  