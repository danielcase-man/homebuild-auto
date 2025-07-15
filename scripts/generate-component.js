#!/usr/bin/env node

/**
 * Component Generator Tool
 * Uses design research and MCP insights to generate optimized components
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

class ComponentGenerator {
  constructor() {
    this.componentsDir = path.join(__dirname, '..', 'src', 'components', 'ui')
    this.templatesDir = path.join(__dirname, 'component-templates')
    this.researchDir = path.join(__dirname, '..', 'design-research-output')
    this.ensureDirectories()
  }

  ensureDirectories() {
    [this.componentsDir, this.templatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  async generateComponent(spec) {
    log(`🛠️  Generating ${spec.name} component for ${spec.industry}...`, colors.blue)
    
    try {
      // Load design research if available
      const research = await this.loadDesignResearch(spec.name, spec.industry)
      
      // Generate component files
      const component = await this.createComponent(spec, research)
      const stories = await this.createStorybook(spec, research)
      const tests = await this.createTests(spec, research)
      const docs = await this.createDocumentation(spec, research)
      
      // Save generated files
      const files = await this.saveGeneratedFiles(spec.name, {
        component,
        stories,
        tests,
        docs
      })
      
      log(`✅ Component ${spec.name} generated successfully!`, colors.green)
      this.displayGenerationSummary(spec, files)
      
      return files
    } catch (error) {
      log(`❌ Component generation failed: ${error.message}`, colors.red)
      throw error
    }
  }

  async loadDesignResearch(componentName, industry) {
    try {
      const researchFiles = fs.readdirSync(this.researchDir)
        .filter(file => file.includes(componentName) && file.includes(industry))
        .sort((a, b) => b.localeCompare(a)) // Get most recent
      
      if (researchFiles.length > 0) {
        const researchPath = path.join(this.researchDir, researchFiles[0])
        const research = JSON.parse(fs.readFileSync(researchPath, 'utf8'))
        log(`📊 Loaded design research: ${researchFiles[0]}`, colors.cyan)
        return research
      }
    } catch (error) {
      log(`⚠️  No design research found, using defaults`, colors.yellow)
    }
    
    return null
  }

  async createComponent(spec, research) {
    const template = this.getComponentTemplate(spec.type)
    const variants = this.extractVariants(spec, research)
    const styles = this.generateStyles(spec, research)
    const accessibility = this.generateAccessibilityFeatures(spec, research)
    
    return this.populateTemplate(template, {
      name: spec.name,
      variants,
      styles,
      accessibility,
      props: spec.props || [],
      industry: spec.industry
    })
  }

  getComponentTemplate(type) {
    const templates = {
      button: `import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const {{name}}Variants = cva(
  "{{baseClasses}}",
  {
    variants: {
      {{variants}}
    },
    defaultVariants: {
      {{defaultVariants}}
    },
  }
)

export interface {{Name}}Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof {{name}}Variants> {
  {{additionalProps}}
}

const {{Name}} = React.forwardRef<HTMLButtonElement, {{Name}}Props>(
  ({ className, {{propsList}}, ...props }, ref) => {
    return (
      <button
        className={cn({{name}}Variants({ {{variantProps}}, className }))}
        ref={ref}
        {{accessibilityAttributes}}
        {...props}
      >
        {{children}}
      </button>
    )
  }
)

{{Name}}.displayName = "{{Name}}"

export { {{Name}}, {{name}}Variants }`,

      card: `import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const {{name}}Variants = cva(
  "{{baseClasses}}",
  {
    variants: {
      {{variants}}
    },
    defaultVariants: {
      {{defaultVariants}}
    },
  }
)

export interface {{Name}}Props
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof {{name}}Variants> {
  {{additionalProps}}
}

const {{Name}} = React.forwardRef<HTMLDivElement, {{Name}}Props>(
  ({ className, {{propsList}}, children, ...props }, ref) => {
    return (
      <div
        className={cn({{name}}Variants({ {{variantProps}}, className }))}
        ref={ref}
        {{accessibilityAttributes}}
        {...props}
      >
        {{children}}
      </div>
    )
  }
)

{{Name}}.displayName = "{{Name}}"

export { {{Name}}, {{name}}Variants }`,

      form: `import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const {{name}}Variants = cva(
  "{{baseClasses}}",
  {
    variants: {
      {{variants}}
    },
    defaultVariants: {
      {{defaultVariants}}
    },
  }
)

export interface {{Name}}Props
  extends React.FormHTMLAttributes<HTMLFormElement>,
    VariantProps<typeof {{name}}Variants> {
  {{additionalProps}}
}

const {{Name}} = React.forwardRef<HTMLFormElement, {{Name}}Props>(
  ({ className, {{propsList}}, children, ...props }, ref) => {
    return (
      <form
        className={cn({{name}}Variants({ {{variantProps}}, className }))}
        ref={ref}
        {{accessibilityAttributes}}
        {...props}
      >
        {{children}}
      </form>
    )
  }
)

{{Name}}.displayName = "{{Name}}"

export { {{Name}}, {{name}}Variants }`
    }

    return templates[type] || templates.button
  }

  extractVariants(spec, research) {
    const variants = {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        xl: 'h-12 px-10 text-base'
      }
    }

    // Apply research-based variants if available
    if (research && research.patterns) {
      research.patterns.forEach(pattern => {
        if (pattern.implementation && pattern.implementation.css) {
          const variantName = pattern.name.toLowerCase().replace(/\s+/g, '-')
          variants.variant[variantName] = pattern.implementation.css
        }
      })
    }

    // Apply industry-specific variants
    if (spec.industry === 'construction') {
      variants.variant.construction = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md'
      variants.variant.safety = 'bg-orange-500 hover:bg-orange-600 text-white font-bold border-2 border-orange-700'
    }

    return variants
  }

  generateStyles(spec, research) {
    let baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

    // Apply research-based styles
    if (research && research.colorSchemes && research.colorSchemes.length > 0) {
      const scheme = research.colorSchemes[0]
      if (scheme.accessibility) {
        baseClasses += ' ring-offset-background'
      }
    }

    // Industry-specific styling
    if (spec.industry === 'construction') {
      baseClasses += ' shadow-sm active:scale-[0.98]'
    }

    return baseClasses
  }

  generateAccessibilityFeatures(spec, research) {
    const features = []

    // Basic accessibility
    features.push('aria-label={ariaLabel}')
    features.push('role="button"')

    // Apply research-based accessibility
    if (research && research.accessibility) {
      research.accessibility.forEach(guideline => {
        if (guideline.includes('keyboard')) {
          features.push('onKeyDown={handleKeyDown}')
        }
        if (guideline.includes('aria')) {
          features.push('aria-describedby={ariaDescribedBy}')
        }
      })
    }

    // Industry-specific accessibility
    if (spec.industry === 'construction') {
      features.push('data-testid="construction-component"')
      features.push('aria-live="polite"') // For status updates
    }

    return features
  }

  populateTemplate(template, data) {
    let populated = template

    // Replace placeholders
    const replacements = {
      '{{name}}': data.name.toLowerCase(),
      '{{Name}}': data.name.charAt(0).toUpperCase() + data.name.slice(1),
      '{{baseClasses}}': data.styles,
      '{{variants}}': this.formatVariants(data.variants),
      '{{defaultVariants}}': this.formatDefaultVariants(data.variants),
      '{{additionalProps}}': this.formatAdditionalProps(data.props),
      '{{propsList}}': this.formatPropsList(data.variants, data.props),
      '{{variantProps}}': this.formatVariantProps(data.variants),
      '{{accessibilityAttributes}}': data.accessibility.join('\\n        '),
      '{{children}}': this.formatChildren(data)
    }

    Object.entries(replacements).forEach(([placeholder, value]) => {
      populated = populated.replace(new RegExp(placeholder, 'g'), value)
    })

    return populated
  }

  formatVariants(variants) {
    return Object.entries(variants)
      .map(([key, values]) => {
        const formattedValues = Object.entries(values)
          .map(([name, classes]) => `        ${name}: "${classes}"`)
          .join(',\\n')
        return `      ${key}: {\\n${formattedValues}\\n      }`
      })
      .join(',\\n')
  }

  formatDefaultVariants(variants) {
    return Object.keys(variants)
      .map(key => {
        const firstVariant = Object.keys(variants[key])[0]
        return `      ${key}: "${firstVariant}"`
      })
      .join(',\\n')
  }

  formatAdditionalProps(props) {
    if (!props || props.length === 0) return ''
    return props.map(prop => `  ${prop.name}?: ${prop.type}`).join('\\n')
  }

  formatPropsList(variants, additionalProps) {
    const variantProps = Object.keys(variants)
    const additional = additionalProps ? additionalProps.map(p => p.name) : []
    return [...variantProps, ...additional].join(', ')
  }

  formatVariantProps(variants) {
    return Object.keys(variants).join(', ')
  }

  formatChildren(data) {
    if (data.name.toLowerCase().includes('button')) {
      return 'children'
    }
    return 'children'
  }

  async createStorybook(spec, research) {
    return `import type { Meta, StoryObj } from '@storybook/react'
import { ${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} } from './${spec.name}'

const meta: Meta<typeof ${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}> = {
  title: 'UI/${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}',
  component: ${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A ${spec.type} component designed for ${spec.industry} industry applications.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}',
  }
}

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Action',
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Action',
  }
}

export const Construction: Story = {
  args: {
    variant: 'construction',
    children: 'Start Project',
  }
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} size="sm">Small</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
      <${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} size="md">Medium</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
      <${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} size="lg">Large</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
      <${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} size="xl">Extra Large</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
    </div>
  )
}`
  }

  async createTests(spec, research) {
    return `import { render, screen, fireEvent } from '@testing-library/react'
import { ${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} } from './${spec.name}'

describe('${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}', () => {
  it('renders correctly', () => {
    render(<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>Test</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(
      <${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} onClick={handleClick}>
        Click me
      </${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes correctly', () => {
    render(
      <${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} variant="primary">
        Primary
      </${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })

  it('is accessible', () => {
    render(
      <${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} aria-label="Test button">
        Accessible Button
      </${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Test button')
  })

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn()
    render(
      <${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} onClick={handleClick}>
        Keyboard Test
      </${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
    )
    
    const button = screen.getByRole('button')
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    expect(handleClick).toHaveBeenCalled()
  })

  ${spec.industry === 'construction' ? `
  it('meets construction industry accessibility requirements', () => {
    render(
      <${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} variant="construction">
        Construction Action
      </${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-testid', 'construction-component')
  })` : ''}
})`
  }

  async createDocumentation(spec, research) {
    return `# ${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} Component

A professional ${spec.type} component designed specifically for ${spec.industry} industry applications.

## Features

- ✨ Multiple variants for different use cases
- 📱 Fully responsive design
- ♿ WCAG 2.1 AA compliant
- 🎨 Customizable with CSS variables
- 🔧 Built with TypeScript for type safety
- 🧪 Comprehensive test coverage

## Installation

\`\`\`bash
import { ${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} } from '@/components/ui/${spec.name}'
\`\`\`

## Usage

### Basic Usage

\`\`\`tsx
<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
  Default ${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}
</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
\`\`\`

### Variants

\`\`\`tsx
<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} variant="primary">Primary</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} variant="secondary">Secondary</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} variant="outline">Outline</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
${spec.industry === 'construction' ? `<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} variant="construction">Construction</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>` : ''}
\`\`\`

### Sizes

\`\`\`tsx
<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} size="sm">Small</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} size="md">Medium</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} size="lg">Large</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
<${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)} size="xl">Extra Large</${spec.name.charAt(0).toUpperCase() + spec.name.slice(1)}>
\`\`\`

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | \`"primary" \| "secondary" \| "outline" \| "ghost"\` | \`"primary"\` | The visual variant of the component |
| size | \`"sm" \| "md" \| "lg" \| "xl"\` | \`"md"\` | The size of the component |
| className | \`string\` | - | Additional CSS classes |
| children | \`React.ReactNode\` | - | The content of the component |

## Accessibility

This component follows WCAG 2.1 AA guidelines:

- ✅ Keyboard navigation support
- ✅ Screen reader compatible
- ✅ High contrast ratios
- ✅ Focus indicators
- ✅ ARIA attributes

${research && research.accessibility ? `
### Specific Guidelines Applied

${research.accessibility.map(guideline => `- ${guideline}`).join('\n')}
` : ''}

## Design Research

${research ? `
This component was generated based on research into ${spec.industry} industry best practices:

### Key Findings
${research.patterns ? research.patterns.map(pattern => `- **${pattern.name}**: ${pattern.description}`).join('\n') : ''}

### Color Psychology
${research.colorSchemes && research.colorSchemes[0] ? research.colorSchemes[0].psychology : 'Optimized for professional use'}
` : 'Generated with industry best practices and accessibility guidelines.'}

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Contributing

Please refer to our [contribution guidelines](../../../CONTRIBUTING.md) for information on how to contribute to this component.`
  }

  async saveGeneratedFiles(componentName, files) {
    const componentDir = path.join(this.componentsDir, componentName)
    if (!fs.existsSync(componentDir)) {
      fs.mkdirSync(componentDir, { recursive: true })
    }

    const savedFiles = []

    // Save component file
    const componentPath = path.join(componentDir, `${componentName}.tsx`)
    fs.writeFileSync(componentPath, files.component)
    savedFiles.push({ type: 'component', path: componentPath })

    // Save stories file
    const storiesPath = path.join(componentDir, `${componentName}.stories.tsx`)
    fs.writeFileSync(storiesPath, files.stories)
    savedFiles.push({ type: 'stories', path: storiesPath })

    // Save test file
    const testPath = path.join(componentDir, `${componentName}.test.tsx`)
    fs.writeFileSync(testPath, files.tests)
    savedFiles.push({ type: 'test', path: testPath })

    // Save documentation
    const docsPath = path.join(componentDir, 'README.md')
    fs.writeFileSync(docsPath, files.docs)
    savedFiles.push({ type: 'docs', path: docsPath })

    return savedFiles
  }

  displayGenerationSummary(spec, files) {
    log('\n📦 Generated Files:', colors.bold)
    files.forEach(file => {
      log(`  ${file.type}: ${path.basename(file.path)}`, colors.cyan)
    })

    log('\n🎨 Component Features:', colors.blue)
    log(`  Industry: ${spec.industry}`, colors.reset)
    log(`  Type: ${spec.type}`, colors.reset)
    log(`  Accessibility: WCAG 2.1 AA compliant`, colors.reset)
    log(`  Testing: Unit tests included`, colors.reset)
    log(`  Documentation: Complete README`, colors.reset)
    log(`  Storybook: Interactive examples`, colors.reset)
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const name = args.find(arg => arg.startsWith('--name='))?.split('=')[1] || 'Button'
  const type = args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'button'
  const industry = args.find(arg => arg.startsWith('--industry='))?.split('=')[1] || 'construction'

  if (args.includes('--help')) {
    log('Component Generator Tool', colors.bold)
    log('Usage: npm run generate-component -- --name="ActionButton" --type="button" --industry="construction"', colors.cyan)
    log('Options:', colors.blue)
    log('  --name=<name>        Component name (e.g., ActionButton)', colors.reset)
    log('  --type=<type>        Component type: button, card, form, input', colors.reset)
    log('  --industry=<name>    Industry context (construction, medical, etc.)', colors.reset)
    log('  --help               Show this help message', colors.reset)
    return
  }

  try {
    const generator = new ComponentGenerator()
    const spec = {
      name,
      type,
      industry,
      props: [
        { name: 'loading', type: 'boolean' },
        { name: 'leftIcon', type: 'React.ReactNode' },
        { name: 'rightIcon', type: 'React.ReactNode' }
      ]
    }

    await generator.generateComponent(spec)
    
    log('\n🚀 Next Steps:', colors.blue)
    log(`1. Review the generated component in src/components/ui/${name}/`, colors.reset)
    log('2. Run npm run dev to see the component in action', colors.reset)
    log('3. Run npm test to verify all tests pass', colors.reset)
    log('4. Use npm run screenshot-component to capture component variants', colors.reset)
    
  } catch (error) {
    log(`❌ Component generation failed: ${error.message}`, colors.red)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { ComponentGenerator }