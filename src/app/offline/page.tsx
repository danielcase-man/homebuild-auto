"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  WifiOff, 
  RefreshCw, 
  Database, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Smartphone
} from 'lucide-react'
import { usePWA } from '@/lib/pwa-service'

export default function OfflinePage() {
  const { capabilities, syncStatus, isOffline } = usePWA()

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleRetryConnection = () => {
    // Trigger a network check
    fetch('/api/health', { method: 'HEAD' })
      .then(() => {
        window.location.href = '/'
      })
      .catch(() => {
        console.log('Still offline')
      })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
      >
        {/* Offline Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center"
        >
          <WifiOff className="h-10 w-10 text-orange-600" />
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>

        <p className="text-gray-600 mb-8">
          No internet connection detected. Don't worry, you can still access cached data 
          and your changes will sync when you're back online.
        </p>

        {/* Offline Capabilities */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm font-medium text-green-800">Cached Data</span>
            </div>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Smartphone className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm font-medium text-blue-800">Mobile Interface</span>
            </div>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>

          {syncStatus.pending > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium text-yellow-800">
                  {syncStatus.pending} changes pending sync
                </span>
              </div>
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetryConnection}
            className="w-full flex items-center justify-center px-4 py-3 bg-construction-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Connection
          </button>

          <button
            onClick={handleRefresh}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Refresh Page
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Go Back
          </button>
        </div>

        {/* PWA Info */}
        {capabilities?.isInstalled && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              App Installed
            </h3>
            <p className="text-xs text-blue-700">
              This app works offline with cached data. Your changes will automatically 
              sync when internet connection is restored.
            </p>
          </div>
        )}

        {/* Available Features */}
        <div className="mt-8 text-left">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Available Offline Features:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• View cached project data</li>
            <li>• Access project timeline</li>
            <li>• Review budget information</li>
            <li>• Browse vendor contacts</li>
            <li>• View compliance checklists</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}