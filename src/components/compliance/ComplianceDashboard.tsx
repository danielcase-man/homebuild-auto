"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Phone,
  ExternalLink,
  Download,
  Calendar,
  DollarSign,
  Building2,
  Search,
  Filter
} from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { municipalCompliance, type JurisdictionCompliance } from '@/lib/municipal-compliance-service'
import { cn } from '@/lib/utils'

interface ComplianceDashboardProps {
  projectId?: string
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ projectId }) => {
  const { currentProject } = useProjectStore()
  const [complianceData, setComplianceData] = useState<JurisdictionCompliance | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'permits' | 'inspections' | 'codes' | 'contacts'>('overview')

  const selectedProjectId = projectId || currentProject?.id

  useEffect(() => {
    if (selectedProjectId) {
      loadComplianceData()
    }
  }, [selectedProjectId])

  const loadComplianceData = async () => {
    if (!selectedProjectId) return
    
    setIsLoading(true)
    try {
      // First detect jurisdiction from project address
      const projectAddress = currentProject?.address || ''
      const jurisdiction = await municipalCompliance.detectJurisdiction(
        typeof projectAddress === 'string' ? projectAddress : JSON.stringify(projectAddress)
      )
      
      // Then get jurisdiction-specific compliance
      const data = await municipalCompliance.getJurisdictionCompliance(selectedProjectId, jurisdiction)
      setComplianceData(data)
    } catch (error) {
      console.error('Failed to load compliance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'NON_COMPLIANT':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return CheckCircle
      case 'NON_COMPLIANT':
        return AlertTriangle
      case 'PENDING':
        return Clock
      default:
        return Shield
    }
  }

  if (!selectedProjectId) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
        <p className="text-gray-600">Please select a project to view compliance information.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-construction-blue"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Municipal Compliance</h1>
          <p className="text-gray-600">
            {currentProject?.name || 'Project'} - Dynamic jurisdiction compliance tracking
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadComplianceData}
            className="inline-flex items-center px-4 py-2 bg-construction-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Shield className="h-4 w-4 mr-2" />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Compliance Status Overview */}
      {complianceData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "rounded-lg border-2 p-6",
            getComplianceStatusColor(complianceData.overallCompliance)
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {React.createElement(getComplianceIcon(complianceData.overallCompliance), {
                className: "h-8 w-8 mr-3"
              })}
              <div>
                <h3 className="text-lg font-semibold">
                  Overall Compliance Status: {complianceData.overallCompliance.replace('_', ' ')}
                </h3>
                <p className="text-sm opacity-90">
                  Last checked: {complianceData.checkDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {complianceData.issues.length > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold">{complianceData.issues.length}</div>
                <div className="text-sm opacity-90">
                  {complianceData.issues.length === 1 ? 'Issue' : 'Issues'}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'permits', label: 'Permits', icon: FileText },
            { id: 'inspections', label: 'Inspections', icon: CheckCircle },
            { id: 'codes', label: 'Building Codes', icon: Building2 },
            { id: 'contacts', label: 'Contacts', icon: Phone }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-construction-blue text-construction-blue"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <ComplianceOverview complianceData={complianceData} />
          )}
          
          {activeTab === 'permits' && (
            <PermitsTab projectId={selectedProjectId} />
          )}
          
          {activeTab === 'inspections' && (
            <InspectionsTab projectId={selectedProjectId} />
          )}
          
          {activeTab === 'codes' && (
            <BuildingCodesTab />
          )}
          
          {activeTab === 'contacts' && (
            <ContactsTab />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Overview Tab Component
const ComplianceOverview: React.FC<{ complianceData: JurisdictionCompliance | null }> = ({ 
  complianceData 
}) => {
  if (!complianceData) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Compliance Data</h3>
        <p className="text-gray-600">Click "Refresh Status" to load compliance information.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Permits</p>
              <p className="text-2xl font-bold text-gray-900">
                {complianceData.permits.obtained.length} / {complianceData.permits.required.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inspections</p>
              <p className="text-2xl font-bold text-gray-900">
                {complianceData.inspections.completed.length} / {complianceData.inspections.required.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Violations</p>
              <p className="text-2xl font-bold text-gray-900">
                {complianceData.buildingCodes.violations.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {complianceData.permits.pending.length + complianceData.inspections.pending.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Issues and Recommendations */}
      {complianceData.issues.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Issues</h3>
          <div className="space-y-3">
            {complianceData.issues.map((issue, index) => (
              <div
                key={index}
                className={cn(
                  "p-4 rounded-lg border-l-4",
                  issue.severity === 'CRITICAL' && "border-red-500 bg-red-50",
                  issue.severity === 'HIGH' && "border-orange-500 bg-orange-50",
                  issue.severity === 'MEDIUM' && "border-yellow-500 bg-yellow-50",
                  issue.severity === 'LOW' && "border-blue-500 bg-blue-50"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{issue.description}</h4>
                    <p className="text-sm text-gray-600 mt-1">{issue.impact}</p>
                    <p className="text-sm text-gray-800 mt-2 font-medium">
                      Resolution: {issue.resolution}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    issue.severity === 'CRITICAL' && "bg-red-100 text-red-800",
                    issue.severity === 'HIGH' && "bg-orange-100 text-orange-800",
                    issue.severity === 'MEDIUM' && "bg-yellow-100 text-yellow-800",
                    issue.severity === 'LOW' && "bg-blue-100 text-blue-800"
                  )}>
                    {issue.severity}
                  </span>
                </div>
                {issue.deadline && (
                  <div className="mt-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Due: {issue.deadline.toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {complianceData.recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {complianceData.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Placeholder components for other tabs
const PermitsTab: React.FC<{ projectId: string }> = ({ projectId }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Permits</h3>
    <p className="text-gray-600">Permit management interface would be implemented here.</p>
  </div>
)

const InspectionsTab: React.FC<{ projectId: string }> = ({ projectId }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Schedule</h3>
    <p className="text-gray-600">Inspection scheduling interface would be implemented here.</p>
  </div>
)

const BuildingCodesTab: React.FC = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Applicable Building Codes</h3>
    <p className="text-gray-600">Building codes reference would be implemented here.</p>
  </div>
)

const ContactsTab: React.FC = () => {
  const { currentProject } = useProjectStore()
  const [contacts, setContacts] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadContacts = async () => {
      if (!currentProject?.address) return
      
      setIsLoading(true)
      try {
        const jurisdiction = await municipalCompliance.detectJurisdiction(
          typeof currentProject.address === 'string' ? currentProject.address : JSON.stringify(currentProject.address)
        )
        const jurisdictionContacts = await municipalCompliance.getJurisdictionContacts(jurisdiction)
        setContacts(jurisdictionContacts)
      } catch (error) {
        console.error('Failed to load jurisdiction contacts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContacts()
  }, [currentProject])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-construction-blue"></div>
      </div>
    )
  }

  if (!contacts) {
    return (
      <div className="text-center py-12">
        <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Contact Information</h3>
        <p className="text-gray-600">Unable to load jurisdiction contacts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Jurisdiction Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          {contacts.jurisdiction.jurisdiction}
        </h3>
        <p className="text-sm text-blue-700">
          {contacts.jurisdiction.city}, {contacts.jurisdiction.county} County, {contacts.jurisdiction.state}
        </p>
      </div>

      {/* Departments */}
      {Object.entries(contacts.departments).map(([key, department]: [string, any]) => (
        <div key={key} className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          
          {typeof department === 'object' && !Array.isArray(department) && (
            <div className="space-y-3">
              {department.name && (
                <div>
                  <p className="font-medium text-gray-900">{department.name}</p>
                </div>
              )}
              
              {department.address && (
                <div className="text-gray-600">
                  <p>{department.address}</p>
                </div>
              )}
              
              {department.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <a href={`tel:${department.phone}`} className="hover:text-construction-blue">
                    {department.phone}
                  </a>
                </div>
              )}
              
              {department.email && (
                <div className="text-gray-600">
                  <a href={`mailto:${department.email}`} className="hover:text-construction-blue">
                    {department.email}
                  </a>
                </div>
              )}
              
              {department.website && (
                <div className="flex items-center text-gray-600">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <a 
                    href={department.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-construction-blue"
                  >
                    {department.website}
                  </a>
                </div>
              )}
              
              {department.hours && (
                <div className="text-gray-600">
                  <p><strong>Hours:</strong> {department.hours}</p>
                </div>
              )}

              {department.onlinePortal && (
                <div className="flex items-center text-gray-600">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <a 
                    href={department.onlinePortal} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-construction-blue"
                  >
                    Online Portal
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Special Districts */}
      {contacts.specialDistricts && contacts.specialDistricts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Districts</h3>
          <div className="space-y-4">
            {contacts.specialDistricts.map((district: any, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-900">{district.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{district.type}</p>
                
                {district.contactInfo.phone && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone className="h-3 w-3 mr-2" />
                    <a href={`tel:${district.contactInfo.phone}`} className="hover:text-construction-blue">
                      {district.contactInfo.phone}
                    </a>
                  </div>
                )}
                
                {district.contactInfo.email && (
                  <div className="text-gray-600 text-sm">
                    <a href={`mailto:${district.contactInfo.email}`} className="hover:text-construction-blue">
                      {district.contactInfo.email}
                    </a>
                  </div>
                )}
                
                {district.requirements && district.requirements.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {district.requirements.map((req: string, reqIndex: number) => (
                        <li key={reqIndex}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}