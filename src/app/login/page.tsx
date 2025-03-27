"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/context/user-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useUser()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !name.trim()) {
      toast({
        title: "Error",
        description: "Please enter both name and email",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate login - in a real app, this would call an authentication API
    setTimeout(() => {
      // Generate a random clerk ID for demo purposes
      const clerkId = `user_${Math.random().toString(36).substring(2, 10)}`

      setUser({
        clerkId,
        name,
        email,
      })

      toast({
        title: "Logged In",
        description: "You have been successfully logged in",
      })

      router.push("/")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>This is a demo login. In a real application, this would connect to an authentication service.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

