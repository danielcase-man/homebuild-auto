import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Project, ProjectPhase, Task, ProjectStatus, Priority } from '@/types'

interface ProjectFilters {
  status?: ProjectStatus[]
  priority?: Priority[]
  managerId?: string
  clientId?: string
  searchQuery?: string
  dateRange?: { start: Date; end: Date }
}

interface ProjectState {
  // Data
  projects: Project[]
  currentProject: Project | null
  phases: ProjectPhase[]
  tasks: Task[]
  
  // UI State
  filters: ProjectFilters
  sortBy: string
  sortOrder: 'asc' | 'desc'
  selectedProjectIds: string[]
  isLoading: boolean
  error: string | null
  
  // View State
  viewMode: 'grid' | 'list' | 'kanban' | 'timeline'
  showCompleted: boolean
  groupBy?: 'status' | 'priority' | 'manager' | 'client'
  
  // Actions
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  setCurrentProject: (project: Project | null) => void
  selectProject: (id: string) => void
  selectMultipleProjects: (ids: string[]) => void
  clearSelection: () => void
  
  // Phase Management
  setPhases: (phases: ProjectPhase[]) => void
  addPhase: (phase: ProjectPhase) => void
  updatePhase: (id: string, updates: Partial<ProjectPhase>) => void
  reorderPhases: (projectId: string, phaseIds: string[]) => void
  
  // Task Management
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (taskId: string, newPhaseId: string) => void
  
  // Filtering & Sorting
  setFilters: (filters: Partial<ProjectFilters>) => void
  clearFilters: () => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  
  // View Management
  setViewMode: (mode: 'grid' | 'list' | 'kanban' | 'timeline') => void
  setGroupBy: (groupBy: 'status' | 'priority' | 'manager' | 'client' | undefined) => void
  toggleShowCompleted: () => void
  
  // Async Actions
  fetchProjects: () => Promise<void>
  fetchProjectById: (id: string) => Promise<void>
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  
  // Computed Properties
  getFilteredProjects: () => Project[]
  getProjectsByStatus: () => Record<ProjectStatus, Project[]>
  getProjectMetrics: () => {
    total: number
    active: number
    completed: number
    overdue: number
    totalBudget: number
    totalActual: number
  }
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        projects: [],
        currentProject: null,
        phases: [],
        tasks: [],
        
        filters: {},
        sortBy: 'createdAt',
        sortOrder: 'desc',
        selectedProjectIds: [],
        isLoading: false,
        error: null,
        
        viewMode: 'grid',
        showCompleted: true,
        groupBy: undefined,
        
        // Basic Actions
        setProjects: (projects) => set((state) => {
          state.projects = projects
          state.isLoading = false
          state.error = null
        }),
        
        addProject: (project) => set((state) => {
          state.projects.push(project)
        }),
        
        updateProject: (id, updates) => set((state) => {
          const index = state.projects.findIndex(p => p.id === id)
          if (index !== -1) {
            Object.assign(state.projects[index], updates)
          }
          if (state.currentProject?.id === id) {
            Object.assign(state.currentProject, updates)
          }
        }),
        
        deleteProject: (id) => set((state) => {
          state.projects = state.projects.filter(p => p.id !== id)
          if (state.currentProject?.id === id) {
            state.currentProject = null
          }
          state.selectedProjectIds = state.selectedProjectIds.filter(pid => pid !== id)
        }),
        
        // Project Selection
        setCurrentProject: (project) => set((state) => {
          state.currentProject = project
        }),
        
        selectProject: (id) => set((state) => {
          if (state.selectedProjectIds.includes(id)) {
            state.selectedProjectIds = state.selectedProjectIds.filter(pid => pid !== id)
          } else {
            state.selectedProjectIds.push(id)
          }
        }),
        
        selectMultipleProjects: (ids) => set((state) => {
          state.selectedProjectIds = ids
        }),
        
        clearSelection: () => set((state) => {
          state.selectedProjectIds = []
        }),
        
        // Phase Management
        setPhases: (phases) => set((state) => {
          state.phases = phases
        }),
        
        addPhase: (phase) => set((state) => {
          state.phases.push(phase)
        }),
        
        updatePhase: (id, updates) => set((state) => {
          const index = state.phases.findIndex(p => p.id === id)
          if (index !== -1) {
            Object.assign(state.phases[index], updates)
          }
        }),
        
        reorderPhases: (projectId, phaseIds) => set((state) => {
          const projectPhases = state.phases.filter(p => p.projectId === projectId)
          const reorderedPhases = phaseIds.map((id, index) => {
            const phase = projectPhases.find(p => p.id === id)
            if (phase) {
              return { ...phase, order: index }
            }
            return null
          }).filter(Boolean) as ProjectPhase[]
          
          state.phases = [
            ...state.phases.filter(p => p.projectId !== projectId),
            ...reorderedPhases
          ]
        }),
        
        // Task Management
        setTasks: (tasks) => set((state) => {
          state.tasks = tasks
        }),
        
        addTask: (task) => set((state) => {
          state.tasks.push(task)
        }),
        
        updateTask: (id, updates) => set((state) => {
          const index = state.tasks.findIndex(t => t.id === id)
          if (index !== -1) {
            Object.assign(state.tasks[index], updates)
          }
        }),
        
