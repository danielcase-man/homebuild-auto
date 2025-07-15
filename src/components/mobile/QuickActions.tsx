"use client"

import React, { useState } from 'react'
import { 
  Camera, 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  Clock,
  CheckCircle,
  MapPin,
  Thermometer,
  Wind,
  Sun,
  CloudRain,
  Mic,
  StopCircle,
  Play,
  Save,
  X,
  Send
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface QuickAction {
  id: string
  icon: React.ReactNode
  label: string
  color: string
  action: () => void
}

interface VoiceNote {
  id: string
  duration: number
  timestamp: Date
  transcription?: string
}

const QuickActions: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showReportIssue, setShowReportIssue] = useState(false)
  const [showTimeLogger, setShowTimeLogger] = useState(false)
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [currentWeather, setCurrentWeather] = useState({
    temp: 78,
    condition: 'sunny',
    windSpeed: 8,
    humidity: 45
  })

  const quickActions: QuickAction[] = [
    {
      id: 'camera',
      icon: <Camera className="w-8 h-8" />,
      label: 'Take Photo',
      color: 'bg-blue-500',
      action: () => handleTakePhoto()
    },
    {
      id: 'voice',
      icon: <Mic className="w-8 h-8" />,
      label: 'Voice Note',
      color: 'bg-green-500',
      action: () => handleVoiceNote()
    },
    {
      id: 'issue',
      icon: <AlertTriangle className="w-8 h-8" />,
      label: 'Report Issue',
      color: 'bg-red-500',
      action: () => setShowReportIssue(true)
    },
    {
      id: 'time',
      icon: <Clock className="w-8 h-8" />,
      label: 'Log Time',
      color: 'bg-purple-500',
      action: () => setShowTimeLogger(true)
    },
    {
      id: 'call',
      icon: <Phone className="w-8 h-8" />,
      label: 'Quick Call',
      color: 'bg-yellow-500',
      action: () => handleQuickCall()
    },
    {
      id: 'message',
      icon: <MessageSquare className="w-8 h-8" />,
      label: 'Send Update',
      color: 'bg-indigo-500',
      action: () => handleSendUpdate()
    }
  ]

  const handleTakePhoto = () => {
    // Would integrate with device camera
    console.log('Opening camera...')
  }

  const handleVoiceNote = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)
      const newNote: VoiceNote = {
        id: Date.now().toString(),
        duration: recordingTime,
        timestamp: new Date()
      }
      setVoiceNotes([...voiceNotes, newNote])
      setRecordingTime(0)
    } else {
      // Start recording
      setIsRecording(true)
      // Would start actual recording here
    }
  }

  const handleQuickCall = () => {
    // Would show contact list or make emergency call
    console.log('Opening quick call...')
  }

  const handleSendUpdate = () => {
    // Would open messaging interface
    console.log('Opening message composer...')
  }

  const getWeatherIcon = () => {
    switch (currentWeather.condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloudy': return <Wind className="w-6 h-6 text-gray-500" />
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />
      default: return <Sun className="w-6 h-6 text-yellow-500" />
    }
  }

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Weather Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">{currentWeather.temp}°F</div>
            <div className="text-blue-100">Perfect building weather</div>
          </div>
          <div className="text-right">
            {getWeatherIcon()}
            <div className="text-sm text-blue-100 mt-1">
              Wind: {currentWeather.windSpeed} mph
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.action}
            className={`
              ${action.color} text-white rounded-xl p-6 
              flex flex-col items-center justify-center space-y-3
              shadow-lg hover:shadow-xl transition-all duration-200
              min-h-[120px] touch-manipulation
            `}
          >
            {action.icon}
            <span className="font-semibold text-lg">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Voice Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-black bg-opacity-90 text-white rounded-xl p-8 text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Mic className="w-8 h-8" />
              </motion.div>
              <div className="text-2xl font-bold mb-2">{formatTime(recordingTime)}</div>
              <div className="text-gray-300 mb-6">Recording voice note...</div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleVoiceNote}
                className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold flex items-center mx-auto"
              >
                <StopCircle className="w-5 h-5 mr-2" />
                Stop Recording
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Reporter Modal */}
      <AnimatePresence>
        {showReportIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Report Issue</h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReportIssue(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Type
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg text-lg">
                    <option>Safety</option>
                    <option>Quality</option>
                    <option>Material</option>
                    <option>Equipment</option>
                    <option>Weather</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Severity
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Low', 'Medium', 'High', 'Critical'].map((severity) => (
                      <button
                        key={severity}
                        className="p-3 border border-gray-300 rounded-lg text-center hover:bg-gray-50"
                      >
                        {severity}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg h-24 text-lg"
                    placeholder="Describe the issue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      className="flex-1 p-3 border border-gray-300 rounded-lg text-lg"
                      placeholder="Location on site..."
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-500 text-white p-3 rounded-lg"
                    >
                      <MapPin className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Add Photo
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Submit
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Logger Modal */}
      <AnimatePresence>
        {showTimeLogger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Log Time</h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTimeLogger(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Task
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg text-lg">
                    <option>Foundation Work</option>
                    <option>Electrical Rough-In</option>
                    <option>Plumbing Installation</option>
                    <option>Framing</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      className="w-full p-3 border border-gray-300 rounded-lg text-lg"
                      defaultValue="08:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      className="w-full p-3 border border-gray-300 rounded-lg text-lg"
                      defaultValue="17:00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg h-20 text-lg"
                    placeholder="Work completed, issues encountered..."
                  />
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowTimeLogger(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Time
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Voice Notes */}
      {voiceNotes.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Voice Notes</h3>
          <div className="space-y-3">
            {voiceNotes.slice(-3).map((note) => (
              <div key={note.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-500 text-white p-2 rounded-full"
                  >
                    <Play className="w-4 h-4" />
                  </motion.button>
                  <div>
                    <div className="text-sm font-semibold">{formatTime(note.duration)}</div>
                    <div className="text-xs text-gray-500">
                      {note.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <button className="text-blue-600 text-sm font-semibold">
                  Transcribe
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuickActions