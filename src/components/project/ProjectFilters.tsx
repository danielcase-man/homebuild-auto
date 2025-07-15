"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Calendar, 
  Filter,
  Users,
  Building2
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import type { ProjectStatus, Priority } from '@/types'
import { cn } from '@/lib/utils'

export const ProjectFilters: React.FC = () => {
  const { filters, setFilters, clearFilters } = useProjectStore()
  
  const [localFilters, setLocalFilters] = useState(filters)
  const [dateRange, setDateRange] = useState({
    start: filters.dateRange?.start?.toISOString().split('T')[0] || '',
    end: filters.dateRange?.end?.toISOString().split('T')[0] || ''
  })

  // Update local state when store filters change
  useEffect(() => {
    setLocalFilters(filters)
    setDateRange({
      start: filters.dateRange?.start?.toISOString().split('T')[0] || '',
      end: filters.dateRange?.end?.toISOString().split('T')[0] || ''
    })
  }, [filters])

  const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
    { value: 'PLANNING', label: 'Planning', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'PERMITS', label: 'Permits', color: 'bg-blue-100 text-blue-800' },
    { value: 'CONSTRUCTION', label: 'Construction', color: 'bg-green-100 text-green-800' },
    { value: 'INSPECTION', label: 'Inspection', color: 'bg-purple-100 text-purple-800' },
    { value: 'COMPLETE', label: 'Complete', color: 'bg-gray-100 text-gray-800' },
    { value: 'ON_HOLD', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ]

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 'LOW', label: 'Low', color: 'text-gray-600' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600' },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-600' }
  ]

  const handleStatusChange = (status: ProjectStatus, checked: boolean) => {
    const currentStatuses = localFilters.status || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)
    
    const updatedFilters = { ...localFilters, status: newStatuses }
    setLocalFilters(updatedFilters)
    setFilters(updatedFilters)
  }

  const handlePriorityChange = (priority: Priority, checked: boolean) => {
    const currentPriorities = localFilters.priority || []
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority)
    
    const updatedFilters = { ...localFilters, priority: newPriorities }
    setLocalFilters(updatedFilters)
    setFilters(updatedFilters)
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newDateRange = { ...dateRange, [field]: value }
    setDateRange(newDateRange)
    
    if (newDateRange.start && newDateRange.end) {
      const updatedFilters = {
        ...localFilters,
        dateRange: {
          start: new Date(newDateRange.start),
          end: new Date(newDateRange.end)
        }
      }
      setLocalFilters(updatedFilters)
      setFilters(updatedFilters)
    } else if (!newDateRange.start && !newDateRange.end) {
      const { dateRange: _, ...updatedFilters } = localFilters
      setLocalFilters(updatedFilters)
      setFilters(updatedFilters)
    }
  }

  const handleManagerChange = (managerId: string) => {
    const updatedFilters = {
      ...localFilters,
      managerId: managerId || undefined
    }
    setLocalFilters(updatedFilters)
    setFilters(updatedFilters)
  }

  const handleClearFilters = () => {
    setLocalFilters({})
    setDateRange({ start: '', end: '' })
    clearFilters()
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.status?.length) count++
    if (localFilters.priority?.length) count++
    if (localFilters.dateRange) count++
    if (localFilters.managerId) count++
    if (localFilters.clientId) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-construction-blue text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Status
          </h4>
          <div className="space-y-2">
            {statusOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.status?.includes(option.value) || false}
                  onChange={(e) => handleStatusChange(option.value, e.target.checked)}
                  className="h-4 w-4 text-construction-blue focus:ring-construction-blue border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                <span className={cn(
                  "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
                  option.color
                )}>
                  •
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Priority
          </h4>
          <div className="space-y-2">
            {priorityOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.priority?.includes(option.value) || false}
                  onChange={(e) => handlePriorityChange(option.value, e.target.checked)}
                  className="h-4 w-4 text-construction-blue focus:ring-construction-blue border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                <span className={cn("ml-auto text-xs font-medium", option.color)}>
                  •
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </h4>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-construction-blue focus:border-construction-blue"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-construction-blue focus:border-construction-blue"
              />
            </div>
          </div>
        </div>

        {/* Manager Filter */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Project Manager
          </h4>
          <select
            value={localFilters.managerId || ''}
            onChange={(e) => handleManagerChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-construction-blue focus:border-construction-blue"
          >
            <option value="">All Managers</option>
            {/* In production, this would be populated from a managers list */}
            <option value="manager-1">John Smith</option>
            <option value="manager-2">Sarah Johnson</option>
            <option value="manager-3">Mike Davis</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {localFilters.status?.map((status) => {
              const option = statusOptions.find(opt => opt.value === status)
              return (
                <span
                  key={status}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {option?.label}
                  <button
                    onClick={() => handleStatusChange(status, false)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
            
            {localFilters.priority?.map((priority) => {
              const option = priorityOptions.find(opt => opt.value === priority)
              return (
                <span
                  key={priority}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                >
                  {option?.label}
                  <button
                    onClick={() => handlePriorityChange(priority, false)}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )
            })}
            
            {localFilters.dateRange && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {dateRange.start} to {dateRange.end}
                <button
                  onClick={() => {
                    setDateRange({ start: '', end: '' })
                    const { dateRange: _, ...updatedFilters } = localFilters
                    setLocalFilters(updatedFilters)
                    setFilters(updatedFilters)
                  }}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {localFilters.managerId && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Manager: {localFilters.managerId}
                <button
                  onClick={() => handleManagerChange('')}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}