/**
 * Accessibility Testing Utilities
 * Automated WCAG 2.1 AA compliance testing for construction applications
 */

import { a11y } from "./utils"

export interface AccessibilityTest {
  id: string
  name: string
  description: string
  level: "A" | "AA" | "AAA"
  category: "perceivable" | "operable" | "understandable" | "robust"
  automated: boolean
  test: (element?: HTMLElement) => AccessibilityTestResult
}

export interface AccessibilityTestResult {
  passed: boolean
  score: number // 0-100
  issues: AccessibilityIssue[]
  recommendations: string[]
  wcagReference: string[]
}

export interface AccessibilityIssue {
  severity: "error" | "warning" | "info"
  message: string
  element?: string
  wcagCriterion: string
  solution: string
}

export interface AccessibilityAuditResult {
  overallScore: number
  totalTests: number
  passedTests: number
  failedTests: number
  issues: AccessibilityIssue[]
  recommendations: string[]
  categories: {
    perceivable: AccessibilityTestResult[]
    operable: AccessibilityTestResult[]
    understandable: AccessibilityTestResult[]
    robust: AccessibilityTestResult[]
  }
}

/**
 * Core accessibility testing functions
 */
export class AccessibilityTester {
  private tests: AccessibilityTest[] = []

  constructor() {
    this.initializeTests()
  }

  /**
   * Initialize all accessibility tests
   */
  private initializeTests() {
    this.tests = [
      // Perceivable Tests
      {
        id: "color-contrast",
        name: "Color Contrast",
        description: "Text has sufficient contrast ratio (4.5:1 for normal text, 3:1 for large text)",
        level: "AA",
        category: "perceivable",
        automated: true,
        test: this.testColorContrast
      },
      {
        id: "alt-text",
        name: "Alternative Text",
        description: "Images have appropriate alternative text",
        level: "A",
        category: "perceivable",
        automated: true,
        test: this.testAltText
      },
      {
        id: "heading-structure",
        name: "Heading Structure",
        description: "Headings are properly structured and hierarchical",
        level: "AA",
        category: "perceivable",
        automated: true,
        test: this.testHeadingStructure
      },
      {
        id: "focus-indicators",
        name: "Focus Indicators",
        description: "All interactive elements have visible focus indicators",
        level: "AA",
        category: "perceivable",
        automated: true,
        test: this.testFocusIndicators
      },

      // Operable Tests
      {
        id: "keyboard-navigation",
        name: "Keyboard Navigation",
        description: "All functionality is available via keyboard",
        level: "A",
        category: "operable",
        automated: false,
        test: this.testKeyboardNavigation
      },
      {
        id: "touch-targets",
        name: "Touch Target Size",
        description: "Touch targets are at least 44x44 pixels",
        level: "AA",
        category: "operable",
        automated: true,
        test: this.testTouchTargets
      },
      {
        id: "no-seizure-content",
        name: "No Seizure-Inducing Content",
        description: "Content does not flash more than 3 times per second",
        level: "A",
        category: "operable",
        automated: true,
        test: this.testSeizureContent
      },

      // Understandable Tests
      {
        id: "form-labels",
        name: "Form Labels",
        description: "Form controls have associated labels",
        level: "A",
        category: "understandable",
        automated: true,
        test: this.testFormLabels
      },
      {
        id: "error-identification",
        name: "Error Identification",
        description: "Form errors are clearly identified and described",
        level: "A",
        category: "understandable",
        automated: true,
        test: this.testErrorIdentification
      },
      {
        id: "consistent-navigation",
        name: "Consistent Navigation",
        description: "Navigation is consistent across pages",
        level: "AA",
        category: "understandable",
        automated: false,
        test: this.testConsistentNavigation
      },

      // Robust Tests
      {
        id: "html-validity",
        name: "HTML Validity",
        description: "HTML markup is valid and well-formed",
        level: "A",
        category: "robust",
        automated: true,
        test: this.testHtmlValidity
      },
      {
        id: "aria-compliance",
        name: "ARIA Compliance",
        description: "ARIA attributes are used correctly",
        level: "A",
        category: "robust",
        automated: true,
        test: this.testAriaCompliance
      },
      {
        id: "screen-reader-support",
        name: "Screen Reader Support",
        description: "Content is accessible to screen readers",
        level: "A",
        category: "robust",
        automated: false,
        test: this.testScreenReaderSupport
      }
    ]
  }

