"use client"

import React, { useState, useEffect } from 'react'
import { 
  Hammer, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Camera,
  Phone,
  MessageSquare,
  MapPin,
  Battery,
  Wifi,
  Signal,
  Menu,
  X,
  Plus,
  PlayCircle,
  PauseCircle,
  Home
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/stores/project-store'

const JobSiteDashboard: React.FC = () => {
  const {
    tasks,
    crew,
    issues,
    updateTask,
    initializeData
  } = useProjectStore()

  const [activeTab, setActiveTab] = useState<'tasks' | 'crew' | 'issues' | 'photos'>('tasks')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [connectionStrength, setConnectionStrength] = useState(3)

  useEffect(() => {
    initializeData()
  }, [initializeData])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Status colors with high contrast for outdoor visibility
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'resolved': return 'bg-green-500'
      case 'in_progress': return 'bg-blue-500'
      case 'pending': case 'open': return 'bg-yellow-500'
      case 'blocked': case 'critical': return 'bg-red-500'
      case 'on_site': return 'bg-green-500'
      case 'off_site': return 'bg-gray-500'
      case 'break': return 'bg-yellow-500'
      case 'emergency': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500'
      case 'high': return 'border-l-orange-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-400'
    }
  }

  const TabButton: React.FC<{ 
    tab: string
    icon: React.ReactNode
    label: string
    isActive: boolean
    badge?: number
  }> = ({ tab, icon, label, isActive, badge }) => (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveTab(tab as any)}
      className={`
        flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-lg
        transition-all duration-200 min-h-[80px] relative
        ${isActive 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'bg-white text-gray-600 border border-gray-200'
        }
        hover:shadow-md active:scale-95
      `}
    >
      <div className="mb-2">{icon}</div>
      <span className="text-sm font-semibold">{label}</span>
      {badge && badge > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </motion.button>
  )

  const TaskCard: React.FC<{ task: typeof tasks[0] }> = ({ task }) => {
    const handleTaskStatusToggle = () => {
      const newStatus = task.status === 'in_progress' ? 'pending' : 'in_progress'
      updateTask(task.id, { status: newStatus })
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          bg-white rounded-xl shadow-lg border-l-4 ${getPriorityColor(task.priority)}
          p-6 mb-4 touch-manipulation
        `}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{task.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {task.estimatedTime}
              </span>
              {task.location && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {task.location}
                </span>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </div>
        </div>
        
        {task.assignedTo && (
          <div className="flex items-center mb-3">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-700">{task.assignedTo}</span>
          </div>
        )}
        
        {task.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-700">{task.notes}</p>
          </div>
        )}
        
        <div className="flex space-x-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTaskStatusToggle}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center"
          >
            {task.status === 'in_progress' ? (
              <>
                <PauseCircle className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold flex items-center justify-center"
          >
            <Camera className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    )
  }

  const CrewCard: React.FC<{ member: typeof crew[0] }> = ({ member }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
            <p className="text-sm text-gray-600">{member.role}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(member.status)}`}>
          {member.status.replace('_', ' ')}
        </div>
      </div>
      
      {member.currentTask && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Current Task:</span> {member.currentTask}
          </p>
        </div>
      )}
      
      {member.checkInTime && (
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-semibold">Checked in:</span> {member.checkInTime.toLocaleTimeString()}
        </div>
      )}
      
      <div className="flex space-x-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center"
        >
          <Phone className="w-5 h-5 mr-2" />
          Call
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Message
        </motion.button>
      </div>
    </motion.div>
  )

  const IssueCard: React.FC<{ issue: typeof issues[0] }> = ({ issue }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-4 border-l-4 border-l-red-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className={`w-5 h-5 ${
              issue.severity === 'critical' ? 'text-red-600' :
              issue.severity === 'high' ? 'text-orange-500' :
              issue.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
            }`} />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {issue.type} • {issue.severity}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{issue.description}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {issue.location}
            </span>
            <span>{issue.reportedBy}</span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getStatusColor(issue.status)}`}>
          {issue.status.replace('_', ' ')}
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        <span className="font-semibold">Reported:</span> {issue.timestamp.toLocaleString()}
      </div>
      
      <div className="flex space-x-3">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          Escalate
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold flex items-center justify-center"
        >
          <Camera className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Status Bar */}
      <div className="bg-black text-white px-4 py-2 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-2">
          <span>{currentTime.toLocaleTimeString()}</span>
          <Home className="w-4 h-4" />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-1 h-4 mx-0.5 rounded ${
                  i < connectionStrength ? 'bg-white' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <Wifi className="w-4 h-4" />
          <div className="flex items-center">
            <Battery className="w-4 h-4 mr-1" />
            <span>{batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-blue-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Job Site</h1>
            <p className="text-blue-200">708 Purple Salvia Cove</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 bg-blue-600 rounded-lg"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{tasks.filter(t => t.status === 'completed').length}</div>
            <div className="text-sm text-blue-200">Completed</div>
          </div>
          <div className="bg-blue-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{crew.filter(c => c.status === 'on_site').length}</div>
            <div className="text-sm text-blue-200">On Site</div>
          </div>
          <div className="bg-blue-600 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">{issues.filter(i => i.status === 'open').length}</div>
            <div className="text-sm text-blue-200">Open Issues</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-6">
          <TabButton
            tab="tasks"
            icon={<CheckCircle className="w-6 h-6" />}
            label="Tasks"
            isActive={activeTab === 'tasks'}
            badge={tasks.filter(t => t.status !== 'completed').length}
          />
          <TabButton
            tab="crew"
            icon={<Users className="w-6 h-6" />}
            label="Crew"
            isActive={activeTab === 'crew'}
            badge={crew.filter(c => c.status === 'on_site').length}
          />
          <TabButton
            tab="issues"
            icon={<AlertTriangle className="w-6 h-6" />}
            label="Issues"
            isActive={activeTab === 'issues'}
            badge={issues.filter(i => i.status === 'open').length}
          />
          <TabButton
            tab="photos"
            icon={<Camera className="w-6 h-6" />}
            label="Photos"
            isActive={activeTab === 'photos'}
          />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </motion.div>
          )}
          
          {activeTab === 'crew' && (
            <motion.div
              key="crew"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {crew.map(member => (
                <CrewCard key={member.id} member={member} />
              ))}
            </motion.div>
          )}
          
          {activeTab === 'issues' && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {issues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </motion.div>
          )}
          
          {activeTab === 'photos' && (
            <motion.div
              key="photos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-12"
            >
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Photo Gallery</h3>
              <p className="text-gray-500 mb-6">Capture progress photos and documentation</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold flex items-center mx-auto"
              >
                <Camera className="w-5 h-5 mr-2" />
                Take Photo
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Emergency Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 left-6 bg-red-600 text-white py-3 px-6 rounded-full shadow-lg font-semibold flex items-center z-50"
      >
        <AlertTriangle className="w-5 h-5 mr-2" />
        Emergency
      </motion.button>
    </div>
  )
}

export default JobSiteDashboard