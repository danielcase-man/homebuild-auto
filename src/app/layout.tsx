import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Home Builder Pro - Construction Management Platform",
  description: "Professional home building budgeting, scheduling, and project management application for construction companies.",
  keywords: "home builder, construction management, project budgeting, scheduling, building permits, contractor software",
  authors: [{ name: "Home Builder Pro Team" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-construction-blue to-construction-orange rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">HB</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Home Builder Pro</h1>
                    <p className="text-xs text-gray-500">Construction Management</p>
                  </div>
                </div>

                {/* Navigation Menu */}
                <nav className="hidden lg:flex space-x-8">
                  <a 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-construction-blue transition-colors font-medium"
                  >
                    Dashboard
                  </a>
                  <a 
                    href="/projects" 
                    className="text-gray-600 hover:text-construction-blue transition-colors font-medium"
                  >
                    Projects
                  </a>
                  <a 
                    href="/schedule" 
                    className="text-gray-600 hover:text-construction-blue transition-colors font-medium"
                  >
                    Schedule
                  </a>
                  <a 
                    href="/budget" 
                    className="text-gray-600 hover:text-construction-blue transition-colors font-medium"
                  >
                    Budget
                  </a>
                  <a 
                    href="/clients" 
                    className="text-gray-600 hover:text-construction-blue transition-colors font-medium"
                  >
                    Clients
                  </a>
                  <a 
                    href="/suppliers" 
                    className="text-gray-600 hover:text-construction-blue transition-colors font-medium"
                  >
                    Suppliers
                  </a>
                  <a 
                    href="/reports" 
                    className="text-gray-600 hover:text-construction-blue transition-colors font-medium"
                  >
                    Reports
                  </a>
                </nav>

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <button className="relative p-2 text-gray-600 hover:text-construction-blue transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* User Avatar */}
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-construction-blue rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">JD</span>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">John Doe</span>
                  </div>

                  {/* Mobile menu button */}
                  <button className="lg:hidden p-2 text-gray-600 hover:text-construction-blue">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center space-x-2 mb-4 md:mb-0">
                  <div className="w-6 h-6 bg-gradient-to-r from-construction-blue to-construction-orange rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Home Builder Pro</span>
                </div>
                
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-500">
                  <span>&copy; 2024 Home Builder Pro. All rights reserved.</span>
                  <div className="flex space-x-4">
                    <a href="/privacy" className="hover:text-construction-blue transition-colors">Privacy</a>
                    <a href="/terms" className="hover:text-construction-blue transition-colors">Terms</a>
                    <a href="/support" className="hover:text-construction-blue transition-colors">Support</a>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}