        moveTask: (taskId, newPhaseId) => set((state) => {
          const task = state.tasks.find(t => t.id === taskId)
          if (task) {
            task.phaseId = newPhaseId
          }
        }),
        
        // Filtering & Sorting
        setFilters: (newFilters) => set((state) => {
          state.filters = { ...state.filters, ...newFilters }
        }),
        
        clearFilters: () => set((state) => {
          state.filters = {}
        }),
        
        setSorting: (sortBy, sortOrder) => set((state) => {
          state.sortBy = sortBy
          state.sortOrder = sortOrder
        }),
        
        // View Management
        setViewMode: (mode) => set((state) => {
          state.viewMode = mode
        }),
        
        setGroupBy: (groupBy) => set((state) => {
          state.groupBy = groupBy
        }),
        
        toggleShowCompleted: () => set((state) => {
          state.showCompleted = !state.showCompleted
        }),
        
        // Async Actions
        fetchProjects: async () => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch('/api/projects')
            if (!response.ok) throw new Error('Failed to fetch projects')
            const projects = await response.json()
            
            set((state) => {
              state.projects = projects
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch projects'
              state.isLoading = false
            })
          }
        },
        
        fetchProjectById: async (id) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch(`/api/projects/${id}`)
            if (!response.ok) throw new Error('Failed to fetch project')
            const project = await response.json()
            
            set((state) => {
              state.currentProject = project
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch project'
              state.isLoading = false
            })
          }
        },
        
        createProject: async (projectData) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch('/api/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(projectData)
            })
            
            if (!response.ok) throw new Error('Failed to create project')
            const project = await response.json()
            
            set((state) => {
              state.projects.push(project)
              state.currentProject = project
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to create project'
              state.isLoading = false
            })
          }
        },
        
        // Computed Properties
        getFilteredProjects: () => {
          const { projects, filters, sortBy, sortOrder, showCompleted } = get()
          
          let filtered = projects.filter(project => {
            // Filter by completion status
            if (!showCompleted && project.status === 'COMPLETE') return false
            
            // Filter by status
            if (filters.status?.length && !filters.status.includes(project.status)) return false
            
            // Filter by priority
            if (filters.priority?.length && !filters.priority.includes(project.priority)) return false
            
            // Filter by manager
            if (filters.managerId && project.managerId !== filters.managerId) return false
            
            // Filter by client
            if (filters.clientId && project.clientId !== filters.clientId) return false
            
            // Filter by search query
            if (filters.searchQuery) {
              const query = filters.searchQuery.toLowerCase()
              return (
                project.name.toLowerCase().includes(query) ||
                project.description?.toLowerCase().includes(query) ||
                project.client?.firstName?.toLowerCase().includes(query) ||
                project.client?.lastName?.toLowerCase().includes(query) ||
                project.client?.companyName?.toLowerCase().includes(query)
              )
            }
            
            // Filter by date range
            if (filters.dateRange) {
              const projectDate = new Date(project.createdAt)
              return projectDate >= filters.dateRange.start && projectDate <= filters.dateRange.end
            }
            
            return true
          })
          
          // Sort
          filtered.sort((a, b) => {
            let aValue: any, bValue: any
            
            switch (sortBy) {
              case 'name':
                aValue = a.name
                bValue = b.name
                break
              case 'status':
                aValue = a.status
                bValue = b.status
                break
              case 'priority':
                aValue = a.priority
                bValue = b.priority
                break
              case 'createdAt':
                aValue = new Date(a.createdAt)
                bValue = new Date(b.createdAt)
                break
              case 'estimatedEndDate':
                aValue = a.estimatedEndDate ? new Date(a.estimatedEndDate) : new Date(0)
                bValue = b.estimatedEndDate ? new Date(b.estimatedEndDate) : new Date(0)
                break
              default:
                aValue = a.createdAt
                bValue = b.createdAt
            }
            
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
            return 0
          })
          
          return filtered
        },
        
        getProjectsByStatus: () => {
          const projects = get().getFilteredProjects()
          const byStatus: Record<ProjectStatus, Project[]> = {
            PLANNING: [],
            PERMITS: [],
            CONSTRUCTION: [],
            INSPECTION: [],
            COMPLETE: [],
            ON_HOLD: [],
            CANCELLED: []
          }
          
          projects.forEach(project => {
            byStatus[project.status].push(project)
          })
          
          return byStatus
        },
        
        getProjectMetrics: () => {
          const projects = get().projects
          const now = new Date()
          
          return {
            total: projects.length,
            active: projects.filter(p => !['COMPLETE', 'CANCELLED'].includes(p.status)).length,
            completed: projects.filter(p => p.status === 'COMPLETE').length,
            overdue: projects.filter(p => 
              p.estimatedEndDate && 
              new Date(p.estimatedEndDate) < now && 
              p.status !== 'COMPLETE'
            ).length,
            totalBudget: projects.reduce((sum, p) => sum + (p.estimatedCost || 0), 0),
            totalActual: projects.reduce((sum, p) => sum + (p.actualCost || 0), 0)
          }
        }
      })),
      {
        name: 'project-store',
        partialize: (state) => ({
          viewMode: state.viewMode,
          showCompleted: state.showCompleted,
          groupBy: state.groupBy,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder
        })
      }
    ),
    { name: 'ProjectStore' }
  )
)