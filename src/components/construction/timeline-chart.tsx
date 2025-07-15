import * as React from "react"
import { cn, a11y, construction } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, AlertTriangle } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, isWeekend } from "date-fns"

export interface TimelineTask {
  id: string
  name: string
  description?: string
  startDate: Date
  endDate: Date
  progress: number
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "DELAYED" | "ON_HOLD"
  assignedTo?: string[]
  dependencies?: string[]
  phase: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  estimatedHours?: number
  actualHours?: number
  materials?: string[]
  inspectionRequired?: boolean
}

export interface TimelineChartProps {
  /**
   * Tasks to display in timeline
   */
  tasks: TimelineTask[]
  /**
   * Current date focus
   */
  currentDate?: Date
  /**
   * View mode
   */
  viewMode?: "week" | "month" | "quarter"
  /**
   * Show weekend columns
   */
  showWeekends?: boolean
  /**
   * Show task dependencies
   */
  showDependencies?: boolean
  /**
   * Mobile optimized layout
   */
  mobile?: boolean
  /**
   * Field optimized for outdoor use
   */
  fieldOptimized?: boolean
  /**
   * High contrast mode
   */
  highContrast?: boolean
  /**
   * Task click handler
   */
  onTaskClick?: (task: TimelineTask) => void
  /**
   * Date range change handler
   */
  onDateRangeChange?: (startDate: Date, endDate: Date) => void
  /**
   * Task update handler
   */
  onTaskUpdate?: (taskId: string, updates: Partial<TimelineTask>) => void
}

