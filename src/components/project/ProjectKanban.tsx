"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Plus,
  MoreVertical
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useAppStore } from '@/stores/app-store'
import type { Project, ProjectStatus } from '@/types'
import { cn } from '@/lib/utils'

interface ProjectKanbanProps {
  projectsByStatus: Record<ProjectStatus, Project[]>
}

export const ProjectKanban: React.FC<ProjectKanbanProps> = ({ projectsByStatus }) => {
  const { updateProject } = useProjectStore()
  const { openModal } = useAppStore()
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  const statusConfig = {
    PLANNING: {
      title: 'Planning',
      color: 'bg-yellow-100 border-yellow-300',
      headerColor: 'bg-yellow-200',
      textColor: 'text-yellow-800'
    },
    PERMITS: {
      title: 'Permits',
      color: 'bg-blue-100 border-blue-300',
      headerColor: 'bg-blue-200',
      textColor: 'text-blue-800'
    },
    CONSTRUCTION: {
      title: 'Construction',
      color: 'bg-green-100 border-green-300',
      headerColor: 'bg-green-200',
      textColor: 'text-green-800'
    },
    INSPECTION: {
      title: 'Inspection',
      color: 'bg-purple-100 border-purple-300',
      headerColor: 'bg-purple-200',
      textColor: 'text-purple-800'
    },
    COMPLETE: {
      title: 'Complete',
      color: 'bg-gray-100 border-gray-300',
      headerColor: 'bg-gray-200',
      textColor: 'text-gray-800'
    },
    ON_HOLD: {
      title: 'On Hold',
      color: 'bg-orange-100 border-orange-300',
      headerColor: 'bg-orange-200',
      textColor: 'text-orange-800'
    },
    CANCELLED: {
      title: 'Cancelled',
      color: 'bg-red-100 border-red-300',
      headerColor: 'bg-red-200',
      textColor: 'text-red-800'
    }
  }

  const handleDragStart = (event: any) => {
    const projectId = event.active.id
    const project = Object.values(projectsByStatus)
      .flat()
      .find(p => p.id === projectId)
    setActiveProject(project || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      setActiveProject(null)
      return
    }

    const projectId = active.id as string
    const newStatus = over.id as ProjectStatus

    // Update project status
    updateProject(projectId, { status: newStatus })
    setActiveProject(null)
  }

  const handleCreateProject = (status: ProjectStatus) => {
    openModal('create-project', { defaultStatus: status })
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <KanbanColumn
            key={status}
            status={status as ProjectStatus}
            config={config}
            projects={projectsByStatus[status as ProjectStatus] || []}
            onCreateProject={handleCreateProject}
          />
        ))}
      </div>

      <DragOverlay>
        {activeProject && <ProjectKanbanCard project={activeProject} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}

