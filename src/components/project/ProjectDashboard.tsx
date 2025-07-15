"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  Filter,
  Search,
  Plus,
  Grid,
  List,
  Kanban
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useAppStore } from '@/stores/app-store'
import { ProjectCard } from './ProjectCard'
import { ProjectKanban } from './ProjectKanban'
import { ProjectTimeline } from './ProjectTimeline'
import { ProjectMetrics } from './ProjectMetrics'
import { ProjectFilters } from './ProjectFilters'
import { CreateProjectModal } from './CreateProjectModal'
import { cn } from '@/lib/utils'

export const ProjectDashboard: React.FC = () => {
  const {
    projects,
    isLoading,
    error,
    viewMode,
    filters,
    selectedProjectIds,
    getFilteredProjects,
    getProjectMetrics,
    getProjectsByStatus,
    setViewMode,
    setFilters,
    clearSelection,
    fetchProjects
  } = useProjectStore()

  const { openModal } = useAppStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    setFilters({ searchQuery })
  }, [searchQuery, setFilters])

  const filteredProjects = getFilteredProjects()
  const metrics = getProjectMetrics()
  const projectsByStatus = getProjectsByStatus()

  const handleCreateProject = () => {
    openModal('create-project')
  }

  const handleBulkAction = (action: string) => {
    if (selectedProjectIds.length === 0) return
    
    switch (action) {
      case 'export':
        // Export selected projects
        break
      case 'archive':
        // Archive selected projects
        break
      case 'delete':
        // Delete selected projects
        break
    }
    
    clearSelection()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-construction-blue"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading projects</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your construction projects</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center px-4 py-2 bg-construction-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <ProjectMetrics metrics={metrics} />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-construction-blue focus:border-transparent"
          />
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "inline-flex items-center px-4 py-2 border rounded-lg transition-colors",
            showFilters
              ? "border-construction-blue bg-construction-blue text-white"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>

        {/* View Mode */}
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-l-lg transition-colors",
              viewMode === 'grid'
                ? "bg-construction-blue text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 transition-colors",
              viewMode === 'list'
                ? "bg-construction-blue text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={cn(
              "p-2 transition-colors",
              viewMode === 'kanban'
                ? "bg-construction-blue text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <Kanban className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={cn(
              "p-2 rounded-r-lg transition-colors",
              viewMode === 'timeline'
                ? "bg-construction-blue text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            )}
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <ProjectFilters />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      {selectedProjectIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-construction-blue text-white rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {selectedProjectIds.length} project{selectedProjectIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
              >
                Export
              </button>
              <button
                onClick={() => handleBulkAction('archive')}
                className="px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
              >
                Archive
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Project Views */}
      <div className="min-h-[400px]">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={selectedProjectIds.includes(project.id)}
              />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <ProjectListRow
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectIds.includes(project.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'kanban' && (
          <ProjectKanban projectsByStatus={projectsByStatus} />
        )}

        {viewMode === 'timeline' && (
          <ProjectTimeline projects={filteredProjects} />
        )}
      </div>

      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || Object.keys(filters).length > 1
              ? "Try adjusting your search or filters"
              : "Get started by creating your first project"
            }
          </p>
          {!searchQuery && Object.keys(filters).length <= 1 && (
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center px-4 py-2 bg-construction-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </button>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <CreateProjectModal />
    </div>
  )
}

// Project List Row Component
const ProjectListRow: React.FC<{
  project: any
  isSelected: boolean
}> = ({ project, isSelected }) => {
  const { selectProject } = useProjectStore()

  const getStatusColor = (status: string) => {
    const colors = {
      PLANNING: 'bg-yellow-100 text-yellow-800',
      PERMITS: 'bg-blue-100 text-blue-800',
      CONSTRUCTION: 'bg-green-100 text-green-800',
      INSPECTION: 'bg-purple-100 text-purple-800',
      COMPLETE: 'bg-gray-100 text-gray-800',
      ON_HOLD: 'bg-orange-100 text-orange-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
    return new Date(date).toLocaleDateString()
  }

  return (
    <tr
      className={cn(
        "hover:bg-gray-50 cursor-pointer transition-colors",
        isSelected && "bg-blue-50"
      )}
      onClick={() => selectProject(project.id)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => selectProject(project.id)}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-4 text-construction-blue focus:ring-construction-blue border-gray-300 rounded mr-3"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{project.name}</div>
            <div className="text-sm text-gray-500">{project.client?.name || 'No client'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={cn("inline-flex px-2 py-1 text-xs font-semibold rounded-full", getStatusColor(project.status))}>
          {project.status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          <div className="font-medium">
            {project.estimatedCost ? formatCurrency(project.estimatedCost) : 'Not set'}
          </div>
          {project.actualCost && (
            <div className="text-gray-500">
              Actual: {formatCurrency(project.actualCost)}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div>
          {project.estimatedStartDate && (
            <div>Start: {formatDate(project.estimatedStartDate)}</div>
          )}
          {project.estimatedEndDate && (
            <div>End: {formatDate(project.estimatedEndDate)}</div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
            <div
              className="bg-construction-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.completionPercentage || 0}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-900">
            {project.completionPercentage || 0}%
          </span>
        </div>
      </td>
    </tr>
  )
}