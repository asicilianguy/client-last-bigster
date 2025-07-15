import type React from "react"
import ProtectedRoute from "@/components/shared/protected-route"
import { Header } from "@/components/shared/header"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
