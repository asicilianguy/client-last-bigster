"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { useVerifyTokenQuery } from "@/lib/redux/features/auth/authApiSlice"
import { selectCurrentUser, logOut } from "@/lib/redux/features/auth/authSlice"
import { Spinner } from "@/components/ui/spinner"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const { isLoading, isError } = useVerifyTokenQuery(undefined, {
    skip: !token || !!user,
  })

  useEffect(() => {
    if (!isLoading && (isError || !token)) {
      dispatch(logOut())
      router.push("/login")
    }
  }, [isLoading, isError, token, router, dispatch])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    )
  }

  return <>{children}</>
}
