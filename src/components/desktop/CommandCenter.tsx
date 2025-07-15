"use client"

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Home,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  MapPin,
  Settings,
  Search,
  Bell,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/stores/project-store'

interface Panel {
  id: string
  title: string
  component: React.ReactNode
  size: 'small' | 'medium' | 'large' | 'full'
  position: { x: number; y: number }
  isMinimized: boolean
  canResize: boolean
}

const CommandCenter: React.FC = () => {
  const {
    metrics,
    notifications,
    tasks,
    crew,
    issues,
    initializeData,
    markNotificationRead
  } = useProjectStore()

  const [panels, setPanels] = useState<Panel[]>([])
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null)

  // Initialize data and default panels
  useEffect(() => {
    initializeData()
  }, [initializeData])

  useEffect(() => {
    const defaultPanels: Panel[] = [
      {
        id: 'overview',
        title: 'Project Overview',
        component: <ProjectOverviewPanel metrics={metrics} />,
        size: 'large',
        position: { x: 0, y: 0 },
        isMinimized: false,
        canResize: true
      },
      {
        id: 'timeline',
        title: 'Timeline & Schedule',
        component: <TimelinePanel />,
        size: 'medium',
        position: { x: 800, y: 0 },
        isMinimized: false,
        canResize: true
      },
      {
        id: 'budget',
        title: 'Budget Tracker',
        component: <BudgetPanel metrics={metrics} />,
        size: 'medium',
        position: { x: 0, y: 400 },
        isMinimized: false,
        canResize: true
      },
      {
        id: 'communications',
        title: 'Communications Hub',
        component: <CommunicationsPanel />,
        size: 'medium',
        position: { x: 400, y: 400 },
        isMinimized: false,
        canResize: true
      },
      {
        id: 'crew',
        title: 'Crew Management',
        component: <CrewPanel crew={crew} />,
        size: 'small',
        position: { x: 800, y: 400 },
        isMinimized: false,
        canResize: true
      },
      {
        id: 'issues',
        title: 'Issue Tracker',
        component: <IssueTrackerPanel issues={issues} />,
        size: 'small',
        position: { x: 1000, y: 400 },
        isMinimized: false,
        canResize: true
      }
    ]
    setPanels(defaultPanels)
  }, [metrics, crew, issues])

  const togglePanelMinimize = (panelId: string) => {
    setPanels(panels.map(panel => 
      panel.id === panelId 
        ? { ...panel, isMinimized: !panel.isMinimized }
        : panel
    ))
  }

  const closePanel = (panelId: string) => {
    setPanels(panels.filter(panel => panel.id !== panelId))
  }

  const getPanelDimensions = (size: string, isMinimized: boolean) => {
    if (isMinimized) return { width: 300, height: 50 }
    
    switch (size) {
      case 'small': return { width: 300, height: 250 }
      case 'medium': return { width: 400, height: 350 }
      case 'large': return { width: 600, height: 400 }
      case 'full': return { width: '100%', height: '100%' }
      default: return { width: 400, height: 350 }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <Home className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Command Center</h1>
              <p className="text-sm text-gray-600">708 Purple Salvia Cove</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ml-8">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, tasks, contacts..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-96 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-gray-600 hover:text-gray-900"
          >
            <Bell className="w-6 h-6" />
            {notifications.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                {notifications.length}
              </div>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Panel</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Settings className="w-6 h-6" />
          </motion.button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-900">
                {metrics.completion}% Complete
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                ${metrics.budgetUsed.toLocaleString()} / ${metrics.totalBudget.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {metrics.daysRemaining} days remaining
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {metrics.crewOnSite} crew on site
              </span>
            </div>
            {metrics.activeIssues > 0 && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-semibold">
                  {metrics.activeIssues} active issues
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-600 hover:text-gray-900"
            >
              <Download className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-600 hover:text-gray-900"
            >
              <Filter className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Dashboard Panels */}
      <div className="relative p-6" style={{ height: 'calc(100vh - 140px)' }}>
        <AnimatePresence>
          {panels.map((panel) => {
            const dimensions = getPanelDimensions(panel.size, panel.isMinimized)
            
            return (
              <motion.div
                key={panel.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`
                  absolute bg-white rounded-lg shadow-lg border border-gray-200
                  ${selectedPanel === panel.id ? 'ring-2 ring-blue-500' : ''}
                `}
                style={{
                  left: panel.position.x,
                  top: panel.position.y,
                  width: dimensions.width,
                  height: panel.isMinimized ? 50 : dimensions.height,
                  zIndex: selectedPanel === panel.id ? 10 : 1
                }}
                onClick={() => setSelectedPanel(panel.id)}
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <h3 className="font-semibold text-gray-900">{panel.title}</h3>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePanelMinimize(panel.id)
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {panel.isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        closePanel(panel.id)
                      }}
                      className="p-1 text-gray-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Panel Content */}
                {!panel.isMinimized && (
                  <div className="p-4 h-full overflow-auto">
                    {panel.component}
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Notifications Sidebar */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed right-4 top-20 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-40"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
                      <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                      <p className="text-gray-400 text-xs mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Panel Components
const ProjectOverviewPanel: React.FC<{ metrics: any }> = ({ metrics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-blue-900">{metrics.completion}%</h4>
        <p className="text-blue-700">Project Complete</p>
        <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${metrics.completion}%` }}
          />
        </div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="text-lg font-semibold text-green-900">
          {metrics.tasksCompleted}/{metrics.totalTasks}
        </h4>
        <p className="text-green-700">Tasks Completed</p>
      </div>
    </div>
    
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Foundation inspection completed</span>
          <span className="text-gray-500">2 hours ago</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-yellow-500" />
          <span>Electrical rough-in scheduled</span>
          <span className="text-gray-500">4 hours ago</span>
        </div>
      </div>
    </div>
  </div>
)

const TimelinePanel: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold text-gray-900">This Week</h4>
      <Calendar className="w-5 h-5 text-gray-500" />
    </div>
    <div className="space-y-3">
      {[
        { day: 'Today', task: 'Foundation Inspection', time: '10:00 AM', status: 'scheduled' },
        { day: 'Tomorrow', task: 'Electrical Rough-In', time: '8:00 AM', status: 'scheduled' },
        { day: 'Friday', task: 'Plumbing Installation', time: 'All Day', status: 'in_progress' }
      ].map((item, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-semibold text-gray-900">{item.task}</p>
            <p className="text-sm text-gray-600">{item.day} • {item.time}</p>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-semibold ${
            item.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {item.status}
          </div>
        </div>
      ))}
    </div>
  </div>
)

const BudgetPanel: React.FC<{ metrics: any }> = ({ metrics }) => {
  const budgetPercentage = (metrics.budgetUsed / metrics.totalBudget) * 100
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900">Budget Status</h4>
        <DollarSign className="w-5 h-5 text-gray-500" />
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Used</span>
          <span className="text-sm font-semibold">{budgetPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full ${budgetPercentage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
            style={{ width: `${budgetPercentage}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-600">${metrics.budgetUsed.toLocaleString()}</span>
          <span className="text-gray-600">${metrics.totalBudget.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

const CommunicationsPanel: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold text-gray-900">Recent Messages</h4>
      <div className="flex space-x-2">
        <Mail className="w-5 h-5 text-gray-500" />
        <Phone className="w-5 h-5 text-gray-500" />
      </div>
    </div>
    <div className="space-y-3">
      {[
        { from: 'Mike Johnson', message: 'Foundation inspection passed', time: '10 min ago' },
        { from: 'Sarah Wilson', message: 'Electrical materials delivered', time: '1 hour ago' },
        { from: 'Liberty Hill', message: 'Permit renewal reminder', time: '2 hours ago' }
      ].map((msg, index) => (
        <div key={index} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-start mb-1">
            <p className="font-semibold text-gray-900 text-sm">{msg.from}</p>
            <span className="text-xs text-gray-500">{msg.time}</span>
          </div>
          <p className="text-sm text-gray-600">{msg.message}</p>
        </div>
      ))}
    </div>
  </div>
)

const CrewPanel: React.FC<{ crew: any[] }> = ({ crew }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold text-gray-900">Crew Status</h4>
      <Users className="w-5 h-5 text-gray-500" />
    </div>
    <div className="space-y-2">
      {crew.map((member: any, index: number) => (
        <div key={index} className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
            <p className="text-xs text-gray-600">{member.role}</p>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            member.status === 'on_site' ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
        </div>
      ))}
    </div>
  </div>
)

const IssueTrackerPanel: React.FC<{ issues: any[] }> = ({ issues }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold text-gray-900">Active Issues</h4>
      <AlertTriangle className="w-5 h-5 text-red-500" />
    </div>
    <div className="space-y-2">
      {issues.map((item: any, index: number) => (
        <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-500">
          <p className="text-sm font-semibold text-red-900">{item.description}</p>
          <p className="text-xs text-red-700 capitalize">{item.severity} severity</p>
        </div>
      ))}
    </div>
  </div>
)

export default CommandCenter
export { CommandCenter }