/**
 * Memory Bank Adapter
 * Synchronizes data between Memory Bank JSON format and Prisma database
 * Maintains backward compatibility while enabling modern database features
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Memory Bank JSON structure types
interface MemoryBankProject {
  name: string
  address: string
  location: string
  lotSize?: number
  squareFootage?: number
  bedrooms?: number
  bathrooms?: number
  stories?: number
  startDate?: string
  targetCompletionDate?: string
  actualCompletionDate?: string
  status: string
}

interface MemoryBankBudget {
  totalBudget?: number
  allocatedFunds: Record<string, number>
  actualExpenses: Record<string, number>
  contingencyReserve?: number
  loanDetails: {
    lender?: string
    loanType?: string
    loanAmount?: number
    interestRate?: number
    term?: number
  }
  drawSchedule: any[]
}

interface MemoryBankVendor {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  rating?: number
  type?: string
  subcategory?: string
  notes?: string
}

interface MemoryBankData {
  project: MemoryBankProject
  budget: MemoryBankBudget
  schedule: {
    milestones: any[]
    currentPhase: string
    tasks: any[]
  }
  vendors: Record<string, MemoryBankVendor[]>
  materials: Record<string, any>
  documents: any[]
  issues: any[]
  changeOrders: any[]
  communications: any[]
  decisions: any[]
}

export class MemoryBankAdapter {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * Import Memory Bank JSON data into Prisma database
   */
  async importFromMemoryBank(
    memoryBankFilePath: string,
    companyId: string,
    managerId: string
  ): Promise<string> {
    try {
      // Read Memory Bank JSON file
      const jsonData = fs.readFileSync(memoryBankFilePath, 'utf8')
      const memoryBankData: MemoryBankData = JSON.parse(jsonData)

      // Create or find client (simplified - in real implementation, would handle client creation)
      let client = await this.prisma.client.findFirst({
        where: { 
          companyId,
          email: 'owner@project.com' // Default owner email
        }
      })

      if (!client) {
        client = await this.prisma.client.create({
          data: {
            companyId,
            firstName: 'Project',
            lastName: 'Owner',
            email: 'owner@project.com',
            type: 'INDIVIDUAL'
          }
        })
      }

      // Create project with Memory Bank data
      const project = await this.prisma.project.create({
        data: {
          companyId,
          managerId,
          clientId: client.id,
          name: memoryBankData.project.name,
          description: `Imported from Memory Bank: ${memoryBankData.project.address}`,
          type: 'CUSTOM_HOME',
          address: {
            street: memoryBankData.project.address,
            city: this.extractCity(memoryBankData.project.location),
            state: this.extractState(memoryBankData.project.location),
            zip: '78645' // Default Liberty Hill ZIP
          },
          lotSize: memoryBankData.project.lotSize,
          homeSize: memoryBankData.project.squareFootage,
          bedrooms: memoryBankData.project.bedrooms,
          bathrooms: memoryBankData.project.bathrooms,
          stories: memoryBankData.project.stories,
          estimatedStartDate: memoryBankData.project.startDate ? 
            new Date(memoryBankData.project.startDate) : null,
          estimatedEndDate: memoryBankData.project.targetCompletionDate ? 
            new Date(memoryBankData.project.targetCompletionDate) : null,
          actualEndDate: memoryBankData.project.actualCompletionDate ? 
            new Date(memoryBankData.project.actualCompletionDate) : null,
          estimatedCost: memoryBankData.budget.totalBudget,
          contingencyPercent: memoryBankData.budget.contingencyReserve,
          
          // Store complete Memory Bank data in JSON field
          memoryBankData: memoryBankData,
          
          // Texas-specific defaults
          ownerBuilderExemption: true,
          libertyHillPermitNumber: null,
          hoaApprovalStatus: 'PENDING'
        }
      })

      // Import budget items
      await this.importBudgetItems(project.id, memoryBankData.budget)

      // Import vendors
      await this.importVendors(companyId, memoryBankData.vendors)

      // Import decisions
      await this.importDecisions(project.id, memoryBankData.decisions)

      // Import issues
      await this.importIssues(project.id, memoryBankData.issues)

      // Import communications
      await this.importCommunications(project.id, memoryBankData.communications)

      return project.id
    } catch (error) {
      console.error('Memory Bank import failed:', error)
      throw new Error(`Failed to import Memory Bank data: ${error.message}`)
    }
  }

  /**
   * Export project data to Memory Bank JSON format
   */
  async exportToMemoryBank(projectId: string): Promise<MemoryBankData> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        include: {
          client: true,
          budgetItems: {
            include: { category: true, supplier: true }
          },
          decisions: true,
          issues: true,
          communications: true,
          phases: {
            include: { tasks: true }
          }
        }
      })

      if (!project) {
        throw new Error(`Project ${projectId} not found`)
      }

      // Convert back to Memory Bank format
      const memoryBankData: MemoryBankData = {
        project: {
          name: project.name,
          address: (project.address as any)?.street || '',
          location: `${(project.address as any)?.city || ''}, ${(project.address as any)?.state || ''}`,
          lotSize: project.lotSize?.toNumber(),
          squareFootage: project.homeSize?.toNumber(),
          bedrooms: project.bedrooms,
          bathrooms: project.bathrooms?.toNumber(),
          stories: project.stories,
          startDate: project.actualStartDate?.toISOString(),
          targetCompletionDate: project.estimatedEndDate?.toISOString(),
          actualCompletionDate: project.actualEndDate?.toISOString(),
          status: project.status
        },
        budget: {
          totalBudget: project.estimatedCost?.toNumber(),
          allocatedFunds: this.buildAllocatedFunds(project.budgetItems),
          actualExpenses: this.buildActualExpenses(project.budgetItems),
          contingencyReserve: project.contingencyPercent?.toNumber(),
          loanDetails: {
            // Extract from memoryBankData if available
            ...((project.memoryBankData as any)?.budget?.loanDetails || {})
          },
          drawSchedule: (project.memoryBankData as any)?.budget?.drawSchedule || []
        },
        schedule: {
          milestones: this.buildMilestones(project.phases),
          currentPhase: this.getCurrentPhase(project.phases),
          tasks: this.buildTasks(project.phases)
        },
        vendors: this.buildVendorsStructure(),
        materials: (project.memoryBankData as any)?.materials || {},
        documents: (project.memoryBankData as any)?.documents || [],
        issues: this.buildIssues(project.issues),
        changeOrders: (project.memoryBankData as any)?.changeOrders || [],
        communications: this.buildCommunications(project.communications),
        decisions: this.buildDecisions(project.decisions)
      }

      return memoryBankData
    } catch (error) {
      console.error('Memory Bank export failed:', error)
      throw new Error(`Failed to export to Memory Bank format: ${error.message}`)
    }
  }

  /**
   * Synchronize Memory Bank data with database changes
   */
  async syncMemoryBankData(projectId: string): Promise<void> {
    try {
      // Export current database state to Memory Bank format
      const memoryBankData = await this.exportToMemoryBank(projectId)
      
      // Update the memoryBankData field in the project
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          memoryBankData: memoryBankData
        }
      })
    } catch (error) {
      console.error('Memory Bank sync failed:', error)
      throw new Error(`Failed to sync Memory Bank data: ${error.message}`)
    }
  }

  // Private helper methods
  private extractCity(location: string): string {
    return location.split(',')[0]?.trim() || 'Liberty Hill'
  }

  private extractState(location: string): string {
    const parts = location.split(',')
    return parts[1]?.trim() || 'TX'
  }

  private async importBudgetItems(projectId: string, budget: MemoryBankBudget): Promise<void> {
    // Create default budget category if not exists
    let category = await this.prisma.budgetCategory.findFirst({
      where: { name: 'General' }
    })

    if (!category) {
      category = await this.prisma.budgetCategory.create({
        data: {
          name: 'General',
          description: 'General construction costs'
        }
      })
    }

    // Import allocated funds as budget items
    for (const [categoryName, amount] of Object.entries(budget.allocatedFunds)) {
      if (amount > 0) {
        await this.prisma.budgetItem.create({
          data: {
            projectId,
            categoryId: category.id,
            name: categoryName,
            description: `Imported from Memory Bank`,
            unit: 'LS', // Lump sum
            quantity: 1,
            estimatedUnitCost: amount,
            estimatedTotal: amount,
            actualUnitCost: budget.actualExpenses[categoryName] || null,
            actualTotal: budget.actualExpenses[categoryName] || null,
            status: budget.actualExpenses[categoryName] ? 'PAID' : 'ESTIMATED'
          }
        })
      }
    }
  }

  private async importVendors(companyId: string, vendors: Record<string, MemoryBankVendor[]>): Promise<void> {
    for (const [category, vendorList] of Object.entries(vendors)) {
      for (const vendor of vendorList) {
        // Check if vendor already exists
        const existingVendor = await this.prisma.supplier.findFirst({
          where: {
            companyId,
            name: vendor.name
          }
        })

        if (!existingVendor) {
          await this.prisma.supplier.create({
            data: {
              companyId,
              name: vendor.name,
              type: this.mapVendorType(category),
              email: vendor.email,
              phone: vendor.phone,
              rating: vendor.rating,
              notes: vendor.notes,
              specialties: [vendor.subcategory || category],
              discoveredVia: 'MEMORY_BANK_IMPORT',
              researchData: vendor
            }
          })
        }
      }
    }
  }

  private async importDecisions(projectId: string, decisions: any[]): Promise<void> {
    for (const decision of decisions || []) {
      await this.prisma.decision.create({
        data: {
          projectId,
          title: decision.title || 'Imported Decision',
          description: decision.description || '',
          category: decision.category || 'GENERAL',
          options: decision.options || [],
          selected: decision.selected || '',
          reasoning: decision.reasoning,
          decisionMakers: decision.participants || [],
          budgetImpact: decision.budgetImpact,
          timelineImpact: decision.timelineImpact
        }
      })
    }
  }

  private async importIssues(projectId: string, issues: any[]): Promise<void> {
    for (const issue of issues || []) {
      await this.prisma.issue.create({
        data: {
          projectId,
          title: issue.title || 'Imported Issue',
          description: issue.description || '',
          category: issue.category || 'GENERAL',
          severity: issue.severity || 'MEDIUM',
          status: issue.status || 'OPEN',
          location: issue.location,
          budgetImpact: issue.budgetImpact,
          timelineImpact: issue.timelineImpact,
          resolution: issue.resolution
        }
      })
    }
  }

  private async importCommunications(projectId: string, communications: any[]): Promise<void> {
    for (const comm of communications || []) {
      await this.prisma.communication.create({
        data: {
          projectId,
          type: comm.type || 'GENERAL',
          subject: comm.subject,
          content: comm.content || '',
          direction: comm.direction || 'OUTBOUND',
          status: 'READ'
        }
      })
    }
  }

  private mapVendorType(category: string): 'MATERIAL' | 'SUBCONTRACTOR' | 'EQUIPMENT' | 'SERVICE' {
    const materialCategories = ['suppliers', 'materials', 'lumber']
    const subcontractorCategories = ['contractors', 'subcontractors', 'builders']
    
    if (materialCategories.some(cat => category.toLowerCase().includes(cat))) {
      return 'MATERIAL'
    }
    if (subcontractorCategories.some(cat => category.toLowerCase().includes(cat))) {
      return 'SUBCONTRACTOR'
    }
    return 'SERVICE'
  }

  private buildAllocatedFunds(budgetItems: any[]): Record<string, number> {
    const allocatedFunds: Record<string, number> = {}
    
    for (const item of budgetItems) {
      const categoryName = item.category?.name || item.name
      allocatedFunds[categoryName] = (allocatedFunds[categoryName] || 0) + 
        (item.estimatedTotal?.toNumber() || 0)
    }
    
    return allocatedFunds
  }

  private buildActualExpenses(budgetItems: any[]): Record<string, number> {
    const actualExpenses: Record<string, number> = {}
    
    for (const item of budgetItems) {
      if (item.actualTotal) {
        const categoryName = item.category?.name || item.name
        actualExpenses[categoryName] = (actualExpenses[categoryName] || 0) + 
          item.actualTotal.toNumber()
      }
    }
    
    return actualExpenses
  }

  private buildMilestones(phases: any[]): any[] {
    return phases.map(phase => ({
      name: phase.name,
      date: phase.estimatedEndDate,
      status: phase.status,
      description: phase.description
    }))
  }

  private getCurrentPhase(phases: any[]): string {
    const inProgressPhase = phases.find(phase => phase.status === 'IN_PROGRESS')
    return inProgressPhase?.name || phases[0]?.name || 'planning'
  }

  private buildTasks(phases: any[]): any[] {
    const allTasks: any[] = []
    
    for (const phase of phases) {
      for (const task of phase.tasks || []) {
        allTasks.push({
          name: task.name,
          phase: phase.name,
          status: task.status,
          assignedTo: task.assignedTo,
          dueDate: task.estimatedEndDate
        })
      }
    }
    
    return allTasks
  }

  private buildVendorsStructure(): Record<string, any> {
    // Return empty structure - vendors are imported separately
    return {
      architects: [],
      contractors: [],
      suppliers: []
    }
  }

  private buildIssues(issues: any[]): any[] {
    return issues.map(issue => ({
      title: issue.title,
      description: issue.description,
      severity: issue.severity,
      status: issue.status,
      category: issue.category,
      location: issue.location,
      discoveredAt: issue.discoveredAt,
      resolvedAt: issue.resolvedAt
    }))
  }

  private buildCommunications(communications: any[]): any[] {
    return communications.map(comm => ({
      type: comm.type,
      subject: comm.subject,
      content: comm.content,
      direction: comm.direction,
      createdAt: comm.createdAt
    }))
  }

  private buildDecisions(decisions: any[]): any[] {
    return decisions.map(decision => ({
      title: decision.title,
      description: decision.description,
      category: decision.category,
      selected: decision.selected,
      reasoning: decision.reasoning,
      participants: decision.decisionMakers
    }))
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
  }
}

