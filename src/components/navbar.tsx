"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation" // Next.js router
import { Menu, Search, ShoppingCart } from "lucide-react"
import {
  SignedOut,
  SignInButton,
  SignUpButton,
  SignedIn,
  useUser,
} from '@clerk/nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/lib/context/cart-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { totalItems } = useCart()
  const router = useRouter() // Next.js router instance
  const { user } = useUser() // Get user information from Clerk

  useEffect(() => {
    // Check if the user is an admin
    if (user && user.publicMetadata?.role === "ADMIN") {
      router.push('/admin') // Redirect to admin dashboard
    }
  }, [user, router])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left section: Logo and mobile menu */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-medium transition-colors hover:text-foreground/80">
                  Home
                </Link>
                <Link href="/products" className="text-lg font-medium transition-colors hover:text-foreground/80">
                  Products
                </Link>
                <Link href="/categories" className="text-lg font-medium transition-colors hover:text-foreground/80">
                  Categories
                </Link>
                <div className="border-t my-4"></div>
                <Link href="/about" className="text-lg font-medium transition-colors hover:text-foreground/80">
                  About
                </Link>
                <Link href="/contact" className="text-lg font-medium transition-colors hover:text-foreground/80">
                  Contact
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="PRINTDOOT Logo" 
              width={160}
              height={40}
              style={{ height: 'auto' }}
              priority
            />
          </Link>
        </div>

        {/* Center section: Desktop navigation and search */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <nav className="flex items-center gap-6 mr-4">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Products
            </Link>
            <Link href="/categories" className="text-sm font-medium transition-colors hover:text-foreground/80">
              Categories
            </Link>
          </nav>

          <div className="w-[240px] lg:w-[300px]">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search here" className="w-full pl-8 bg-muted/50" />
            </div>
          </div>
        </div>

        {/* Right section: Actions (search, cart, account) */}
        <div className="flex items-center gap-2">
          {/* Search button - mobile */}
          <Button variant="ghost" className="md:hidden flex flex-col items-center gap-1 h-auto py-1" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-5 w-5" />
            <span className="text-[10px] font-medium">Search</span>
          </Button>
          
          {/* Cart button */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/cart">
                  <Button variant="ghost" className="relative flex flex-col items-center gap-1 h-auto py-1 md:flex-row md:gap-2">
                    <div className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {totalItems}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] md:text-xs font-medium md:hidden">Cart</span>
                    <span className="sr-only md:not-sr-only md:text-xs hidden">Cart</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-black">Shopping Cart</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Clerk Authentication */}
          <SignedIn>
            {/* User is signed in */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex flex-col items-center gap-1 h-auto py-1 cursor-pointer"
                    onClick={() => router.push('/account')} // Redirect to /account page on click
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <Image
                        src={user?.imageUrl || "/default-avatar.png"}
                        alt="User Avatar"
                        width={32}
                        height={32}
                      />
                    </div>
                    <span className="text-[10px] md:text-xs font-medium md:hidden">Account</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-black">My Account</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SignedIn>
          
          <SignedOut>
            {/* User is not signed in */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center gap-1 h-auto py-1">
                    <SignInButton>
                      <Button variant="ghost" className="h-5 w-5 p-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                        </svg>
                      </Button>
                    </SignInButton>
                    <span className="text-[10px] md:text-xs font-medium md:hidden">Login</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-black">Sign In</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SignedOut>
        </div>
      </div>

      {isSearchOpen && (
        <div className="absolute top-16 left-0 right-0 border-t border-border bg-background px-4 py-3 shadow-md md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search here" className="w-full pl-8 bg-muted/50" />
          </div>
        </div>
      )}
    </header>
  )
}