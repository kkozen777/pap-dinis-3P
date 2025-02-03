const CACHE_NAME = 'pwa-cache-v1';
const OFFLINE_URL = 'offline.html';

// Arquivos a serem cacheados
const CACHE_ASSETS = [
  '/',
  '/favico.ico',
  '/index.html',
  '/offline.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_ASSETS);
    })
  );
  console.log('Service Worker instalado');
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        return response || caches.match(OFFLINE_URL);
      });
    })
  );
});

// Atualização do Cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cache) => cache !== CACHE_NAME)
          .map((cache) => caches.delete(cache))
      );
    })
  );
  console.log('Service Worker ativado');
});
