/* Service worker minimal : rend l'appli installable, sans cache (toujours la dernière version en ligne). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') e.respondWith(fetch(e.request));
});

/* Rappels de révision (Web Push) : affichés même appli fermée ; un toucher ouvre l'appli. */
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Révisions physique-chimie', {
    body: d.body || 'Tes révisions t’attendent.', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'rv', data: { url: d.url || '/' },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const w = list.find((c) => c.url.startsWith(self.location.origin));
    return w ? w.focus() : self.clients.openWindow(url);
  }));
});
