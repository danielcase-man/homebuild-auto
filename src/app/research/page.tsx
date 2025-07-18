import { ResearchPanel } from '@/components/research/ResearchPanel'

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Construction Research
          </h1>
          <p className="text-gray-600">
            Get comprehensive research data for your construction project using AI-powered analysis
          </p>
        </div>
        
        <ResearchPanel />
      </div>
    </div>
  )
}