"use client"

import * as React from "react"
import { DayPicker, DayPickerRangeProps, DateRange } from "react-day-picker"
import { format, isAfter, isBefore, isWeekend, addDays, subDays } from "date-fns"
import Holidays from "date-holidays"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertTriangle, Clock, Settings } from "lucide-react"

// Construction-specific types
export interface ConstructionDatePickerProps {
  selected?: Date | DateRange
  onSelect?: (date: Date | DateRange | undefined) => void
  mode?: "single" | "range"
  placeholder?: string
  disabled?: boolean
  className?: string
  
  // Construction-specific props
  excludeWeekends?: boolean
  excludeHolidays?: boolean
  workDaysOnly?: boolean
  country?: string // For holiday calculation
  minDate?: Date
  maxDate?: Date
  blockedDates?: Date[]
  weatherRestrictionDates?: Date[]
  
  // Project-specific
  projectStartDate?: Date
  projectEndDate?: Date
  criticalPath?: boolean
  
  // Accessibility
  ariaLabel?: string
  ariaDescription?: string
}

// Holiday manager
const holidayManager = new Holidays("US")

// Construction-specific date utilities
export const constructionDateUtils = {
  isWorkDay: (date: Date, excludeWeekends = true, excludeHolidays = true, country = "US") => {
    if (excludeWeekends && isWeekend(date)) return false
    if (excludeHolidays && holidayManager.isHoliday(date)) return false
    return true
  },
  
  getNextWorkDay: (date: Date, excludeWeekends = true, excludeHolidays = true) => {
    let nextDay = addDays(date, 1)
    while (!constructionDateUtils.isWorkDay(nextDay, excludeWeekends, excludeHolidays)) {
      nextDay = addDays(nextDay, 1)
    }
    return nextDay
  },
  
  getPreviousWorkDay: (date: Date, excludeWeekends = true, excludeHolidays = true) => {
    let prevDay = subDays(date, 1)
    while (!constructionDateUtils.isWorkDay(prevDay, excludeWeekends, excludeHolidays)) {
      prevDay = subDays(prevDay, 1)
    }
    return prevDay
  },
  
  getWorkDaysInRange: (startDate: Date, endDate: Date, excludeWeekends = true, excludeHolidays = true) => {
    const workDays = []
    let currentDate = startDate
    
    while (currentDate <= endDate) {
      if (constructionDateUtils.isWorkDay(currentDate, excludeWeekends, excludeHolidays)) {
        workDays.push(new Date(currentDate))
      }
      currentDate = addDays(currentDate, 1)
    }
    
    return workDays
  }
}

export const ConstructionDatePicker = React.forwardRef<
  HTMLDivElement,
  ConstructionDatePickerProps
