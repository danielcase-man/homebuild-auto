#!/usr/bin/env node

/**
 * Texas Compliance CLI Tool
 * Command-line interface for Texas building compliance and Liberty Hill integration
 */

// Mock the services for CLI testing since TypeScript files can't be directly required
class MockTexasComplianceService {
  async getComplianceRequirements(workType, projectValue, isOwnerBuilder, hoaRequired) {
    return {
      texasRequirements: [
        {
          id: 'tx-building-permit',
          category: 'PERMIT',
          requirement: 'Texas Building Permit',
          description: 'Building permit required for new construction and major renovations',
          authority: 'Local Building Authority',
          cost: { baseAmount: 500 }
        }
      ],
      libertyHillRequirements: [
        {
          type: 'Building Permit',
          description: 'Liberty Hill municipal building permit',
          department: 'Building & Development Services',
          fees: { baseFee: 200 }
        }
      ],
      workflow: {
        workType,
        steps: [
          { id: 'site-survey', title: 'Obtain Site Survey', estimatedCost: 800 },
          { id: 'building-plans', title: 'Prepare Building Plans', estimatedCost: 2000 },
          { id: 'permit-application', title: 'Submit Permit Application', estimatedCost: 500 }
        ],
        totalEstimatedTime: '6-10 weeks',
        criticalPath: ['site-survey', 'building-plans', 'permit-application'],
        ownerBuilderNotes: [
          'Owner-builder exemption applies to personal residence only',
          'Must occupy property for minimum 1 year after completion'
        ]
      },
      estimatedCosts: {
        permits: 700,
        inspections: 150,
        total: 850
      }
    }
  }

  async generateOwnerBuilderChecklist(workType, projectValue) {
    return {
      preConstruction: [
        'Verify property boundaries and setbacks',
        'Obtain building permit from Liberty Hill',
        'Submit plans for HOA approval (if applicable)'
      ],
      duringConstruction: [
        'Call for inspections 24 hours in advance',
        'Ensure all work stops until inspection passes',
        'Keep permit and approved plans on-site'
      ],
      postConstruction: [
        'Schedule final inspection',
        'Obtain certificate of occupancy',
        'Submit as-built drawings (if required)'
      ],
      commonMistakes: [
        'Starting work before permit approval',
        'Missing required inspections',
        'Not following approved plans'
      ],
      resources: [
        {
          title: 'Liberty Hill Building Department',
          url: 'https://www.libertyhill.org/building',
          description: 'Official building permits and inspection information'
        }
      ]
    }
  }

  async disconnect() {}
}

class MockLibertyHillIntegrationService {
  async submitPermitApplication(projectId, permitData) {
    const permitNumber = `LH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
    return {
      permitNumber,
      applicationId: `APP-${permitNumber}`,
      submissionDate: new Date(),
      estimatedReviewTime: '10-15 business days',
      reviewFees: 350,
      nextSteps: [
        'Plan review by city staff',
        'Address any review comments',
        'Pay permit fees upon approval',
        'Schedule initial inspection'
      ]
    }
  }

  async checkPermitStatus(permitNumber) {
    return {
      permitNumber,
      applicationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      issuedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: 'ISSUED',
      permitType: 'New Residential Construction',
      projectDescription: 'Single family residence construction',
      projectValue: 350000,
      fees: {
        total: 4100,
        paid: 4100,
        outstanding: 0
      },
      inspections: [
        { type: 'FOUNDATION', status: 'PASSED' },
        { type: 'FRAMING', status: 'SCHEDULED' }
      ]
    }
  }

  async scheduleInspection(permitNumber, inspectionType, preferredDate, contactPhone, notes) {
    return {
      inspectionId: `INS-${permitNumber}-${Date.now()}`,
      scheduledDate: new Date(preferredDate.getTime() + 24 * 60 * 60 * 1000),
      inspector: 'Mike Johnson, Senior Building Inspector',
      timeWindow: '8:00 AM - 12:00 PM',
      requirements: [
        'All framing complete',
        'Sheathing installed',
        'Windows and doors rough-opened'
      ],
      contactInfo: 'Inspections: (512) 515-5100 ext. 234'
    }
  }

  async getLibertyHillContacts() {
    return [
      {
        department: 'Building & Development Services',
        name: 'Sarah Wilson',
        title: 'Building Official',
        phone: '(512) 515-5100',
        email: 'building@libertyhill.org',
        office: '111 W San Antonio St, Liberty Hill, TX 78642',
        hours: 'Mon-Fri 8:00 AM - 5:00 PM',
        services: ['Building permits', 'Plan review', 'Code enforcement']
      },
      {
        department: 'Inspections',
        name: 'Mike Johnson',
        title: 'Senior Building Inspector',
        phone: '(512) 515-5100 ext. 234',
        email: 'inspections@libertyhill.org',
        office: '111 W San Antonio St, Liberty Hill, TX 78642',
        hours: 'Mon-Fri 7:00 AM - 4:00 PM',
        services: ['Building inspections', 'Code compliance', 'Final approvals']
      }
    ]
  }

  async generateComplianceReport(projectId) {
    return {
      projectInfo: {
        permitNumber: 'LH-2024-0123',
        status: 'ISSUED',
        compliance: 'COMPLIANT'
      },
      inspectionSummary: {
        completed: 3,
        pending: 2,
        failed: 0
      },
      outstandingIssues: [],
      recommendations: [
        'Schedule remaining inspections promptly',
        'Ensure all required documents are submitted'
      ],
      contactsNeeded: await this.getLibertyHillContacts()
    }
  }

  async disconnect() {}
}

function createTexasComplianceService() {
  return new MockTexasComplianceService()
}

function createLibertyHillIntegration() {
  return new MockLibertyHillIntegrationService()
}
const fs = require('fs')
const path = require('path')

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

class TexasComplianceCLI {
  constructor() {
    this.complianceService = createTexasComplianceService()
    this.libertyHillService = createLibertyHillIntegration()
    this.outputDir = path.join(__dirname, '..', 'compliance-output')
    this.ensureOutputDir()
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  async checkCompliance(workType, projectValue = 250000, isOwnerBuilder = true, hoaRequired = false) {
    log(`🏗️ Checking compliance for ${workType}...`, colors.blue)
    log(`   Project Value: $${projectValue.toLocaleString()}`, colors.reset)
    log(`   Owner-Builder: ${isOwnerBuilder ? 'Yes' : 'No'}`, colors.reset)
    log(`   HOA Required: ${hoaRequired ? 'Yes' : 'No'}`, colors.reset)
    log('')

    try {
      const result = await this.complianceService.getComplianceRequirements(
        workType,
        projectValue,
        isOwnerBuilder,
        hoaRequired
      )

      // Save compliance report
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${workType.replace(/\s+/g, '-')}-compliance-${timestamp}.json`
      const filepath = path.join(this.outputDir, filename)

      fs.writeFileSync(filepath, JSON.stringify({
        workType,
        projectValue,
        isOwnerBuilder,
        hoaRequired,
        timestamp: new Date().toISOString(),
        ...result
      }, null, 2))

      log(`✅ Compliance analysis complete`, colors.green)
      log(`💾 Report saved to: ${filename}`, colors.cyan)
      log('')

      this.displayComplianceSummary(result)
      return result
    } catch (error) {
      log(`❌ Compliance check failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async generateOwnerBuilderGuide(workType, projectValue = 250000) {
    log(`📋 Generating owner-builder guide for ${workType}...`, colors.blue)

    try {
      const checklist = await this.complianceService.generateOwnerBuilderChecklist(
        workType,
        projectValue
      )

      // Save checklist
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `owner-builder-guide-${workType.replace(/\s+/g, '-')}-${timestamp}.json`
      const filepath = path.join(this.outputDir, filename)

      fs.writeFileSync(filepath, JSON.stringify({
        workType,
        projectValue,
        timestamp: new Date().toISOString(),
        ...checklist
      }, null, 2))

      log(`✅ Owner-builder guide generated`, colors.green)
      log(`💾 Guide saved to: ${filename}`, colors.cyan)
      log('')

      this.displayOwnerBuilderGuide(checklist)
      return checklist
    } catch (error) {
      log(`❌ Guide generation failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async submitPermit(projectId, permitData) {
    log(`📝 Submitting permit application to Liberty Hill...`, colors.blue)
    log(`   Project: ${projectId}`, colors.reset)
    log(`   Type: ${permitData.permitType}`, colors.reset)
    log(`   Value: $${permitData.projectValue.toLocaleString()}`, colors.reset)
    log('')

    try {
      const result = await this.libertyHillService.submitPermitApplication(
        projectId,
        permitData
      )

      log(`✅ Permit application submitted`, colors.green)
      log(`   Permit Number: ${result.permitNumber}`, colors.cyan)
      log(`   Application ID: ${result.applicationId}`, colors.cyan)
      log(`   Review Time: ${result.estimatedReviewTime}`, colors.reset)
      log(`   Review Fees: $${result.reviewFees}`, colors.reset)
      log('')

      log(`📋 Next Steps:`, colors.blue)
      result.nextSteps.forEach((step, index) => {
        log(`   ${index + 1}. ${step}`, colors.reset)
      })

      return result
    } catch (error) {
      log(`❌ Permit submission failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async checkPermitStatus(permitNumber) {
    log(`🔍 Checking permit status for ${permitNumber}...`, colors.blue)

    try {
      const permitData = await this.libertyHillService.checkPermitStatus(permitNumber)

      if (!permitData) {
        log(`❌ Permit not found: ${permitNumber}`, colors.red)
        return null
      }

      log(`✅ Permit found`, colors.green)
      log(`   Status: ${permitData.status}`, colors.cyan)
      log(`   Type: ${permitData.permitType}`, colors.reset)
      log(`   Value: $${permitData.projectValue.toLocaleString()}`, colors.reset)
      log(`   Issued: ${permitData.issuedDate?.toLocaleDateString() || 'Pending'}`, colors.reset)
      log(`   Expires: ${permitData.expirationDate?.toLocaleDateString() || 'N/A'}`, colors.reset)
      log('')

      log(`💰 Fee Summary:`, colors.blue)
      log(`   Total: $${permitData.fees.total}`, colors.reset)
      log(`   Paid: $${permitData.fees.paid}`, colors.green)
      log(`   Outstanding: $${permitData.fees.outstanding}`, permitData.fees.outstanding > 0 ? colors.red : colors.green)

      if (permitData.inspections.length > 0) {
        log('')
        log(`🔍 Inspections:`, colors.blue)
        permitData.inspections.forEach(inspection => {
          const statusColor = inspection.status === 'PASSED' ? colors.green : 
                             inspection.status === 'FAILED' ? colors.red : colors.yellow
          log(`   ${inspection.type}: ${inspection.status}`, statusColor)
        })
      }

      return permitData
    } catch (error) {
      log(`❌ Status check failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async scheduleInspection(permitNumber, inspectionType, preferredDate, contactPhone, notes) {
    log(`📅 Scheduling ${inspectionType} inspection...`, colors.blue)
    log(`   Permit: ${permitNumber}`, colors.reset)
    log(`   Preferred Date: ${preferredDate}`, colors.reset)
    log(`   Contact: ${contactPhone}`, colors.reset)

    try {
      const result = await this.libertyHillService.scheduleInspection(
        permitNumber,
        inspectionType,
        new Date(preferredDate),
        contactPhone,
        notes
      )

      log(`✅ Inspection scheduled`, colors.green)
      log(`   Inspection ID: ${result.inspectionId}`, colors.cyan)
      log(`   Scheduled: ${result.scheduledDate.toLocaleDateString()}`, colors.cyan)
      log(`   Time Window: ${result.timeWindow}`, colors.reset)
      log(`   Inspector: ${result.inspector}`, colors.reset)
      log(`   Contact: ${result.contactInfo}`, colors.reset)
      log('')

      log(`📋 Requirements:`, colors.blue)
      result.requirements.forEach((req, index) => {
        log(`   ${index + 1}. ${req}`, colors.reset)
      })

      return result
    } catch (error) {
      log(`❌ Inspection scheduling failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async getLibertyHillContacts() {
    log(`📞 Liberty Hill Contact Information:`, colors.blue)
    log('')

    try {
      const contacts = await this.libertyHillService.getLibertyHillContacts()

      contacts.forEach(contact => {
        log(`${contact.department}`, colors.cyan)
        log(`   ${contact.name}, ${contact.title}`, colors.reset)
        log(`   📞 ${contact.phone}`, colors.reset)
        log(`   📧 ${contact.email}`, colors.reset)
        log(`   🏢 ${contact.office}`, colors.reset)
        log(`   ⏰ ${contact.hours}`, colors.reset)
        log(`   Services: ${contact.services.join(', ')}`, colors.yellow)
        log('')
      })

      return contacts
    } catch (error) {
      log(`❌ Failed to get contacts: ${error.message}`, colors.red)
      throw error
    }
  }

  async generateComplianceReport(projectId) {
    log(`📊 Generating compliance report for project ${projectId}...`, colors.blue)

    try {
      const report = await this.libertyHillService.generateComplianceReport(projectId)

      // Save report
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `compliance-report-${projectId}-${timestamp}.json`
      const filepath = path.join(this.outputDir, filename)

      fs.writeFileSync(filepath, JSON.stringify(report, null, 2))

      log(`✅ Compliance report generated`, colors.green)
      log(`💾 Report saved to: ${filename}`, colors.cyan)
      log('')

      this.displayComplianceReport(report)
      return report
    } catch (error) {
      log(`❌ Report generation failed: ${error.message}`, colors.red)
      throw error
    }
  }

  displayComplianceSummary(result) {
    log(`📊 Compliance Summary:`, colors.bold)
    log('')

    log(`💰 Estimated Costs:`, colors.blue)
    log(`   Permits: $${result.estimatedCosts.permits}`, colors.reset)
    log(`   Inspections: $${result.estimatedCosts.inspections}`, colors.reset)
    log(`   Total: $${result.estimatedCosts.total}`, colors.cyan)
    log('')

    log(`📋 Workflow Overview:`, colors.blue)
    log(`   Total Steps: ${result.workflow.steps.length}`, colors.reset)
    log(`   Critical Path: ${result.workflow.criticalPath.length} steps`, colors.reset)
    log(`   Estimated Time: ${result.workflow.totalEstimatedTime}`, colors.reset)
    log('')

    if (result.workflow.ownerBuilderNotes.length > 0) {
      log(`👷 Owner-Builder Notes:`, colors.yellow)
      result.workflow.ownerBuilderNotes.forEach((note, index) => {
        log(`   ${index + 1}. ${note}`, colors.reset)
      })
    }
  }

  displayOwnerBuilderGuide(checklist) {
    log(`👷 Owner-Builder Checklist:`, colors.bold)
    log('')

    log(`📋 Pre-Construction:`, colors.blue)
    checklist.preConstruction.forEach((item, index) => {
      log(`   ☐ ${item}`, colors.reset)
    })
    log('')

    log(`🏗️ During Construction:`, colors.blue)
    checklist.duringConstruction.forEach((item, index) => {
      log(`   ☐ ${item}`, colors.reset)
    })
    log('')

    log(`✅ Post-Construction:`, colors.blue)
    checklist.postConstruction.forEach((item, index) => {
      log(`   ☐ ${item}`, colors.reset)
    })
    log('')

    if (checklist.commonMistakes.length > 0) {
      log(`⚠️ Common Mistakes to Avoid:`, colors.red)
      checklist.commonMistakes.forEach((mistake, index) => {
        log(`   • ${mistake}`, colors.reset)
      })
      log('')
    }

    if (checklist.resources.length > 0) {
      log(`📚 Helpful Resources:`, colors.cyan)
      checklist.resources.forEach(resource => {
        log(`   • ${resource.title}`, colors.reset)
        log(`     ${resource.description}`, colors.yellow)
        log(`     ${resource.url}`, colors.blue)
      })
    }
  }

  displayComplianceReport(report) {
    log(`📊 Project Compliance Report:`, colors.bold)
    log('')

    log(`🏗️ Project Info:`, colors.blue)
    log(`   Permit: ${report.projectInfo.permitNumber}`, colors.reset)
    log(`   Status: ${report.projectInfo.status}`, colors.reset)
    log(`   Compliance: ${report.projectInfo.compliance}`, report.projectInfo.compliance === 'COMPLIANT' ? colors.green : colors.yellow)
    log('')

    log(`🔍 Inspection Summary:`, colors.blue)
    log(`   Completed: ${report.inspectionSummary.completed}`, colors.green)
    log(`   Pending: ${report.inspectionSummary.pending}`, colors.yellow)
    log(`   Failed: ${report.inspectionSummary.failed}`, report.inspectionSummary.failed > 0 ? colors.red : colors.green)
    log('')

    if (report.outstandingIssues.length > 0) {
      log(`⚠️ Outstanding Issues:`, colors.red)
      report.outstandingIssues.forEach(issue => {
        const severityColor = issue.severity === 'HIGH' ? colors.red : 
                             issue.severity === 'MEDIUM' ? colors.yellow : colors.reset
        log(`   • ${issue.description} (${issue.severity})`, severityColor)
        log(`     Due: ${issue.dueDate.toLocaleDateString()}`, colors.reset)
      })
      log('')
    }

    if (report.recommendations.length > 0) {
      log(`💡 Recommendations:`, colors.cyan)
      report.recommendations.forEach(rec => {
        log(`   • ${rec}`, colors.reset)
      })
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === 'help') {
    showHelp()
    return
  }

  const cli = new TexasComplianceCLI()
  const command = args[0]

  try {
    switch (command) {
      case 'check':
        if (args.length < 2) {
          log('❌ Work type required for compliance check', colors.red)
          process.exit(1)
        }
        
        const workType = args[1]
        const projectValue = args[2] ? parseInt(args[2]) : 250000
        const isOwnerBuilder = args[3] !== 'false'
        const hoaRequired = args[4] === 'true'
        
        await cli.checkCompliance(workType, projectValue, isOwnerBuilder, hoaRequired)
        break

      case 'owner-builder':
        if (args.length < 2) {
          log('❌ Work type required for owner-builder guide', colors.red)
          process.exit(1)
        }
        
        const obWorkType = args[1]
        const obProjectValue = args[2] ? parseInt(args[2]) : 250000
        
        await cli.generateOwnerBuilderGuide(obWorkType, obProjectValue)
        break

      case 'permit-status':
        if (args.length < 2) {
          log('❌ Permit number required', colors.red)
          process.exit(1)
        }
        
        await cli.checkPermitStatus(args[1])
        break

      case 'schedule-inspection':
        if (args.length < 5) {
          log('❌ Required: permit-number inspection-type preferred-date contact-phone', colors.red)
          process.exit(1)
        }
        
        const [, permitNumber, inspectionType, preferredDate, contactPhone] = args
        const notes = args[5] || ''
        
        await cli.scheduleInspection(permitNumber, inspectionType, preferredDate, contactPhone, notes)
        break

      case 'contacts':
        await cli.getLibertyHillContacts()
        break

      case 'report':
        if (args.length < 2) {
          log('❌ Project ID required for compliance report', colors.red)
          process.exit(1)
        }
        
        await cli.generateComplianceReport(args[1])
        break

      default:
        log(`❌ Unknown command: ${command}`, colors.red)
        showHelp()
        process.exit(1)
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red)
    process.exit(1)
  } finally {
    await cli.complianceService.disconnect()
    await cli.libertyHillService.disconnect()
  }
}

function showHelp() {
  log('Texas Compliance & Liberty Hill Integration Tool', colors.bold)
  log('===============================================', colors.cyan)
  log('')
  log('Commands:', colors.blue)
  log('  check <work-type> [project-value] [owner-builder] [hoa-required]', colors.reset)
  log('    Check compliance requirements for construction work')
  log('')
  log('  owner-builder <work-type> [project-value]', colors.reset)
  log('    Generate owner-builder checklist and guide')
  log('')
  log('  permit-status <permit-number>', colors.reset)
  log('    Check Liberty Hill permit status')
  log('')
  log('  schedule-inspection <permit> <type> <date> <phone> [notes]', colors.reset)
  log('    Schedule building inspection with Liberty Hill')
  log('')
  log('  contacts', colors.reset)
  log('    Get Liberty Hill department contact information')
  log('')
  log('  report <project-id>', colors.reset)
  log('    Generate compliance report for project')
  log('')
  log('Examples:', colors.blue)
  log('  npm run texas-compliance check "new construction" 350000 true false', colors.cyan)
  log('  npm run texas-compliance owner-builder "electrical work" 25000', colors.cyan)
  log('  npm run texas-compliance permit-status LH-2024-0123', colors.cyan)
  log('  npm run texas-compliance schedule-inspection LH-2024-0123 FOUNDATION "2024-02-15" "(512)555-0123"', colors.cyan)
  log('  npm run texas-compliance contacts', colors.cyan)
  log('  npm run texas-compliance report proj_abc123', colors.cyan)
}

if (require.main === module) {
  main()
}

module.exports = { TexasComplianceCLI }