const TimelineChart: React.FC<TimelineChartProps> = ({
  tasks = [],
  currentDate = new Date(),
  viewMode = "week",
  showWeekends = false,
  showDependencies = false,
  mobile = false,
  fieldOptimized = false,
  highContrast = false,
  onTaskClick,
  onDateRangeChange,
  onTaskUpdate
}) => {
  const [focusDate, setFocusDate] = React.useState(currentDate)
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null)
  
  const timelineId = a11y.generateId('timeline')

  // Calculate date range based on view mode
  const dateRange = React.useMemo(() => {
    const start = startOfWeek(focusDate, { weekStartsOn: 1 }) // Monday start
    let end: Date
    
    switch (viewMode) {
      case "month":
        end = endOfWeek(addWeeks(start, 3), { weekStartsOn: 1 })
        break
      case "quarter":
        end = endOfWeek(addWeeks(start, 11), { weekStartsOn: 1 })
        break
      default: // week
        end = endOfWeek(start, { weekStartsOn: 1 })
        break
    }
    
    return { start, end }
  }, [focusDate, viewMode])

  // Generate date columns
  const dateColumns = React.useMemo(() => {
    const days = eachDayOfInterval(dateRange)
    return showWeekends ? days : days.filter(day => !isWeekend(day))
  }, [dateRange, showWeekends])

  // Group tasks by phase
  const tasksByPhase = React.useMemo(() => {
    const phases = new Map<string, TimelineTask[]>()
    
    tasks.forEach(task => {
      if (!phases.has(task.phase)) {
        phases.set(task.phase, [])
      }
      phases.get(task.phase)!.push(task)
    })
    
    return phases
  }, [tasks])

  // Calculate task position and width
  const getTaskPosition = React.useCallback((task: TimelineTask) => {
    const totalDays = dateColumns.length
    const startIndex = dateColumns.findIndex(date => 
      isSameDay(date, task.startDate) || date >= task.startDate
    )
    const endIndex = dateColumns.findIndex(date => 
      isSameDay(date, task.endDate) || date >= task.endDate
    )
    
    if (startIndex === -1) return { left: 0, width: 0, visible: false }
    
    const left = (startIndex / totalDays) * 100
    const width = Math.max(((endIndex - startIndex + 1) / totalDays) * 100, 2)
    
    return { left, width, visible: true }
  }, [dateColumns])

  // Navigation handlers
  const navigatePrevious = React.useCallback(() => {
    const weeks = viewMode === "quarter" ? 12 : viewMode === "month" ? 4 : 1
    const newDate = subWeeks(focusDate, weeks)
    setFocusDate(newDate)
    onDateRangeChange?.(
      startOfWeek(newDate, { weekStartsOn: 1 }),
      endOfWeek(addWeeks(newDate, weeks - 1), { weekStartsOn: 1 })
    )
  }, [focusDate, viewMode, onDateRangeChange])

  const navigateNext = React.useCallback(() => {
    const weeks = viewMode === "quarter" ? 12 : viewMode === "month" ? 4 : 1
    const newDate = addWeeks(focusDate, weeks)
    setFocusDate(newDate)
    onDateRangeChange?.(
      startOfWeek(newDate, { weekStartsOn: 1 }),
      endOfWeek(addWeeks(newDate, weeks - 1), { weekStartsOn: 1 })
    )
  }, [focusDate, viewMode, onDateRangeChange])

  const navigateToday = React.useCallback(() => {
    const today = new Date()
    setFocusDate(today)
    onDateRangeChange?.(
      startOfWeek(today, { weekStartsOn: 1 }),
      endOfWeek(today, { weekStartsOn: 1 })
    )
  }, [onDateRangeChange])

  // Task click handler
  const handleTaskClick = React.useCallback((task: TimelineTask) => {
    setSelectedTask(task.id)
    onTaskClick?.(task)
    a11y.announce(`Selected task: ${task.name}`, 'polite')
  }, [onTaskClick])

  // Keyboard navigation
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent, task: TimelineTask) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTaskClick(task)
    }
  }, [handleTaskClick])

  return (
    <Card className={cn(
      "w-full",
      fieldOptimized && "shadow-xl border-2",
      highContrast && "border-black"
    )}>
      <CardHeader className={cn(
        "pb-4",
        fieldOptimized && "pb-6"
      )}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "flex items-center gap-2",
            fieldOptimized ? "text-xl" : "text-lg"
          )}>
            <Calendar className={cn(
              "text-construction-blue",
              fieldOptimized ? "h-6 w-6" : "h-5 w-5"
            )} />
            Project Timeline
          </CardTitle>
          
          {/* View Mode Selector */}
          <div className="flex items-center gap-2">
            {["week", "month", "quarter"].map(mode => (
              <Button
                key={mode}
                variant={viewMode === mode ? "construction" : "outline"}
                size={mobile ? "sm" : "default"}
                onClick={() => setFocusDate(new Date(focusDate))}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size={mobile ? "sm" : "default"}
              onClick={navigatePrevious}
              ariaLabel="Previous period"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size={mobile ? "sm" : "default"}
              onClick={navigateToday}
            >
              Today
            </Button>
            
            <Button
              variant="outline"
              size={mobile ? "sm" : "default"}
              onClick={navigateNext}
              ariaLabel="Next period"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className={cn(
            "text-sm font-medium",
            fieldOptimized && "text-base"
          )}>
            {format(dateRange.start, "MMM d")} - {format(dateRange.end, "MMM d, yyyy")}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div 
          className="relative overflow-x-auto"
          role="grid"
          aria-label="Project timeline chart"
          id={timelineId}
        >
          {/* Header Row */}
          <div className={cn(
            "sticky top-0 bg-background border-b flex min-w-max",
            fieldOptimized && "min-h-[60px]"
          )}>
            {/* Phase Column Header */}
            <div className={cn(
              "flex-shrink-0 w-48 p-3 border-r bg-muted/50 font-semibold",
              fieldOptimized && "w-64 p-4 text-base",
              mobile && "w-40 p-2 text-sm"
            )}>
              Construction Phase
            </div>
            
            {/* Date Column Headers */}
            {dateColumns.map((date, index) => (
              <div
                key={index}
                className={cn(
                  "flex-shrink-0 p-2 border-r text-center text-xs font-medium",
                  fieldOptimized ? "w-20 p-3 text-sm" : "w-16",
                  mobile && "w-12 p-1 text-xs",
                  isSameDay(date, new Date()) && "bg-construction-blue/10",
                  isWeekend(date) && "bg-muted/30"
                )}
                role="columnheader"
              >
                <div>{format(date, "EEE")}</div>
                <div className={cn(
                  "font-bold",
                  isSameDay(date, new Date()) && "text-construction-blue"
                )}>
                  {format(date, "d")}
                </div>
              </div>
            ))}
          </div>

          {/* Task Rows */}
          {Array.from(tasksByPhase.entries()).map(([phase, phaseTasks]) => (
            <div key={phase} className="border-b">
              {/* Phase Header */}
              <div className={cn(
                "flex min-w-max bg-muted/30",
                fieldOptimized && "min-h-[50px]"
              )}>
                <div className={cn(
                  "flex-shrink-0 w-48 p-3 border-r font-semibold text-construction-blue",
                  fieldOptimized && "w-64 p-4 text-base",
                  mobile && "w-40 p-2 text-sm"
                )}>
                  <div className="flex items-center gap-2">
                    <span>{construction.phases.getPhaseIcon(phase)}</span>
                    {construction.phases.getPhaseLabel(phase)}
                  </div>
                </div>
                <div className="flex-1" />
              </div>

              {/* Phase Tasks */}
              {phaseTasks.map((task) => {
                const position = getTaskPosition(task)
                const isSelected = selectedTask === task.id
                
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "flex min-w-max hover:bg-muted/50 transition-colors",
                      isSelected && "bg-construction-blue/10",
                      fieldOptimized && "min-h-[60px]"
                    )}
                    role="row"
                  >
                    {/* Task Info Column */}
                    <div className={cn(
                      "flex-shrink-0 w-48 p-3 border-r",
                      fieldOptimized && "w-64 p-4",
                      mobile && "w-40 p-2"
                    )}>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={cn(
                            "font-medium truncate",
                            fieldOptimized ? "text-sm" : "text-xs",
                            mobile && "text-xs"
                          )}>
                            {task.name}
                          </h4>
                          <Badge 
                            status={task.status}
                            size="sm"
                            highContrast={highContrast}
                          />
                        </div>
                        
                        {task.progress > 0 && (
                          <Progress
                            value={task.progress}
                            size="sm"
                            constructionType="task"
                            className="h-1"
                          />
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {task.assignedTo && task.assignedTo.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{task.assignedTo.length}</span>
                            </div>
                          )}
                          
                          {task.inspectionRequired && (
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                          )}
                          
                          {task.priority === "HIGH" || task.priority === "URGENT" && (
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              task.priority === "URGENT" ? "bg-red-500" : "bg-orange-500"
                            )} />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div className="relative flex-1 p-2">
                      {position.visible && (
                        <button
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-construction-blue focus:ring-offset-1",
                            task.status === "COMPLETED" && "bg-construction-green text-white",
                            task.status === "IN_PROGRESS" && "bg-construction-blue text-white",
                            task.status === "PENDING" && "bg-construction-yellow text-black",
                            task.status === "DELAYED" && "bg-construction-red text-white",
                            task.status === "ON_HOLD" && "bg-construction-slate text-white",
                            isSelected && "ring-2 ring-construction-blue ring-offset-1",
                            fieldOptimized && "px-3 py-2 text-sm min-h-[32px]"
                          )}
                          style={{
                            left: `${position.left}%`,
                            width: `${position.width}%`,
                            minWidth: fieldOptimized ? "80px" : "60px"
                          }}
                          onClick={() => handleTaskClick(task)}
                          onKeyDown={(e) => handleKeyDown(e, task)}
                          aria-label={a11y.labels.taskProgress(task.name, task.progress)}
                          role="gridcell"
                          tabIndex={0}
                        >
                          <div className="truncate">
                            {mobile ? task.name.slice(0, 10) + "..." : task.name}
                          </div>
                          {task.progress > 0 && (
                            <div className="text-xs opacity-75">
                              {task.progress}%
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className={cn(
          "p-4 border-t bg-muted/20",
          fieldOptimized && "p-6"
        )}>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-construction-green rounded" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-construction-blue rounded" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-construction-yellow rounded" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-construction-red rounded" />
              <span>Delayed</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-orange-500" />
              <span>Inspection Required</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { TimelineChart, type TimelineTask }