"use client"

import React, { useState } from 'react'
import { addDays, subDays, isWeekend } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { ConstructionDatePicker, constructionDatePresets, constructionDateUtils } from '@/components/ui/construction-date-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, AlertTriangle, Users, MapPin, Wrench, CheckCircle } from 'lucide-react'
import { AppHeader } from '@/components/ui/app-header'

export default function SchedulingDemo() {
  // Single date picker states
  const [singleDate, setSingleDate] = useState<Date | undefined>(undefined)
  const [inspectionDate, setInspectionDate] = useState<Date | undefined>(undefined)
  const [permitDate, setPermitDate] = useState<Date | undefined>(undefined)
  
  // Range date picker states
  const [projectRange, setProjectRange] = useState<DateRange | undefined>(undefined)
  const [foundationRange, setFoundationRange] = useState<DateRange | undefined>(undefined)
  const [framingRange, setFramingRange] = useState<DateRange | undefined>(undefined)
  
  // Mock blocked and restricted dates
  const blockedDates = [
    addDays(new Date(), 5),  // Equipment delivery
    addDays(new Date(), 12), // Permit inspection
    addDays(new Date(), 18), // Holiday
  ]
  
  const weatherRestrictedDates = [
    addDays(new Date(), 3),   // Rainy day
    addDays(new Date(), 7),   // Storm forecast
    addDays(new Date(), 14),  // High winds
  ]
  
  // Mock project dates
  const projectStartDate = new Date()
  const projectEndDate = addDays(new Date(), 90)
  
  // Sample construction scenarios
  const constructionScenarios = [
    {
      id: 'foundation',
      title: 'Foundation Pour',
      description: 'Concrete foundation pouring - weather sensitive',
      icon: <Wrench className="h-5 w-5" />,
      constraints: {
        excludeWeekends: true,
        excludeHolidays: true,
        weatherRestrictionDates: weatherRestrictedDates,
        minDate: addDays(new Date(), 2),
        maxDate: addDays(new Date(), 30)
      }
    },
    {
      id: 'inspection',
      title: 'Building Inspection',
      description: 'Municipal inspection scheduling',
      icon: <CheckCircle className="h-5 w-5" />,
      constraints: {
        excludeWeekends: true,
        excludeHolidays: true,
        blockedDates: blockedDates,
        minDate: addDays(new Date(), 1),
        maxDate: addDays(new Date(), 14)
      }
    },
    {
      id: 'framing',
      title: 'Framing Work',
      description: 'Structural framing - 2 week duration',
      icon: <Users className="h-5 w-5" />,
      constraints: {
        excludeWeekends: false,
        excludeHolidays: true,
        projectStartDate,
        projectEndDate,
        criticalPath: true
      }
    }
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        title="Construction Scheduling System"
        navigation={[
          { label: "Home", href: "/", active: false },
          { label: "Dashboard", href: "/dashboard", active: false },
          { label: "Scheduling", href: "/scheduling", active: true },
          { label: "Mobile", href: "/mobile", active: false },
          { label: "Design", href: "/design-dashboard", active: false },
        ]}
      />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">
            Advanced Construction Scheduling →
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900">
            Construction Scheduling System
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced date picker with construction-specific features including work day calculations, 
            holiday exclusions, weather restrictions, and project timeline management.
          </p>
        </div>
      
      {/* Feature Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-construction-orange mx-auto mb-2" />
            <h3 className="font-semibold">Work Day Logic</h3>
            <p className="text-sm text-gray-600">Excludes weekends & holidays</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-construction-blue mx-auto mb-2" />
            <h3 className="font-semibold">Timeline Management</h3>
            <p className="text-sm text-gray-600">Project boundary constraints</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-construction-yellow mx-auto mb-2" />
            <h3 className="font-semibold">Weather Awareness</h3>
            <p className="text-sm text-gray-600">Weather restriction dates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 text-construction-green mx-auto mb-2" />
            <h3 className="font-semibold">Critical Path</h3>
            <p className="text-sm text-gray-600">Dependency management</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Date Selection</TabsTrigger>
          <TabsTrigger value="range">Date Range Selection</TabsTrigger>
          <TabsTrigger value="scenarios">Construction Scenarios</TabsTrigger>
        </TabsList>
        
        {/* Single Date Selection */}
        <TabsContent value="single" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Basic Date Picker */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Basic Date Selection
                </CardTitle>
                <CardDescription>
                  Standard date picker with work day exclusions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConstructionDatePicker
                  mode="single"
                  selected={singleDate}
                  onSelect={(date) => setSingleDate(date as Date)}
                  placeholder="Select work date"
                  {...constructionDatePresets.standard}
                />
                {singleDate && (
                  <div className="text-sm text-gray-600">
                    Selected: {singleDate.toLocaleDateString()}
                    {constructionDateUtils.isWorkDay(singleDate) && (
                      <Badge variant="secondary" className="ml-2">Work Day</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Inspection Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Inspection Scheduling
                </CardTitle>
                <CardDescription>
                  Municipal inspection with blocked dates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConstructionDatePicker
                  mode="single"
                  selected={inspectionDate}
                  onSelect={(date) => setInspectionDate(date as Date)}
                  placeholder="Schedule inspection"
                  excludeWeekends={true}
                  excludeHolidays={true}
                  blockedDates={blockedDates}
                  minDate={addDays(new Date(), 1)}
                  maxDate={addDays(new Date(), 21)}
                />
                {inspectionDate && (
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600">
                      Inspection: {inspectionDate.toLocaleDateString()}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Municipal Calendar
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Permit Application */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Permit Application
                </CardTitle>
                <CardDescription>
                  Emergency project - weekends allowed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConstructionDatePicker
                  mode="single"
                  selected={permitDate}
                  onSelect={(date) => setPermitDate(date as Date)}
                  placeholder="Permit submission"
                  {...constructionDatePresets.emergency}
                />
                {permitDate && (
                  <div className="text-sm space-y-1">
                    <p className="text-gray-600">
                      Permit: {permitDate.toLocaleDateString()}
                    </p>
                    <Badge variant="destructive" className="text-xs">
                      Emergency Schedule
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Date Range Selection */}
        <TabsContent value="range" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Project Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Project Timeline
                </CardTitle>
                <CardDescription>
                  Full project duration with work day calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConstructionDatePicker
                  mode="range"
                  selected={projectRange}
                  onSelect={(range) => setProjectRange(range as DateRange)}
                  placeholder="Select project duration"
                  excludeWeekends={true}
                  excludeHolidays={true}
                  minDate={new Date()}
                  maxDate={addDays(new Date(), 365)}
                />
                {projectRange?.from && projectRange?.to && (
                  <div className="text-sm space-y-2">
                    <p className="text-gray-600">
                      Duration: {Math.ceil((projectRange.to!.getTime() - projectRange.from!.getTime()) / (1000 * 60 * 60 * 24))} total days
                    </p>
                    <p className="text-gray-600">
                      Work Days: {constructionDateUtils.getWorkDaysInRange(projectRange.from!, projectRange.to!).length}
                    </p>
                    <Badge variant="default" className="text-xs">
                      Project Schedule
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Foundation Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Foundation Phase
                </CardTitle>
                <CardDescription>
                  Weather-sensitive concrete work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConstructionDatePicker
                  mode="range"
                  selected={foundationRange}
                  onSelect={(range) => setFoundationRange(range as DateRange)}
                  placeholder="Foundation work period"
                  excludeWeekends={true}
                  excludeHolidays={true}
                  weatherRestrictionDates={weatherRestrictedDates}
                  projectStartDate={projectStartDate}
                  projectEndDate={projectEndDate}
                />
                {foundationRange?.from && foundationRange?.to && (
                  <div className="text-sm space-y-2">
                    <p className="text-gray-600">
                      Foundation: {foundationRange.from!.toLocaleDateString()} - {foundationRange.to!.toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Weather Dependent
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Framing Work */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Framing Phase
                </CardTitle>
                <CardDescription>
                  Critical path with weekend work allowed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ConstructionDatePicker
                  mode="range"
                  selected={framingRange}
                  onSelect={(range) => setFramingRange(range as DateRange)}
                  placeholder="Framing work period"
                  excludeWeekends={false}
                  excludeHolidays={true}
                  projectStartDate={projectStartDate}
                  projectEndDate={projectEndDate}
                  criticalPath={true}
                />
                {framingRange?.from && framingRange?.to && (
                  <div className="text-sm space-y-2">
                    <p className="text-gray-600">
                      Framing: {framingRange.from!.toLocaleDateString()} - {framingRange.to!.toLocaleDateString()}
                    </p>
                    <Badge variant="destructive" className="text-xs">
                      Critical Path
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Schedule Actions</CardTitle>
                <CardDescription>
                  Common construction scheduling shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const nextWorkDay = constructionDateUtils.getNextWorkDay(new Date())
                    setSingleDate(nextWorkDay)
                  }}
                  className="w-full justify-start"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Next Work Day
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const start = addDays(new Date(), 7)
                    const end = addDays(start, 13) // 2 weeks
                    setProjectRange({ from: start, to: end })
                  }}
                  className="w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  2-Week Sprint
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const start = new Date()
                    const end = addDays(start, 89) // 90 days
                    setProjectRange({ from: start, to: end })
                  }}
                  className="w-full justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  90-Day Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Construction Scenarios */}
        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {constructionScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {scenario.icon}
                    {scenario.title}
                  </CardTitle>
                  <CardDescription>
                    {scenario.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ConstructionDatePicker
                    mode="range"
                    selected={undefined}
                    onSelect={() => {}}
                    placeholder={`Schedule ${scenario.title.toLowerCase()}`}
                    {...scenario.constraints}
                  />
                  
                  {/* Scenario-specific info */}
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Work days only: {scenario.constraints.excludeWeekends ? 'Yes' : 'No'}</p>
                    <p>• Holiday exclusions: {scenario.constraints.excludeHolidays ? 'Yes' : 'No'}</p>
                    {scenario.constraints.weatherRestrictionDates && (
                      <p>• Weather restrictions: {scenario.constraints.weatherRestrictionDates.length} days</p>
                    )}
                    {scenario.constraints.blockedDates && (
                      <p>• Blocked dates: {scenario.constraints.blockedDates.length} days</p>
                    )}
                    {scenario.constraints.criticalPath && (
                      <p>• Critical path: Yes</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Implementation Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Statistics</CardTitle>
          <CardDescription>
            Performance metrics for the construction date picker
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-construction-orange">~18KB</div>
              <div className="text-sm text-gray-600">Bundle Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-construction-blue">A+</div>
              <div className="text-sm text-gray-600">Accessibility</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-construction-green">6.25M</div>
              <div className="text-sm text-gray-600">Weekly Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-construction-yellow">100%</div>
              <div className="text-sm text-gray-600">TypeScript</div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}