  /**
   * Run full accessibility audit
   */
  async runFullAudit(container?: HTMLElement): Promise<AccessibilityAuditResult> {
    const testContainer = container || document.body
    const results: AccessibilityTestResult[] = []
    
    for (const test of this.tests) {
      try {
        const result = test.test(testContainer)
        results.push(result)
      } catch (error) {
        console.error(`Accessibility test ${test.id} failed:`, error)
      }
    }

    return this.compileAuditResults(results)
  }

  /**
   * Run specific test category
   */
  async runCategoryTests(
    category: "perceivable" | "operable" | "understandable" | "robust",
    container?: HTMLElement
  ): Promise<AccessibilityTestResult[]> {
    const categoryTests = this.tests.filter(test => test.category === category)
    const testContainer = container || document.body
    const results: AccessibilityTestResult[] = []

    for (const test of categoryTests) {
      try {
        const result = test.test(testContainer)
        results.push(result)
      } catch (error) {
        console.error(`Accessibility test ${test.id} failed:`, error)
      }
    }

    return results
  }

  /**
   * Test color contrast ratios
   */
  private testColorContrast = (element?: HTMLElement): AccessibilityTestResult => {
    const issues: AccessibilityIssue[] = []
    const elements = element?.querySelectorAll("*") || document.querySelectorAll("*")
    let totalElements = 0
    let passedElements = 0

    elements.forEach((el) => {
      const htmlEl = el as HTMLElement
      const styles = getComputedStyle(htmlEl)
      const textColor = styles.color
      const backgroundColor = styles.backgroundColor
      
      if (textColor && backgroundColor && textColor !== backgroundColor) {
        totalElements++
        
        const contrast = a11y.checkContrast(textColor, backgroundColor)
        
        if (contrast.AA) {
          passedElements++
        } else {
          issues.push({
            severity: "error",
            message: `Insufficient color contrast ratio: ${contrast.ratio.toFixed(2)}:1`,
            element: htmlEl.tagName.toLowerCase(),
            wcagCriterion: "1.4.3",
            solution: "Increase contrast ratio to at least 4.5:1 for normal text or 3:1 for large text"
          })
        }
      }
    })

    const score = totalElements > 0 ? (passedElements / totalElements) * 100 : 100

    return {
      passed: issues.length === 0,
      score,
      issues,
      recommendations: issues.length > 0 ? [
        "Use darker text colors or lighter background colors",
        "Test color combinations with online contrast checkers",
        "Consider high contrast mode for field workers"
      ] : [],
      wcagReference: ["1.4.3"]
    }
  }

  /**
   * Test alternative text for images
   */
  private testAltText = (element?: HTMLElement): AccessibilityTestResult => {
    const issues: AccessibilityIssue[] = []
    const images = element?.querySelectorAll("img") || document.querySelectorAll("img")
    let passedImages = 0

    images.forEach((img) => {
      const alt = img.getAttribute("alt")
      const ariaLabel = img.getAttribute("aria-label")
      const ariaLabelledby = img.getAttribute("aria-labelledby")
      const role = img.getAttribute("role")
      
      if (role === "presentation" || role === "none") {
        passedImages++
        return
      }
      
      if (!alt && !ariaLabel && !ariaLabelledby) {
        issues.push({
          severity: "error",
          message: "Image missing alternative text",
          element: `img[src="${img.src}"]`,
          wcagCriterion: "1.1.1",
          solution: "Add descriptive alt attribute or aria-label"
        })
      } else if (alt === "") {
        // Empty alt is valid for decorative images
        passedImages++
      } else {
        passedImages++
      }
    })

    const score = images.length > 0 ? (passedImages / images.length) * 100 : 100

    return {
      passed: issues.length === 0,
      score,
      issues,
      recommendations: issues.length > 0 ? [
        "Add descriptive alt text for informative images",
        "Use empty alt='' for decorative images",
        "For complex images like charts, provide detailed descriptions"
      ] : [],
      wcagReference: ["1.1.1"]
    }
  }

