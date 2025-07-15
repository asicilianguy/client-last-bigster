"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { selectCurrentUser } from "@/lib/redux/features/auth/authSlice"
import { Spinner } from "@/components/ui/spinner"

export default function HomePage() {
  const router = useRouter()
  const user = useSelector(selectCurrentUser)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    if (token && user) {
      router.replace("/selezioni")
    } else if (!token) {
      router.replace("/login")
    }
  }, [user, token, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner className="h-16 w-16" />
    </div>
  )
}
