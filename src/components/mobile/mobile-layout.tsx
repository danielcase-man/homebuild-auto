import * as React from "react"
import { cn, a11y } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Menu, 
  X, 
  Home, 
  FolderOpen, 
  Users, 
  Calendar, 
  Settings,
  Bell,
  Search,
  Plus,
  ArrowLeft,
  ChevronUp,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from "lucide-react"

export interface MobileLayoutProps {
  children: React.ReactNode
  /**
   * Page title for mobile header
   */
  title?: string
  /**
   * Show back button
   */
  showBack?: boolean
  /**
   * Back button handler
   */
  onBack?: () => void
  /**
   * Show search in header
   */
  showSearch?: boolean
  /**
   * Search handler
   */
  onSearch?: (query: string) => void
  /**
   * Show primary action button
   */
  showPrimaryAction?: boolean
  /**
   * Primary action configuration
   */
  primaryAction?: {
    label: string
    icon?: React.ReactNode
    onClick: () => void
  }
  /**
   * Navigation items for bottom nav
   */
  navigationItems?: MobileNavItem[]
  /**
   * Active navigation item
   */
  activeNav?: string
  /**
   * Show status bar info
   */
  showStatusBar?: boolean
  /**
   * PWA install prompt available
   */
  showInstallPrompt?: boolean
  /**
   * Install prompt handler
   */
  onInstall?: () => void
  /**
   * Notification count
   */
  notificationCount?: number
  /**
   * Field optimized mode
   */
  fieldOptimized?: boolean
  /**
   * Safe area handling
   */
  useSafeArea?: boolean
}

