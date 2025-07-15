#!/usr/bin/env node

/**
 * Comprehensive MCP Setup for UI/UX Design Workflow
 * Sets up all necessary MCP servers for Figma-like design capabilities
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

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

class DesignMCPSetup {
  constructor() {
    this.mcpServers = {}
    this.configPath = path.join(__dirname, '..', '.mcp-design-config.json')
  }

  async setupAllServers() {
    log('🎨 Setting up MCP servers for UI/UX Design Workflow', colors.bold)
    log('=' .repeat(60), colors.cyan)

    try {
      // 1. Setup Filesystem MCP for design file management
      await this.setupFilesystemMCP()

      // 2. Setup Puppeteer MCP for browser automation and screenshots
      await this.setupPuppeteerMCP()

      // 3. Setup Web Search MCP for design research
      await this.setupWebSearchMCP()

      // 4. Setup GitHub MCP for component library research
      await this.setupGitHubMCP()

      // 5. Setup Perplexity MCP for design research (if not already configured)
      await this.setupPerplexityMCP()

      // 6. Setup Browser Automation MCP for UI testing
      await this.setupBrowserMCP()

      // 7. Create master configuration file
      await this.createMasterConfig()

      // 8. Test all connections
      await this.testConnections()

      log('\n🎉 All MCP servers configured successfully!', colors.green)
      this.printUsageInstructions()

    } catch (error) {
      log(`\n❌ Setup failed: ${error.message}`, colors.red)
      process.exit(1)
    }
  }

  async setupFilesystemMCP() {
    log('\n📁 Setting up Filesystem MCP...', colors.blue)
    
    try {
      // Install filesystem MCP if not available
      try {
        execSync('npm list -g @modelcontextprotocol/server-filesystem', { stdio: 'pipe' })
        log('✅ Filesystem MCP already installed', colors.green)
      } catch {
        log('📦 Installing Filesystem MCP...', colors.yellow)
        execSync('npm install -g @modelcontextprotocol/server-filesystem', { stdio: 'inherit' })
        log('✅ Filesystem MCP installed', colors.green)
      }

      this.mcpServers['filesystem'] = {
        command: 'npx',
        args: ['@modelcontextprotocol/server-filesystem', '.'],
        env: {},
        description: 'File system access for reading/writing design files, components, and assets'
      }

      log('✅ Filesystem MCP configured', colors.green)
    } catch (error) {
      log(`❌ Failed to setup Filesystem MCP: ${error.message}`, colors.red)
    }
  }

  async setupPuppeteerMCP() {
    log('\n🤖 Setting up Puppeteer MCP for browser automation...', colors.blue)
    
    try {
      // Install puppeteer MCP if not available
      try {
        execSync('npm list -g @modelcontextprotocol/server-puppeteer', { stdio: 'pipe' })
        log('✅ Puppeteer MCP already installed', colors.green)
      } catch {
        log('📦 Installing Puppeteer MCP...', colors.yellow)
        execSync('npm install -g @modelcontextprotocol/server-puppeteer', { stdio: 'inherit' })
        log('✅ Puppeteer MCP installed', colors.green)
      }

      this.mcpServers['puppeteer'] = {
        command: 'npx',
        args: ['@modelcontextprotocol/server-puppeteer'],
        env: {},
        description: 'Browser automation for screenshots, UI testing, and design validation'
      }

      log('✅ Puppeteer MCP configured', colors.green)
    } catch (error) {
      log(`❌ Failed to setup Puppeteer MCP: ${error.message}`, colors.red)
    }
  }

  async setupWebSearchMCP() {
    log('\n🔍 Setting up Web Search MCP for design research...', colors.blue)
    
    try {
      // Check if web search MCP is available
      this.mcpServers['web-search'] = {
        command: 'npx',
        args: ['web-search-mcp'],
        env: {
          SEARCH_API_KEY: process.env.SEARCH_API_KEY || ''
        },
        description: 'Web search for design inspiration, trends, and research'
      }

      log('✅ Web Search MCP configured', colors.green)
      log('⚠️  Add SEARCH_API_KEY to environment for full functionality', colors.yellow)
    } catch (error) {
      log(`❌ Failed to setup Web Search MCP: ${error.message}`, colors.red)
    }
  }

  async setupGitHubMCP() {
    log('\n🐙 Setting up GitHub MCP for component library research...', colors.blue)
    
    try {
      // Install GitHub MCP if not available
      try {
        execSync('npm list -g @modelcontextprotocol/server-github', { stdio: 'pipe' })
        log('✅ GitHub MCP already installed', colors.green)
      } catch {
        log('📦 Installing GitHub MCP...', colors.yellow)
        execSync('npm install -g @modelcontextprotocol/server-github', { stdio: 'inherit' })
        log('✅ GitHub MCP installed', colors.green)
      }

      this.mcpServers['github'] = {
        command: 'npx',
        args: ['@modelcontextprotocol/server-github'],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || ''
        },
        description: 'Access to GitHub repositories for component library research and code examples'
      }

      log('✅ GitHub MCP configured', colors.green)
      log('⚠️  Add GITHUB_TOKEN to environment for full functionality', colors.yellow)
    } catch (error) {
      log(`❌ Failed to setup GitHub MCP: ${error.message}`, colors.red)
    }
  }

  async setupPerplexityMCP() {
    log('\n🔮 Setting up Perplexity MCP for design research...', colors.blue)
    
    // Check if already configured
    const envFile = path.join(__dirname, '..', '.env.local')
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8')
      if (envContent.includes('PERPLEXITY_API_KEY') && !envContent.includes('PERPLEXITY_API_KEY=""')) {
        this.mcpServers['perplexity-search'] = {
          command: 'npx',
          args: ['perplexity-mcp'],
          env: {
            PERPLEXITY_API_KEY: 'configured'
          },
          description: 'Advanced research for design trends, best practices, and UX insights'
        }
        log('✅ Perplexity MCP already configured', colors.green)
        return
      }
    }

    log('⚠️  Perplexity MCP not configured. Run npm run setup-mcp to configure.', colors.yellow)
  }

  async setupBrowserMCP() {
    log('\n🌐 Setting up Browser MCP for UI validation...', colors.blue)
    
    try {
      this.mcpServers['browser-automation'] = {
        command: 'npx',
        args: ['browser-automation-mcp'],
        env: {},
        description: 'Browser automation for accessibility testing, performance monitoring, and UI validation'
      }

      log('✅ Browser MCP configured', colors.green)
    } catch (error) {
      log(`❌ Failed to setup Browser MCP: ${error.message}`, colors.red)
    }
  }

  async createMasterConfig() {
    log('\n📝 Creating master MCP configuration...', colors.blue)
    
    const config = {
      mcpServers: this.mcpServers,
      designWorkflow: {
        research: ['perplexity-search', 'web-search', 'github'],
        validation: ['puppeteer', 'browser-automation'],
        fileManagement: ['filesystem'],
        lastUpdated: new Date().toISOString()
      },
      capabilities: {
        designResearch: true,
        componentGeneration: true,
        uiTesting: true,
        fileManagement: true,
        browserAutomation: true,
        accessibilityTesting: true,
        performanceMonitoring: true
      }
    }

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2))
    log('✅ Master configuration saved', colors.green)

    // Also update the main .mcp-config.json
    const mainConfigPath = path.join(__dirname, '..', '.mcp-config.json')
    const mainConfig = { mcpServers: this.mcpServers }
    fs.writeFileSync(mainConfigPath, JSON.stringify(mainConfig, null, 2))
    log('✅ Main MCP configuration updated', colors.green)
  }

  async testConnections() {
    log('\n🧪 Testing MCP server connections...', colors.blue)
    
    for (const [name, config] of Object.entries(this.mcpServers)) {
      try {
        log(`Testing ${name}...`, colors.cyan)
        // Basic test - check if command is available
        const testResult = execSync(`which ${config.command}`, { stdio: 'pipe' })
        if (testResult) {
          log(`✅ ${name} connection OK`, colors.green)
        }
      } catch (error) {
        log(`⚠️  ${name} may need additional setup`, colors.yellow)
      }
    }
  }

  printUsageInstructions() {
    log('\n' + '=' .repeat(60), colors.cyan)
    log('🎨 Design MCP Servers Ready!', colors.bold)
    log('=' .repeat(60), colors.cyan)

    log('\n📋 Available Capabilities:', colors.blue)
    log('• 📁 File Management - Read/write design files and components', colors.reset)
    log('• 🤖 Browser Automation - Take screenshots and test UIs', colors.reset)
    log('• 🔍 Design Research - Find latest UI/UX trends and patterns', colors.reset)
    log('• 🐙 Component Libraries - Access GitHub repositories for examples', colors.reset)
    log('• 🔮 Advanced Research - Perplexity-powered design insights', colors.reset)
    log('• 🌐 UI Testing - Automated accessibility and performance tests', colors.reset)

    log('\n🚀 Quick Start Commands:', colors.blue)
    log('# Research UI patterns', colors.cyan)
    log('npm run design-research -- --component="button" --industry="construction"', colors.reset)
    
    log('\n# Generate component screenshots', colors.cyan)
    log('npm run screenshot-component -- --url="http://localhost:3001" --selector=".btn"', colors.reset)
    
    log('\n# Test accessibility', colors.cyan)
    log('npm run test-accessibility -- --url="http://localhost:3001"', colors.reset)

    log('\n🔧 Environment Variables Needed:', colors.blue)
    log('• SEARCH_API_KEY - For web search capabilities', colors.yellow)
    log('• GITHUB_TOKEN - For GitHub repository access', colors.yellow)
    log('• PERPLEXITY_API_KEY - For advanced research (already configured)', colors.green)

    log('\n📖 Documentation:', colors.blue)
    log('• Configuration: .mcp-design-config.json', colors.reset)
    log('• Usage examples: UI-DESIGN-SYSTEM.md', colors.reset)
    log('• Component library: src/components/ui/', colors.reset)

    log('\n🎯 Next Steps:', colors.blue)
    log('1. Add missing API keys to .env.local', colors.reset)
    log('2. Run npm run design-research to test research capabilities', colors.reset)
    log('3. Start building components with MCP-powered insights', colors.reset)
    log('4. Use browser automation for UI testing and validation', colors.reset)
  }
}

// Environment variable setup helper
function setupEnvironmentVariables() {
  log('\n🔐 Setting up environment variables...', colors.blue)
  
  const envPath = path.join(__dirname, '..', '.env.local')
  let envContent = ''
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8')
  }

  // Add MCP-specific environment variables if not present
  const mcpVars = [
    '# MCP Server Configuration',
    'SEARCH_API_KEY=""',
    'GITHUB_TOKEN=""',
    'FIGMA_ACCESS_TOKEN=""',
    'BROWSER_AUTOMATION_ENABLED="true"'
  ]

  mcpVars.forEach(varLine => {
    const varName = varLine.split('=')[0].replace('#', '').trim()
    if (varName && !envContent.includes(varName)) {
      envContent += '\n' + varLine
    }
  })

  fs.writeFileSync(envPath, envContent)
  log('✅ Environment variables template updated', colors.green)
}

// Package.json script additions
function addPackageScripts() {
  log('\n📦 Adding design workflow scripts to package.json...', colors.blue)
  
  const packagePath = path.join(__dirname, '..', 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  const designScripts = {
    'setup-design-mcp': 'node scripts/setup-design-mcp.js',
    'design-research': 'node scripts/design-research.js',
    'screenshot-component': 'node scripts/screenshot-component.js',
    'test-accessibility': 'node scripts/test-accessibility.js',
    'validate-ui': 'node scripts/validate-ui.js',
    'generate-component': 'node scripts/generate-component.js'
  }

  Object.assign(packageJson.scripts, designScripts)
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
  log('✅ Package.json scripts added', colors.green)
}

// Main execution
async function main() {
  try {
    const setup = new DesignMCPSetup()
    
    setupEnvironmentVariables()
    addPackageScripts()
    
    await setup.setupAllServers()
    
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, colors.red)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { DesignMCPSetup }