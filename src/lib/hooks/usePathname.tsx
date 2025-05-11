"use client"

import { usePathname as useNextPathname } from "next/navigation"

export function usePathname() {
  const pathname = useNextPathname()
  
  return {
    pathname,
    isAdmin: pathname?.startsWith('/admin'),
  }
}
