import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User, Notification, NotificationType } from '@/types'

interface ThemeConfig {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  accentColor: string
  fontSize: 'small' | 'medium' | 'large'
}

interface AppPreferences {
  theme: ThemeConfig
  language: string
  timezone: string
  dateFormat: string
  currency: string
  notifications: {
    email: boolean
    browser: boolean
    mobile: boolean
    types: NotificationType[]
  }
  dashboard: {
    layout: 'grid' | 'list'
    widgets: string[]
    refreshInterval: number
  }
}

interface GlobalState {
  // Authentication & User
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  
  // App State
  isLoading: boolean
  error: string | null
  isOnline: boolean
  lastSync: Date | null
  
  // UI State
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  activeModal: string | null
  modalProps: Record<string, any>
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  
  // Preferences
  preferences: AppPreferences
  
  // Real-time State
  wsConnected: boolean
  wsReconnectAttempts: number
  
  // Sync State
  syncQueue: any[]
  syncInProgress: boolean
  
  // Actions
  // Authentication
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  logout: () => void
  
  // App State
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setOnlineStatus: (online: boolean) => void
  updateLastSync: () => void
  
  // UI Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openModal: (modalId: string, props?: Record<string, any>) => void
  closeModal: () => void
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Preferences
  updatePreferences: (updates: Partial<AppPreferences>) => void
  updateTheme: (theme: Partial<ThemeConfig>) => void
  
  // WebSocket
  setWsConnected: (connected: boolean) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
  
  // Sync
  addToSyncQueue: (item: any) => void
  removeFromSyncQueue: (id: string) => void
  setSyncInProgress: (inProgress: boolean) => void
  processSyncQueue: () => Promise<void>
  
  // Async Actions
  initialize: () => Promise<void>
  fetchNotifications: () => Promise<void>
  syncData: () => Promise<void>
}

const defaultPreferences: AppPreferences = {
  theme: {
    mode: 'system',
    primaryColor: '#1e40af',
    accentColor: '#ea580c',
    fontSize: 'medium'
  },
  language: 'en',
  timezone: 'America/Chicago',
  dateFormat: 'MM/dd/yyyy',
  currency: 'USD',
  notifications: {
    email: true,
    browser: true,
    mobile: true,
    types: ['TASK_ASSIGNED', 'DEADLINE_APPROACHING', 'BUDGET_ALERT', 'INSPECTION_SCHEDULED']
  },
  dashboard: {
    layout: 'grid',
    widgets: ['projects', 'tasks', 'budget', 'timeline', 'weather'],
    refreshInterval: 300000 // 5 minutes
  }
}

