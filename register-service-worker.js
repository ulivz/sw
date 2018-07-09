// Modified from: https://github.com/yyx990803/register-service-worker
// Register a service worker to serve assets from local cache.

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
)

function register (swUrl, hooks) {
  const emit = (hook, ...args) => {
    if (hooks && hooks[hook]) {
      hooks[hook](...args)
    }
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      if (isLocalhost) {
        // This is running on localhost, let's check if a service worker still exist or not.
        checkValidServiceWorker(swUrl, emit)
        navigator.serviceWorker.ready.then(() => {
          emit('ready')
        })
      } else {
        // It's not local host. Just register service worker.
        registerValidSW(swUrl, emit)
      }
    })
  }
}

function registerValidSW (swUrl, emit) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      emit('registered', registration)
      const installingWorker = registration.installing
      registration.onupdatedfound = () => {
        if (installingWorker.state === 'installed') {
          // At this point, the old content will have been purged and
          // the fresh content will have been added to the cache,
          // It's the perfect time to display a "New content is
          // available; please refresh." message in your web app.
          emit('updated', registration)
        } else {
          // At this point, everything have been precached.
          // It's the perfect time to display a
          // "Content is cached for offline use." message.
          emit('cached', registration)
        }
      }
    })
    .catch(error => {
      if (!navigator.onLine) {
        emit('offline')
      } else {
        emit('error', error)
      }
    })
}

function checkValidServiceWorker (swUrl, emit) {
  // Check if a service worker can be found
  fetch(swUrl)
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      if (
        response.status === 404 ||
        response.headers.get('content-type').indexOf('javascript') === -1
      ) {
        // No service worker found/
        emit('error', new Error(`Service worker not found at ${swUrl}`))
        unregister()
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, emit)
      }
    })
    .catch(error => {
      if (!navigator.onLine) {
        emit('offline')
      } else {
        emit('error', error)
      }
    })
}

function unregister () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister()
    })
  }
}
