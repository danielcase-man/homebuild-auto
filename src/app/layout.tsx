import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SessionProvider from "@/components/providers/SessionProvider"

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
        <SessionProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}