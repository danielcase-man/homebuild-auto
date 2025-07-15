"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  CheckCircle, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectMetricsProps {
  metrics: {
    total: number
    active: number
    completed: number
    overdue: number
    totalBudget: number
    totalActual: number
  }
}

export const ProjectMetrics: React.FC<ProjectMetricsProps> = ({ metrics }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }

  const getBudgetVariance = () => {
    if (metrics.totalBudget === 0) return { amount: 0, percentage: 0, type: 'neutral' }
    
    const variance = metrics.totalActual - metrics.totalBudget
    const percentage = (variance / metrics.totalBudget) * 100
    
    return {
      amount: Math.abs(variance),
      percentage: Math.abs(percentage),
      type: variance > 0 ? 'over' : variance < 0 ? 'under' : 'neutral'
    }
  }

  const budgetVariance = getBudgetVariance()

  const metricCards = [
    {
      title: 'Total Projects',
      value: metrics.total,
      icon: Building2,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      subtitle: `${metrics.active} active`
    },
    {
      title: 'Completed',
      value: metrics.completed,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      subtitle: `${formatPercentage(metrics.completed, metrics.total)}% completion rate`
    },
    {
      title: 'Overdue',
      value: metrics.overdue,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      subtitle: metrics.overdue > 0 ? 'Needs attention' : 'On track',
      alert: metrics.overdue > 0
    },
    {
      title: 'Total Budget',
      value: formatCurrency(metrics.totalBudget),
      icon: DollarSign,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      subtitle: `${formatCurrency(metrics.totalActual)} actual`,
      trend: budgetVariance.type !== 'neutral' ? budgetVariance : undefined
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={cn(
            "relative overflow-hidden rounded-lg border p-6 transition-all duration-200 hover:shadow-md",
            card.bgColor,
            card.alert ? "border-red-200" : "border-gray-200"
          )}
        >
          {/* Background Icon */}
          <div className="absolute -top-4 -right-4 opacity-10">
            <card.icon className="h-24 w-24" />
          </div>

          {/* Icon */}
          <div className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-lg mb-4",
            card.color
          )}>
            <card.icon className="h-6 w-6 text-white" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">
              {card.title}
            </h3>
            
            <div className="flex items-baseline space-x-2">
              <p className={cn("text-2xl font-bold", card.textColor)}>
                {card.value}
              </p>
              
              {card.trend && (
                <div className={cn(
                  "flex items-center text-xs font-medium",
                  card.trend.type === 'over' ? "text-red-600" : 
                  card.trend.type === 'under' ? "text-green-600" : "text-gray-600"
                )}>
                  {card.trend.type === 'over' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {card.trend.type === 'under' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {card.trend.type === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
                  
                  {card.trend.type === 'over' && `+${card.trend.percentage.toFixed(1)}%`}
                  {card.trend.type === 'under' && `-${card.trend.percentage.toFixed(1)}%`}
                  {card.trend.type === 'neutral' && 'On budget'}
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              {card.subtitle}
            </p>
          </div>

          {/* Alert Indicator */}
          {card.alert && (
            <div className="absolute top-2 right-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}