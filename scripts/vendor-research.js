#!/usr/bin/env node

/**
 * Vendor Research Script
 * Integrates with Perplexity MCP to discover and populate vendor database
 */

const { createResearchService } = require('../src/lib/research-service.ts')
const { PrismaClient } = require('@prisma/client')
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

class VendorResearchCLI {
  constructor() {
    this.researchService = createResearchService()
    this.prisma = new PrismaClient()
    this.outputDir = path.join(__dirname, '..', 'research-output', 'vendors')
    this.ensureOutputDir()
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  async discoverVendors(trade, location = 'Liberty Hill, TX', projectId = null) {
    log(`🔍 Discovering ${trade} vendors in ${location}...`, colors.blue)
    
    try {
      const result = await this.researchService.discoverVendors(trade, location, projectId)
      
      log(`✅ Found ${result.vendors.length} vendors`, colors.green)
      
      // Save results to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${trade.replace(/\s+/g, '-')}-vendors-${timestamp}.json`
      const filepath = path.join(this.outputDir, filename)
      
      fs.writeFileSync(filepath, JSON.stringify({
        searchMetadata: result.searchMetadata,
        vendors: result.vendors,
        summary: {
          totalFound: result.vendors.length,
          withContact: result.vendors.filter(v => v.phone || v.email).length,
          withRatings: result.vendors.filter(v => v.rating).length,
          withLicense: result.vendors.filter(v => v.licenseNumber).length
        }
      }, null, 2))
      
      log(`💾 Results saved to: ${filename}`, colors.cyan)
      this.displayVendorSummary(result.vendors)
      
      return result
    } catch (error) {
      log(`❌ Vendor discovery failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async populateDatabase(vendors, companyId, trade) {
    log(`📊 Populating database with discovered vendors...`, colors.blue)
    
    try {
      const createdCount = await this.researchService.populateVendorDatabase(
        vendors,
        companyId,
        trade
      )
      
      log(`✅ Created ${createdCount} new vendor records`, colors.green)
      return createdCount
    } catch (error) {
      log(`❌ Database population failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async researchMaterials(materialName, quantity = null, location = 'Austin, TX') {
    log(`🏗️ Researching ${materialName} pricing and availability...`, colors.blue)
    
    try {
      const result = await this.researchService.researchMaterialCosts(
        materialName,
        quantity,
        location
      )
      
      // Save results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${materialName.replace(/\s+/g, '-')}-research-${timestamp}.json`
      const filepath = path.join(this.outputDir, filename)
      
      fs.writeFileSync(filepath, JSON.stringify(result, null, 2))
      
      log(`✅ Found pricing for ${result.materials.length} suppliers`, colors.green)
      log(`💾 Results saved to: ${filename}`, colors.cyan)
      
      this.displayMaterialSummary(result)
      
      return result
    } catch (error) {
      log(`❌ Material research failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async checkCompliance(workType, location = 'Liberty Hill, TX') {
    log(`📋 Checking compliance requirements for ${workType} in ${location}...`, colors.blue)
    
    try {
      const result = await this.researchService.checkCompliance(workType, location)
      
      // Save results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `${workType.replace(/\s+/g, '-')}-compliance-${timestamp}.json`
      const filepath = path.join(this.outputDir, filename)
      
      fs.writeFileSync(filepath, JSON.stringify(result, null, 2))
      
      log(`✅ Found ${result.requirements.length} compliance requirements`, colors.green)
      log(`📄 ${result.permits.length} permits required`, colors.cyan)
      log(`🔍 ${result.inspections.length} inspections needed`, colors.cyan)
      log(`💾 Results saved to: ${filename}`, colors.cyan)
      
      this.displayComplianceSummary(result)
      
      return result
    } catch (error) {
      log(`❌ Compliance check failed: ${error.message}`, colors.red)
      throw error
    }
  }

  displayVendorSummary(vendors) {
    log('\n📊 Vendor Discovery Summary:', colors.bold)
    
    vendors.slice(0, 3).forEach((vendor, index) => {
      log(`\n${index + 1}. ${vendor.name}`, colors.cyan)
      if (vendor.phone) log(`   📞 ${vendor.phone}`, colors.reset)
      if (vendor.email) log(`   📧 ${vendor.email}`, colors.reset)
      if (vendor.rating) log(`   ⭐ ${vendor.rating}/5.0 (${vendor.reviewCount || 0} reviews)`, colors.reset)
      if (vendor.specialties.length > 0) {
        log(`   🔧 ${vendor.specialties.join(', ')}`, colors.reset)
      }
      if (vendor.pricing?.range) log(`   💰 ${vendor.pricing.range}`, colors.reset)
      if (vendor.availability) log(`   ⏰ ${vendor.availability}`, colors.reset)
    })
    
    if (vendors.length > 3) {
      log(`\n... and ${vendors.length - 3} more vendors`, colors.yellow)
    }
  }

  displayMaterialSummary(result) {
    log('\n💰 Material Pricing Summary:', colors.bold)
    
    log(`Average Price: $${result.priceAnalysis.averagePrice.toFixed(2)}`, colors.cyan)
    log(`Price Range: $${result.priceAnalysis.priceRange.low.toFixed(2)} - $${result.priceAnalysis.priceRange.high.toFixed(2)}`, colors.cyan)
    log(`Market Position: ${result.priceAnalysis.marketPosition}`, colors.cyan)
    
    if (result.marketTrends.length > 0) {
      log('\n📈 Market Trends:', colors.blue)
      result.marketTrends.forEach(trend => {
        const arrow = trend.trend === 'rising' ? '📈' : trend.trend === 'falling' ? '📉' : '➡️'
        log(`   ${arrow} ${trend.material}: ${trend.trend} ${trend.percentageChange.toFixed(1)}% (${trend.timeframe})`, colors.reset)
      })
    }
    
    if (result.priceAnalysis.recommendations.length > 0) {
      log('\n💡 Recommendations:', colors.blue)
      result.priceAnalysis.recommendations.forEach(rec => {
        log(`   • ${rec}`, colors.reset)
      })
    }
  }

  displayComplianceSummary(result) {
    log('\n📋 Compliance Summary:', colors.bold)
    
    if (result.permits.length > 0) {
      log('\n📄 Required Permits:', colors.blue)
      result.permits.forEach(permit => {
        log(`   • ${permit.type} - ${permit.authority}`, colors.reset)
        log(`     Cost: $${permit.cost}, Timeline: ${permit.timeline}`, colors.reset)
      })
    }
    
    if (result.inspections.length > 0) {
      log('\n🔍 Required Inspections:', colors.blue)
      result.inspections.forEach(inspection => {
        log(`   • ${inspection.phase}: ${inspection.type}`, colors.reset)
        log(`     Cost: $${inspection.cost}, Timeline: ${inspection.timeline}`, colors.reset)
      })
    }
    
    if (result.timeline.length > 0) {
      log('\n⏰ Compliance Timeline:', colors.blue)
      result.timeline.forEach(milestone => {
        log(`   • ${milestone.milestone} - ${milestone.deadline}`, colors.reset)
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

  const cli = new VendorResearchCLI()
  const command = args[0]

  try {
    switch (command) {
      case 'discover':
        if (args.length < 2) {
          log('❌ Trade type required for vendor discovery', colors.red)
          process.exit(1)
        }
        
        const trade = args[1]
        const location = args[2] || 'Liberty Hill, TX'
        const projectId = args[3] || null
        
        const result = await cli.discoverVendors(trade, location, projectId)
        
        // Ask if user wants to populate database
        if (result.vendors.length > 0) {
          log('\n💫 Options:', colors.blue)
          log('1. To populate database, run:', colors.reset)
          log(`   npm run vendor-research populate "${trade}" <company-id>`, colors.cyan)
        }
        break

      case 'populate':
        if (args.length < 3) {
          log('❌ Trade type and company ID required for database population', colors.red)
          process.exit(1)
        }
        
        const populateTrade = args[1]
        const companyId = args[2]
        
        // Find latest research file for this trade
        const files = fs.readdirSync(cli.outputDir)
          .filter(f => f.startsWith(populateTrade.replace(/\s+/g, '-')) && f.endsWith('.json'))
          .sort()
          .reverse()
        
        if (files.length === 0) {
          log(`❌ No research data found for ${populateTrade}. Run discovery first.`, colors.red)
          process.exit(1)
        }
        
        const latestFile = path.join(cli.outputDir, files[0])
        const researchData = JSON.parse(fs.readFileSync(latestFile, 'utf8'))
        
        await cli.populateDatabase(researchData.vendors, companyId, populateTrade)
        break

      case 'materials':
        if (args.length < 2) {
          log('❌ Material name required', colors.red)
          process.exit(1)
        }
        
        const materialName = args[1]
        const quantity = args[2] ? parseInt(args[2]) : null
        const materialLocation = args[3] || 'Austin, TX'
        
        await cli.researchMaterials(materialName, quantity, materialLocation)
        break

      case 'compliance':
        if (args.length < 2) {
          log('❌ Work type required', colors.red)
          process.exit(1)
        }
        
        const workType = args[1]
        const complianceLocation = args[2] || 'Liberty Hill, TX'
        
        await cli.checkCompliance(workType, complianceLocation)
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
    await cli.researchService.disconnect()
    await cli.prisma.$disconnect()
  }
}

function showHelp() {
  log('Vendor Research Tool', colors.bold)
  log('===================', colors.cyan)
  log('')
  log('Commands:', colors.blue)
  log('  discover <trade> [location] [project-id]', colors.reset)
  log('    Discover vendors for a specific trade')
  log('')
  log('  populate <trade> <company-id>', colors.reset)
  log('    Populate database with discovered vendors')
  log('')
  log('  materials <material-name> [quantity] [location]', colors.reset)
  log('    Research material pricing and availability')
  log('')
  log('  compliance <work-type> [location]', colors.reset)
  log('    Check compliance requirements for construction work')
  log('')
  log('Examples:', colors.blue)
  log('  npm run vendor-research discover electrical "Liberty Hill, TX"', colors.cyan)
  log('  npm run vendor-research populate electrical comp_123', colors.cyan)
  log('  npm run vendor-research materials "2x4 lumber" 1000 "Austin, TX"', colors.cyan)
  log('  npm run vendor-research compliance "electrical work" "Liberty Hill, TX"', colors.cyan)
}

if (require.main === module) {
  main()
}

module.exports = { VendorResearchCLI }