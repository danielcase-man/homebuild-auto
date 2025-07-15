# Global UI Design System - Best Practices & MCP Integration

## 🎨 **Universal Design System for All Projects**

This document establishes global UI design standards and MCP server integrations that can be applied across all your applications - medical, construction, and any future projects.

---

## 🏗️ **Core Design Philosophy**

### **Design Principles**
1. **Accessibility First** - WCAG 2.1 AA compliance by default
2. **Performance Optimized** - Sub-3 second load times
3. **Mobile Responsive** - Progressive enhancement approach
4. **Semantic HTML** - Screen reader and SEO friendly
5. **Consistent Patterns** - Reusable components across projects
6. **Data-Driven** - Analytics and user feedback integration

### **Technology Stack Standards**
- **Framework**: Next.js 15+ with App Router
- **Styling**: Tailwind CSS 3.4+ with custom design tokens
- **Components**: Radix UI primitives + custom business logic
- **Icons**: Lucide React (consistent, tree-shakeable)
- **Animations**: Framer Motion for complex, CSS for simple
- **State**: Zustand for client state, React Query for server state
- **Forms**: React Hook Form + Zod validation

---

## 🔮 **MCP Server Integration for UI Design**

### **Primary MCP Servers for UI Development**

1. **Claude Code MCP** (Already configured)
   - Code generation and optimization
   - Component architecture guidance
   - Performance auditing

2. **Web Search MCP** (For design research)
   - Latest UI/UX trends and patterns
   - Accessibility guidelines updates
   - Performance best practices

3. **GitHub MCP** (For component libraries)
   - Access to latest component patterns
   - Design system inspirations
   - Open source UI libraries research

### **MCP Configuration for Design Workflow**

```json
{
  "mcpServers": {
    "perplexity-search": {
      "command": "npx",
      "args": ["perplexity-mcp"],
      "env": {
        "PERPLEXITY_API_KEY": "your-key"
      }
    },
    "web-search": {
      "command": "npx",
      "args": ["web-search-mcp"],
      "env": {
        "SEARCH_API_KEY": "your-key"
      }
    },
    "github-mcp": {
      "command": "npx",
      "args": ["github-mcp"],
      "env": {
        "GITHUB_TOKEN": "your-token"
      }
    }
  }
}
```

---

## 🎯 **Design Token System**

### **Global Design Tokens** (Copy to every project)

```typescript
// src/design-system/tokens.ts
export const designTokens = {
  // Color Palette - Semantic naming
  colors: {
    // Base colors
    white: '#ffffff',
    black: '#000000',
    
    // Gray scale (neutral)
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
    
    // Primary brand colors (customize per project)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main brand color
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    
    // Semantic colors
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#f0f9ff',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
    },
  },
  
  // Typography scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
      display: ['Cal Sans', 'Inter', 'sans-serif'], // For headings
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  // Spacing scale (based on 4px grid)
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows
  boxShadow: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    DEFAULT: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  
  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Breakpoints
  screens: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Animation timing
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
}
```

---

## 🧩 **Universal Component Library**

### **Base Component Architecture**

```typescript
// src/components/ui/base/Button.tsx
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-11 px-8",
        xl: "h-12 px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
```

### **Universal Form Components**

```typescript
// src/components/ui/base/Input.tsx
import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3",
        lg: "h-12 px-4 text-base",
      },
      variant: {
        default: "",
        error: "border-error focus-visible:ring-error",
        success: "border-success focus-visible:ring-success",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'error' | 'success'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  helper?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, variant, leftIcon, rightIcon, error, helper, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ size, variant: error ? 'error' : variant }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helper) && (
          <p className={cn(
            "text-xs",
            error ? "text-error" : "text-muted-foreground"
          )}>
            {error || helper}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }
```

---

## 📱 **Responsive Design Standards**

### **Mobile-First Breakpoint Strategy**

```css
/* Mobile First Approach */
.component {
  /* Mobile styles (default) */
  padding: 1rem;
  
  /* Tablet and up */
  @media (min-width: 768px) {
    padding: 1.5rem;
  }
  
  /* Desktop and up */
  @media (min-width: 1024px) {
    padding: 2rem;
  }
  
  /* Large desktop */
  @media (min-width: 1536px) {
    padding: 3rem;
  }
}
```

### **Container Patterns**

```typescript
// src/components/ui/layout/Container.tsx
interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  className?: string
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl', 
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full'
}

export function Container({ size = 'xl', children, className }: ContainerProps) {
  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      containerSizes[size],
      className
    )}>
      {children}
    </div>
  )
}
```

---

## 🎭 **Animation System**

### **Performance-Optimized Animations**

```typescript
// src/components/ui/animations/MotionPrimitives.tsx
import { motion } from 'framer-motion'

// Reusable animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
}

export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
  transition: { duration: 0.3, ease: "easeOut" }
}

export const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.2, ease: "easeOut" }
}

// Reusable motion components
export const MotionDiv = motion.div
export const MotionButton = motion.button
export const MotionCard = motion.div

// Page transition wrapper
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 🔧 **MCP-Powered Development Workflow**

### **Design Research Integration**

```typescript
// src/lib/design-research.ts
import { mcpClient } from './mcp-client'

export class DesignResearchService {
  // Research latest UI patterns
  async researchUIPatterns(component: string, industry?: string) {
    const query = `latest ${component} UI design patterns ${industry || ''} 2024 accessibility responsive`
    return await mcpClient.research({
      query,
      domain: 'design',
      timeframe: 'recent'
    })
  }
  
  // Get color palette inspiration
  async getColorPalettes(brand: string, industry: string) {
    const query = `${brand} ${industry} color palette design system modern 2024`
    return await mcpClient.research({
      query,
      domain: 'design',
      timeframe: 'recent'
    })
  }
  
