import React from 'react'
import MobileLayout from '@/components/mobile/MobileLayout'
import QuickActions from '@/components/mobile/QuickActions'

export default function MobileTasksPage() {
  return (
    <MobileLayout title="Quick Actions" activeTab="tasks">
      <div className="p-4">
        <QuickActions />
      </div>
    </MobileLayout>
  )
}