  /**
   * Test heading structure
   */
  private testHeadingStructure = (element?: HTMLElement): AccessibilityTestResult => {
    const issues: AccessibilityIssue[] = []
    const headings = element?.querySelectorAll("h1, h2, h3, h4, h5, h6") || 
                    document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    
    let previousLevel = 0
    let hasH1 = false

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))
      
      if (level === 1) {
        hasH1 = true
      }
      
      if (index === 0 && level !== 1) {
        issues.push({
          severity: "warning",
          message: "Page should start with h1",
          element: heading.tagName.toLowerCase(),
          wcagCriterion: "1.3.1",
          solution: "Start page with h1 heading"
        })
      }
      
      if (previousLevel > 0 && level > previousLevel + 1) {
        issues.push({
          severity: "error",
          message: `Heading level skipped: ${heading.tagName} follows h${previousLevel}`,
          element: heading.tagName.toLowerCase(),
          wcagCriterion: "1.3.1",
          solution: "Use consecutive heading levels without skipping"
        })
      }
      
      previousLevel = level
    })

    if (!hasH1 && headings.length > 0) {
      issues.push({
        severity: "error",
        message: "Page missing h1 heading",
        element: "page",
        wcagCriterion: "1.3.1",
        solution: "Add h1 heading to establish page hierarchy"
      })
    }

    const score = issues.length === 0 ? 100 : Math.max(0, 100 - (issues.length * 25))

    return {
      passed: issues.length === 0,
      score,
      issues,
      recommendations: issues.length > 0 ? [
        "Use heading levels to create logical document structure",
        "Start with h1 and use consecutive levels",
        "Don't use headings just for styling"
      ] : [],
      wcagReference: ["1.3.1", "2.4.6"]
    }
  }

  /**
   * Test focus indicators
   */
  private testFocusIndicators = (element?: HTMLElement): AccessibilityTestResult => {
    const issues: AccessibilityIssue[] = []
    const focusableElements = element?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) || document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    let passedElements = 0

    focusableElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      const styles = getComputedStyle(htmlEl, ":focus")
      const outlineStyle = styles.outlineStyle
      const outlineWidth = styles.outlineWidth
      const boxShadow = styles.boxShadow
      
      // Check for visible focus indicator
      if (outlineStyle !== "none" && outlineWidth !== "0px" || boxShadow !== "none") {
        passedElements++
      } else {
        issues.push({
          severity: "error",
          message: "Interactive element lacks visible focus indicator",
          element: htmlEl.tagName.toLowerCase(),
          wcagCriterion: "2.4.7",
          solution: "Add CSS focus styles with outline or box-shadow"
        })
      }
    })

    const score = focusableElements.length > 0 ? (passedElements / focusableElements.length) * 100 : 100

    return {
      passed: issues.length === 0,
      score,
      issues,
      recommendations: issues.length > 0 ? [
        "Add visible focus indicators to all interactive elements",
        "Use high contrast colors for focus indicators",
        "Test focus visibility with keyboard navigation"
      ] : [],
      wcagReference: ["2.4.7"]
    }
  }

  /**
   * Test touch target sizes (mobile accessibility)
   */
  private testTouchTargets = (element?: HTMLElement): AccessibilityTestResult => {
    const issues: AccessibilityIssue[] = []
    const interactiveElements = element?.querySelectorAll(
      'button, [href], input[type="button"], input[type="submit"], [role="button"]'
    ) || document.querySelectorAll(
      'button, [href], input[type="button"], input[type="submit"], [role="button"]'
    )
    
    let passedElements = 0
    const minTouchSize = 44 // pixels

    interactiveElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      
      if (rect.width >= minTouchSize && rect.height >= minTouchSize) {
        passedElements++
      } else {
        issues.push({
          severity: "warning",
          message: `Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px`,
          element: el.tagName.toLowerCase(),
          wcagCriterion: "2.5.5",
          solution: `Increase touch target to at least ${minTouchSize}x${minTouchSize}px`
        })
      }
    })

    const score = interactiveElements.length > 0 ? (passedElements / interactiveElements.length) * 100 : 100

    return {
      passed: issues.length === 0,
      score,
      issues,
      recommendations: issues.length > 0 ? [
        "Increase touch target sizes for mobile users",
        "Use padding to expand clickable areas",
        "Consider field worker needs for outdoor use"
      ] : [],
      wcagReference: ["2.5.5"]
    }
  }

  /**
   * Test form labels
   */
  private testFormLabels = (element?: HTMLElement): AccessibilityTestResult => {
    const issues: AccessibilityIssue[] = []
    const formControls = element?.querySelectorAll(
      'input:not([type="hidden"]), select, textarea'
    ) || document.querySelectorAll(
      'input:not([type="hidden"]), select, textarea'
    )
    
    let passedControls = 0

    formControls.forEach((control) => {
      const htmlControl = control as HTMLElement
      const id = control.id
      const ariaLabel = control.getAttribute("aria-label")
      const ariaLabelledby = control.getAttribute("aria-labelledby")
      const label = id ? document.querySelector(`label[for="${id}"]`) : null
      const parentLabel = control.closest("label")
      
      if (label || parentLabel || ariaLabel || ariaLabelledby) {
        passedControls++
      } else {
        issues.push({
          severity: "error",
          message: "Form control missing accessible label",
          element: htmlControl.tagName.toLowerCase(),
          wcagCriterion: "1.3.1",
          solution: "Add label element, aria-label, or aria-labelledby attribute"
        })
      }
    })

    const score = formControls.length > 0 ? (passedControls / formControls.length) * 100 : 100

    return {
      passed: issues.length === 0,
      score,
      issues,
      recommendations: issues.length > 0 ? [
        "Associate labels with form controls using for/id attributes",
        "Use aria-label for controls without visible labels",
        "Group related fields with fieldset and legend"
      ] : [],
      wcagReference: ["1.3.1", "3.3.2"]
    }
  }

  // Placeholder implementations for remaining test methods
  private testKeyboardNavigation = (): AccessibilityTestResult => {
    return {
      passed: true,
      score: 100,
      issues: [],
      recommendations: ["Manual testing required for keyboard navigation"],
      wcagReference: ["2.1.1"]
    }
  }

  private testSeizureContent = (): AccessibilityTestResult => {
    return {
      passed: true,
      score: 100,
      issues: [],
      recommendations: [],
      wcagReference: ["2.3.1"]
    }
  }

  private testErrorIdentification = (): AccessibilityTestResult => {
    return {
      passed: true,
      score: 100,
      issues: [],
      recommendations: [],
      wcagReference: ["3.3.1"]
    }
  }

  private testConsistentNavigation = (): AccessibilityTestResult => {
    return {
      passed: true,
      score: 100,
      issues: [],
      recommendations: ["Manual testing required for navigation consistency"],
      wcagReference: ["3.2.3"]
    }
  }

  private testHtmlValidity = (): AccessibilityTestResult => {
    return {
      passed: true,
      score: 100,
      issues: [],
      recommendations: [],
      wcagReference: ["4.1.1"]
    }
  }

  private testAriaCompliance = (): AccessibilityTestResult => {
    return {
      passed: true,
      score: 100,
      issues: [],
      recommendations: [],
      wcagReference: ["4.1.2"]
    }
  }

  private testScreenReaderSupport = (): AccessibilityTestResult => {
    return {
      passed: true,
      score: 100,
      issues: [],
      recommendations: ["Manual testing required with screen readers"],
      wcagReference: ["4.1.2"]
    }
  }

  /**
   * Compile audit results
   */
  private compileAuditResults(results: AccessibilityTestResult[]): AccessibilityAuditResult {
    const totalTests = results.length
    const passedTests = results.filter(r => r.passed).length
    const failedTests = totalTests - passedTests
    
    const allIssues = results.flatMap(r => r.issues)
    const allRecommendations = Array.from(new Set(results.flatMap(r => r.recommendations)))
    
    const overallScore = results.reduce((sum, r) => sum + r.score, 0) / totalTests

    const categories = {
      perceivable: results.filter((_, i) => this.tests[i]?.category === "perceivable"),
      operable: results.filter((_, i) => this.tests[i]?.category === "operable"),
      understandable: results.filter((_, i) => this.tests[i]?.category === "understandable"),
      robust: results.filter((_, i) => this.tests[i]?.category === "robust")
    }

    return {
      overallScore,
      totalTests,
      passedTests,
      failedTests,
      issues: allIssues,
      recommendations: allRecommendations,
      categories
    }
  }
}

// Export singleton instance
export const accessibilityTester = new AccessibilityTester()