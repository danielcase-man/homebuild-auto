"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  ExternalLink
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useAppStore } from '@/stores/app-store'
import type { Project } from '@/types'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  isSelected: boolean
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, isSelected }) => {
  const { selectProject, setCurrentProject } = useProjectStore()
  const { openModal } = useAppStore()

  const getStatusConfig = (status: string) => {
    const configs = {
      PLANNING: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock,
        label: 'Planning'
      },
      PERMITS: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: Calendar,
        label: 'Permits'
      },
      CONSTRUCTION: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: Users,
        label: 'Construction'
      },
      INSPECTION: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: CheckCircle,
        label: 'Inspection'
      },
      COMPLETE: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: CheckCircle,
        label: 'Complete'
      },
      ON_HOLD: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200', 
        icon: AlertTriangle,
        label: 'On Hold'
      },
      CANCELLED: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: AlertTriangle,
        label: 'Cancelled'
      }
    }
    return configs[status as keyof typeof configs] || configs.PLANNING
  }

  const getPriorityConfig = (priority: string) => {
    const configs = {
      LOW: { color: 'text-gray-500', label: 'Low' },
      MEDIUM: { color: 'text-yellow-600', label: 'Medium' },
      HIGH: { color: 'text-orange-600', label: 'High' },
      URGENT: { color: 'text-red-600', label: 'Urgent' }
    }
    return configs[priority as keyof typeof configs] || configs.MEDIUM
  }

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
      day: 'numeric',
      year: 'numeric'
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

  const isUpcoming = () => {
    const daysUntil = getDaysUntilDeadline()
    return daysUntil !== null && daysUntil <= 7 && daysUntil >= 0
  }

  const statusConfig = getStatusConfig(project.status)
  const priorityConfig = getPriorityConfig(project.priority)
  const StatusIcon = statusConfig.icon

  const handleCardClick = () => {
    setCurrentProject(project)
    openModal('project-details', { projectId: project.id })
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    selectProject(project.id)
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
      case 'archive':
        // Handle archive
        break
      case 'view':
        handleCardClick()
        break
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={cn(
        "bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer",
        isSelected ? "border-construction-blue bg-blue-50" : "border-gray-200",
        isOverdue() && "border-red-300 bg-red-50"
      )}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectChange}
              className="h-4 w-4 text-construction-blue focus:ring-construction-blue border-gray-300 rounded mt-1"
            />
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {project.name}
              </h3>
              
              {project.client && (
                <p className="text-sm text-gray-600 mt-1">
                  {project.client.firstName} {project.client.lastName}
                  {project.client.companyName && ` (${project.client.companyName})`}
                </p>
              )}
              
              {project.address && (
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">
                    {typeof project.address === 'object' 
                      ? `${project.address.city}, ${project.address.state}`
                      : project.address
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dropdown Menu */}
          <div className="relative group">
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            <div className="absolute right-0 top-6 w-40 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={(e) => handleMenuClick(e, 'view')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={(e) => handleMenuClick(e, 'edit')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={(e) => handleMenuClick(e, 'archive')}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </button>
                <button
                  onClick={(e) => handleMenuClick(e, 'delete')}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Priority */}
        <div className="flex items-center justify-between mt-3">
          <div className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            statusConfig.color
          )}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig.label}
          </div>
          
          <div className={cn("text-xs font-medium", priorityConfig.color)}>
            {priorityConfig.label} Priority
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{project.completionPercentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-construction-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.completionPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Budget */}
        {project.estimatedCost && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              Budget
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(project.estimatedCost)}
              </div>
              {project.actualCost && (
                <div className="text-xs text-gray-500">
                  Spent: {formatCurrency(project.actualCost)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline */}
        {project.estimatedEndDate && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              Deadline
            </div>
            <div className="text-right">
              <div className={cn(
                "text-sm font-medium",
                isOverdue() ? "text-red-600" : isUpcoming() ? "text-orange-600" : "text-gray-900"
              )}>
                {formatDate(project.estimatedEndDate)}
              </div>
              {getDaysUntilDeadline() !== null && (
                <div className={cn(
                  "text-xs",
                  isOverdue() ? "text-red-500" : isUpcoming() ? "text-orange-500" : "text-gray-500"
                )}>
                  {isOverdue() 
                    ? `${Math.abs(getDaysUntilDeadline()!)} days overdue`
                    : `${getDaysUntilDeadline()} days left`
                  }
                </div>
              )}
            </div>
          </div>
        )}

        {/* Project Type */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Type</div>
          <div className="text-sm font-medium text-gray-900">
            {project.type.replace('_', ' ')}
          </div>
        </div>

        {/* Home Details */}
        {(project.homeSize || project.bedrooms || project.bathrooms) && (
          <div className="pt-2 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-2 text-xs">
              {project.homeSize && (
                <div className="text-center">
                  <div className="font-medium text-gray-900">
                    {project.homeSize.toLocaleString()}
                  </div>
                  <div className="text-gray-500">sq ft</div>
                </div>
              )}
              {project.bedrooms && (
                <div className="text-center">
                  <div className="font-medium text-gray-900">{project.bedrooms}</div>
                  <div className="text-gray-500">beds</div>
                </div>
              )}
              {project.bathrooms && (
                <div className="text-center">
                  <div className="font-medium text-gray-900">{project.bathrooms}</div>
                  <div className="text-gray-500">baths</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Alerts */}
      {(isOverdue() || isUpcoming()) && (
        <div className={cn(
          "px-4 py-2 border-t text-xs font-medium",
          isOverdue() 
            ? "bg-red-50 border-red-100 text-red-700"
            : "bg-orange-50 border-orange-100 text-orange-700"
        )}>
          <div className="flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {isOverdue() ? 'Project is overdue' : 'Deadline approaching'}
          </div>
        </div>
      )}
    </motion.div>
  )
}