// CLI interface for Memory Bank operations
export class MemoryBankCLI {
  private adapter: MemoryBankAdapter

  constructor() {
    this.adapter = new MemoryBankAdapter()
  }

  async importProject(
    memoryBankPath: string,
    companyId: string,
    managerId: string
  ): Promise<void> {
    try {
      console.log(`Importing Memory Bank data from: ${memoryBankPath}`)
      const projectId = await this.adapter.importFromMemoryBank(
        memoryBankPath,
        companyId,
        managerId
      )
      console.log(`✅ Successfully imported project: ${projectId}`)
    } catch (error) {
      console.error(`❌ Import failed: ${error.message}`)
      process.exit(1)
    }
  }

  async exportProject(projectId: string, outputPath: string): Promise<void> {
    try {
      console.log(`Exporting project ${projectId} to Memory Bank format...`)
      const memoryBankData = await this.adapter.exportToMemoryBank(projectId)
      
      fs.writeFileSync(outputPath, JSON.stringify(memoryBankData, null, 2))
      console.log(`✅ Successfully exported to: ${outputPath}`)
    } catch (error) {
      console.error(`❌ Export failed: ${error.message}`)
      process.exit(1)
    }
  }

  async syncProject(projectId: string): Promise<void> {
    try {
      console.log(`Syncing Memory Bank data for project: ${projectId}`)
      await this.adapter.syncMemoryBankData(projectId)
      console.log(`✅ Successfully synced Memory Bank data`)
    } catch (error) {
      console.error(`❌ Sync failed: ${error.message}`)
      process.exit(1)
    }
  }
}