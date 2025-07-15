"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Search, Github, Calendar, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react"

interface DashboardProps {
  className?: string
}

const Dashboard = React.forwardRef<HTMLDivElement, DashboardProps>(
  ({ className, ...props }, ref) => {
    const [selectedTheme, setSelectedTheme] = React.useState("Orange")
    const [goalValue, setGoalValue] = React.useState(350)
    const [selectedDate, setSelectedDate] = React.useState(new Date())

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

    const calendarDays = React.useMemo(() => {
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDayOfWeek = firstDay.getDay()
      
      const days = []
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null)
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day)
      }
      
      return days
    }, [selectedDate])

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]

    const navigateMonth = (direction: 'prev' | 'next') => {
      setSelectedDate(prev => {
        const newDate = new Date(prev)
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else {
          newDate.setMonth(newDate.getMonth() + 1)
        }
        return newDate
      })
    }

    const barChartData = [
      { day: 'M', value: 80 },
      { day: 'T', value: 95 },
      { day: 'W', value: 60 },
      { day: 'T', value: 90 },
      { day: 'F', value: 85 },
      { day: 'S', value: 70 },
      { day: 'S', value: 75 },
    ]

    const exerciseData = [
      { day: 'Mon', value: 45 },
      { day: 'Tue', value: 30 },
      { day: 'Wed', value: 65 },
      { day: 'Thu', value: 55 },
      { day: 'Fri', value: 40 },
      { day: 'Sat', value: 50 },
      { day: 'Sun', value: 48 },
    ]

    const payments = [
      { status: 'Success', email: 'ken99@example.com', amount: '$316.00' },
      { status: 'Success', email: 'abe45@example.com', amount: '$242.00' },
      { status: 'Processing', email: 'monserrat44@example.com', amount: '$837.00' },
      { status: 'Failed', email: 'carmela@example.com', amount: '$721.00' },
    ]

    return (
      <div ref={ref} className={cn("min-h-screen bg-gray-50", className)} {...props}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1">
                <span className="text-xl font-semibold">⚡</span>
              </div>
              <nav className="flex items-center space-x-6">
                <a href="#" className="text-sm font-medium text-gray-900">Docs</a>
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Components</a>
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Blocks</a>
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Charts</a>
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Themes</a>
                <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">Colors</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search documentation..."
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Ctrl</span>
                <span>K</span>
              </div>
              <Button variant="ghost" size="sm">
                <Github className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">90.1k</span>
                <Button variant="ghost" size="sm">
                  <span className="text-sm">⚙️</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-6 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <Badge variant="outline" className="mb-4">
                New Calendar Component →
              </Badge>
            </div>
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
                  onClick={() => setSelectedTheme(theme.name)}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    selectedTheme === theme.name
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              Copy Code
            </Button>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Revenue Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-2">$15,231.89</div>
                  <p className="text-sm text-gray-600">+20.1% from last month</p>
                  <div className="mt-4 h-12">
                    <svg viewBox="0 0 400 80" className="w-full h-full">
                      <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        points="0,60 50,50 100,45 150,40 200,50 250,35 300,30 350,25 400,20"
                      />
                      <circle cx="400" cy="20" r="3" fill="#f97316" />
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Subscriptions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-2">+2,350</div>
                  <p className="text-sm text-gray-600">+180.1% from last month</p>
                  <div className="mt-4 h-12">
                    <svg viewBox="0 0 400 80" className="w-full h-full">
                      <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        points="0,70 50,65 100,60 150,55 200,65 250,45 300,35 350,30 400,25"
                      />
                      <circle cx="400" cy="25" r="3" fill="#f97316" />
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Upgrade your subscription
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    You are currently on the free plan. Upgrade to the pro plan to get access to all features.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Full Name" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" placeholder="example@acme.com" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="card">Card Number</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="1234 1234 1234 1234" className="col-span-2" />
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="MM/YY" />
                        <Input placeholder="CVC" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Plan</Label>
                    <p className="text-sm text-gray-600 mb-2">Select the plan that best fits your needs.</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-3 border border-orange-200 rounded-lg bg-orange-50">
                        <div className="h-4 w-4 rounded-full border-2 border-orange-500 bg-white flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                        </div>
                        <div>
                          <p className="font-medium">Starter Plan</p>
                          <p className="text-sm text-gray-600">Perfect for small businesses</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg">
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300 bg-white"></div>
                        <div>
                          <p className="font-medium">Pro Plan</p>
                          <p className="text-sm text-gray-600">More features and storage</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <textarea
                      className="w-full p-2 border border-gray-200 rounded-md resize-none"
                      rows={3}
                      placeholder="Enter notes"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="terms" className="rounded" />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the terms and conditions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="emails" className="rounded" />
                    <Label htmlFor="emails" className="text-sm">
                      Allow us to send you emails
                    </Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      View More
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">
                        {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => (
                      <div
                        key={index}
                        className={cn(
                          "text-center text-sm py-2 cursor-pointer rounded",
                          day === null
                            ? "text-gray-300"
                            : day === 5
                            ? "bg-orange-600 text-white"
                            : "text-gray-900 hover:bg-gray-100"
                        )}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Create Account */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Create an account
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Enter your email below to create your account
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Github className="h-4 w-4" />
                      <span>Github</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Google</span>
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" placeholder="m@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" />
                  </div>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Create account
                  </Button>
                </CardContent>
              </Card>

              {/* Chat */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">SD</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sofia Davis</p>
                      <p className="text-xs text-gray-500">m@example.com</p>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm">Hi, how can I help you today?</p>
                    <div className="bg-orange-600 text-white text-sm p-3 rounded-lg">
                      Hey, I'm having trouble with my account.
                    </div>
                    <p className="text-sm">What seems to be the problem?</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Move Goal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Move Goal</CardTitle>
                  <p className="text-sm text-gray-600">Set your daily activity goal.</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setGoalValue(Math.max(0, goalValue - 10))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{goalValue}</div>
                      <div className="text-sm text-gray-600">CALORIES/DAY</div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setGoalValue(goalValue + 10)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-end justify-between space-x-1 mb-4 h-20">
                    {barChartData.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-orange-500 rounded-sm mb-1"
                          style={{ height: `${item.value}%` }}
                        />
                        <span className="text-xs text-gray-600">{item.day}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800">
                    Set Goal
                  </Button>
                </CardContent>
              </Card>

              {/* Exercise Minutes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Exercise Minutes</CardTitle>
                  <p className="text-sm text-gray-600">
                    Your exercise minutes are ahead of where you normally are.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-24 mb-4">
                    <svg viewBox="0 0 350 80" className="w-full h-full">
                      <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        points="0,60 50,70 100,30 150,40 200,65 250,50 300,45 350,50"
                      />
                      <polyline
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                        strokeOpacity="0.5"
                        points="0,70 50,65 100,60 150,55 200,60 250,58 300,55 350,52"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    {exerciseData.map((item, index) => (
                      <span key={index}>{item.day}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payments */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Payments</CardTitle>
                    <Button variant="outline" size="sm">
                      Add Payment
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">Manage your payments.</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                      <span>Status</span>
                      <span>Email</span>
                      <span>Amount</span>
                    </div>
                    {payments.map((payment, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 items-center text-sm">
                        <Badge
                          variant={
                            payment.status === 'Success' ? 'default' :
                            payment.status === 'Processing' ? 'secondary' : 'destructive'
                          }
                          className={cn(
                            payment.status === 'Success' && 'bg-green-100 text-green-800',
                            payment.status === 'Processing' && 'bg-blue-100 text-blue-800',
                            payment.status === 'Failed' && 'bg-red-100 text-red-800'
                          )}
                        >
                          {payment.status}
                        </Badge>
                        <span className="text-gray-600">{payment.email}</span>
                        <span className="font-medium">{payment.amount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

Dashboard.displayName = "Dashboard"

export { Dashboard }