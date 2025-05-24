'use client'

import { useEffect } from 'react'
import { useUser, RedirectToSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface ProtectRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export default function ProtectRoute({ children, allowedRoles }: ProtectRouteProps) {
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  useEffect(() => {
    // wait for Clerk to finish loading
    if (!isLoaded) return

    // 1) Not signed in → send to sign-in
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    // 2) Signed in but wrong role → send to home
   
  }, [isLoaded, isSignedIn, user, router, allowedRoles])

  // While loading or redirecting, render nothing (or a spinner)
  if (!isLoaded || !isSignedIn || !user) {
    return null
  }

  // If they passed the role check, show kids
  const role = user.publicMetadata.role as string
  if (allowedRoles.includes(role)) {
    return <>{children}</>
  }

  // (Optional) you could render a “Not authorized” message here instead
  return null
}
