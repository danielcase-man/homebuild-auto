#!/usr/bin/env node

/**
 * Memory Bank CLI Tool
 * Command-line interface for Memory Bank data operations
 */

const { MemoryBankCLI } = require('../src/lib/memory-bank-adapter.ts')
const path = require('path')

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function showHelp() {
  log('Memory Bank CLI Tool', colors.bold)
  log('===================', colors.cyan)
  log('')
  log('Commands:', colors.blue)
  log('  import <memory-bank-file> <company-id> <manager-id>', colors.reset)
  log('    Import Memory Bank JSON data into the database')
  log('')
  log('  export <project-id> <output-file>', colors.reset)
  log('    Export project data to Memory Bank JSON format')
  log('')
  log('  sync <project-id>', colors.reset)
  log('    Synchronize Memory Bank data with current database state')
  log('')
  log('Examples:', colors.blue)
  log('  npm run memory-bank import ./memory-bank-data.json comp_123 user_456', colors.cyan)
  log('  npm run memory-bank export proj_789 ./exported-project.json', colors.cyan)
  log('  npm run memory-bank sync proj_789', colors.cyan)
  log('')
  log('Notes:', colors.yellow)
  log('• Ensure DATABASE_URL environment variable is set')
  log('• Memory Bank files should be valid JSON format')
  log('• Company ID and Manager ID must exist in the database')
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    showHelp()
    return
  }

  const command = args[0]
  const cli = new MemoryBankCLI()

  try {
    switch (command) {
      case 'import':
        if (args.length !== 4) {
          log('❌ Import requires: <memory-bank-file> <company-id> <manager-id>', colors.red)
          process.exit(1)
        }
        
        const [, memoryBankFile, companyId, managerId] = args
        const memoryBankPath = path.resolve(memoryBankFile)
        
        log(`📁 Importing Memory Bank data...`, colors.blue)
        log(`   File: ${memoryBankPath}`, colors.reset)
        log(`   Company: ${companyId}`, colors.reset)
        log(`   Manager: ${managerId}`, colors.reset)
        log('')
        
        await cli.importProject(memoryBankPath, companyId, managerId)
        break

      case 'export':
        if (args.length !== 3) {
          log('❌ Export requires: <project-id> <output-file>', colors.red)
          process.exit(1)
        }
        
        const [, projectId, outputFile] = args
        const outputPath = path.resolve(outputFile)
        
        log(`📤 Exporting project to Memory Bank format...`, colors.blue)
        log(`   Project: ${projectId}`, colors.reset)
        log(`   Output: ${outputPath}`, colors.reset)
        log('')
        
        await cli.exportProject(projectId, outputPath)
        break

      case 'sync':
        if (args.length !== 2) {
          log('❌ Sync requires: <project-id>', colors.red)
          process.exit(1)
        }
        
        const [, syncProjectId] = args
        
        log(`🔄 Syncing Memory Bank data...`, colors.blue)
        log(`   Project: ${syncProjectId}`, colors.reset)
        log('')
        
        await cli.syncProject(syncProjectId)
        break

      default:
        log(`❌ Unknown command: ${command}`, colors.red)
        log('Run "npm run memory-bank help" for usage information', colors.yellow)
        process.exit(1)
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, colors.red)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n👋 Memory Bank CLI shutting down...', colors.yellow)
  process.exit(0)
})

process.on('SIGTERM', () => {
  log('\n👋 Memory Bank CLI shutting down...', colors.yellow)
  process.exit(0)
})

if (require.main === module) {
  main()
}

module.exports = { main }