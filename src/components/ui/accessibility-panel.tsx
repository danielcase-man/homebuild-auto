import * as React from "react"
import { cn, a11y } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Zap, 
  Contrast,
  Type,
  MousePointer,
  Keyboard,
  Smartphone,
  Settings,
  Play,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react"
import { accessibilityTester, type AccessibilityAuditResult } from "@/lib/accessibility-testing"

export interface AccessibilityPanelProps {
  /**
   * Panel visibility
   */
  isOpen?: boolean
  /**
   * Panel position
   */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  /**
   * Show quick accessibility toggles
   */
  showQuickToggles?: boolean
  /**
   * Show testing tools
   */
  showTestingTools?: boolean
  /**
   * Mobile optimized
   */
  mobile?: boolean
  /**
   * Panel close handler
   */
  onClose?: () => void
}

export interface AccessibilitySettings {
  highContrast: boolean
  largeText: boolean
  reduceMotion: boolean
  screenReaderMode: boolean
  focusIndicators: boolean
  voiceAnnouncements: boolean
  keyboardNavigation: boolean
  touchOptimized: boolean
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen = false,
  position = "bottom-right",
  showQuickToggles = true,
  showTestingTools = true,
  mobile = false,
  onClose
}) => {
  const [settings, setSettings] = React.useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reduceMotion: false,
    screenReaderMode: false,
    focusIndicators: true,
    voiceAnnouncements: true,
    keyboardNavigation: true,
    touchOptimized: false
  })
  
  const [auditResult, setAuditResult] = React.useState<AccessibilityAuditResult | null>(null)
  const [isAuditing, setIsAuditing] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"settings" | "testing" | "results">("settings")

  const panelId = a11y.generateId('accessibility-panel')

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4"
  }

  // Apply accessibility settings to document
  React.useEffect(() => {
    const html = document.documentElement
    
    // High contrast mode
    if (settings.highContrast) {
      html.classList.add('accessibility-high-contrast')
    } else {
      html.classList.remove('accessibility-high-contrast')
    }
    
    // Large text mode
    if (settings.largeText) {
      html.classList.add('accessibility-large-text')
    } else {
      html.classList.remove('accessibility-large-text')
    }
    
    // Reduce motion
    if (settings.reduceMotion) {
      html.classList.add('accessibility-reduce-motion')
    } else {
      html.classList.remove('accessibility-reduce-motion')
    }
    
    // Touch optimized
    if (settings.touchOptimized) {
      html.classList.add('accessibility-touch-optimized')
    } else {
      html.classList.remove('accessibility-touch-optimized')
    }
    
    // Focus indicators
    if (!settings.focusIndicators) {
      html.classList.add('accessibility-no-focus')
    } else {
      html.classList.remove('accessibility-no-focus')
    }

  }, [settings])

  // Settings toggle handler
  const toggleSetting = React.useCallback((key: keyof AccessibilitySettings) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] }
      
      // Announce change
      if (settings.voiceAnnouncements) {
        const action = newSettings[key] ? "enabled" : "disabled"
        const settingName = key.replace(/([A-Z])/g, ' $1').toLowerCase()
        a11y.announce(`${settingName} ${action}`, 'polite')
      }
      
      return newSettings
    })
  }, [settings.voiceAnnouncements])

  // Run accessibility audit
  const runAccessibilityAudit = React.useCallback(async () => {
    setIsAuditing(true)
    setActiveTab("results")
    
    try {
      const result = await accessibilityTester.runFullAudit()
      setAuditResult(result)
      
      if (settings.voiceAnnouncements) {
        a11y.announce(
          `Accessibility audit complete. Score: ${Math.round(result.overallScore)}%. ${result.failedTests} issues found.`,
          'polite'
        )
      }
    } catch (error) {
      console.error('Accessibility audit failed:', error)
    } finally {
      setIsAuditing(false)
    }
  }, [settings.voiceAnnouncements])

  if (!isOpen) return null

  return (
    <div
      className={cn(
        "fixed z-50 w-96 max-h-[80vh] overflow-hidden",
        positionClasses[position],
        mobile && "w-full max-w-sm"
      )}
    >
      <Card 
        className="shadow-2xl border-2"
        role="dialog"
        aria-labelledby={`${panelId}-title`}
        aria-modal="true"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle 
              id={`${panelId}-title`}
              className="flex items-center gap-2 text-lg"
            >
              <Eye className="h-5 w-5 text-construction-blue" />
              Accessibility
            </CardTitle>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              ariaLabel="Close accessibility panel"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === "settings" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab("settings")}
              aria-pressed={activeTab === "settings"}
            >
              Settings
            </button>
            
            {showTestingTools && (
              <button
                className={cn(
                  "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === "testing"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setActiveTab("testing")}
                aria-pressed={activeTab === "testing"}
              >
                Testing
              </button>
            )}
            
            <button
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === "results"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab("results")}
              aria-pressed={activeTab === "results"}
            >
              Results
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Visual</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Contrast className="h-4 w-4" />
                      <span className="text-sm">High Contrast</span>
                    </div>
                    <Button
                      variant={settings.highContrast ? "construction" : "outline"}
                      size="sm"
                      onClick={() => toggleSetting('highContrast')}
                      ariaLabel={`${settings.highContrast ? 'Disable' : 'Enable'} high contrast mode`}
                    >
                      {settings.highContrast ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <span className="text-sm">Large Text</span>
                    </div>
                    <Button
                      variant={settings.largeText ? "construction" : "outline"}
                      size="sm"
                      onClick={() => toggleSetting('largeText')}
                      ariaLabel={`${settings.largeText ? 'Disable' : 'Enable'} large text mode`}
                    >
                      {settings.largeText ? <Type className="h-3 w-3" /> : <Type className="h-3 w-3 opacity-50" />}
                    </Button>
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">Reduce Motion</span>
                    </div>
                    <Button
                      variant={settings.reduceMotion ? "construction" : "outline"}
                      size="sm"
                      onClick={() => toggleSetting('reduceMotion')}
                      ariaLabel={`${settings.reduceMotion ? 'Disable' : 'Enable'} reduced motion`}
                    >
                      {settings.reduceMotion ? <Zap className="h-3 w-3" /> : <Zap className="h-3 w-3 opacity-50" />}
                    </Button>
                  </label>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Interaction</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Keyboard className="h-4 w-4" />
                      <span className="text-sm">Keyboard Navigation</span>
                    </div>
                    <Button
                      variant={settings.keyboardNavigation ? "construction" : "outline"}
                      size="sm"
                      onClick={() => toggleSetting('keyboardNavigation')}
                      ariaLabel={`${settings.keyboardNavigation ? 'Disable' : 'Enable'} keyboard navigation`}
                    >
                      {settings.keyboardNavigation ? <Keyboard className="h-3 w-3" /> : <Keyboard className="h-3 w-3 opacity-50" />}
                    </Button>
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm">Touch Optimized</span>
                    </div>
                    <Button
                      variant={settings.touchOptimized ? "construction" : "outline"}
                      size="sm"
                      onClick={() => toggleSetting('touchOptimized')}
                      ariaLabel={`${settings.touchOptimized ? 'Disable' : 'Enable'} touch optimization`}
                    >
                      {settings.touchOptimized ? <Smartphone className="h-3 w-3" /> : <Smartphone className="h-3 w-3 opacity-50" />}
                    </Button>
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      <span className="text-sm">Voice Announcements</span>
                    </div>
                    <Button
                      variant={settings.voiceAnnouncements ? "construction" : "outline"}
                      size="sm"
                      onClick={() => toggleSetting('voiceAnnouncements')}
                      ariaLabel={`${settings.voiceAnnouncements ? 'Disable' : 'Enable'} voice announcements`}
                    >
                      {settings.voiceAnnouncements ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Testing Tab */}
          {activeTab === "testing" && showTestingTools && (
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Accessibility Testing</h3>
                
                <Button
                  onClick={runAccessibilityAudit}
                  disabled={isAuditing}
                  className="w-full"
                  variant="construction"
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running Audit...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Accessibility Audit
                    </>
                  )}
                </Button>
                
                <div className="text-xs text-muted-foreground">
                  Tests WCAG 2.1 AA compliance including color contrast, keyboard navigation, 
                  form labels, and screen reader support.
                </div>
              </div>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && (
            <div className="space-y-4">
              {auditResult ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">Audit Results</h3>
                      <Badge 
                        variant={auditResult.overallScore >= 80 ? "default" : 
                                auditResult.overallScore >= 60 ? "secondary" : "destructive"}
                      >
                        {Math.round(auditResult.overallScore)}%
                      </Badge>
                    </div>
                    
                    <Progress
                      value={auditResult.overallScore}
                      label="Overall Accessibility Score"
                      showValue
                      constructionType="inspection"
                    />
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{auditResult.passedTests} Passed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>{auditResult.failedTests} Failed</span>
                      </div>
                    </div>
                  </div>
                  
                  {auditResult.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Issues Found</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {auditResult.issues.slice(0, 5).map((issue, index) => (
                          <div 
                            key={index}
                            className={cn(
                              "p-2 rounded text-xs border-l-2",
                              issue.severity === "error" && "border-red-500 bg-red-50",
                              issue.severity === "warning" && "border-yellow-500 bg-yellow-50",
                              issue.severity === "info" && "border-blue-500 bg-blue-50"
                            )}
                          >
                            <div className="font-medium">{issue.message}</div>
                            <div className="text-muted-foreground mt-1">{issue.solution}</div>
                          </div>
                        ))}
                        {auditResult.issues.length > 5 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{auditResult.issues.length - 5} more issues
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {auditResult.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Recommendations</h4>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        {auditResult.recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-construction-blue">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Run an accessibility audit to see results</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { AccessibilityPanel }