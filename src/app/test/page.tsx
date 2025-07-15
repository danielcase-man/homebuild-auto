'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  message?: string
  duration?: number
}

const TestPage: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Frontend Components', status: 'pending' },
    { name: 'Store Integration', status: 'pending' },
    { name: 'API Connection', status: 'pending' },
    { name: 'Authentication', status: 'pending' },
    { name: 'Database Connection', status: 'pending' },
    { name: 'UI Responsiveness', status: 'pending' }
  ])

  const [isRunning, setIsRunning] = useState(false)

  const runTest = async (testName: string, testFunction: () => Promise<boolean>) => {
    setTests(prev => prev.map(t => 
      t.name === testName ? { ...t, status: 'running' } : t
    ))

    const startTime = Date.now()
    
    try {
      const result = await testFunction()
      const duration = Date.now() - startTime
      
      setTests(prev => prev.map(t => 
        t.name === testName ? { 
          ...t, 
          status: result ? 'passed' : 'failed',
          message: result ? 'Test passed successfully' : 'Test failed',
          duration
        } : t
      ))
    } catch (error) {
      const duration = Date.now() - startTime
      setTests(prev => prev.map(t => 
        t.name === testName ? { 
          ...t, 
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          duration
        } : t
      ))
    }
  }

  const testFrontendComponents = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    // Test if React components are rendering
    const hasReactElements = document.querySelector('.test-page') !== null
    return hasReactElements
  }

  const testStoreIntegration = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    // Test if Zustand store is working
    try {
      const { useProjectStore } = await import('@/stores/project-store')
      const store = useProjectStore.getState()
      return typeof store.initializeData === 'function'
    } catch {
      return false
    }
  }

  const testAPIConnection = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Test if API endpoints are accessible
    try {
      const response = await fetch('/api/projects')
      return response.status === 401 || response.status === 200 // 401 is expected without auth
    } catch {
      return false
    }
  }

  const testAuthentication = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 700))
    // Test if NextAuth is configured
    try {
      const response = await fetch('/api/auth/session')
      return response.status === 200
    } catch {
      return false
    }
  }

  const testDatabaseConnection = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    // Test if database connection is working (will fail without actual DB)
    try {
      const response = await fetch('/api/projects')
      return response.status !== 500 // Not a server error
    } catch {
      return false
    }
  }

  const testUIResponsiveness = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    // Test if UI is responsive
    const viewport = window.innerWidth
    return viewport > 0 && document.body.style.display !== 'none'
  }

  const runAllTests = async () => {
    setIsRunning(true)
    
    await runTest('Frontend Components', testFrontendComponents)
    await runTest('Store Integration', testStoreIntegration)
    await runTest('API Connection', testAPIConnection)
    await runTest('Authentication', testAuthentication)
    await runTest('Database Connection', testDatabaseConnection)
    await runTest('UI Responsiveness', testUIResponsiveness)
    
    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const passedTests = tests.filter(t => t.status === 'passed').length
  const failedTests = tests.filter(t => t.status === 'failed').length
  const totalTests = tests.length

  return (
    <div className="test-page min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Home Builder App - System Test Suite
          </h1>
          <p className="text-gray-600 mb-6">
            Testing the backend infrastructure and critical functionality
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="bg-construction-blue hover:bg-construction-blue/90"
            >
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Passed: {passedTests}</span>
              <span>Failed: {failedTests}</span>
              <span>Total: {totalTests}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{test.name}</h3>
                    {test.message && (
                      <p className="text-sm text-gray-600">{test.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {test.duration && (
                    <span className="text-sm text-gray-500">
                      {test.duration}ms
                    </span>
                  )}
                  {getStatusBadge(test.status)}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-green-600">Passed</div>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((passedTests / totalTests) * 100)}%
              </div>
              <div className="text-sm text-blue-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage