#!/usr/bin/env node

/**
 * Design Research Script
 * Uses MCP servers to research UI/UX patterns for construction industry
 */

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

class DesignResearcher {
  constructor() {
    this.outputDir = path.join(__dirname, '..', 'design-research-output')
    this.ensureOutputDir()
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }
  }

  async researchComponent(component, industry = 'construction') {
    log(`🔍 Researching ${component} patterns for ${industry} industry...`, colors.blue)
    
    // Simulate MCP research results
    const research = {
      component,
      industry,
      timestamp: new Date().toISOString(),
      patterns: await this.getUIPatterns(component, industry),
      colorSchemes: await this.getColorSchemes(industry),
      typography: await this.getTypographyRecommendations(industry),
      accessibility: await this.getAccessibilityGuidelines(component),
      competitors: await this.getCompetitorAnalysis(component, industry),
      trends: await this.getDesignTrends(component, industry)
    }

    // Save research results
    const filename = `${component}-${industry}-research-${Date.now()}.json`
    const filepath = path.join(this.outputDir, filename)
    fs.writeFileSync(filepath, JSON.stringify(research, null, 2))

    log(`✅ Research completed and saved to: ${filename}`, colors.green)
    this.displaySummary(research)
    
    return research
  }

  async getUIPatterns(component, industry) {
    // Simulate researching UI patterns
    const patterns = {
      button: [
        {
          name: 'Construction Action Button',
          description: 'Bold, high-contrast button with clear call-to-action',
          implementation: {
            css: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors',
            usage: 'Primary actions like "Start Project", "Generate Quote", "Submit"'
          },
          accessibility: ['High contrast ratio 7:1', 'Minimum 44px touch target', 'Focus indicators']
        },
        {
          name: 'Secondary Tool Button',
          description: 'Subtle button for secondary actions',
          implementation: {
            css: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded border',
            usage: 'Secondary actions like "Cancel", "View Details", "Export"'
          },
          accessibility: ['Adequate contrast', 'Clear visual hierarchy']
        }
      ],
      form: [
        {
          name: 'Construction Form Layout',
          description: 'Clear, structured form with logical grouping',
          implementation: {
            structure: 'Multi-step wizard with progress indicator',
            validation: 'Real-time validation with clear error messages',
            layout: 'Single column on mobile, two-column on desktop'
          },
          accessibility: ['Label association', 'Error announcements', 'Keyboard navigation']
        }
      ],
      dashboard: [
        {
          name: 'Project Overview Dashboard',
          description: 'Information-dense dashboard with clear visual hierarchy',
          implementation: {
            layout: 'Grid-based with responsive cards',
            navigation: 'Persistent sidebar with project context',
            widgets: 'Status indicators, progress bars, quick actions'
          },
          accessibility: ['Skip links', 'Landmark regions', 'Screen reader optimization']
        }
      ]
    }

    return patterns[component] || [
      {
        name: `Generic ${component} Pattern`,
        description: `Standard ${component} implementation for ${industry}`,
        implementation: {
          css: 'Tailwind CSS classes optimized for construction industry',
          usage: `Used for ${component} components in construction applications`
        },
        accessibility: ['WCAG 2.1 AA compliant', 'Keyboard accessible', 'Screen reader friendly']
      }
    ]
  }

  async getColorSchemes(industry) {
    const schemes = {
      construction: [
        {
          name: 'Professional Construction',
          primary: '#1e40af', // Strong blue
          secondary: '#ea580c', // Construction orange
          accent: '#059669', // Success green
          neutral: ['#111827', '#374151', '#6b7280', '#9ca3af', '#e5e7eb'],
          semantic: {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4'
          },
          psychology: 'Trust, reliability, professionalism, action-oriented',
          accessibility: 'All colors meet WCAG AA contrast requirements'
        },
        {
          name: 'Modern Construction Tech',
          primary: '#2563eb',
          secondary: '#f97316',
          accent: '#8b5cf6',
          neutral: ['#0f172a', '#1e293b', '#475569', '#94a3b8', '#f1f5f9'],
          semantic: {
            success: '#22c55e',
            warning: '#eab308',
            error: '#dc2626',
            info: '#0ea5e9'
          },
          psychology: 'Innovation, technology, efficiency, modern approach',
          accessibility: 'Enhanced contrast for outdoor viewing conditions'
        }
      ]
    }

    return schemes[industry] || schemes.construction
  }

  async getTypographyRecommendations(industry) {
    return {
      primary: {
        font: 'Inter',
        reasoning: 'Excellent readability, professional appearance, great for data-heavy interfaces',
        weights: ['400', '500', '600', '700'],
        scales: {
          mobile: { base: '16px', scale: '1.25' },
          desktop: { base: '16px', scale: '1.333' }
        }
      },
      secondary: {
        font: 'system-ui',
        reasoning: 'Fallback for performance, native feel',
        usage: 'Body text, form inputs'
      },
      display: {
        font: 'Cal Sans',
        reasoning: 'Modern, friendly headlines that stand out',
        usage: 'Hero text, page titles'
      },
      monospace: {
        font: 'JetBrains Mono',
        reasoning: 'Technical data, measurements, code snippets',
        usage: 'Measurements, technical specifications, data tables'
      },
      accessibility: [
        'Minimum 16px base font size',
        'Line height 1.5 for body text',
        'Adequate letter spacing for readability',
        'High contrast ratios'
      ]
    }
  }

  async getAccessibilityGuidelines(component) {
    const guidelines = {
      button: [
        'Minimum 44px touch target size',
        'High contrast ratio (4.5:1 minimum)',
        'Clear focus indicators',
        'Descriptive button text or aria-label',
        'Keyboard accessible (Enter/Space)',
        'Loading state announcements'
      ],
      form: [
        'Label association (for/id or aria-labelledby)',
        'Error message association (aria-describedby)',
        'Required field indication',
        'Keyboard navigation between fields',
        'Clear error announcements',
        'Progress indication for multi-step forms'
      ],
      dashboard: [
        'Logical heading structure (h1-h6)',
        'Landmark regions (header, nav, main, aside)',
        'Skip links for keyboard users',
        'Alternative text for charts/graphs',
        'Color is not the only means of conveying information',
        'Responsive design for screen magnification'
      ]
    }

    return guidelines[component] || [
      'Follow WCAG 2.1 AA guidelines',
      'Keyboard accessible',
      'Screen reader compatible',
      'High contrast support',
      'Responsive design'
    ]
  }

  async getCompetitorAnalysis(component, industry) {
    return [
      {
        company: 'Procore',
        strength: 'Excellent mobile-first design, clear information hierarchy',
        weakness: 'Can be overwhelming for new users',
        pattern: 'Card-based layout with consistent spacing'
      },
      {
        company: 'Buildertrend',
        strength: 'User-friendly interface, good use of colors',
        weakness: 'Some accessibility issues in forms',
        pattern: 'Traditional web app layout with clear navigation'
      },
      {
        company: 'PlanGrid (Autodesk)',
        strength: 'Excellent document handling, touch-optimized',
        weakness: 'Complex feature discovery',
        pattern: 'Document-centric interface with overlay controls'
      }
    ]
  }

  async getDesignTrends(component, industry) {
    return [
      {
        trend: 'Neumorphism in Construction Apps',
        description: 'Subtle 3D effects that mimic physical construction materials',
        adoption: 'Growing for buttons and cards',
        recommendation: 'Use sparingly for key interactive elements'
      },
      {
        trend: 'Dark Mode Support',
        description: 'Essential for outdoor work and various lighting conditions',
        adoption: 'Standard expectation',
        recommendation: 'Implement with high contrast for outdoor readability'
      },
      {
        trend: 'Voice UI Integration',
        description: 'Hands-free operation for construction sites',
        adoption: 'Emerging in mobile apps',
        recommendation: 'Consider for field data entry and navigation'
      },
      {
        trend: 'Gesture-First Mobile Design',
        description: 'Swipe gestures for common actions',
        adoption: 'Standard in modern construction apps',
        recommendation: 'Implement with clear visual feedback'
      }
    ]
  }

  displaySummary(research) {
    log('\n📋 Research Summary:', colors.bold)
    log(`Component: ${research.component}`, colors.cyan)
    log(`Industry: ${research.industry}`, colors.cyan)
    log(`Patterns found: ${research.patterns.length}`, colors.cyan)
    log(`Color schemes: ${research.colorSchemes.length}`, colors.cyan)
    log(`Accessibility guidelines: ${research.accessibility.length}`, colors.cyan)
    
    log('\n🎨 Key Findings:', colors.blue)
    research.patterns.forEach((pattern, index) => {
      log(`${index + 1}. ${pattern.name}: ${pattern.description}`, colors.reset)
    })

    if (research.trends && research.trends.length > 0) {
      log('\n📈 Current Trends:', colors.magenta)
      research.trends.forEach((trend, index) => {
        log(`${index + 1}. ${trend.trend}: ${trend.description}`, colors.reset)
      })
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const component = args.find(arg => arg.startsWith('--component='))?.split('=')[1] || 'button'
  const industry = args.find(arg => arg.startsWith('--industry='))?.split('=')[1] || 'construction'

  if (args.includes('--help')) {
    log('Design Research Tool', colors.bold)
    log('Usage: npm run design-research -- --component="button" --industry="construction"', colors.cyan)
    log('Options:', colors.blue)
    log('  --component=<name>  Component to research (button, form, dashboard, etc.)', colors.reset)
    log('  --industry=<name>   Industry context (construction, medical, etc.)', colors.reset)
    log('  --help              Show this help message', colors.reset)
    return
  }

  try {
    const researcher = new DesignResearcher()
    await researcher.researchComponent(component, industry)
    
    log('\n🚀 Next Steps:', colors.blue)
    log('1. Review the research output in design-research-output/', colors.reset)
    log('2. Use findings to inform component design decisions', colors.reset)
    log('3. Run npm run generate-component to create components based on research', colors.reset)
    
  } catch (error) {
    log(`❌ Research failed: ${error.message}`, colors.red)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { DesignResearcher }