interface KanbanColumnProps {
  status: ProjectStatus
  config: any
  projects: Project[]
  onCreateProject: (status: ProjectStatus) => void
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  status, 
  config, 
  projects, 
  onCreateProject 
}) => {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div className="flex-shrink-0 w-80">
      <div className={cn("rounded-lg border-2 border-dashed h-full", config.color)}>
        {/* Column Header */}
        <div className={cn("px-4 py-3 rounded-t-lg border-b", config.headerColor)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h3 className={cn("font-semibold", config.textColor)}>
                {config.title}
              </h3>
              <span className={cn(
                "ml-2 px-2 py-0.5 rounded-full text-xs font-medium",
                "bg-white bg-opacity-70"
              )}>
                {projects.length}
              </span>
            </div>
            
            <button
              onClick={() => onCreateProject(status)}
              className={cn(
                "p-1 rounded hover:bg-white hover:bg-opacity-50 transition-colors",
                config.textColor
              )}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Column Content */}
        <div ref={setNodeRef} className="p-3 space-y-3 min-h-[500px]">
          <AnimatePresence>
            {projects.map((project) => (
              <ProjectKanbanCard key={project.id} project={project} />
            ))}
          </AnimatePresence>
          
          {projects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">No projects in {config.title.toLowerCase()}</div>
              <button
                onClick={() => onCreateProject(status)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800"
              >
                Add a project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ProjectKanbanCardProps {
  project: Project
  isDragging?: boolean
}

const ProjectKanbanCard: React.FC<ProjectKanbanCardProps> = ({ 
  project, 
  isDragging = false 
}) => {
  const { setCurrentProject } = useProjectStore()
  const { openModal } = useAppStore()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isBeingDragged
  } = useDraggable({ id: project.id })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
  } : undefined

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilDeadline = () => {
    if (!project.estimatedEndDate) return null
    
    const today = new Date()
    const deadline = new Date(project.estimatedEndDate)
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const isOverdue = () => {
    const daysUntil = getDaysUntilDeadline()
    return daysUntil !== null && daysUntil < 0 && project.status !== 'COMPLETE'
  }

  const handleCardClick = () => {
    setCurrentProject(project)
    openModal('project-details', { projectId: project.id })
  }

  const handleMenuClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation()
    
    switch (action) {
      case 'edit':
        openModal('edit-project', { project })
        break
      case 'delete':
        openModal('confirm-delete', { 
          type: 'project',
          id: project.id,
          name: project.name
        })
        break
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        "bg-white rounded-lg border shadow-sm cursor-pointer transition-all duration-200",
        isDragging || isBeingDragged 
          ? "shadow-lg border-construction-blue transform rotate-2" 
          : "hover:shadow-md",
        isOverdue && "border-red-300 bg-red-50"
      )}
      onClick={handleCardClick}
      {...attributes}
      {...listeners}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {project.name}
            </h4>
            
            {project.client && (
              <p className="text-sm text-gray-600 mt-1 truncate">
                {project.client.firstName} {project.client.lastName}
              </p>
            )}
          </div>

          <div className="relative group ml-2">
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="h-3 w-3" />
            </button>
            
            <div className="absolute right-0 top-6 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={(e) => handleMenuClick(e, 'edit')}
                  className="block w-full text-left px-3 py-1 text-xs text-gray-700 hover:bg-gray-100"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => handleMenuClick(e, 'delete')}
                  className="block w-full text-left px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Indicator */}
        {project.priority !== 'MEDIUM' && (
          <div className="mt-2">
            <span className={cn(
              "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
              project.priority === 'HIGH' && "bg-orange-100 text-orange-800",
              project.priority === 'URGENT' && "bg-red-100 text-red-800",
              project.priority === 'LOW' && "bg-gray-100 text-gray-800"
            )}>
              {project.priority}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span className="font-medium">{project.completionPercentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-construction-blue h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${project.completionPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Budget */}
        {project.estimatedCost && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-3 w-3 mr-1" />
              Budget
            </div>
            <span className="font-medium text-gray-900">
              {formatCurrency(project.estimatedCost)}
            </span>
          </div>
        )}

        {/* Timeline */}
        {project.estimatedEndDate && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-3 w-3 mr-1" />
              Due
            </div>
            <span className={cn(
              "font-medium",
              isOverdue ? "text-red-600" : "text-gray-900"
            )}>
              {formatDate(project.estimatedEndDate)}
            </span>
          </div>
        )}

        {/* Home Size */}
        {project.homeSize && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center text-gray-600">
              <Users className="h-3 w-3 mr-1" />
              Size
            </div>
            <span className="font-medium text-gray-900">
              {project.homeSize.toLocaleString()} sq ft
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      {isOverdue && (
        <div className="px-3 py-2 bg-red-50 border-t border-red-100 rounded-b-lg">
          <div className="flex items-center text-xs text-red-700">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {Math.abs(getDaysUntilDeadline()!)} days overdue
          </div>
        </div>
      )}
    </motion.div>
  )
}