import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Material, MaterialSelection, MaterialStatus, SelectionStatus } from '@/types'

interface MaterialFilters {
  category?: string[]
  status?: MaterialStatus[]
  brand?: string[]
  priceRange?: { min: number; max: number }
  searchQuery?: string
  inStock?: boolean
}

interface MaterialResearchRequest {
  category: string
  specifications?: string[]
  budget?: number
  location?: string
  projectId?: string
}

interface MaterialState {
  // Data
  materials: Material[]
  currentMaterial: Material | null
  selections: MaterialSelection[]
  categories: string[]
  
  // UI State
  filters: MaterialFilters
  sortBy: string
  sortOrder: 'asc' | 'desc'
  selectedMaterialIds: string[]
  isLoading: boolean
  isResearching: boolean
  error: string | null
  
  // Research State
  researchHistory: any[]
  lastResearchQuery: string
  
  // Selection State
  selectionsByProject: Record<string, MaterialSelection[]>
  pendingSelections: MaterialSelection[]
  
  // Actions
  setMaterials: (materials: Material[]) => void
  addMaterial: (material: Material) => void
  updateMaterial: (id: string, updates: Partial<Material>) => void
  deleteMaterial: (id: string) => void
  
  setCurrentMaterial: (material: Material | null) => void
  selectMaterial: (id: string) => void
  selectMultipleMaterials: (ids: string[]) => void
  clearSelection: () => void
  
  // Material Selection Actions
  setSelections: (selections: MaterialSelection[]) => void
  addSelection: (selection: MaterialSelection) => void
  updateSelection: (id: string, updates: Partial<MaterialSelection>) => void
  removeSelection: (id: string) => void
  approveSelection: (id: string, approvedBy: string) => Promise<void>
  
  // Research Actions
  researchMaterials: (request: MaterialResearchRequest) => Promise<any>
  applyResearchResults: (materials: any[]) => Promise<void>
  
  // Comparison Actions
  compareMaterials: (materialIds: string[]) => Material[]
  getAlternatives: (materialId: string) => Material[]
  
  // Filtering & Sorting
  setFilters: (filters: Partial<MaterialFilters>) => void
  clearFilters: () => void
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  
  // Category Management
  loadCategories: () => Promise<void>
  addCategory: (category: string) => void
  
  // Async Actions
  fetchMaterials: () => Promise<void>
  fetchMaterialById: (id: string) => Promise<void>
  createMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  
  // Project-specific actions
  loadSelectionsForProject: (projectId: string) => Promise<void>
  createSelectionForProject: (projectId: string, selection: Omit<MaterialSelection, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  
  // Computed Properties
  getFilteredMaterials: () => Material[]
  getMaterialsByCategory: () => Record<string, Material[]>
  getSelectionsByStatus: () => Record<SelectionStatus, MaterialSelection[]>
  getMaterialMetrics: () => {
    total: number
    active: number
    byCategory: Record<string, number>
    averagePrice: number
    pendingSelections: number
  }
}

export const useMaterialStore = create<MaterialState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        materials: [],
        currentMaterial: null,
        selections: [],
        categories: [],
        
        filters: {},
        sortBy: 'name',
        sortOrder: 'asc',
        selectedMaterialIds: [],
        isLoading: false,
        isResearching: false,
        error: null,
        
        researchHistory: [],
        lastResearchQuery: '',
        
        selectionsByProject: {},
        pendingSelections: [],
        
        // Basic Actions
        setMaterials: (materials) => set((state) => {
          state.materials = materials
          state.isLoading = false
          state.error = null
        }),
        
        addMaterial: (material) => set((state) => {
          state.materials.push(material)
        }),
        
        updateMaterial: (id, updates) => set((state) => {
          const index = state.materials.findIndex(m => m.id === id)
          if (index !== -1) {
            Object.assign(state.materials[index], updates)
          }
          if (state.currentMaterial?.id === id) {
            Object.assign(state.currentMaterial, updates)
          }
        }),
        
        deleteMaterial: (id) => set((state) => {
          state.materials = state.materials.filter(m => m.id !== id)
          if (state.currentMaterial?.id === id) {
            state.currentMaterial = null
          }
          state.selectedMaterialIds = state.selectedMaterialIds.filter(mid => mid !== id)
        }),
        
        // Material Selection
        setCurrentMaterial: (material) => set((state) => {
          state.currentMaterial = material
        }),
        
        selectMaterial: (id) => set((state) => {
          if (state.selectedMaterialIds.includes(id)) {
            state.selectedMaterialIds = state.selectedMaterialIds.filter(mid => mid !== id)
          } else {
            state.selectedMaterialIds.push(id)
          }
        }),
        
        selectMultipleMaterials: (ids) => set((state) => {
          state.selectedMaterialIds = ids
        }),
        
        clearSelection: () => set((state) => {
          state.selectedMaterialIds = []
        }),
        
