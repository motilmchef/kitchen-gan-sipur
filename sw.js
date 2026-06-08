const CACHE = 'gan-sipur-v20260608';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  
  // Always network first - never serve stale content
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'})
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// Tell all clients to reload when new SW activates
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
