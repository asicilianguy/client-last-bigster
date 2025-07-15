"use client"

import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logOut, selectCurrentUser } from "@/lib/redux/features/auth/authSlice"
import { LogOut } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logOut())
    router.push("/login")
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-lg font-semibold hidden sm:block">Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600 text-right">
            <span className="font-semibold">
              {user.nome} {user.cognome}
            </span>
            <br />
            <span className="text-xs">{user.ruolo.replace(/_/g, " ")}</span>
          </span>
        )}
        <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  )
}
