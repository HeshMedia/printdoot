"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/context/user-context"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()
  const { setUser } = useUser()

  useEffect(() => {
    // Clear user data
    setUser(null)

    // Redirect to home page
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }, [router, setUser])

  return (
    <div className="container py-12 flex flex-col items-center justify-center min-h-[50vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <h1 className="text-2xl font-bold">Logging out...</h1>
      <p className="text-muted-foreground">You will be redirected shortly.</p>
    </div>
  )
}

