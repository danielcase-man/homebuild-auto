"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProjectButton } from '@/components/construction/project-button'
import { FileUpload } from '@/components/construction/file-upload'
import { TimelineChart } from '@/components/construction/timeline-chart'
import { StatusIndicator } from '@/components/construction/status-indicator'
import { AccessibilityPanel } from '@/components/ui/accessibility-panel'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'

export default function DemoPage() {
  const sampleTasks = [
    {
      id: '1',
      name: 'Foundation Pour',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-25'),
      progress: 100,
      status: 'COMPLETED' as const,
      dependencies: [],
      phase: 'Foundation',
      priority: 'HIGH' as const
    },
    {
      id: '2', 
      name: 'Framing',
      startDate: new Date('2024-01-26'),
      endDate: new Date('2024-02-15'),
      progress: 75,
      status: 'IN_PROGRESS' as const,
      dependencies: ['1'],
      phase: 'Structure',
      priority: 'HIGH' as const
    },
    {
      id: '3',
      name: 'Electrical Rough-in',
      startDate: new Date('2024-02-16'),
      endDate: new Date('2024-02-28'),
      progress: 0,
      status: 'PENDING' as const,
      dependencies: ['2'],
      phase: 'MEP',
      priority: 'MEDIUM' as const
    }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-construction-dark">
          Home Builder Design System
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enhanced with Shadcn/UI components, WCAG 2.1 AA accessibility, and construction-specific features
        </p>
      </div>

      {/* Enhanced UI Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-construction-dark">Enhanced UI Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Button Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Construction-themed button styles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="construction" size="lg">Primary Action</Button>
              <Button variant="warning" size="default">Safety Check</Button>
              <Button variant="outline" size="sm">Secondary</Button>
            </CardContent>
          </Card>

          {/* Input Components */}
          <Card>
            <CardHeader>
              <CardTitle>Input Components</CardTitle>
              <CardDescription>Field-optimized inputs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" placeholder="Enter project name" />
              </div>
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input id="budget" type="number" placeholder="$0.00" />
              </div>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Status Indicators</CardTitle>
              <CardDescription>Project status display</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusIndicator status="COMPLETED" label="Foundation" />
              <StatusIndicator status="IN_PROGRESS" label="Framing" />
              <StatusIndicator status="PENDING" label="Electrical" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Construction-Specific Components */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-construction-dark">Construction Components</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Project Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Project Navigation</CardTitle>
              <CardDescription>Quick access to project details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProjectButton 
                title="Residential Build - 123 Main St"
                status="IN_PROGRESS"
                progress={65}
                onClick={() => console.log('Navigate to project')}
              />
              <ProjectButton 
                title="Commercial Renovation - Downtown"
                status="COMPLETED"
                progress={100}
                onClick={() => console.log('Navigate to project')}
              />
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Construction document management</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload 
                onUpload={async (files) => console.log('Files uploaded:', files)}
                accept=".pdf,.jpg,.png,.dwg"
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Timeline Chart */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-construction-dark">Project Timeline</h2>
        <Card>
          <CardHeader>
            <CardTitle>Construction Schedule</CardTitle>
            <CardDescription>Interactive Gantt-style timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <TimelineChart 
              tasks={sampleTasks}
              onTaskClick={(task) => console.log('Task clicked:', task)}
            />
          </CardContent>
        </Card>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-construction-dark">Accessibility Features</h2>
        <Card>
          <CardHeader>
            <CardTitle>WCAG 2.1 AA Compliance</CardTitle>
            <CardDescription>Real-time accessibility testing and controls</CardDescription>
          </CardHeader>
          <CardContent>
            <AccessibilityPanel />
          </CardContent>
        </Card>
      </section>

      {/* Progress Indicators */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-construction-dark">Progress Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Completed Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">12</div>
              <Progress value={100} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">5</div>
              <Progress value={65} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">8</div>
              <Progress value={0} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600">
        <p>Enhanced Home Builder Design System • WCAG 2.1 AA Compliant • Mobile-First</p>
      </footer>
    </div>
  )
}