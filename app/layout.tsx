import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ReduxProvider } from "@/lib/redux/provider"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BigSter 2.0",
  description: "Piattaforma per la gestione delle selezioni del personale.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <Toaster position="top-right" />
        </ReduxProvider>
      </body>
    </html>
  )
}
