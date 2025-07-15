/**
 * Smart Notifications Service
 * Intelligent notification system with adaptive delivery and priority management
 */

import { PrismaClient } from '@prisma/client'
import { createPredictiveAnalyticsService } from './predictive-analytics-service'

interface SmartNotification {
  id: string
  type: 'ALERT' | 'REMINDER' | 'INSIGHT' | 'UPDATE' | 'WARNING' | 'SUCCESS'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  title: string
  message: string
  data?: any
  channels: NotificationChannel[]
  scheduledFor: Date
  deliveredAt?: Date
  readAt?: Date
  actionTaken?: boolean
  userId: string
  projectId?: string
  category: string
  tags: string[]
  expiresAt: Date
  retryCount: number
  maxRetries: number
}

interface NotificationChannel {
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP' | 'SLACK' | 'TEAMS'
  address: string
  enabled: boolean
  preferences: {
    quietHours: { start: string; end: string }
    frequency: 'IMMEDIATE' | 'BATCHED' | 'DAILY_DIGEST' | 'WEEKLY_DIGEST'
    categories: string[]
  }
}

interface NotificationRule {
  id: string
  name: string
  condition: string
  trigger: 'SCHEDULE' | 'EVENT' | 'THRESHOLD' | 'PATTERN'
  enabled: boolean
  template: {
    title: string
    message: string
    priority: SmartNotification['priority']
    channels: string[]
  }
  schedule?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
    time: string
    daysOfWeek?: number[]
  }
  threshold?: {
    metric: string
    operator: '>' | '<' | '=' | '>=' | '<='
    value: number
  }
}

interface DeliveryMetrics {
  sent: number
  delivered: number
  read: number
  actionTaken: number
  deliveryRate: number
  readRate: number
  actionRate: number
}

export class SmartNotificationsService {
  private prisma: PrismaClient
  private analyticsService: any

  constructor() {
    this.prisma = new PrismaClient()
    this.analyticsService = createPredictiveAnalyticsService()
  }

