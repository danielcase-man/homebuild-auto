import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Supplier, SupplierType, SupplierStatus, VendorResearch } from '@/types'

interface VendorFilters {
  type?: SupplierType[]
  status?: SupplierStatus[]
  rating?: { min: number; max: number }
  location?: string
  specialties?: string[]
  searchQuery?: string
  libertyHillApproved?: boolean
  hoaApproved?: boolean
}

interface ResearchRequest {
  trade: string
  location: string
  projectId?: string
  requirements?: string[]
  budget?: number
}

interface VendorState {
  // Data
  vendors: Supplier[]
  currentVendor: Supplier | null
  researchResults: VendorResearch[]
  
  // UI State
  filters: VendorFilters
  sortBy: string
  sortOrder: 'asc' | 'desc'
  selectedVendorIds: string[]
  isLoading: boolean
  isResearching: boolean
  error: string | null
  
  // Research State
  pendingResearch: ResearchRequest[]
  lastResearchQuery: string
  researchHistory: VendorResearch[]
  
  // Actions
  setVendors: (vendors: Supplier[]) => void
  addVendor: (vendor: Supplier) => void
  updateVendor: (id: string, updates: Partial<Supplier>) => void
  deleteVendor: (id: string) => void
  
  setCurrentVendor: (vendor: Supplier | null) => void
  selectVendor: (id: string) => void
  selectMultipleVendors: (ids: string[]) => void
  clearSelection: () => void
  
  // Research Actions
  startVendorResearch: (request: ResearchRequest) => Promise<VendorResearch>
  applyResearchResults: (researchId: string, selectedVendors: any[]) => Promise<void>
  saveResearchResult: (research: VendorResearch) => void
  
  // Filtering & Sorting
  setFilters: (filters: Partial<VendorFilters>) => void
  clearFilters: () => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  
  // Async Actions
  fetchVendors: () => Promise<void>
  fetchVendorById: (id: string) => Promise<void>
  createVendor: (vendor: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  
  // Vendor Management
  updateVendorRating: (id: string, rating: number) => Promise<void>
  toggleVendorStatus: (id: string) => Promise<void>
  markAsPreferred: (id: string, preferred: boolean) => Promise<void>
  
  // Communication
  sendRFP: (vendorIds: string[], rfpData: any) => Promise<void>
  trackCommunication: (vendorId: string, communication: any) => Promise<void>
  
  // Computed Properties
  getFilteredVendors: () => Supplier[]
  getVendorsByType: () => Record<SupplierType, Supplier[]>
  getTopRatedVendors: (limit?: number) => Supplier[]
  getVendorMetrics: () => {
    total: number
    active: number
    byType: Record<SupplierType, number>
    averageRating: number
    libertyHillApproved: number
  }
}

export const useVendorStore = create<VendorState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        vendors: [],
        currentVendor: null,
        researchResults: [],
        
        filters: {},
        sortBy: 'name',
        sortOrder: 'asc',
        selectedVendorIds: [],
        isLoading: false,
        isResearching: false,
        error: null,
        
        pendingResearch: [],
        lastResearchQuery: '',
        researchHistory: [],
        
        // Basic Actions
        setVendors: (vendors) => set((state) => {
          state.vendors = vendors
          state.isLoading = false
          state.error = null
        }),
        
        addVendor: (vendor) => set((state) => {
          state.vendors.push(vendor)
        }),
        
        updateVendor: (id, updates) => set((state) => {
          const index = state.vendors.findIndex(v => v.id === id)
          if (index !== -1) {
            Object.assign(state.vendors[index], updates)
          }
          if (state.currentVendor?.id === id) {
            Object.assign(state.currentVendor, updates)
          }
        }),
        
        deleteVendor: (id) => set((state) => {
          state.vendors = state.vendors.filter(v => v.id !== id)
          if (state.currentVendor?.id === id) {
            state.currentVendor = null
          }
          state.selectedVendorIds = state.selectedVendorIds.filter(vid => vid !== id)
        }),
        