export const useAppStore = create<GlobalState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        user: null,
        isAuthenticated: false,
        isInitialized: false,
        
        isLoading: false,
        error: null,
        isOnline: true,
        lastSync: null,
        
        sidebarOpen: true,
        sidebarCollapsed: false,
        activeModal: null,
        modalProps: {},
        
        notifications: [],
        unreadCount: 0,
        
        preferences: defaultPreferences,
        
        wsConnected: false,
        wsReconnectAttempts: 0,
        
        syncQueue: [],
        syncInProgress: false,
        
        // Authentication Actions
        setUser: (user) => set((state) => {
          state.user = user
          state.isAuthenticated = !!user
        }),
        
        setAuthenticated: (authenticated) => set((state) => {
          state.isAuthenticated = authenticated
          if (!authenticated) {
            state.user = null
          }
        }),
        
        logout: () => set((state) => {
          state.user = null
          state.isAuthenticated = false
          state.notifications = []
          state.unreadCount = 0
          state.syncQueue = []
          state.wsConnected = false
        }),
        
        // App State Actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading
        }),
        
        setError: (error) => set((state) => {
          state.error = error
        }),
        
        setOnlineStatus: (online) => set((state) => {
          state.isOnline = online
          if (online && state.syncQueue.length > 0) {
            // Trigger sync when coming back online
            get().processSyncQueue()
          }
        }),
        
        updateLastSync: () => set((state) => {
          state.lastSync = new Date()
        }),
        
        // UI Actions
        toggleSidebar: () => set((state) => {
          state.sidebarOpen = !state.sidebarOpen
        }),
        
        setSidebarCollapsed: (collapsed) => set((state) => {
          state.sidebarCollapsed = collapsed
        }),
        
        openModal: (modalId, props = {}) => set((state) => {
          state.activeModal = modalId
          state.modalProps = props
        }),
        
        closeModal: () => set((state) => {
          state.activeModal = null
          state.modalProps = {}
        }),
        
        // Notification Actions
        addNotification: (notificationData) => set((state) => {
          const notification: Notification = {
            id: `notification-${Date.now()}-${Math.random()}`,
            createdAt: new Date(),
            read: false,
            readAt: undefined,
            ...notificationData
          }
          
          state.notifications.unshift(notification)
          if (!notification.read) {
            state.unreadCount++
          }
          
          // Keep only last 50 notifications
          if (state.notifications.length > 50) {
            state.notifications = state.notifications.slice(0, 50)
          }
        }),
        
        markNotificationRead: (id) => set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification && !notification.read) {
            notification.read = true
            notification.readAt = new Date()
            state.unreadCount = Math.max(0, state.unreadCount - 1)
          }
        }),
        
        markAllNotificationsRead: () => set((state) => {
          state.notifications.forEach(n => {
            if (!n.read) {
              n.read = true
              n.readAt = new Date()
            }
          })
          state.unreadCount = 0
        }),
        
        removeNotification: (id) => set((state) => {
          const index = state.notifications.findIndex(n => n.id === id)
          if (index !== -1) {
            const notification = state.notifications[index]
            if (!notification.read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1)
            }
            state.notifications.splice(index, 1)
          }
        }),
        
        clearNotifications: () => set((state) => {
          state.notifications = []
          state.unreadCount = 0
        }),
        
        // Preferences Actions
        updatePreferences: (updates) => set((state) => {
          Object.assign(state.preferences, updates)
        }),
        
        updateTheme: (themeUpdates) => set((state) => {
          Object.assign(state.preferences.theme, themeUpdates)
        }),
        
        // WebSocket Actions
        setWsConnected: (connected) => set((state) => {
          state.wsConnected = connected
          if (connected) {
            state.wsReconnectAttempts = 0
          }
        }),
        
        incrementReconnectAttempts: () => set((state) => {
          state.wsReconnectAttempts++
        }),
        
        resetReconnectAttempts: () => set((state) => {
          state.wsReconnectAttempts = 0
        }),
        
        // Sync Actions
        addToSyncQueue: (item) => set((state) => {
          state.syncQueue.push({
            id: `sync-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            ...item
          })
        }),
        
        removeFromSyncQueue: (id) => set((state) => {
          state.syncQueue = state.syncQueue.filter(item => item.id !== id)
        }),
        
        setSyncInProgress: (inProgress) => set((state) => {
          state.syncInProgress = inProgress
        }),
        
        processSyncQueue: async () => {
          const { syncQueue, isOnline } = get()
          
          if (!isOnline || syncQueue.length === 0) return
          
          set((state) => {
            state.syncInProgress = true
          })
          
          try {
            const response = await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ items: syncQueue })
            })
            
            if (response.ok) {
              set((state) => {
                state.syncQueue = []
                state.lastSync = new Date()
              })
            }
          } catch (error) {
            console.error('Sync failed:', error)
          } finally {
            set((state) => {
              state.syncInProgress = false
            })
          }
        },
        
        // Async Actions
        initialize: async () => {
          try {
            set((state) => {
              state.isLoading = true
              state.error = null
            })
            
            // Check authentication status
            const authResponse = await fetch('/api/auth/me')
            if (authResponse.ok) {
              const user = await authResponse.json()
              set((state) => {
                state.user = user
                state.isAuthenticated = true
              })
              
              // Load user preferences
              const prefsResponse = await fetch('/api/user/preferences')
              if (prefsResponse.ok) {
                const preferences = await prefsResponse.json()
                set((state) => {
                  state.preferences = { ...defaultPreferences, ...preferences }
                })
              }
              
              // Load notifications
              await get().fetchNotifications()
            }
            
            set((state) => {
              state.isInitialized = true
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to initialize app'
              state.isLoading = false
              state.isInitialized = true
            })
          }
        },
        
        fetchNotifications: async () => {
          try {
            const response = await fetch('/api/notifications')
            if (response.ok) {
              const notifications = await response.json()
              set((state) => {
                state.notifications = notifications
                state.unreadCount = notifications.filter((n: Notification) => !n.read).length
              })
            }
          } catch (error) {
            console.error('Failed to fetch notifications:', error)
          }
        },
        
        syncData: async () => {
          const { isOnline, syncInProgress } = get()
          
          if (!isOnline || syncInProgress) return
          
          try {
            set((state) => {
              state.syncInProgress = true
            })
            
            const response = await fetch('/api/sync/full')
            if (response.ok) {
              const syncData = await response.json()
              
              // Update last sync time
              set((state) => {
                state.lastSync = new Date()
              })
              
              // Dispatch sync events for stores to update
              window.dispatchEvent(new CustomEvent('app:sync', { detail: syncData }))
            }
          } catch (error) {
            console.error('Full sync failed:', error)
          } finally {
            set((state) => {
              state.syncInProgress = false
            })
          }
        }
      })),
      {
        name: 'app-store',
        partialize: (state) => ({
          preferences: state.preferences,
          sidebarCollapsed: state.sidebarCollapsed,
          notifications: state.notifications.slice(0, 10), // Persist only recent notifications
          unreadCount: state.unreadCount
        })
      }
    ),
    { name: 'AppStore' }
  )
)

// Initialize app on store creation
if (typeof window !== 'undefined') {
  useAppStore.getState().initialize()
  
  // Set up online/offline detection
  window.addEventListener('online', () => {
    useAppStore.getState().setOnlineStatus(true)
  })
  
  window.addEventListener('offline', () => {
    useAppStore.getState().setOnlineStatus(false)
  })
  
  // Set up periodic sync
  setInterval(() => {
    const state = useAppStore.getState()
    if (state.isOnline && state.isAuthenticated && !state.syncInProgress) {
      state.processSyncQueue()
    }
  }, 30000) // Sync every 30 seconds
}