  // Research accessibility guidelines
  async getAccessibilityGuidelines(component: string) {
    const query = `${component} accessibility WCAG 2.1 AA guidelines best practices screen reader`
    return await mcpClient.research({
      query,
      domain: 'accessibility',
      timeframe: 'recent'
    })
  }
  
  // Performance optimization research
  async getPerformanceOptimizations(framework: string) {
    const query = `${framework} performance optimization techniques 2024 core web vitals`
    return await mcpClient.research({
      query,
      domain: 'performance',
      timeframe: 'recent'
    })
  }
}
```

### **Component Generation with MCP**

```typescript
// src/lib/component-generator.ts
export class ComponentGenerator {
  async generateComponent(spec: {
    name: string
    type: 'form' | 'data-display' | 'navigation' | 'feedback'
    features: string[]
    industry: string
  }) {
    // Research best practices for this component type
    const research = await designResearch.researchUIPatterns(
      `${spec.type} ${spec.name}`, 
      spec.industry
    )
    
    // Generate component based on research and our design system
    const componentCode = await this.generateFromTemplate(spec, research)
    
    return {
      component: componentCode,
      documentation: this.generateDocumentation(spec),
      tests: this.generateTests(spec),
      stories: this.generateStorybook(spec)
    }
  }
}
```

---

## 📊 **Performance & Analytics Standards**

### **Core Web Vitals Targets**

```typescript
// Performance targets for all projects
export const performanceTargets = {
  // Core Web Vitals
  LCP: 2.5, // Largest Contentful Paint (seconds)
  FID: 100, // First Input Delay (milliseconds)
  CLS: 0.1, // Cumulative Layout Shift
  
  // Additional metrics
  FCP: 1.8, // First Contentful Paint (seconds)
  TTI: 3.8, // Time to Interactive (seconds)
  TBT: 200, // Total Blocking Time (milliseconds)
  
  // Bundle size targets
  initialJS: 200, // KB
  totalJS: 1000,  // KB
  css: 50,        // KB
  
  // Accessibility targets
  lighthouse: 95, // Lighthouse accessibility score
  colorContrast: 4.5, // WCAG AA contrast ratio
}
```

### **Analytics Integration**

```typescript
// src/lib/analytics.ts
export class UIAnalytics {
  // Track component performance
  trackComponentRender(componentName: string, renderTime: number) {
    // Implementation
  }
  
  // Track user interactions
  trackInteraction(element: string, action: string, context: any) {
    // Implementation
  }
  
  // A/B test UI variants
  trackVariant(testName: string, variant: string, outcome: string) {
    // Implementation
  }
}
```

---

## 🧪 **Testing Standards**

### **Component Testing Template**

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../ui/base/Button'

describe('Button Component', () => {
  // Accessibility tests
  it('should be accessible', async () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toHaveAttribute('aria-disabled')
  })
  
  // Responsive behavior
  it('should handle different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9')
    
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-11')
  })
  
  // Performance test
  it('should render quickly', () => {
    const start = performance.now()
    render(<Button>Performance test</Button>)
    const end = performance.now()
    expect(end - start).toBeLessThan(16) // 60fps = 16ms per frame
  })
})
```

---

## 📚 **Documentation Standards**

### **Component Documentation Template**

```typescript
/**
 * Button Component
 * 
 * A flexible button component following our design system standards.
 * Supports multiple variants, sizes, and states with full accessibility.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" loading={isLoading}>
 *   Submit Form
 * </Button>
 * ```
 * 
 * @accessibility
 * - Supports keyboard navigation
 * - Screen reader compatible
 * - Focus management
 * - ARIA attributes
 * 
 * @performance
 * - Optimized for Core Web Vitals
 * - Minimal bundle impact
 * - Efficient re-renders
 */
```

---

## 🚀 **Implementation Checklist**

### **For Every New Project:**

1. **Setup Design System**
   - [ ] Copy design tokens
   - [ ] Install base dependencies
   - [ ] Configure Tailwind with tokens
   - [ ] Set up component library structure

2. **Configure MCP Servers**
   - [ ] Install design research MCP servers
   - [ ] Configure API keys securely
   - [ ] Test research integration
   - [ ] Set up automated design updates

3. **Implement Core Components**
   - [ ] Button, Input, Card base components
   - [ ] Layout components (Container, Grid, Stack)
   - [ ] Form components with validation
   - [ ] Navigation components

4. **Setup Performance Monitoring**
   - [ ] Configure Core Web Vitals tracking
   - [ ] Set up bundle size monitoring
   - [ ] Implement accessibility testing
   - [ ] Add performance budgets

5. **Testing & Quality**
   - [ ] Unit tests for all components
   - [ ] Visual regression tests
   - [ ] Accessibility audits
   - [ ] Performance benchmarks

---

## 🔄 **Maintenance & Updates**

### **Quarterly Design System Updates**

1. **Research Latest Trends** (via MCP)
   - UI/UX pattern evolution
   - Accessibility guideline updates
   - Performance optimization techniques
   - Browser support changes

2. **Component Library Audit**
   - Usage analytics review
   - Performance impact assessment
   - Accessibility compliance check
   - User feedback integration

3. **Token Updates**
   - Color palette refinements
   - Typography scale adjustments
   - Spacing system optimization
   - Animation timing updates

---

This design system provides a robust foundation that can be applied to any project type - medical applications, construction management, e-commerce, etc. The MCP integration ensures you're always building with the latest best practices and can quickly adapt to new design trends and technologies.

**Copy this file to every new project and customize the industry-specific elements while maintaining the core standards.**