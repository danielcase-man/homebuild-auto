/**
 * Utility functions for the Home Builder Pro application
 * Core utilities that follow our global design system standards
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names with tailwind-merge for optimal CSS
 * This is our standard className utility across all projects
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Accessibility utilities for construction applications
 */
export const a11y = {
  /**
   * Generate accessible IDs for form elements
   */
  generateId: (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  /**
   * Screen reader announcements for construction status updates
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },
  
  /**
   * Format construction status for screen readers
   */
  formatStatus: (status: string) => {
    const statusMap: Record<string, string> = {
      'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed',
      'PENDING': 'Pending',
      'DELAYED': 'Delayed',
      'ON_HOLD': 'On Hold',
      'CANCELLED': 'Cancelled'
    }
    return statusMap[status] || status.replace(/_/g, ' ').toLowerCase()
  },

  /**
   * Construction-specific ARIA labels
   */
  labels: {
    projectStatus: (status: string) => `Project status: ${a11y.formatStatus(status)}`,
    budgetItem: (name: string, amount: number) => `Budget item: ${name}, amount: $${amount.toLocaleString()}`,
    taskProgress: (task: string, progress: number) => `Task: ${task}, ${progress}% complete`,
    inspectionResult: (type: string, passed: boolean) => `${type} inspection: ${passed ? 'Passed' : 'Failed'}`,
    permitStatus: (type: string, status: string) => `${type} permit: ${a11y.formatStatus(status)}`
  },

  /**
   * Keyboard navigation helpers
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    if (focusableElements.length === 0) return
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    firstElement.focus()
    
    return () => container.removeEventListener('keydown', handleTabKey)
  },

  /**
   * Color contrast checker for WCAG compliance
   */
  checkContrast: (foreground: string, background: string) => {
    const getRGB = (color: string) => {
      const match = color.match(/\d+/g)
      return match ? match.map(Number) : [0, 0, 0]
    }
    
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    const [r1, g1, b1] = getRGB(foreground)
    const [r2, g2, b2] = getRGB(background)
    
    const lum1 = getLuminance(r1, g1, b1)
    const lum2 = getLuminance(r2, g2, b2)
    
    const contrast = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05)
    
    return {
      ratio: contrast,
      AA: contrast >= 4.5,
      AAA: contrast >= 7
    }
  }
}

/**
 * Enhanced construction utilities with accessibility
 */
export const construction = {
  /**
   * Format currency for construction budgets with accessibility
   */
  formatCurrency: (amount: number, options?: { screenReader?: boolean }) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
    
    if (options?.screenReader) {
      return `${formatted} dollars`
    }
    return formatted
  },

  /**
   * Calculate project progress percentage
   */
  calculateProgress: (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  },

  /**
   * Get status color classes with accessibility considerations
   */
  getStatusColor: (status: string, variant: 'default' | 'high-contrast' = 'default') => {
    const colors: Record<string, Record<string, string>> = {
      'COMPLETED': {
        default: 'bg-green-100 text-green-800 border-green-200',
        'high-contrast': 'bg-green-600 text-white border-green-700'
      },
      'IN_PROGRESS': {
        default: 'bg-blue-100 text-blue-800 border-blue-200',
        'high-contrast': 'bg-blue-600 text-white border-blue-700'
      },
      'PENDING': {
        default: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'high-contrast': 'bg-yellow-600 text-black border-yellow-700'
      },
      'DELAYED': {
        default: 'bg-red-100 text-red-800 border-red-200',
        'high-contrast': 'bg-red-600 text-white border-red-700'
      },
      'ON_HOLD': {
        default: 'bg-gray-100 text-gray-800 border-gray-200',
        'high-contrast': 'bg-gray-600 text-white border-gray-700'
      },
      'CANCELLED': {
        default: 'bg-red-100 text-red-800 border-red-200',
        'high-contrast': 'bg-red-600 text-white border-red-700'
      }
    }
    return colors[status]?.[variant] || colors['PENDING'][variant]
  },

  /**
   * Validate required construction fields with accessible error messages
   */
  validateRequired: (fields: Record<string, any>) => {
    const errors: { field: string; message: string; id: string }[] = []
    Object.entries(fields).forEach(([key, value]) => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const fieldName = key.replace(/([A-Z])/g, ' $1').toLowerCase()
        errors.push({
          field: key,
          message: `${fieldName} is required`,
          id: a11y.generateId(`error-${key}`)
        })
      }
    })
    return errors
  },

  /**
   * Construction phase helpers with accessibility
   */
  phases: {
    getPhaseIcon: (phase: string) => {
      const icons: Record<string, string> = {
        'PLANNING': '📋',
        'PERMITS': '📄',
        'FOUNDATION': '🏗️',
        'FRAMING': '🔨',
        'ROOFING': '🏠',
        'PLUMBING': '🔧',
        'ELECTRICAL': '⚡',
        'INSULATION': '🧱',
        'DRYWALL': '🎨',
        'FLOORING': '🏠',
        'FINISHING': '✨',
        'FINAL_INSPECTION': '✅'
      }
      return icons[phase] || '🏗️'
    },
    
    getPhaseLabel: (phase: string) => {
      return phase.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    }
  }
}

/**
 * Format currency values consistently across the application
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format dates consistently across the application
 */
export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' | 'relative' = 'medium'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      })
    case 'medium':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    case 'relative':
      return formatRelativeTime(dateObj)
    default:
      return dateObj.toLocaleDateString()
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(Math.abs(diffInSeconds) / seconds)
    
    if (interval >= 1) {
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
      return rtf.format(
        diffInSeconds < 0 ? interval : -interval,
        unit as Intl.RelativeTimeFormatUnit
      )
    }
  }
  
  return 'just now'
}

/**
 * Calculate percentage and handle edge cases
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Format percentages consistently
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

/**
 * Generate a random color for avatars, charts, etc.
 */
export function generateColor(seed: string): string {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ]
  
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff
  }
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Debounce function for search inputs, etc.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for scroll events, etc.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now().toString(36)}`
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (US format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
  return phoneRegex.test(phone)
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

/**
 * Calculate business days between two dates
 */
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}

/**
 * Get status color based on project/task status
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    'PLANNING': 'text-gray-600 bg-gray-100',
    'PERMITS': 'text-yellow-600 bg-yellow-100',
    'CONSTRUCTION': 'text-blue-600 bg-blue-100',
    'INSPECTION': 'text-purple-600 bg-purple-100',
    'COMPLETE': 'text-green-600 bg-green-100',
    'ON_HOLD': 'text-yellow-600 bg-yellow-100',
    'CANCELLED': 'text-red-600 bg-red-100',
    'NOT_STARTED': 'text-gray-600 bg-gray-100',
    'IN_PROGRESS': 'text-blue-600 bg-blue-100',
  }
  
  return statusColors[status] || 'text-gray-600 bg-gray-100'
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
  const priorityColors: Record<string, string> = {
    'LOW': 'text-gray-600',
    'MEDIUM': 'text-yellow-600',
    'HIGH': 'text-orange-600',
    'URGENT': 'text-red-600',
  }
  
  return priorityColors[priority] || 'text-gray-600'
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Convert string to slug (URL-friendly)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
    .trim()
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Download data as file
 */
export function downloadFile(data: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}

/**
 * Performance timing utility
 */
export class PerformanceTimer {
  private startTime: number
  private label: string

  constructor(label: string = 'Operation') {
    this.label = label
    this.startTime = performance.now()
  }

  end(): number {
    const endTime = performance.now()
    const duration = endTime - this.startTime
    console.log(`${this.label} took ${duration.toFixed(2)}ms`)
    return duration
  }
}

/**
 * Local storage utilities with error handling
 */
export const storage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  },

  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear()
      return true
    } catch {
      return false
    }
  }
}