export interface MobileNavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  badge?: number
  disabled?: boolean
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title = "Home Builder Pro",
  showBack = false,
  onBack,
  showSearch = false,
  onSearch,
  showPrimaryAction = false,
  primaryAction,
  navigationItems = [],
  activeNav,
  showStatusBar = true,
  showInstallPrompt = false,
  onInstall,
  notificationCount = 0,
  fieldOptimized = false,
  useSafeArea = true
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(true)
  const [batteryLevel, setBatteryLevel] = React.useState<number | null>(null)

  const layoutId = a11y.generateId('mobile-layout')
  const menuButtonRef = React.useRef<HTMLButtonElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Detect online/offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Battery API (if supported)
  React.useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100))
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100))
        })
      })
    }
  }, [])

  // Handle menu toggle
  const toggleMenu = React.useCallback(() => {
    setIsMenuOpen(prev => {
      const newState = !prev
      if (newState) {
        // Focus trap when menu opens
        setTimeout(() => {
          const firstMenuItem = document.querySelector('[data-mobile-menu-item]') as HTMLElement
          firstMenuItem?.focus()
        }, 100)
      } else {
        // Return focus to menu button when closed
        menuButtonRef.current?.focus()
      }
      return newState
    })
  }, [])

  // Handle search
  const handleSearchSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
    setIsSearchFocused(false)
    searchInputRef.current?.blur()
  }, [searchQuery, onSearch])

  // Keyboard navigation for menu
  const handleMenuKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsMenuOpen(false)
      menuButtonRef.current?.focus()
    }
  }, [])

  // Default navigation items
  const defaultNavItems: MobileNavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      href: '/'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderOpen className="h-5 w-5" />,
      href: '/projects'
    },
    {
      id: 'team',
      label: 'Team',
      icon: <Users className="h-5 w-5" />,
      href: '/team'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Calendar className="h-5 w-5" />,
      href: '/schedule'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings'
    }
  ]

  const finalNavItems = navigationItems.length > 0 ? navigationItems : defaultNavItems

  return (
    <div 
      className={cn(
        "mobile-vh flex flex-col bg-background",
        useSafeArea && "safe-area-inset",
        fieldOptimized && "field-optimized-layout"
      )}
      id={layoutId}
    >
      {/* Status Bar */}
      {showStatusBar && (
        <div className={cn(
          "flex items-center justify-between px-4 py-1 text-xs bg-muted/50 border-b",
          fieldOptimized && "py-2 text-sm"
        )}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isOnline && (
              <Badge variant="destructive" size="sm">
                Offline
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
            <Signal className="h-3 w-3" />
            {batteryLevel !== null && (
              <div className="flex items-center space-x-1">
                <Battery className={cn(
                  "h-3 w-3",
                  batteryLevel < 20 && "text-red-500",
                  batteryLevel < 50 && batteryLevel >= 20 && "text-yellow-500",
                  batteryLevel >= 50 && "text-green-500"
                )} />
                <span>{batteryLevel}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className={cn(
        "flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-40",
        fieldOptimized && "p-6 border-b-2"
      )}>
        <div className="flex items-center space-x-3">
          {showBack ? (
            <Button
              variant="ghost"
              size={fieldOptimized ? "field" : "default"}
              onClick={onBack}
              ariaLabel="Go back"
              className="p-2"
            >
              <ArrowLeft className={fieldOptimized ? "h-6 w-6" : "h-5 w-5"} />
            </Button>
          ) : (
            <Button
              ref={menuButtonRef}
              variant="ghost"
              size={fieldOptimized ? "field" : "default"}
              onClick={toggleMenu}
              ariaLabel="Open navigation menu"
              className="p-2"
              aria-expanded={isMenuOpen}
              aria-controls={`${layoutId}-menu`}
            >
              <Menu className={fieldOptimized ? "h-6 w-6" : "h-5 w-5"} />
            </Button>
          )}
          
          <h1 className={cn(
            "font-bold text-foreground truncate",
            fieldOptimized ? "text-xl" : "text-lg"
          )}>
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <form onSubmit={handleSearchSubmit}>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className={cn(
                    "w-40 px-3 py-2 text-sm bg-muted rounded-lg border-0 focus:ring-2 focus:ring-construction-blue focus:outline-none",
                    fieldOptimized && "w-48 py-3 text-base",
                    isSearchFocused && "w-60"
                  )}
                  aria-label="Search projects and tasks"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </form>
            </div>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size={fieldOptimized ? "field" : "default"}
            className="relative p-2"
            ariaLabel={`Notifications ${notificationCount > 0 ? `(${notificationCount} unread)` : ''}`}
          >
            <Bell className={fieldOptimized ? "h-6 w-6" : "h-5 w-5"} />
            {notificationCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                variant="destructive"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>

          {/* Primary Action */}
          {showPrimaryAction && primaryAction && (
            <Button
              variant="construction"
              size={fieldOptimized ? "field" : "default"}
              onClick={primaryAction.onClick}
              className="ml-2"
            >
              {primaryAction.icon}
              <span className="ml-2">{primaryAction.label}</span>
            </Button>
          )}
        </div>
      </header>

      {/* Slide-out Menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50"
          onClick={toggleMenu}
          onKeyDown={handleMenuKeyDown}
          tabIndex={-1}
          role="presentation"
        >
          <div 
            className={cn(
              "absolute left-0 top-0 bottom-0 w-80 bg-background border-r shadow-xl transform transition-transform",
              useSafeArea && "safe-area-inset"
            )}
            onClick={(e) => e.stopPropagation()}
            id={`${layoutId}-menu`}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                ariaLabel="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {finalNavItems.map((item) => (
                  <li key={item.id}>
                    <Button
                      variant={activeNav === item.id ? "construction" : "ghost"}
                      size="lg"
                      className="w-full justify-start"
                      onClick={() => {
                        item.onClick?.()
                        if (item.href) {
                          window.location.href = item.href
                        }
                        setIsMenuOpen(false)
                      }}
                      disabled={item.disabled}
                      data-mobile-menu-item
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge className="ml-auto" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Install Prompt */}
            {showInstallPrompt && (
              <div className="p-4 border-t">
                <Card className="p-4">
                  <div className="text-sm mb-3">
                    <h3 className="font-semibold mb-1">Install App</h3>
                    <p className="text-muted-foreground">
                      Install for faster access and offline use
                    </p>
                  </div>
                  <Button 
                    onClick={onInstall}
                    className="w-full"
                    variant="construction"
                  >
                    Install Now
                  </Button>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      {finalNavItems.length > 0 && (
        <nav 
          className={cn(
            "border-t bg-background/95 backdrop-blur",
            useSafeArea && "pb-safe"
          )}
          role="tablist"
          aria-label="Main navigation"
        >
          <div className="grid grid-cols-5 h-16">
            {finalNavItems.slice(0, 5).map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "h-full flex flex-col items-center justify-center space-y-1 rounded-none",
                  activeNav === item.id && "text-construction-blue bg-construction-blue/10",
                  fieldOptimized && "h-20 text-lg"
                )}
                onClick={() => {
                  item.onClick?.()
                  if (item.href) {
                    window.location.href = item.href
                  }
                }}
                disabled={item.disabled}
                role="tab"
                aria-selected={activeNav === item.id}
                aria-label={item.label}
              >
                <div className="relative">
                  {item.icon}
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                      variant="destructive"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  fieldOptimized && "text-sm"
                )}>
                  {item.label}
                </span>
              </Button>
            ))}
          </div>
        </nav>
      )}

      {/* Floating Action Button */}
      {showPrimaryAction && primaryAction && (
        <Button
          variant="construction"
          size={fieldOptimized ? "field" : "lg"}
          className={cn(
            "fixed bottom-20 right-4 z-30 rounded-full shadow-lg h-14 w-14 p-0",
            fieldOptimized && "h-16 w-16 bottom-24",
            useSafeArea && "bottom-24"
          )}
          onClick={primaryAction.onClick}
          ariaLabel={primaryAction.label}
        >
          {primaryAction.icon || <Plus className="h-6 w-6" />}
        </Button>
      )}

      {/* Scroll to Top Button */}
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "fixed bottom-32 right-4 z-20 rounded-full shadow-md h-10 w-10 p-0",
          fieldOptimized && "h-12 w-12 bottom-36",
          useSafeArea && "bottom-36"
        )}
        onClick={() => {
          document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        ariaLabel="Scroll to top"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
    </div>
  )
}

export { MobileLayout }