import type React from "react"
import { cookies } from "next/headers"
import ProtectedRoute from "@/components/shared/protected-route"
import { Header } from "@/components/shared/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/shared/app-sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const layout = cookies().get("react-resizable-panels:layout")
  const defaultLayout = layout ? JSON.parse(layout.value) : undefined

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex h-screen">
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 md:p-8">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
