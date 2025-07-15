/**
 * PWA Service - Progressive Web App functionality
 * Handles installation, offline detection, background sync, and push notifications
 */

export interface InstallPromptEvent extends Event {
  platforms: string[]
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

export interface PWACapabilities {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  hasServiceWorker: boolean
  supportsNotifications: boolean
  supportsBackgroundSync: boolean
  supportsPush: boolean
}

export interface SyncQueueItem {
  id: string
  type: 'project' | 'communication' | 'vendor-research' | 'material-selection'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: Date
  retryCount: number
}

export interface NotificationConfig {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: NotificationAction[]
  data?: any
}

class PWAService {
  private deferredPrompt: InstallPromptEvent | null = null
  private syncQueue: SyncQueueItem[] = []
  private isOnline = true
  private notificationPermission: NotificationPermission = 'default'

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializePWA()
    }
  }

  /**
   * Initialize PWA functionality
   */
  private async initializePWA() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e as InstallPromptEvent
      this.dispatchEvent('installable', { installable: true })
    })

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null
      this.dispatchEvent('installed', { installed: true })
    })

    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true
      this.dispatchEvent('online', { online: true })
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.dispatchEvent('offline', { online: false })
    })

    // Register service worker
    await this.registerServiceWorker()

    // Initialize push notifications
    await this.initializePushNotifications()

    // Process any pending sync items
    await this.loadSyncQueue()
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registered:', registration)

        // Listen for service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event)
        })

        return registration
      } catch (error) {
        console.error('Service Worker registration failed:', error)
        return null
      }
    }
    return null
  }

  /**
   * Initialize push notifications
   */
  private async initializePushNotifications() {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission
      
      if (this.notificationPermission === 'default') {
        // Don't automatically request permission - wait for user action
        console.log('Notification permission not yet granted')
      }
    }
  }

  /**
   * Get PWA capabilities
   */
  getCapabilities(): PWACapabilities {
    return {
      isInstallable: this.deferredPrompt !== null,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      isOnline: this.isOnline,
      hasServiceWorker: 'serviceWorker' in navigator,
      supportsNotifications: 'Notification' in window,
      supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      supportsPush: 'serviceWorker' in navigator && 'PushManager' in window
    }
  }

  /**
   * Trigger app installation
   */
  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('App installation not available')
      return false
    }

    try {
      await this.deferredPrompt.prompt()
      const choiceResult = await this.deferredPrompt.userChoice
      
      this.deferredPrompt = null
      
      return choiceResult.outcome === 'accepted'
    } catch (error) {
      console.error('Installation failed:', error)
      return false
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied'
    }

    if (Notification.permission === 'default') {
      this.notificationPermission = await Notification.requestPermission()
    } else {
      this.notificationPermission = Notification.permission
    }

    return this.notificationPermission
  }

  /**
   * Show local notification
   */
  async showNotification(config: NotificationConfig): Promise<void> {
    if (this.notificationPermission !== 'granted') {
      console.log('Notification permission not granted')
      return
    }

    const registration = await navigator.serviceWorker.ready
    
    await registration.showNotification(config.title, {
      body: config.body,
      icon: config.icon || '/icons/icon-192x192.png',
      badge: config.badge || '/icons/icon-72x72.png',
      tag: config.tag || 'default',
      requireInteraction: config.requireInteraction || false,
      actions: config.actions || [],
      data: config.data || {}
    })
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      })

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
      return subscription
    } catch (error) {
      console.error('Push subscription failed:', error)
      return null
    }
  }

  /**
   * Add item to sync queue for offline operation
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncItem: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retryCount: 0,
      ...item
    }

    this.syncQueue.push(syncItem)
    await this.saveSyncQueue()

    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register(`${item.type}-sync`)
    }

    // If online, process immediately
    if (this.isOnline) {
      this.processSyncQueue()
    }
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return
    }

    const itemsToProcess = [...this.syncQueue]
    
    for (const item of itemsToProcess) {
      try {
        await this.processSyncItem(item)
        
        // Remove from queue on success
        this.syncQueue = this.syncQueue.filter(queueItem => queueItem.id !== item.id)
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error)
        
        // Increment retry count
        const queueItem = this.syncQueue.find(queueItem => queueItem.id === item.id)
        if (queueItem) {
          queueItem.retryCount++
          
          // Remove items that have failed too many times
          if (queueItem.retryCount > 3) {
            this.syncQueue = this.syncQueue.filter(queueItem => queueItem.id !== item.id)
          }
        }
      }
    }

    await this.saveSyncQueue()
  }

  /**
   * Process individual sync item
   */
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    const apiEndpoints = {
      project: '/api/projects',
      communication: '/api/communications/send',
      'vendor-research': '/api/vendor-research',
      'material-selection': '/api/material-selections'
    }

    const endpoint = apiEndpoints[item.type]
    if (!endpoint) {
      throw new Error(`Unknown sync type: ${item.type}`)
    }

    let url = endpoint
    let method = 'POST'

    if (item.action === 'update') {
      url = `${endpoint}/${item.data.id}`
      method = 'PUT'
    } else if (item.action === 'delete') {
      url = `${endpoint}/${item.data.id}`
      method = 'DELETE'
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  /**
   * Get offline status
   */
  isOffline(): boolean {
    return !this.isOnline
  }

  /**
   * Get sync queue status
   */
  getSyncQueueStatus(): { pending: number; failed: number } {
    const pending = this.syncQueue.filter(item => item.retryCount === 0).length
    const failed = this.syncQueue.filter(item => item.retryCount > 0).length
    
    return { pending, failed }
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    this.syncQueue = []
    await this.saveSyncQueue()
  }

  // Private helper methods

  private async handleServiceWorkerMessage(event: MessageEvent) {
    const { type, data } = event.data
    
    switch (type) {
      case 'sync-complete':
        this.dispatchEvent('syncComplete', data)
        break
      case 'push-received':
        this.dispatchEvent('pushReceived', data)
        break
      default:
        console.log('Unknown service worker message:', type, data)
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send subscription to server')
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      localStorage.setItem('pwa-sync-queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('pwa-sync-queue')
      if (stored) {
        this.syncQueue = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
      this.syncQueue = []
    }
  }

  private dispatchEvent(type: string, detail: any): void {
    window.dispatchEvent(new CustomEvent(`pwa:${type}`, { detail }))
  }
}

// Export singleton instance
export const pwaService = new PWAService()

// React hook for PWA functionality
export function usePWA() {
  const [capabilities, setCapabilities] = React.useState<PWACapabilities>()
  const [syncStatus, setSyncStatus] = React.useState({ pending: 0, failed: 0 })

  React.useEffect(() => {
    const updateCapabilities = () => {
      setCapabilities(pwaService.getCapabilities())
      setSyncStatus(pwaService.getSyncQueueStatus())
    }

    updateCapabilities()

    // Listen for PWA events
    const events = ['installable', 'installed', 'online', 'offline', 'syncComplete']
    
    events.forEach(event => {
      window.addEventListener(`pwa:${event}`, updateCapabilities)
    })

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(`pwa:${event}`, updateCapabilities)
      })
    }
  }, [])

  return {
    capabilities,
    syncStatus,
    installApp: () => pwaService.installApp(),
    requestNotifications: () => pwaService.requestNotificationPermission(),
    showNotification: (config: NotificationConfig) => pwaService.showNotification(config),
    addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) => 
      pwaService.addToSyncQueue(item),
    isOffline: () => pwaService.isOffline(),
    clearSyncQueue: () => pwaService.clearSyncQueue()
  }
}

// Import React for the hook
import React from 'react'