  /**
   * Send intelligent notification with adaptive delivery
   */
  async sendSmartNotification(
    notification: Omit<SmartNotification, 'id' | 'deliveredAt' | 'readAt' | 'retryCount'>
  ): Promise<{
    notificationId: string
    deliveryResults: Array<{
      channel: string
      status: 'sent' | 'failed' | 'queued'
      message?: string
    }>
  }> {
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Apply intelligent scheduling
      const optimizedSchedule = await this.optimizeDeliveryTime(notification)
      
      // Filter channels based on user preferences and context
      const activeChannels = await this.filterChannels(notification.channels, notification)
      
      // Create notification record
      const smartNotification: SmartNotification = {
        ...notification,
        id: notificationId,
        scheduledFor: optimizedSchedule,
        retryCount: 0,
        channels: activeChannels
      }

      // Store notification
      await this.storeNotification(smartNotification)

      // Immediate delivery or schedule for later
      const deliveryResults = await this.deliverNotification(smartNotification)

      return {
        notificationId,
        deliveryResults
      }
    } catch (error) {
      console.error('Smart notification failed:', error)
      throw new Error(`Failed to send notification: ${error.message}`)
    }
  }

  /**
   * Process predictive insights and generate notifications
   */
  async processInsightsNotifications(projectId: string): Promise<{
    generated: number
    insights: Array<{
      type: string
      priority: string
      notification: SmartNotification
    }>
  }> {
    try {
      const insights = await this.analyticsService.generateProjectInsights(projectId)
      const notifications: SmartNotification[] = []

      // Process each insight type
      for (const insight of insights.insights) {
        const notification = await this.createInsightNotification(insight, projectId)
        notifications.push(notification)
        await this.sendSmartNotification(notification)
      }

      // Weather impact notifications
      const weatherImpact = await this.analyticsService.analyzeWeatherImpact(projectId, 7)
      if (weatherImpact.delayRisk > 0.3) {
        const weatherNotification = await this.createWeatherNotification(weatherImpact, projectId)
        notifications.push(weatherNotification)
        await this.sendSmartNotification(weatherNotification)
      }

      return {
        generated: notifications.length,
        insights: notifications.map(notif => ({
          type: notif.type,
          priority: notif.priority,
          notification: notif
        }))
      }
    } catch (error) {
      console.error('Insights notification processing failed:', error)
      throw new Error(`Failed to process insights: ${error.message}`)
    }
  }

  /**
   * Manage notification rules and automation
   */
  async manageNotificationRules(
    userId: string,
    action: 'create' | 'update' | 'delete' | 'list',
    rule?: Partial<NotificationRule>
  ): Promise<{
    rules: NotificationRule[]
    action: string
    success: boolean
  }> {
    try {
      switch (action) {
        case 'create':
          if (!rule) throw new Error('Rule data required for creation')
          const newRule = await this.createNotificationRule(userId, rule)
          return { rules: [newRule], action: 'created', success: true }

        case 'update':
          if (!rule || !rule.id) throw new Error('Rule ID required for update')
          const updatedRule = await this.updateNotificationRule(rule.id, rule)
          return { rules: [updatedRule], action: 'updated', success: true }

        case 'delete':
          if (!rule || !rule.id) throw new Error('Rule ID required for deletion')
          await this.deleteNotificationRule(rule.id)
          return { rules: [], action: 'deleted', success: true }

        case 'list':
        default:
          const userRules = await this.getUserNotificationRules(userId)
          return { rules: userRules, action: 'listed', success: true }
      }
    } catch (error) {
      console.error('Notification rule management failed:', error)
      throw new Error(`Failed to manage rules: ${error.message}`)
    }
  }

  /**
   * Get notification analytics and metrics
   */
  async getNotificationMetrics(
    userId: string,
    timeframe: 'day' | 'week' | 'month' = 'week'
  ): Promise<{
    overview: DeliveryMetrics
    byChannel: Record<string, DeliveryMetrics>
    byCategory: Record<string, DeliveryMetrics>
    trends: Array<{
      date: string
      sent: number
      read: number
      actionTaken: number
    }>
    topCategories: Array<{
      category: string
      count: number
      readRate: number
    }>
  }> {
    try {
      const timeframeHours = timeframe === 'day' ? 24 : timeframe === 'week' ? 168 : 720
      const startDate = new Date(Date.now() - timeframeHours * 60 * 60 * 1000)

      const notifications = await this.getUserNotifications(userId, startDate)

      const overview = this.calculateMetrics(notifications)
      const byChannel = this.calculateMetricsByChannel(notifications)
      const byCategory = this.calculateMetricsByCategory(notifications)
      const trends = this.calculateTrends(notifications, timeframe)
      const topCategories = this.getTopCategories(notifications)

      return {
        overview,
        byChannel,
        byCategory,
        trends,
        topCategories
      }
    } catch (error) {
      console.error('Notification metrics failed:', error)
      throw new Error(`Failed to get metrics: ${error.message}`)
    }
  }

  /**
   * Intelligent notification batching and digest
   */
  async generateDigest(
    userId: string,
    digestType: 'daily' | 'weekly',
    categories?: string[]
  ): Promise<{
    digest: {
      summary: string
      notifications: SmartNotification[]
      insights: string[]
      actions: Array<{
        title: string
        description: string
        priority: string
        dueDate: Date
      }>
    }
    deliverySchedule: Date
  }> {
    try {
      const timeframeHours = digestType === 'daily' ? 24 : 168
      const startDate = new Date(Date.now() - timeframeHours * 60 * 60 * 1000)

      let notifications = await this.getUserNotifications(userId, startDate)
      
      if (categories) {
        notifications = notifications.filter(n => categories.includes(n.category))
      }

      // Group by priority and category
      const highPriority = notifications.filter(n => n.priority === 'HIGH' || n.priority === 'URGENT')
      const insights = notifications.filter(n => n.type === 'INSIGHT')

      // Generate summary
      const summary = this.generateDigestSummary(notifications, digestType)

      // Extract actionable items
      const actions = await this.extractActionableItems(notifications)

      // Schedule delivery based on user preferences
      const deliverySchedule = await this.getOptimalDigestTime(userId, digestType)

      return {
        digest: {
          summary,
          notifications: [...highPriority, ...insights.slice(0, 5)],
          insights: insights.map(i => i.message),
          actions
        },
        deliverySchedule
      }
    } catch (error) {
      console.error('Digest generation failed:', error)
      throw new Error(`Failed to generate digest: ${error.message}`)
    }
  }

  // Private helper methods
  private async optimizeDeliveryTime(notification: Partial<SmartNotification>): Promise<Date> {
    // Intelligent scheduling based on priority, user preferences, and context
    if (notification.priority === 'URGENT') {
      return new Date() // Immediate delivery
    }

    if (notification.priority === 'HIGH') {
      return new Date(Date.now() + 5 * 60 * 1000) // 5 minutes delay
    }

    // For medium/low priority, consider user's active hours
    const now = new Date()
    const hour = now.getHours()

    // Business hours (8 AM - 6 PM)
    if (hour >= 8 && hour <= 18) {
      return new Date(Date.now() + 15 * 60 * 1000) // 15 minutes delay
    }

    // Outside business hours, schedule for next morning
    const nextMorning = new Date(now)
    nextMorning.setDate(now.getDate() + (hour >= 18 ? 0 : 1))
    nextMorning.setHours(8, 0, 0, 0)

    return nextMorning
  }

  private async filterChannels(
    channels: NotificationChannel[],
    notification: Partial<SmartNotification>
  ): Promise<NotificationChannel[]> {
    return channels.filter(channel => {
      // Check if channel is enabled
      if (!channel.enabled) return false

      // Check quiet hours
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5)
      const quietStart = channel.preferences.quietHours.start
      const quietEnd = channel.preferences.quietHours.end

      if (currentTime >= quietStart && currentTime <= quietEnd) {
        // Only urgent notifications during quiet hours
        return notification.priority === 'URGENT'
      }

      // Check category preferences
      if (notification.category && !channel.preferences.categories.includes(notification.category)) {
        return false
      }

      return true
    })
  }

  private async deliverNotification(notification: SmartNotification): Promise<Array<{
    channel: string
    status: 'sent' | 'failed' | 'queued'
    message?: string
  }>> {
    const results = []

    for (const channel of notification.channels) {
      try {
        const result = await this.deliverToChannel(notification, channel)
        results.push({
          channel: channel.type,
          status: result.success ? 'sent' : 'failed',
          message: result.message
        })
      } catch (error) {
        results.push({
          channel: channel.type,
          status: 'failed',
          message: error.message
        })
      }
    }

    return results
  }

  private async deliverToChannel(
    notification: SmartNotification,
    channel: NotificationChannel
  ): Promise<{ success: boolean; message?: string }> {
    // Mock implementation - would integrate with actual notification services
    console.log(`[MOCK] Delivering ${notification.type} notification via ${channel.type} to ${channel.address}`)
    console.log(`Title: ${notification.title}`)
    console.log(`Message: ${notification.message}`)

    // Simulate delivery delay
    await new Promise(resolve => setTimeout(resolve, 100))

    return { success: true, message: 'Delivered successfully' }
  }

  private async storeNotification(notification: SmartNotification): Promise<void> {
    // Store in database - mock implementation
    console.log(`[MOCK] Storing notification ${notification.id} in database`)
  }

  private async createInsightNotification(
    insight: any,
    projectId: string
  ): Promise<SmartNotification> {
    return {
      id: `insight_${insight.id}`,
      type: 'INSIGHT',
      priority: insight.priority,
      title: insight.title,
      message: insight.description,
      data: insight,
      channels: [], // Would be populated based on user preferences
      scheduledFor: new Date(),
      userId: 'current_user', // Would be determined from context
      projectId,
      category: 'PROJECT_INSIGHTS',
      tags: ['analytics', 'prediction', insight.type.toLowerCase()],
      expiresAt: insight.expiresAt,
      retryCount: 0,
      maxRetries: 3
    }
  }

  private async createWeatherNotification(
    weatherImpact: any,
    projectId: string
  ): Promise<SmartNotification> {
    return {
      id: `weather_${Date.now()}`,
      type: 'WARNING',
      priority: weatherImpact.delayRisk > 0.5 ? 'HIGH' : 'MEDIUM',
      title: 'Weather Impact Alert',
      message: `Weather conditions may impact project timeline. ${weatherImpact.workableDays} workable days in next 14 days.`,
      data: weatherImpact,
      channels: [],
      scheduledFor: new Date(),
      userId: 'current_user',
      projectId,
      category: 'WEATHER_ALERTS',
      tags: ['weather', 'schedule', 'risk'],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      retryCount: 0,
      maxRetries: 2
    }
  }

  private async createNotificationRule(
    userId: string,
    rule: Partial<NotificationRule>
  ): Promise<NotificationRule> {
    const newRule: NotificationRule = {
      id: `rule_${Date.now()}`,
      name: rule.name || 'New Rule',
      condition: rule.condition || '',
      trigger: rule.trigger || 'EVENT',
      enabled: rule.enabled !== undefined ? rule.enabled : true,
      template: rule.template || {
        title: 'Notification',
        message: 'Default message',
        priority: 'MEDIUM',
        channels: ['IN_APP']
      },
      schedule: rule.schedule,
      threshold: rule.threshold
    }

    // Store rule in database (mock)
    console.log(`[MOCK] Creating notification rule ${newRule.id} for user ${userId}`)

    return newRule
  }

  private async updateNotificationRule(
    ruleId: string,
    updates: Partial<NotificationRule>
  ): Promise<NotificationRule> {
    // Mock implementation
    console.log(`[MOCK] Updating notification rule ${ruleId}`)
    return { ...updates, id: ruleId } as NotificationRule
  }

  private async deleteNotificationRule(ruleId: string): Promise<void> {
    console.log(`[MOCK] Deleting notification rule ${ruleId}`)
  }

  private async getUserNotificationRules(userId: string): Promise<NotificationRule[]> {
    // Mock implementation
    return [
      {
        id: 'rule_1',
        name: 'Budget Alerts',
        condition: 'budget_variance > 0.1',
        trigger: 'THRESHOLD',
        enabled: true,
        template: {
          title: 'Budget Alert',
          message: 'Project budget variance detected',
          priority: 'HIGH',
          channels: ['EMAIL', 'IN_APP']
        },
        threshold: {
          metric: 'budget_variance',
          operator: '>',
          value: 0.1
        }
      }
    ]
  }

  private async getUserNotifications(
    userId: string,
    since: Date
  ): Promise<SmartNotification[]> {
    // Mock implementation
    return []
  }

  private calculateMetrics(notifications: SmartNotification[]): DeliveryMetrics {
    const sent = notifications.length
    const delivered = notifications.filter(n => n.deliveredAt).length
    const read = notifications.filter(n => n.readAt).length
    const actionTaken = notifications.filter(n => n.actionTaken).length

    return {
      sent,
      delivered,
      read,
      actionTaken,
      deliveryRate: sent > 0 ? delivered / sent : 0,
      readRate: delivered > 0 ? read / delivered : 0,
      actionRate: read > 0 ? actionTaken / read : 0
    }
  }

  private calculateMetricsByChannel(notifications: SmartNotification[]): Record<string, DeliveryMetrics> {
    const channels: Record<string, SmartNotification[]> = {}
    
    notifications.forEach(notif => {
      notif.channels.forEach(channel => {
        if (!channels[channel.type]) channels[channel.type] = []
        channels[channel.type].push(notif)
      })
    })

    const result: Record<string, DeliveryMetrics> = {}
    Object.entries(channels).forEach(([channel, notifs]) => {
      result[channel] = this.calculateMetrics(notifs)
    })

    return result
  }

  private calculateMetricsByCategory(notifications: SmartNotification[]): Record<string, DeliveryMetrics> {
    const categories: Record<string, SmartNotification[]> = {}
    
    notifications.forEach(notif => {
      if (!categories[notif.category]) categories[notif.category] = []
      categories[notif.category].push(notif)
    })

    const result: Record<string, DeliveryMetrics> = {}
    Object.entries(categories).forEach(([category, notifs]) => {
      result[category] = this.calculateMetrics(notifs)
    })

    return result
  }

  private calculateTrends(
    notifications: SmartNotification[],
    timeframe: string
  ): Array<{ date: string; sent: number; read: number; actionTaken: number }> {
    // Mock implementation
    return [
      { date: '2025-07-06', sent: 15, read: 12, actionTaken: 8 },
      { date: '2025-07-07', sent: 18, read: 14, actionTaken: 9 },
      { date: '2025-07-08', sent: 12, read: 10, actionTaken: 6 }
    ]
  }

  private getTopCategories(notifications: SmartNotification[]): Array<{
    category: string
    count: number
    readRate: number
  }> {
    const categories: Record<string, { count: number; read: number }> = {}
    
    notifications.forEach(notif => {
      if (!categories[notif.category]) {
        categories[notif.category] = { count: 0, read: 0 }
      }
      categories[notif.category].count++
      if (notif.readAt) categories[notif.category].read++
    })

    return Object.entries(categories).map(([category, data]) => ({
      category,
      count: data.count,
      readRate: data.count > 0 ? data.read / data.count : 0
    })).sort((a, b) => b.count - a.count)
  }

  private generateDigestSummary(
    notifications: SmartNotification[],
    digestType: string
  ): string {
    const total = notifications.length
    const urgent = notifications.filter(n => n.priority === 'URGENT').length
    const insights = notifications.filter(n => n.type === 'INSIGHT').length

    return `${digestType === 'daily' ? 'Daily' : 'Weekly'} digest: ${total} notifications including ${urgent} urgent alerts and ${insights} insights.`
  }

  private async extractActionableItems(notifications: SmartNotification[]): Promise<Array<{
    title: string
    description: string
    priority: string
    dueDate: Date
  }>> {
    return notifications
      .filter(n => n.type === 'ALERT' || n.type === 'WARNING')
      .map(n => ({
        title: n.title,
        description: n.message,
        priority: n.priority,
        dueDate: n.expiresAt
      }))
  }

  private async getOptimalDigestTime(
    userId: string,
    digestType: string
  ): Promise<Date> {
    // Mock implementation - would use user preferences
    const now = new Date()
    const deliveryTime = new Date(now)
    
    if (digestType === 'daily') {
      deliveryTime.setHours(8, 0, 0, 0) // 8 AM daily
      if (deliveryTime <= now) {
        deliveryTime.setDate(deliveryTime.getDate() + 1)
      }
    } else {
      // Weekly digest on Monday 8 AM
      const daysUntilMonday = (1 - now.getDay() + 7) % 7
      deliveryTime.setDate(now.getDate() + daysUntilMonday)
      deliveryTime.setHours(8, 0, 0, 0)
    }

    return deliveryTime
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect()
    await this.analyticsService.disconnect()
  }
}

// Factory function
export function createSmartNotificationsService(): SmartNotificationsService {
  return new SmartNotificationsService()
}