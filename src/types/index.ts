/**
 * Core TypeScript types for Home Builder Pro
 * Comprehensive type definitions for construction project management
 */

// Project Management Types
export interface Project {
  id: string
  name: string
  description?: string
  type: ProjectType
  status: ProjectStatus
  priority: Priority
  
  // Client and management
  clientId: string
  client?: Client
  managerId: string
  manager?: User
  
  // Location and specifications
  address: Address
  lotSize?: number
  homeSize?: number
  bedrooms?: number
  bathrooms?: number
  stories?: number
  
  // Timeline
  estimatedStartDate?: Date
  actualStartDate?: Date
  estimatedEndDate?: Date
  actualEndDate?: Date
  
  // Budget
  contractAmount?: number
  estimatedCost?: number
  actualCost?: number
  contingencyPercent?: number
  
  // Progress tracking
  completionPercentage: number
  phases?: ProjectPhase[]
  tasks?: Task[]
  
  createdAt: Date
  updatedAt: Date
}

export interface ProjectPhase {
  id: string
  projectId: string
  name: string
  description?: string
  order: number
  status: PhaseStatus
  
  // Timeline
  estimatedStartDate?: Date
  actualStartDate?: Date
  estimatedEndDate?: Date
  actualEndDate?: Date
  
  // Budget
  estimatedCost?: number
  actualCost?: number
  
  // Progress
  completionPercentage: number
  dependencies: string[]
  
  tasks?: Task[]
}

export interface Task {
  id: string
  projectId: string
  phaseId?: string
  name: string
  description?: string
  type: TaskType
  status: TaskStatus
  priority: Priority
  
  // Assignment
  assignedToId?: string
  assignedTo?: User
  
  // Timeline
  estimatedStartDate?: Date
  actualStartDate?: Date
  estimatedEndDate?: Date
  actualEndDate?: Date
  estimatedHours?: number
  actualHours?: number
  
  // Budget
  estimatedCost?: number
  actualCost?: number
  
  // Dependencies and relationships
  dependencies: string[]
  materials?: TaskMaterial[]
  
  notes?: string
  tags: string[]
}

// Budget and Financial Types
export interface BudgetItem {
  id: string
  projectId: string
  categoryId: string
  category?: BudgetCategory
  
  name: string
  description?: string
  unit?: string
  quantity: number
  
  estimatedUnitCost: number
  actualUnitCost?: number
  estimatedTotal: number
  actualTotal?: number
  
  supplierId?: string
  supplier?: Supplier
  status: BudgetItemStatus
  notes?: string
}

export interface BudgetCategory {
  id: string
  name: string
  description?: string
  code?: string
  parentId?: string
  children?: BudgetCategory[]
}

export interface BudgetSummary {
  projectId: string
  totalEstimated: number
  totalActual: number
  variance: number
  variancePercentage: number
  categories: CategorySummary[]
}

export interface CategorySummary {
  categoryId: string
  categoryName: string
  estimated: number
  actual: number
  variance: number
  itemCount: number
}

// Scheduling Types
export interface ScheduleEvent {
  id: string
  title: string
  description?: string
  type: ScheduleEventType
  
  // Timing
  startDate: Date
  endDate: Date
  allDay?: boolean
  
  // Project association
  projectId?: string
  project?: Project
  taskId?: string
  task?: Task
  
  // Resources
  assignedToId?: string
  assignedTo?: User
  location?: string
  
  // Status
  status: ScheduleEventStatus
  priority: Priority
  
  // Metadata
  tags: string[]
  notes?: string
  attachments?: string[]
}

export interface ResourceSchedule {
  userId: string
  user: User
  availability: TimeSlot[]
  assignments: ScheduleEvent[]
  utilization: number // Percentage
}

export interface TimeSlot {
  start: Date
  end: Date
  available: boolean
  reason?: string // If not available
}

// Material and Supplier Types
export interface MaterialOrder {
  id: string
  projectId: string
  supplierId: string
  supplier?: Supplier
  
  orderNumber: string
  status: OrderStatus
  
  orderDate: Date
  expectedDate?: Date
  deliveredDate?: Date
  
  subtotal: number
  tax: number
  shipping: number
  total: number
  
  deliveryAddress?: Address
  notes?: string
  
  items: MaterialOrderItem[]
}

export interface MaterialOrderItem {
  id: string
  orderId: string
  
  name: string
  description?: string
  sku?: string
  unit: string
  quantity: number
  unitCost: number
  total: number
  
  quantityDelivered: number
}

export interface Supplier {
  id: string
  name: string
  type: SupplierType
  email?: string
  phone?: string
  website?: string
  address?: Address
  
  // Business details
  license?: string
  insurance?: string
  rating?: number
  
  // Financial terms
  paymentTerms?: number
  creditLimit?: number
  
  status: SupplierStatus
  notes?: string
  tags: string[]
}

// User and Client Types
export interface User {
  id: string
  email: string
  username?: string
  name: string
  role: UserRole
  phone?: string
  avatar?: string
  
  // Company association
  companyId?: string
  company?: Company
  
  // Settings and permissions
  permissions?: Record<string, boolean>
  settings?: Record<string, any>
  
  // Activity
  isActive: boolean
  lastLoginAt?: Date
  
  // Work tracking
  hourlyRate?: number
  skills?: string[]
  certifications?: string[]
}

export interface Client {
  id: string
  type: ClientType
  firstName?: string
  lastName?: string
  companyName?: string
  email: string
  phone?: string
  
  address?: Address
  billingAddress?: Address
  
  // Financial
  creditLimit?: number
  paymentTerms?: number
  preferredPaymentMethod?: PaymentMethod
  
  status: ClientStatus
  notes?: string
  tags: string[]
  
  projects?: Project[]
}

export interface Company {
  id: string
  name: string
  description?: string
  website?: string
  phone?: string
  email?: string
  
  // Business details
  license?: string
  insurance?: string
  taxId?: string
  
  address?: Address
  logo?: string
  settings?: Record<string, any>
}

// Document and Communication Types
export interface Document {
  id: string
  projectId?: string
  taskId?: string
  uploadedById: string
  uploadedBy?: User
  
  name: string
  description?: string
  type: DocumentType
  category?: string
  
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  
  isPublic: boolean
  tags: string[]
  
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, any>
  
  read: boolean
  readAt?: Date
  createdAt: Date
}

// Time and Expense Tracking
export interface TimeEntry {
  id: string
  projectId: string
  userId: string
  taskId?: string
  
  startTime: Date
  endTime?: Date
  duration?: number
  description?: string
  
  hourlyRate?: number
  billable: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  id: string
  projectId?: string
  userId: string
  
  description: string
  category: string
  amount: number
  expenseDate: Date
  
  receipt?: string
  notes?: string
  
  status: ExpenseStatus
  approvedBy?: string
  approvedAt?: Date
}

// Quality Control and Inspections
export interface Inspection {
  id: string
  projectId: string
  type: InspectionType
  phase: string
  inspector: string
  date: Date
  status: InspectionStatus
  
  passed?: boolean
  notes?: string
  issues?: InspectionIssue[]
  
  reportPath?: string
  photos: string[]
}

export interface InspectionIssue {
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  location?: string
  resolved: boolean
  resolvedDate?: Date
  resolvedBy?: string
  notes?: string
}

// Financial Types
export interface Invoice {
  id: string
  projectId?: string
  clientId: string
  
  invoiceNumber: string
  title?: string
  description?: string
  
  subtotal: number
  tax: number
  total: number
  amountPaid: number
  
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  
  status: InvoiceStatus
  notes?: string
  
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

// Utility Types
export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface DateRange {
  start: Date
  end: Date
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard and Analytics Types
export interface DashboardStats {
  activeProjects: number
  completedProjects: number
  totalRevenue: number
  upcomingDeadlines: number
  overdueTasks: number
  budgetVariance: number
}

export interface ProjectAnalytics {
  projectId: string
  timeline: {
    originalDuration: number // days
    currentDuration: number
    daysOverdue: number
    completionPercentage: number
  }
  budget: {
    originalBudget: number
    currentBudget: number
    spentAmount: number
    variance: number
    variancePercentage: number
  }
  productivity: {
    tasksCompleted: number
    tasksTotal: number
    averageTaskDuration: number
    teammemberUtilization: number
  }
}

// Enum Types (matching Prisma schema)
export type UserRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'EMPLOYEE' | 'CLIENT' | 'SUBCONTRACTOR'
export type ClientType = 'INDIVIDUAL' | 'BUSINESS' | 'GOVERNMENT'
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'ARCHIVED'
export type PaymentMethod = 'CASH' | 'CHECK' | 'CREDIT_CARD' | 'ACH' | 'WIRE_TRANSFER'
export type ProjectType = 'CUSTOM_HOME' | 'PRODUCTION_HOME' | 'REMODEL' | 'ADDITION' | 'COMMERCIAL' | 'MULTI_FAMILY'
export type ProjectStatus = 'PLANNING' | 'PERMITS' | 'CONSTRUCTION' | 'INSPECTION' | 'COMPLETE' | 'ON_HOLD' | 'CANCELLED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type PhaseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD' | 'CANCELLED'
export type TaskType = 'CONSTRUCTION' | 'INSPECTION' | 'PERMIT' | 'DELIVERY' | 'MEETING' | 'ADMIN'
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'ON_HOLD' | 'CANCELLED'
export type BudgetItemStatus = 'ESTIMATED' | 'QUOTED' | 'ORDERED' | 'DELIVERED' | 'INSTALLED' | 'PAID'
export type SupplierType = 'MATERIAL' | 'SUBCONTRACTOR' | 'EQUIPMENT' | 'SERVICE'
export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'PREFERRED' | 'BLACKLISTED'
export type OrderStatus = 'DRAFT' | 'PENDING' | 'ORDERED' | 'PARTIAL' | 'DELIVERED' | 'CANCELLED'
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID'
export type DocumentType = 'CONTRACT' | 'PERMIT' | 'INSPECTION' | 'PHOTO' | 'PLAN' | 'SPECIFICATION' | 'INVOICE' | 'RECEIPT' | 'OTHER'
export type InspectionType = 'FOUNDATION' | 'FRAMING' | 'ELECTRICAL' | 'PLUMBING' | 'HVAC' | 'INSULATION' | 'DRYWALL' | 'FINAL' | 'CUSTOM'
export type InspectionStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'CANCELLED'
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED'
export type NotificationType = 'TASK_ASSIGNED' | 'TASK_COMPLETED' | 'DEADLINE_APPROACHING' | 'BUDGET_ALERT' | 'INSPECTION_SCHEDULED' | 'PAYMENT_RECEIVED' | 'CHANGE_ORDER' | 'GENERAL'

// Schedule-specific types
export type ScheduleEventType = 'TASK' | 'MEETING' | 'INSPECTION' | 'DELIVERY' | 'MILESTONE' | 'VACATION' | 'TRAINING'
export type ScheduleEventStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'