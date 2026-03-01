import type React from "react"
import type { Metadata } from "next"
import { DM_Sans, Syne } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./hooks/useAuth"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "./components/theme-provider"

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-sans" })
const syne = Syne({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-syne" })

export const metadata: Metadata = {
  title: "TalentRanker.ai - AI Resume Shortlisting",
  description: "Smart hiring made simple with AI-powered resume analysis",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
