"use client"

import React from 'react'
import Link from 'next/link'
import { 
  Home, 
  Smartphone, 
  Monitor, 
  BarChart3, 
  Users, 
  FileText, 
  Settings,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  Search,
  Github
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AppHeader } from '@/components/ui/app-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Predictive Analytics",
      description: "AI-powered insights for budget forecasting, weather impact, and schedule optimization"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Job Site",
      description: "Glove-friendly interface for field crews with offline capability and real-time updates"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Texas Compliance",
      description: "Liberty Hill municipal integration with automated permit and inspection management"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Smart Automation",
      description: "Gmail integration, vendor research, and intelligent notification management"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Memory Bank Integration",
      description: "Seamless compatibility with existing Memory Bank data and workflows"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Crew Management",
      description: "Real-time crew tracking, task assignment, and communication tools"
    }
  ]

  const stats = [
    { number: "350K+", label: "Projects Managed" },
    { number: "98%", label: "Uptime Reliability" },
    { number: "45%", label: "Time Savings" },
    { number: "24/7", label: "Support Available" }
  ]

  const themes = [
    { name: "Default", color: "bg-gray-500" },
    { name: "Red", color: "bg-red-500" },
    { name: "Rose", color: "bg-rose-500" },
    { name: "Orange", color: "bg-orange-500" },
    { name: "Green", color: "bg-green-500" },
    { name: "Blue", color: "bg-blue-500" },
    { name: "Yellow", color: "bg-yellow-500" },
    { name: "Violet", color: "bg-violet-500" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      {/* Hero Section - Dashboard Style */}
      <section className="px-6 py-8">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            New Home Builder Platform →
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pick a Color. Make it yours.
          </h1>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Try our hand-picked themes. Copy and paste them into your project. New theme editor coming soon.
          </p>
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Button className="bg-black text-white hover:bg-gray-800">
              Browse Themes
            </Button>
            <Button variant="outline">
              Documentation
            </Button>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            {themes.map((theme) => (
              <button
                key={theme.name}
                className="text-sm font-medium text-orange-600 transition-colors"
              >
                {theme.name}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            Copy Code
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Dashboard Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Desktop Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Comprehensive construction management with analytics, scheduling, and compliance tools.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Multi-panel analytics dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Predictive insights and forecasting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Texas compliance management</span>
                </div>
              </div>
              <Link href="/dashboard">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Launch Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Mobile Job Site
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Field-optimized interface for crews with offline capability and real-time updates.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Glove-friendly touch interface</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Offline capability with sync</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Real-time crew management</span>
                </div>
              </div>
              <Link href="/mobile">
                <Button variant="outline" className="w-full">
                  Open Mobile Site
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Builders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for Texas home builders, 
              combining proven workflows with cutting-edge technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interface Preview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access your projects from anywhere with our desktop command center 
              or mobile job site interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Desktop Preview */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <Monitor className="w-8 h-8 text-blue-400" />
                  <h3 className="text-2xl font-bold">Desktop Command Center</h3>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Multi-panel analytics dashboard</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Predictive insights and forecasting</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Texas compliance management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>Vendor research and communication</span>
                  </div>
                </div>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Launch Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Mobile Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl p-8 text-white">
                <div className="flex items-center space-x-3 mb-6">
                  <Smartphone className="w-8 h-8 text-white" />
                  <h3 className="text-2xl font-bold">Mobile Job Site</h3>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-white opacity-90" />
                    <span>Glove-friendly touch interface</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-white opacity-90" />
                    <span>Offline capability with sync</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-white opacity-90" />
                    <span>Quick actions and voice notes</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-white opacity-90" />
                    <span>Real-time crew management</span>
                  </div>
                </div>
                <Link href="/mobile">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border border-white border-opacity-30"
                  >
                    <span>Open Mobile Site</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CLI Tools Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful CLI Tools
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Access advanced features through comprehensive command-line tools 
              for automation, analytics, and system management.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "Texas Compliance", 
                command: "npm run texas-compliance",
                description: "Permit tracking, inspections, Liberty Hill integration"
              },
              { 
                title: "Predictive Analytics", 
                command: "npm run analytics",
                description: "AI insights, weather analysis, budget optimization"
              },
              { 
                title: "Vendor Research", 
                command: "npm run vendor-research",
                description: "AI-powered vendor discovery and material research"
              },
              { 
                title: "Memory Bank", 
                command: "npm run memory-bank",
                description: "Data import/export and synchronization"
              }
            ].map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <h3 className="text-lg font-bold mb-3">{tool.title}</h3>
                <code className="text-sm text-green-400 bg-gray-900 px-3 py-2 rounded block mb-3">
                  {tool.command}
                </code>
                <p className="text-gray-400 text-sm">{tool.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Construction Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join the next generation of home builders using AI-powered tools 
              and intelligent automation to build better, faster, and smarter.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Get Started Now
                </motion.button>
              </Link>
              
              <Link href="/mobile">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
                >
                  Try Mobile Interface
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage