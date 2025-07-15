"use client"

import React, { useState, useEffect } from 'react'
import { 
  Home, 
  CheckSquare, 
  Users, 
  MessageSquare, 
  Settings,
  ArrowLeft,
  Menu,
  Wifi,
  WifiOff,
  Battery,
  Signal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileLayoutProps {
  children: React.ReactNode
  title?: string
  showBackButton?: boolean
  onBack?: () => void
  activeTab?: string
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title = "Job Site",
  showBackButton = false,
  onBack,
  activeTab = 'home'
}) => {
  const [isOnline, setIsOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [signalStrength, setSignalStrength] = useState(3)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
      setTimeout(() => setShowOfflineMessage(false), 3000)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(timer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const navigationItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/mobile' },
    { id: 'tasks', icon: CheckSquare, label: 'Tasks', path: '/mobile/tasks' },
    { id: 'crew', icon: Users, label: 'Crew', path: '/mobile/crew' },
    { id: 'messages', icon: MessageSquare, label: 'Messages', path: '/mobile/messages' },
    { id: 'settings', icon: Settings, label: 'Settings', path: '/mobile/settings' }
  ]

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Status Bar */}
      <div className="bg-black text-white px-4 py-2 flex justify-between items-center text-sm sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
          <span className="text-xs bg-gray-800 px-2 py-1 rounded">
            {title}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Signal Strength */}
          <div className="flex">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-4 mx-0.5 rounded ${
                  i < signalStrength ? 'bg-white' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          {/* WiFi Status */}
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
          
          {/* Battery */}
          <div className="flex items-center">
            <Battery className="w-4 h-4 mr-1" />
            <span className={`text-xs ${batteryLevel < 20 ? 'text-red-400' : ''}`}>
              {batteryLevel}%
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-orange-600 text-white px-4 py-4 sticky top-8 z-40">
        <div className="flex items-center justify-between">
          {showBackButton ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 hover:bg-orange-700 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          ) : (
            <div className="w-10" />
          )}
          
          <h1 className="text-lg font-bold text-center flex-1">{title}</h1>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-orange-700 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Offline Message */}
      <AnimatePresence>
        {showOfflineMessage && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="bg-red-500 text-white px-4 py-3 text-center text-sm font-semibold"
          >
            <div className="flex items-center justify-center space-x-2">
              <WifiOff className="w-4 h-4" />
              <span>Working offline - changes will sync when connected</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <main className="pb-20 min-h-[calc(100vh-140px)]">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
        <div className="flex justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex flex-col items-center justify-center py-2 px-3 rounded-lg
                  transition-all duration-200 min-w-[60px]
                  ${isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-semibold">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed top-20 right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg z-50"
          >
            <WifiOff className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Overlay */}
      <div className="fixed bottom-24 left-4 right-4 z-30">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg"
          style={{ 
            boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)',
            background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
          }}
        >
          🚨 EMERGENCY STOP
        </motion.button>
      </div>

      {/* Quick Access Floating Buttons */}
      <div className="fixed bottom-32 right-4 space-y-3 z-30">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <MessageSquare className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Users className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Touch Optimizations */}
      <style jsx global>{`
        /* Prevent zoom on input focus */
        input[type="text"],
        input[type="number"],
        input[type="email"],
        input[type="password"],
        input[type="search"],
        input[type="tel"],
        input[type="url"],
        select,
        textarea {
          font-size: 16px;
        }
        
        /* Improve touch targets */
        button, 
        .touch-target {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Remove iOS tap highlights */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Improve readability in sunlight */
        .high-contrast {
          color: #000;
          background: #fff;
          font-weight: 600;
        }
        
        /* Large touch areas for gloves */
        .glove-friendly {
          padding: 16px;
          margin: 8px;
          font-size: 18px;
          font-weight: 600;
        }
        
        /* Prevent accidental selections */
        .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  )
}

export default MobileLayout