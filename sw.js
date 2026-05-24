// ═══════════════════════════════════════════════════════════════════════════
// CLP — Service Worker mínimo (sesión 15, Camino F, 24 mayo 2026)
// ═══════════════════════════════════════════════════════════════════════════
//
// PROPÓSITO:
//   Silenciar el error 404 que aparecía en consola al intentar registrar SW.
//   NO cachea nada. Toda request va directo a la red (comportamiento idéntico
//   al de antes, solo sin el error).
//
// POR QUÉ ES TAN SIMPLE:
//   Un SW que cachea agresivamente sería bueno para PWA offline, pero ya
//   tuvimos el bug del 24 mayo donde la PWA mostraba versión vieja del index.
//   Hasta que el código se estabilice, mejor que el SW NO se meta con cache.
//
// MIGRACIÓN FUTURA:
//   Cuando queramos PWA offline real, reemplazar este archivo con uno que
//   use cache-first o stale-while-revalidate para assets. Bumpear CACHE_VERSION
//   romperá los caches anteriores limpiamente.
// ═══════════════════════════════════════════════════════════════════════════

const CACHE_VERSION = 'clp-v1-no-cache-2026-05-24';

// INSTALL: tomar control inmediatamente, sin esperar a que los clients viejos
// se cierren. Importante para que actualizaciones del SW se propaguen rápido.
self.addEventListener('install', (event) => {
  console.log('[SW] install', CACHE_VERSION);
  self.skipWaiting();
});

// ACTIVATE: limpieza defensiva — borrar TODOS los caches que pudieran haber
// quedado de versiones previas del SW o de pruebas anteriores. Esto previene
// que vuelva a pasar el bug del 24 mayo donde la PWA servía archivo viejo.
self.addEventListener('activate', (event) => {
  console.log('[SW] activate', CACHE_VERSION);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// FETCH: intencionalmente AUSENTE.
// Sin handler de fetch, el browser maneja todas las requests directamente:
// nada se cachea, nada se intercepta. La app funciona idéntica a como funcionaba
// antes de que existiera este SW, pero sin el error 404 en consola.
//
// Cuando se quiera agregar caching, descomentar y configurar algo como:
//   self.addEventListener('fetch', (event) => {
//     event.respondWith(fetch(event.request));
//   });
