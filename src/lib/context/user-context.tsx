"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  clerkId: string
  name: string
  email: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on client side
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to load user from localStorage:", error)
      setIsLoading(false)
    }
  }, [])

  // Save user to localStorage whenever it changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user))
      } else {
        localStorage.removeItem("user")
      }
    } catch (error) {
      console.error("Failed to save user to localStorage:", error)
    }
  }, [user])

  return <UserContext.Provider value={{ user, setUser, isLoading }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

