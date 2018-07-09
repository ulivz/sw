console.log('[Service Worker] v12')
console.log('[SW] Registration time: ' + new Date().toLocaleTimeString())

const BASE_URL = location.pathname.replace('sw.js', '')

const CACHE_NAMESPACE = 'ulivz'
const PRECACHE = CACHE_NAMESPACE + 'precache-v1'
const PRECACHE_LIST = [
  normalizeUrl('offline.html'),
  normalizeUrl('evan.jpeg')
]

const RUNTIME = CACHE_NAMESPACE + 'runtime-v1'
const expectedCaches = [PRECACHE, RUNTIME]

const LOG_STYLE = 'background: #f66; color: #ffffff'
const FECTH_FILE_STYLE = 'background: #222; color: #bada55'

console.log('[SW] Precache ID: ' + PRECACHE)

self.oninstall = (event) => {
  console.log('[SW] %cinstalled', LOG_STYLE)
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_LIST))
      .then(self.skipWaiting())
      .catch(err => console.log(err))
  )
}

self.onactivate = (event) => {
  console.log('[SW] %cactivated', LOG_STYLE)

  // delete any cache not match expectedCaches for migration.
  // noticed that we delete by cache instead of by request here.
  // so we MUST filter out caches opened by this app firstly.
  // check out sw-precache or workbox-build for an better way.
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames
        .filter(cacheName => cacheName.startsWith(CACHE_NAMESPACE))
        .filter(cacheName => !expectedCaches.includes(cacheName))
        .map(cacheName => caches.delete(cacheName))
    ))
  )
}

self.onfetch = event => {
  const cached = caches.match(event.request)
  // const fixedUrl = `${event.request.url}?${Date.now()}`
  const fetched = fetch(event.request.url, { cache: 'no-store' })
  const fetchedCopy = fetched.then(resp => resp.clone())
  const url = new URL(event.request.url)

  console.log(`[SW] Fetch %c ${url.pathname}`, FECTH_FILE_STYLE)

  if (url.origin === location.origin) {
    // Intercept Request
    if (url.pathname === normalizeUrl('ulivz.png')) {
      return event.respondWith(caches.match(normalizeUrl('evan.jpeg')))
    }
    if (url.pathname === normalizeUrl('sw.js')) {
      return event.respondWith(fetched)
    }
  }

  // Call respondWith() with whatever we get first.
  // If the fetch fails (e.g disconnected), wait for the cache.
  // If there’s nothing in cache, wait for the fetch.
  // If neither yields a response, return offline pages.
  event.respondWith(
    Promise.race([fetched.catch(_ => cached), cached])
      .then(resp => resp || fetched)
      .catch(_ => caches.match(normalizeUrl('offline.html')))
  )

  event.waitUntil(
    Promise.all([fetchedCopy, caches.open(RUNTIME)])
      .then(([response, cache]) => response.ok && cache.put(event.request, response))
      .catch(_ => { /* ignore errors */ })
  )
}

function normalizeUrl (path) {
  return BASE_URL + path
}
