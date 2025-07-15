"use client"

import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logOut, selectCurrentUser } from "@/lib/redux/features/auth/authSlice"
import { LogOut } from "lucide-react"

export function Header() {
  const user = useSelector(selectCurrentUser)
  const dispatch = useDispatch()
  const router = useRouter()

  const handleLogout = () => {
    dispatch(logOut())
    router.push("/login")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold">BigSter Dashboard</h1>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-600">
            Welcome, {user.nome} {user.cognome} ({user.ruolo})
          </span>
        )}
        <Button variant="outline" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  )
}