        // Material Selection Actions
        setSelections: (selections) => set((state) => {
          state.selections = selections
        }),
        
        addSelection: (selection) => set((state) => {
          state.selections.push(selection)
          
          // Update project-specific selections
          if (!state.selectionsByProject[selection.projectId]) {
            state.selectionsByProject[selection.projectId] = []
          }
          state.selectionsByProject[selection.projectId].push(selection)
          
          // Add to pending if not approved
          if (selection.status === 'PENDING_APPROVAL') {
            state.pendingSelections.push(selection)
          }
        }),
        
        updateSelection: (id, updates) => set((state) => {
          const index = state.selections.findIndex(s => s.id === id)
          if (index !== -1) {
            const selection = state.selections[index]
            Object.assign(selection, updates)
            
            // Update in project-specific selections
            const projectSelections = state.selectionsByProject[selection.projectId]
            if (projectSelections) {
              const projectIndex = projectSelections.findIndex(s => s.id === id)
              if (projectIndex !== -1) {
                Object.assign(projectSelections[projectIndex], updates)
              }
            }
            
            // Update pending selections
            if (updates.status === 'APPROVED') {
              state.pendingSelections = state.pendingSelections.filter(s => s.id !== id)
            } else if (updates.status === 'PENDING_APPROVAL' && !state.pendingSelections.find(s => s.id === id)) {
              state.pendingSelections.push(selection)
            }
          }
        }),
        
        removeSelection: (id) => set((state) => {
          const selection = state.selections.find(s => s.id === id)
          if (selection) {
            // Remove from main list
            state.selections = state.selections.filter(s => s.id !== id)
            
            // Remove from project-specific selections
            const projectSelections = state.selectionsByProject[selection.projectId]
            if (projectSelections) {
              state.selectionsByProject[selection.projectId] = projectSelections.filter(s => s.id !== id)
            }
            
            // Remove from pending
            state.pendingSelections = state.pendingSelections.filter(s => s.id !== id)
          }
        }),
        
        approveSelection: async (id, approvedBy) => {
          try {
            const response = await fetch(`/api/material-selections/${id}/approve`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ approvedBy })
            })
            
            if (!response.ok) throw new Error('Failed to approve selection')
            
            set((state) => {
              const selection = state.selections.find(s => s.id === id)
              if (selection) {
                selection.status = 'APPROVED'
                selection.approvedBy = approvedBy
                selection.approvedDate = new Date()
              }
              
              // Remove from pending
              state.pendingSelections = state.pendingSelections.filter(s => s.id !== id)
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to approve selection'
            })
          }
        },
        
        // Research Actions
        researchMaterials: async (request) => {
          set((state) => {
            state.isResearching = true
            state.error = null
            state.lastResearchQuery = `${request.category} materials`
          })
          
          try {
            const response = await fetch('/api/material-research', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(request)
            })
            
            if (!response.ok) throw new Error('Failed to research materials')
            const research = await response.json()
            
            set((state) => {
              state.researchHistory.push(research)
              state.isResearching = false
            })
            
            return research
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to research materials'
              state.isResearching = false
            })
            throw error
          }
        },
        
        applyResearchResults: async (materials) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch('/api/materials/bulk-create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ materials })
            })
            
            if (!response.ok) throw new Error('Failed to create materials')
            const newMaterials = await response.json()
            
            set((state) => {
              state.materials.push(...newMaterials)
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to create materials'
              state.isLoading = false
            })
          }
        },
        
        // Comparison Actions
        compareMaterials: (materialIds) => {
          const materials = get().materials
          return materials.filter(m => materialIds.includes(m.id))
        },
        
        getAlternatives: (materialId) => {
          const material = get().materials.find(m => m.id === materialId)
          if (!material) return []
          
          const materials = get().materials
          return materials.filter(m => 
            m.id !== materialId && 
            m.category === material.category &&
            m.status === 'ACTIVE'
          ).slice(0, 5) // Return top 5 alternatives
        },
        
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
        
        // Category Management
        loadCategories: async () => {
          try {
            const response = await fetch('/api/materials/categories')
            if (!response.ok) throw new Error('Failed to load categories')
            const categories = await response.json()
            
            set((state) => {
              state.categories = categories
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load categories'
            })
          }
        },
        
        addCategory: (category) => set((state) => {
          if (!state.categories.includes(category)) {
            state.categories.push(category)
          }
        }),
        
        // Async Actions
        fetchMaterials: async () => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch('/api/materials')
            if (!response.ok) throw new Error('Failed to fetch materials')
            const materials = await response.json()
            
            set((state) => {
              state.materials = materials
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch materials'
              state.isLoading = false
            })
          }
        },
        
        fetchMaterialById: async (id) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch(`/api/materials/${id}`)
            if (!response.ok) throw new Error('Failed to fetch material')
            const material = await response.json()
            
            set((state) => {
              state.currentMaterial = material
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to fetch material'
              state.isLoading = false
            })
          }
        },
        
        createMaterial: async (materialData) => {
          set((state) => {
            state.isLoading = true
            state.error = null
          })
          
          try {
            const response = await fetch('/api/materials', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(materialData)
            })
            
            if (!response.ok) throw new Error('Failed to create material')
            const material = await response.json()
            
            set((state) => {
              state.materials.push(material)
              state.currentMaterial = material
              state.isLoading = false
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to create material'
              state.isLoading = false
            })
          }
        },
        
        // Project-specific actions
        loadSelectionsForProject: async (projectId) => {
          try {
            const response = await fetch(`/api/projects/${projectId}/material-selections`)
            if (!response.ok) throw new Error('Failed to load selections')
            const selections = await response.json()
            
            set((state) => {
              state.selectionsByProject[projectId] = selections
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to load selections'
            })
          }
        },
        
        createSelectionForProject: async (projectId, selectionData) => {
          try {
            const response = await fetch('/api/material-selections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...selectionData, projectId })
            })
            
            if (!response.ok) throw new Error('Failed to create selection')
            const selection = await response.json()
            
            set((state) => {
              state.selections.push(selection)
              
              if (!state.selectionsByProject[projectId]) {
                state.selectionsByProject[projectId] = []
              }
              state.selectionsByProject[projectId].push(selection)
              
              if (selection.status === 'PENDING_APPROVAL') {
                state.pendingSelections.push(selection)
              }
            })
          } catch (error) {
            set((state) => {
              state.error = error instanceof Error ? error.message : 'Failed to create selection'
            })
          }
        },
        
        // Computed Properties
        getFilteredMaterials: () => {
          const { materials, filters, sortBy, sortOrder } = get()
          
          let filtered = materials.filter(material => {
            // Filter by category
            if (filters.category?.length && !filters.category.includes(material.category)) return false
            
            // Filter by status
            if (filters.status?.length && !filters.status.includes(material.status)) return false
            
            // Filter by brand
            if (filters.brand?.length && material.brand && !filters.brand.includes(material.brand)) return false
            
            // Filter by price range
            if (filters.priceRange && material.basePrice) {
              if (material.basePrice < filters.priceRange.min || material.basePrice > filters.priceRange.max) return false
            }
            
            // Filter by search query
            if (filters.searchQuery) {
              const query = filters.searchQuery.toLowerCase()
              return (
                material.name.toLowerCase().includes(query) ||
                material.description?.toLowerCase().includes(query) ||
                material.brand?.toLowerCase().includes(query) ||
                material.category.toLowerCase().includes(query)
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
              case 'category':
                aValue = a.category
                bValue = b.category
                break
              case 'price':
                aValue = a.basePrice || 0
                bValue = b.basePrice || 0
                break
              case 'brand':
                aValue = a.brand || ''
                bValue = b.brand || ''
                break
              case 'rating':
                aValue = a.qualityRating || 0
                bValue = b.qualityRating || 0
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
        
        getMaterialsByCategory: () => {
          const materials = get().getFilteredMaterials()
          const byCategory: Record<string, Material[]> = {}
          
          materials.forEach(material => {
            if (!byCategory[material.category]) {
              byCategory[material.category] = []
            }
            byCategory[material.category].push(material)
          })
          
          return byCategory
        },
        
        getSelectionsByStatus: () => {
          const selections = get().selections
          const byStatus: Record<SelectionStatus, MaterialSelection[]> = {
            RESEARCHING: [],
            OPTIONS_IDENTIFIED: [],
            PENDING_APPROVAL: [],
            APPROVED: [],
            ORDERED: [],
            DELIVERED: [],
            INSTALLED: []
          }
          
          selections.forEach(selection => {
            byStatus[selection.status].push(selection)
          })
          
          return byStatus
        },
        
        getMaterialMetrics: () => {
          const materials = get().materials
          const selections = get().selections
          
          const byCategory: Record<string, number> = {}
          let totalPrice = 0
          let priceCount = 0
          
          materials.forEach(material => {
            byCategory[material.category] = (byCategory[material.category] || 0) + 1
            
            if (material.basePrice) {
              totalPrice += material.basePrice
              priceCount++
            }
          })
          
          return {
            total: materials.length,
            active: materials.filter(m => m.status === 'ACTIVE').length,
            byCategory,
            averagePrice: priceCount > 0 ? totalPrice / priceCount : 0,
            pendingSelections: selections.filter(s => s.status === 'PENDING_APPROVAL').length
          }
        }
      })),
      {
        name: 'material-store',
        partialize: (state) => ({
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          categories: state.categories,
          researchHistory: state.researchHistory.slice(-20) // Keep last 20 research items
        })
      }
    ),
    { name: 'MaterialStore' }
  )
)