        // Vendor Selection
        setCurrentVendor: (vendor) => set((state) => {
          state.currentVendor = vendor
        }),
        
        selectVendor: (id) => set((state) => {
          if (state.selectedVendorIds.includes(id)) {
            state.selectedVendorIds = state.selectedVendorIds.filter(vid => vid !== id)
          } else {
            state.selectedVendorIds.push(id)
          }
        }),
        
        selectMultipleVendors: (ids) => set((state) => {
          state.selectedVendorIds = ids
        }),
        
        clearSelection: () => set((state) => {
          state.selectedVendorIds = []
        }),
        
        // Research Actions
        startVendorResearch: async (request) => {
          set((state) => {
            state.isResearching = true
            state.error = null
            state.lastResearchQuery = `${request.trade} vendors in ${request.location}`
          })
          
          try {
            const response = await fetch('/api/vendor-research', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(request)
            })
            
            if (!response.ok) throw new Error('Failed to start vendor research')
            const research = await response.json()
            
            set((state) => {
              state.researchResults.push(research)
              state.researchHistory.push(research)
              state.isResearching = false
            })
            
            return research
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to research vendors'
              state.isResearching = false
            })
            throw error
          }
        },
        
        applyResearchResults: async (researchId, selectedVendors) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch('/api/vendor-research/apply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ researchId, selectedVendors })
            })
            
            if (!response.ok) throw new Error('Failed to apply research results')
            const newVendors = await response.json()
            
            set((state) => {
              state.vendors.push(...newVendors)
              state.isLoading = false
              
              // Mark research as applied
              const research = state.researchResults.find(r => r.id === researchId)
              if (research) {
                research.applied = true
                research.vendorsCreated = newVendors.length
              }
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to apply research results'
              state.isLoading = false
            })
          }
        },
        
        saveResearchResult: (research) => set((state) => {
          state.researchResults.push(research)
          state.researchHistory.push(research)
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
        
        // Async Actions
        fetchVendors: async () => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch('/api/vendors')
            if (!response.ok) throw new Error('Failed to fetch vendors')
            const vendors = await response.json()
            
            set((state) => {
              state.vendors = vendors
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch vendors'
              state.isLoading = false
            })
          }
        },
        
        fetchVendorById: async (id) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch(`/api/vendors/${id}`)
            if (!response.ok) throw new Error('Failed to fetch vendor')
            const vendor = await response.json()
            
            set((state) => {
              state.currentVendor = vendor
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch vendor'
              state.isLoading = false
            })
          }
        },
        
        createVendor: async (vendorData) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch('/api/vendors', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(vendorData)
            })
            
            if (!response.ok) throw new Error('Failed to create vendor')
            const vendor = await response.json()
            
            set((state) => {
              state.vendors.push(vendor)
              state.currentVendor = vendor
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to create vendor'
              state.isLoading = false
            })
          }
        },
        
        // Vendor Management
        updateVendorRating: async (id, rating) => {
          try {
            const response = await fetch(`/api/vendors/${id}/rating`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ rating })
            })
            
            if (!response.ok) throw new Error('Failed to update rating')
            
            set((state) => {
              const vendor = state.vendors.find(v => v.id === id)
              if (vendor) {
                vendor.rating = rating
              }
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update rating'
            })
          }
        },
        
        toggleVendorStatus: async (id) => {
          try {
            const vendor = get().vendors.find(v => v.id === id)
            if (!vendor) return
            
            const newStatus = vendor.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
            
            const response = await fetch(`/api/vendors/${id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            })
            
            if (!response.ok) throw new Error('Failed to update status')
            
            set((state) => {
              const vendor = state.vendors.find(v => v.id === id)
              if (vendor) {
                vendor.status = newStatus
              }
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update status'
            })
          }
        },
        
        markAsPreferred: async (id, preferred) => {
          try {
            const response = await fetch(`/api/vendors/${id}/preferred`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ preferred })
            })
            
            if (!response.ok) throw new Error('Failed to update preference')
            
            // This would update a vendor preference field if it existed in the schema
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to update preference'
            })
          }
        },
        
        // Communication
        sendRFP: async (vendorIds, rfpData) => {
          try {
            const response = await fetch('/api/rfp/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vendorIds, rfpData })
            })
            
            if (!response.ok) throw new Error('Failed to send RFP')
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to send RFP'
            })
          }
        },
        
        trackCommunication: async (vendorId, communication) => {
          try {
            const response = await fetch('/api/communications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vendorId, ...communication })
            })
            
            if (!response.ok) throw new Error('Failed to track communication')
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to track communication'
            })
          }
        },
        
        // Computed Properties
        getFilteredVendors: () => {
          const { vendors, filters, sortBy, sortOrder } = get()
          
          let filtered = vendors.filter(vendor => {
            // Filter by type
            if (filters.type?.length && !filters.type.includes(vendor.type)) return false
            
            // Filter by status
            if (filters.status?.length && !filters.status.includes(vendor.status)) return false
            
            // Filter by rating
            if (filters.rating && vendor.rating) {
              if (vendor.rating < filters.rating.min || vendor.rating > filters.rating.max) return false
            }
            
            // Filter by specialties
            if (filters.specialties?.length) {
              const hasSpecialty = filters.specialties.some(specialty =>
                vendor.specialties?.includes(specialty)
              )
              if (!hasSpecialty) return false
            }
            
            // Filter by Liberty Hill approval
            if (filters.libertyHillApproved !== undefined && 
                vendor.libertyHillApproved !== filters.libertyHillApproved) return false
            
            // Filter by HOA approval
            if (filters.hoaApproved !== undefined && 
                vendor.hoaApproved !== filters.hoaApproved) return false
            
            // Filter by search query
            if (filters.searchQuery) {
              const query = filters.searchQuery.toLowerCase()
              return (
                vendor.name.toLowerCase().includes(query) ||
                vendor.email?.toLowerCase().includes(query) ||
                vendor.specialties?.some(s => s.toLowerCase().includes(query))
              )
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
              case 'rating':
                aValue = a.rating || 0
                bValue = b.rating || 0
                break
              case 'type':
                aValue = a.type
                bValue = b.type
                break
              case 'status':
                aValue = a.status
                bValue = b.status
                break
              default:
                aValue = a.name
                bValue = b.name
            }
            
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
            return 0
          })
          
          return filtered
        },
        
        getVendorsByType: () => {
          const vendors = get().getFilteredVendors()
          const byType: Record<SupplierType, Supplier[]> = {
            MATERIAL: [],
            SUBCONTRACTOR: [],
            EQUIPMENT: [],
            SERVICE: []
          }
          
          vendors.forEach(vendor => {
            byType[vendor.type].push(vendor)
          })
          
          return byType
        },
        
        getTopRatedVendors: (limit = 10) => {
          const vendors = get().vendors
          return vendors
            .filter(v => v.rating && v.status === 'ACTIVE')
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, limit)
        },
        
        getVendorMetrics: () => {
          const vendors = get().vendors
          
          const byType: Record<SupplierType, number> = {
            MATERIAL: 0,
            SUBCONTRACTOR: 0,
            EQUIPMENT: 0,
            SERVICE: 0
          }
          
          let totalRating = 0
          let ratedVendors = 0
          
          vendors.forEach(vendor => {
            byType[vendor.type]++
            if (vendor.rating) {
              totalRating += vendor.rating
              ratedVendors++
            }
          })
          
          return {
            total: vendors.length,
            active: vendors.filter(v => v.status === 'ACTIVE').length,
            byType,
            averageRating: ratedVendors > 0 ? totalRating / ratedVendors : 0,
            libertyHillApproved: vendors.filter(v => v.libertyHillApproved).length
          }
        }
      })),
      {
        name: 'vendor-store',
        partialize: (state) => ({
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          researchHistory: state.researchHistory.slice(-50) // Keep last 50 research items
        })
      }
    ),
    { name: 'VendorStore' }
  )
)