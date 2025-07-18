"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Search, Github, Settings, Menu } from "lucide-react"

interface AppHeaderProps {
  className?: string
  title?: string
  showSearch?: boolean
  navigation?: Array<{
    label: string
    href: string
    active?: boolean
  }>
}

const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>(
  ({ className, title = "Home Builder Pro", showSearch = true, navigation = [], ...props }, ref) => {
    const defaultNavigation = [
      { label: "Dashboard", href: "/dashboard", active: false },
      { label: "Scheduling", href: "/scheduling", active: false },
      { label: "Research", href: "/research", active: false },
      { label: "Mobile", href: "/mobile", active: false },
      { label: "Components", href: "/components", active: false },
      { label: "Design", href: "/design-dashboard", active: false },
    ]

    const navItems = navigation.length > 0 ? navigation : defaultNavigation

    return (
      <header ref={ref} className={cn("bg-white border-b border-gray-200 px-6 py-4", className)} {...props}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold text-orange-600">🏠</span>
              <span className="text-lg font-semibold text-gray-900">{title}</span>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    item.active
                      ? "text-orange-600"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64"
                />
              </div>
            )}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span>Ctrl</span>
              <span>K</span>
            </div>
            <Button variant="ghost" size="sm">
              <Github className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    )
  }
)

AppHeader.displayName = "AppHeader"

export { AppHeader }