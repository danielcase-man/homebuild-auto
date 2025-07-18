"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Building, 
  Users, 
  FileText, 
  Loader2, 
  CheckCircle,
  ExternalLink,
  Phone,
  Mail
} from 'lucide-react'

interface ResearchData {
  lenders?: any[]
  regulations?: any
  vendors?: any[]
  loading?: boolean
  error?: string
}

export function ResearchPanel() {
  const [projectData, setProjectData] = useState({
    location: '',
    projectType: 'Custom home construction',
    builderType: 'Owner-builder',
    budget: '',
    timeline: '',
    services: ''
  })
  
  const [research, setResearch] = useState<ResearchData>({})
  const [activeTab, setActiveTab] = useState('lenders')

  const handleResearch = async (type: 'lenders' | 'regulations' | 'vendors') => {
    setResearch(prev => ({ ...prev, loading: true, error: undefined }))
    
    try {
      const endpoint = `/api/research/${type}`
      const payload = type === 'regulations' 
        ? { location: projectData.location, projectType: projectData.projectType }
        : type === 'vendors'
        ? { location: projectData.location, services: projectData.services, projectType: projectData.projectType }
        : projectData
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (result.success) {
        setResearch(prev => ({ 
          ...prev, 
          [type]: result.data.structuredData,
          loading: false 
        }))
      } else {
        setResearch(prev => ({ 
          ...prev, 
          error: result.error || 'Research failed',
          loading: false 
        }))
      }
    } catch (error) {
      setResearch(prev => ({ 
        ...prev, 
        error: 'Network error occurred',
        loading: false 
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Project Information
          </CardTitle>
          <CardDescription>
            Enter your project details to get targeted research results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="City, State"
                value={projectData.location}
                onChange={(e) => setProjectData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="projectType">Project Type</Label>
              <Input
                id="projectType"
                placeholder="Custom home construction"
                value={projectData.projectType}
                onChange={(e) => setProjectData(prev => ({ ...prev, projectType: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="builderType">Builder Type</Label>
              <Input
                id="builderType"
                placeholder="Owner-builder"
                value={projectData.builderType}
                onChange={(e) => setProjectData(prev => ({ ...prev, builderType: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <Input
                id="budget"
                placeholder="$500,000"
                value={projectData.budget}
                onChange={(e) => setProjectData(prev => ({ ...prev, budget: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="services">Services Needed (for vendor research)</Label>
            <Textarea
              id="services"
              placeholder="General contracting, excavation, concrete work, framing..."
              value={projectData.services}
              onChange={(e) => setProjectData(prev => ({ ...prev, services: e.target.value }))}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Research Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            AI Research Results
          </CardTitle>
          <CardDescription>
            Get comprehensive research data for your construction project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lenders" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Lenders
              </TabsTrigger>
              <TabsTrigger value="regulations" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Regulations
              </TabsTrigger>
              <TabsTrigger value="vendors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Vendors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="lenders" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => handleResearch('lenders')}
                  disabled={!projectData.location || research.loading}
                  className="flex items-center gap-2"
                >
                  {research.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Research Lenders
                </Button>
                {research.lenders && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {research.lenders.length} lenders found
                  </Badge>
                )}
              </div>
              
              {research.lenders && (
                <div className="space-y-3">
                  {research.lenders.map((lender, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{lender.name}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            {lender.contact?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {lender.contact.phone}
                              </span>
                            )}
                            {lender.contact?.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {lender.contact.email}
                              </span>
                            )}
                            {lender.contact?.website && (
                              <a 
                                href={lender.contact.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Website
                              </a>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {lender.features?.map((feature: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        {lender.content?.slice(0, 200)}...
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="regulations" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => handleResearch('regulations')}
                  disabled={!projectData.location || research.loading}
                  className="flex items-center gap-2"
                >
                  {research.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Research Regulations
                </Button>
                {research.regulations && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Research completed
                  </Badge>
                )}
              </div>
              
              {research.regulations && (
                <div className="space-y-3">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Building Codes</h4>
                    <div className="text-sm space-y-1">
                      {research.regulations.buildingCodes?.map((code: string, index: number) => (
                        <p key={index}>{code}</p>
                      ))}
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h4 className="font-semibold mb-2">Permits & Inspections</h4>
                    <div className="text-sm space-y-1">
                      {research.regulations.permits?.map((permit: string, index: number) => (
                        <p key={index}>{permit}</p>
                      ))}
                    </div>
                  </Card>
                  
                  {research.regulations.contact && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-2">Contact Information</h4>
                      <div className="text-sm space-y-1">
                        {research.regulations.contact.department && (
                          <p><strong>Department:</strong> {research.regulations.contact.department}</p>
                        )}
                        {research.regulations.contact.phone && (
                          <p><strong>Phone:</strong> {research.regulations.contact.phone}</p>
                        )}
                        {research.regulations.contact.email && (
                          <p><strong>Email:</strong> {research.regulations.contact.email}</p>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="vendors" className="space-y-4">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => handleResearch('vendors')}
                  disabled={!projectData.location || research.loading}
                  className="flex items-center gap-2"
                >
                  {research.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Research Vendors
                </Button>
                {research.vendors && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {research.vendors.length} vendors found
                  </Badge>
                )}
              </div>
              
              {research.vendors && (
                <div className="space-y-3">
                  {research.vendors.map((vendor, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{vendor.name}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            {vendor.contact?.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {vendor.contact.phone}
                              </span>
                            )}
                            {vendor.contact?.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {vendor.contact.email}
                              </span>
                            )}
                            {vendor.contact?.website && (
                              <a 
                                href={vendor.contact.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Website
                              </a>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {vendor.services?.map((service: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                          {vendor.serviceArea && (
                            <p className="mt-2 text-sm text-gray-600">
                              Service Area: {vendor.serviceArea}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        {vendor.content?.slice(0, 200)}...
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {research.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{research.error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}