>(({
  selected,
  onSelect,
  mode = "single",
  placeholder = "Select date",
  disabled = false,
  className,
  excludeWeekends = true,
  excludeHolidays = true,
  workDaysOnly = false,
  country = "US",
  minDate,
  maxDate,
  blockedDates = [],
  weatherRestrictionDates = [],
  projectStartDate,
  projectEndDate,
  criticalPath = false,
  ariaLabel,
  ariaDescription,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [monthsShown, setMonthsShown] = React.useState(1)
  
  // Initialize holidays for specified country
  React.useEffect(() => {
    holidayManager.init(country)
  }, [country])
  
  // Custom modifiers for construction scheduling
  const modifiers = React.useMemo(() => {
    const mods: any = {}
    
    // Work days vs non-work days
    if (workDaysOnly || excludeWeekends) {
      mods.weekend = (date: Date) => isWeekend(date)
    }
    
    // Holidays
    if (excludeHolidays) {
      mods.holiday = (date: Date) => holidayManager.isHoliday(date)
    }
    
    // Blocked dates (permits, inspections, etc.)
    if (blockedDates.length > 0) {
      mods.blocked = blockedDates
    }
    
    // Weather restrictions
    if (weatherRestrictionDates.length > 0) {
      mods.weatherRestricted = weatherRestrictionDates
    }
    
    // Project boundaries
    if (projectStartDate && projectEndDate) {
      mods.outsideProject = (date: Date) => 
        isBefore(date, projectStartDate) || isAfter(date, projectEndDate)
    }
    
    // Critical path highlighting
    if (criticalPath && mode === "range" && selected && typeof selected === "object" && "from" in selected) {
      mods.criticalPath = (date: Date) => {
        if (!selected.from || !selected.to) return false
        return date >= selected.from && date <= selected.to
      }
    }
    
    return mods
  }, [
    workDaysOnly,
    excludeWeekends,
    excludeHolidays,
    blockedDates,
    weatherRestrictionDates,
    projectStartDate,
    projectEndDate,
    criticalPath,
    mode,
    selected
  ])
  
  // Custom styles for construction themes
  const modifiersStyles = {
    weekend: { 
      color: "#9CA3AF",
      textDecoration: "line-through"
    },
    holiday: { 
      backgroundColor: "#FEF3C7",
      color: "#D97706",
      fontWeight: "bold"
    },
    blocked: { 
      backgroundColor: "#FEE2E2",
      color: "#DC2626",
      position: "relative" as const
    },
    weatherRestricted: { 
      backgroundColor: "#DBEAFE",
      color: "#2563EB",
      fontStyle: "italic"
    },
    outsideProject: { 
      opacity: 0.3,
      pointerEvents: "none" as const
    },
    criticalPath: { 
      backgroundColor: "#FEF3C7",
      borderColor: "#F59E0B",
      fontWeight: "bold"
    }
  }
  
  // Disable function
  const disableDate = React.useCallback((date: Date) => {
    // Min/max date constraints
    if (minDate && isBefore(date, minDate)) return true
    if (maxDate && isAfter(date, maxDate)) return true
    
    // Work days only constraint
    if (workDaysOnly && !constructionDateUtils.isWorkDay(date, excludeWeekends, excludeHolidays)) {
      return true
    }
    
    // Blocked dates
    if (blockedDates.some(blocked => blocked.getTime() === date.getTime())) {
      return true
    }
    
    // Project boundaries
    if (projectStartDate && projectEndDate) {
      if (isBefore(date, projectStartDate) || isAfter(date, projectEndDate)) {
        return true
      }
    }
    
    return false
  }, [
    minDate,
    maxDate,
    workDaysOnly,
    excludeWeekends,
    excludeHolidays,
    blockedDates,
    projectStartDate,
    projectEndDate
  ])
  
  // Format display text
  const getDisplayText = () => {
    if (mode === "single") {
      return selected instanceof Date ? format(selected, "PPP") : placeholder
    } else {
      if (selected && typeof selected === "object" && "from" in selected) {
        const range = selected as DateRange
        if (range.from && range.to) {
          return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`
        } else if (range.from) {
          return `${format(range.from, "PPP")} - Select end date`
        }
      }
      return placeholder
    }
  }
  
  // Get work days count for range mode
  const getWorkDaysCount = () => {
    if (mode === "range" && selected && typeof selected === "object" && "from" in selected) {
      const range = selected as DateRange
      if (range.from && range.to) {
        const workDays = constructionDateUtils.getWorkDaysInRange(
          range.from,
          range.to,
          excludeWeekends,
          excludeHolidays
        )
        return workDays.length
      }
    }
    return null
  }
  
  const workDaysCount = getWorkDaysCount()
  
  return (
    <div ref={ref} className={cn("construction-date-picker", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selected && "text-muted-foreground",
              criticalPath && "border-yellow-400 bg-yellow-50",
              className
            )}
            aria-label={ariaLabel}
            aria-description={ariaDescription}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {getDisplayText()}
            {workDaysCount && (
              <Badge variant="secondary" className="ml-auto">
                {workDaysCount} work days
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4">
            {/* Header with controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">
                  {mode === "single" ? "Select Date" : "Select Date Range"}
                </h3>
                {criticalPath && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Critical Path
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMonthsShown(monthsShown === 1 ? 2 : 1)}
                  className="text-xs"
                >
                  {monthsShown === 1 ? "2 Months" : "1 Month"}
                </Button>
              </div>
            </div>
            
            {/* Date Picker */}
            <DayPicker
              mode={mode as any}
              selected={selected as any}
              onSelect={onSelect as any}
              numberOfMonths={monthsShown}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              disabled={disableDate}
              className="construction-calendar"
              {...props}
            />
            
            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Legend:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {excludeWeekends && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded" />
                    <span>Weekends</span>
                  </div>
                )}
                {excludeHolidays && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-200 rounded" />
                    <span>Holidays</span>
                  </div>
                )}
                {blockedDates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-200 rounded" />
                    <span>Blocked</span>
                  </div>
                )}
                {weatherRestrictionDates.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-200 rounded" />
                    <span>Weather Risk</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tomorrow = addDays(new Date(), 1)
                    const nextWorkDay = constructionDateUtils.getNextWorkDay(
                      tomorrow,
                      excludeWeekends,
                      excludeHolidays
                    )
                    onSelect?.(mode === "single" ? nextWorkDay : { from: nextWorkDay, to: undefined })
                  }}
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Next Work Day
                </Button>
                
                {mode === "range" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const startDate = addDays(new Date(), 1)
                      const endDate = addDays(startDate, 6) // 1 week
                      onSelect?.({ from: startDate, to: endDate })
                    }}
                    className="text-xs"
                  >
                    Next Week
                  </Button>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
})

ConstructionDatePicker.displayName = "ConstructionDatePicker"

// Preset configurations for common construction scenarios
export const constructionDatePresets = {
  // Standard construction project
  standard: {
    excludeWeekends: true,
    excludeHolidays: true,
    workDaysOnly: true,
    country: "US"
  },
  
  // Emergency/rush projects
  emergency: {
    excludeWeekends: false,
    excludeHolidays: false,
    workDaysOnly: false,
    country: "US"
  },
  
  // Weather-dependent tasks
  weatherSensitive: {
    excludeWeekends: true,
    excludeHolidays: true,
    workDaysOnly: true,
    country: "US"
  },
  
  // Inspection scheduling
  inspection: {
    excludeWeekends: true,
    excludeHolidays: true,
    workDaysOnly: true,
    country: "US"
  }
}

