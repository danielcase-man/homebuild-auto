import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface Task {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedTime: string
  assignedTo?: string
  notes?: string
  location?: string
  dependencies?: string[]
  updatedAt: Date
}

export interface Crew {
  id: string
  name: string
  role: string
  status: 'on_site' | 'off_site' | 'break' | 'emergency'
  phone: string
  currentTask?: string
  checkInTime?: Date
  updatedAt: Date
}

export interface Issue {
  id: string
  type: 'safety' | 'quality' | 'material' | 'weather' | 'equipment'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location: string
  reportedBy: string
  timestamp: Date
  photos?: string[]
  status: 'open' | 'in_progress' | 'resolved'
  updatedAt: Date
}

export interface ProjectMetrics {
  totalBudget: number
  budgetUsed: number
  daysRemaining: number
  completion: number
  tasksCompleted: number
  totalTasks: number
  activeIssues: number
  crewOnSite: number
  updatedAt: Date
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface ProjectState {
  tasks: Task[]
  crew: Crew[]
  issues: Issue[]
  metrics: ProjectMetrics
  notifications: Notification[]
  
  isLoading: boolean
  error: string | null
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  
  // Crew actions
  addCrew: (member: Omit<Crew, 'id' | 'updatedAt'>) => void
  updateCrew: (id: string, updates: Partial<Crew>) => void
  deleteCrew: (id: string) => void
  
  // Issue actions
  addIssue: (issue: Omit<Issue, 'id' | 'updatedAt'>) => void
  updateIssue: (id: string, updates: Partial<Issue>) => void
  deleteIssue: (id: string) => void
  
  // Metrics actions
  updateMetrics: (updates: Partial<ProjectMetrics>) => void
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  
  // Computed getters
  getTasksByStatus: (status: Task['status']) => Task[]
  getCrewByStatus: (status: Crew['status']) => Crew[]
  getIssuesBySeverity: (severity: Issue['severity']) => Issue[]
  getUnreadNotifications: () => Notification[]
  
  // Utility actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  initializeData: () => void
}

export const useProjectStore = create<ProjectState>()(
  subscribeWithSelector((set, get) => ({
    tasks: [],
    crew: [],
    issues: [],
    metrics: {
      totalBudget: 0,
      budgetUsed: 0,
      daysRemaining: 0,
      completion: 0,
      tasksCompleted: 0,
      totalTasks: 0,
      activeIssues: 0,
      crewOnSite: 0,
      updatedAt: new Date()
    },
    notifications: [],
    isLoading: false,
    error: null,
    
    addTask: (task) => set((state) => ({
      tasks: [...state.tasks, {
        ...task,
        id: crypto.randomUUID(),
        updatedAt: new Date()
      }]
    })),
    
    updateTask: (id, updates) => set((state) => ({
      tasks: state.tasks.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    })),
    
    deleteTask: (id) => set((state) => ({
      tasks: state.tasks.filter(task => task.id !== id)
    })),
    
    addCrew: (member) => set((state) => ({
      crew: [...state.crew, {
        ...member,
        id: crypto.randomUUID(),
        updatedAt: new Date()
      }]
    })),
    
    updateCrew: (id, updates) => set((state) => ({
      crew: state.crew.map(member => 
        member.id === id 
          ? { ...member, ...updates, updatedAt: new Date() }
          : member
      )
    })),
    
    deleteCrew: (id) => set((state) => ({
      crew: state.crew.filter(member => member.id !== id)
    })),
    
    addIssue: (issue) => set((state) => ({
      issues: [...state.issues, {
        ...issue,
        id: crypto.randomUUID(),
        updatedAt: new Date()
      }]
    })),
    
    updateIssue: (id, updates) => set((state) => ({
      issues: state.issues.map(issue => 
        issue.id === id 
          ? { ...issue, ...updates, updatedAt: new Date() }
          : issue
      )
    })),
    
    deleteIssue: (id) => set((state) => ({
      issues: state.issues.filter(issue => issue.id !== id)
    })),
    
    updateMetrics: (updates) => set((state) => ({
      metrics: { ...state.metrics, ...updates, updatedAt: new Date() }
    })),
    
    addNotification: (notification) => set((state) => ({
      notifications: [...state.notifications, {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: new Date(),
        read: false
      }]
    })),
    
    markNotificationRead: (id) => set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    })),
    
    clearNotifications: () => set({ notifications: [] }),
    
    getTasksByStatus: (status) => get().tasks.filter(task => task.status === status),
    getCrewByStatus: (status) => get().crew.filter(member => member.status === status),
    getIssuesBySeverity: (severity) => get().issues.filter(issue => issue.severity === severity),
    getUnreadNotifications: () => get().notifications.filter(notification => !notification.read),
    
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    
    initializeData: () => set({
      tasks: [
        {
          id: '1',
          title: 'Foundation Inspection',
          status: 'pending',
          priority: 'urgent',
          estimatedTime: '30 min',
          assignedTo: 'Mike Johnson',
          location: 'Foundation Area',
          notes: 'Inspector arriving at 10:00 AM',
          updatedAt: new Date()
        },
        {
          id: '2',
          title: 'Electrical Rough-In',
          status: 'in_progress',
          priority: 'high',
          estimatedTime: '4 hours',
          assignedTo: 'Sarah Wilson',
          location: 'Main Floor',
          updatedAt: new Date()
        },
        {
          id: '3',
          title: 'Plumbing Installation',
          status: 'completed',
          priority: 'medium',
          estimatedTime: '6 hours',
          assignedTo: 'Tom Martinez',
          location: 'Basement',
          updatedAt: new Date()
        }
      ],
      crew: [
        {
          id: '1',
          name: 'Mike Johnson',
          role: 'Foreman',
          status: 'on_site',
          phone: '(512) 555-0123',
          currentTask: 'Foundation Inspection',
          checkInTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Sarah Wilson',
          role: 'Electrician',
          status: 'on_site',
          phone: '(512) 555-0124',
          currentTask: 'Electrical Rough-In',
          checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date()
        },
        {
          id: '3',
          name: 'Tom Martinez',
          role: 'Plumber',
          status: 'break',
          phone: '(512) 555-0125',
          checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
          updatedAt: new Date()
        }
      ],
      issues: [
        {
          id: '1',
          type: 'safety',
          severity: 'high',
          description: 'Loose scaffolding on east side',
          location: 'East Wall - 2nd Floor',
          reportedBy: 'Mike Johnson',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          status: 'open',
          updatedAt: new Date()
        },
        {
          id: '2',
          type: 'material',
          severity: 'medium',
          description: 'Short 20 pieces of 2x4 lumber',
          location: 'Material Storage',
          reportedBy: 'Sarah Wilson',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          status: 'in_progress',
          updatedAt: new Date()
        }
      ],
      metrics: {
        totalBudget: 350000,
        budgetUsed: 147500,
        daysRemaining: 82,
        completion: 42,
        tasksCompleted: 156,
        totalTasks: 372,
        activeIssues: 3,
        crewOnSite: 8,
        updatedAt: new Date()
      },
      notifications: [
        {
          id: '1',
          type: 'warning',
          title: 'Budget Alert',
          message: 'Material costs 8% over budget',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: false
        },
        {
          id: '2',
          type: 'info',
          title: 'Inspection Scheduled',
          message: 'Foundation inspection tomorrow at 10 AM',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          read: false
        },
        {
          id: '3',
          type: 'success',
          title: 'Permit Approved',
          message: 'Electrical permit approved by Liberty Hill',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: false
        }
      ]
    })
  }))
)