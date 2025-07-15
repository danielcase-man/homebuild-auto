// Home Builder Pro - Service Worker
// Provides offline functionality, background sync, and push notifications

const CACHE_NAME = 'home-builder-pro-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'
const API_CACHE = 'api-v1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/mobile',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/projects',
  '/api/vendors',
  '/api/materials',
  '/api/communications/inbox'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim()
    ])
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // API requests - Network First with fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiCacheStrategy(request))
    return
  }

  // Static assets - Cache First
  if (STATIC_ASSETS.some(asset => url.pathname === asset) || 
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // Page requests - Stale While Revalidate
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(staleWhileRevalidateStrategy(request))
    return
  }

  // Everything else - Network First
  event.respondWith(networkFirstStrategy(request))
})

// Background Sync - for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag)
  
  if (event.tag === 'project-sync') {
    event.waitUntil(syncProjects())
  } else if (event.tag === 'communication-sync') {
    event.waitUntil(syncCommunications())
  } else if (event.tag === 'vendor-research-sync') {
    event.waitUntil(syncVendorResearch())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  let notificationData = {
    title: 'Home Builder Pro',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'default',
    requireInteraction: false
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      notificationData = { ...notificationData, ...payload }
    } catch (error) {
      console.error('Error parsing push payload:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions || [],
      data: notificationData.data || {}
    })
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.notification)
  
  event.notification.close()
  
  const notificationData = event.notification.data || {}
  let targetUrl = '/'
  
  // Determine target URL based on notification type
  if (notificationData.type === 'task_assigned') {
    targetUrl = `/projects/${notificationData.projectId}/tasks/${notificationData.taskId}`
  } else if (notificationData.type === 'inspection_scheduled') {
    targetUrl = `/projects/${notificationData.projectId}/inspections`
  } else if (notificationData.type === 'budget_alert') {
    targetUrl = `/projects/${notificationData.projectId}/budget`
  } else if (notificationData.type === 'vendor_message') {
    targetUrl = `/communications?vendorId=${notificationData.vendorId}`
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open with the target URL
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window if none found
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// Caching Strategies

async function cacheFirstStrategy(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('Cache First strategy failed:', error)
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network failed, trying cache:', error)
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/offline')
    }
    
    return new Response('Offline', { status: 503 })
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Fetch from network in background
  const networkPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    console.log('Network failed for stale-while-revalidate')
  })
  
  // Return cached version immediately if available
  if (cachedResponse) {
    networkPromise // Don't await, let it run in background
    return cachedResponse
  }
  
  // If no cache, wait for network
  try {
    return await networkPromise
  } catch (error) {
    return caches.match('/offline')
  }
}

async function apiCacheStrategy(request) {
  const url = new URL(request.url)
  
  // Don't cache POST/PUT/DELETE requests
  if (request.method !== 'GET') {
    try {
      return await fetch(request)
    } catch (error) {
      // Store failed requests for background sync
      await storeFailedRequest(request)
      return new Response(JSON.stringify({ error: 'Offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('API network failed, trying cache:', error)
    
    const cache = await caches.open(API_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // Add offline indicator to response
      const data = await cachedResponse.json()
      return new Response(JSON.stringify({ ...data, _offline: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ error: 'No cached data available' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Background Sync Functions

async function syncProjects() {
  try {
    console.log('Syncing projects...')
    
    // Get pending project updates from IndexedDB
    const pendingUpdates = await getPendingUpdates('projects')
    
    for (const update of pendingUpdates) {
      try {
        const response = await fetch(update.url, {
          method: update.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        })
        
        if (response.ok) {
          await removePendingUpdate('projects', update.id)
        }
      } catch (error) {
        console.error('Failed to sync project update:', error)
      }
    }
  } catch (error) {
    console.error('Project sync failed:', error)
  }
}

async function syncCommunications() {
  try {
    console.log('Syncing communications...')
    
    const pendingCommunications = await getPendingUpdates('communications')
    
    for (const communication of pendingCommunications) {
      try {
        const response = await fetch('/api/communications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(communication.data)
        })
        
        if (response.ok) {
          await removePendingUpdate('communications', communication.id)
        }
      } catch (error) {
        console.error('Failed to sync communication:', error)
      }
    }
  } catch (error) {
    console.error('Communication sync failed:', error)
  }
}

async function syncVendorResearch() {
  try {
    console.log('Syncing vendor research...')
    
    const pendingResearch = await getPendingUpdates('vendor-research')
    
    for (const research of pendingResearch) {
      try {
        const response = await fetch('/api/vendor-research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(research.data)
        })
        
        if (response.ok) {
          await removePendingUpdate('vendor-research', research.id)
        }
      } catch (error) {
        console.error('Failed to sync vendor research:', error)
      }
    }
  } catch (error) {
    console.error('Vendor research sync failed:', error)
  }
}

// IndexedDB helpers for offline storage

async function storeFailedRequest(request) {
  // Implementation would store failed requests in IndexedDB
  // for later synchronization when network is available
  console.log('Storing failed request for later sync:', request.url)
}

async function getPendingUpdates(type) {
  // Implementation would retrieve pending updates from IndexedDB
  return []
}

async function removePendingUpdate(type, id) {
  // Implementation would remove synced update from IndexedDB
  console.log(`Removing synced update ${id} of type ${type}`)
}

// Utility functions

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))
}

function isAPIRequest(request) {
  return request.url.includes('/api/')
}

function isStaticAsset(request) {
  return request.url.includes('/_next/static/') || 
         request.url.includes('/icons/') ||
         request.url.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)
}

// Debug logging
function log(message, data = null) {
  if (self.location.hostname === 'localhost') {
    console.log(`SW: ${message}`, data)
  }
}