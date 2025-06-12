"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Menu, Search, ShoppingCart, Headphones, ChevronDown, ChevronRight } from "lucide-react"
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
import { useAtom } from "jotai"
import { cartCountAtom } from "@/lib/atoms/cartAtoms"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTopbarData, TransformedTopbarTitle, TransformedCategory, TransformedProduct } from "@/lib/hooks/useTopbarData";

import Topbar from "./topbar"

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [cartItemCount] = useAtom(cartCountAtom)
  const router = useRouter() 
  const { user } = useUser()
  const { topbarData, isLoading: isTopbarLoading, error: topbarError } = useTopbarData();
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.publicMetadata?.role === "ADMIN") {
      router.push('/admin') 
    }
  }, [user, router])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <nav className="flex flex-col gap-2 mt-8">
                <Link href="/" className="text-lg font-medium transition-colors hover:text-foreground/80 px-2 py-1">
                  Home
                </Link>
                <Link href="/products" className="text-lg font-medium transition-colors hover:text-foreground/80 px-2 py-1">
                  Products
                </Link>
                <Link href="/categories" className="text-lg font-medium transition-colors hover:text-foreground/80">
                  Categories
                </Link>
                <div className="border-t my-4"></div>
                <Link href="/about" className="text-lg font-medium transition-colors hover:text-foreground/80 px-2 py-1">
                  About
                </Link>
                <Link href="/contact" className="text-lg font-medium transition-colors hover:text-foreground/80 px-2 py-1">
                  Contact
                </Link>

                {/* Topbar data integration for mobile */}
                {!isTopbarLoading && !topbarError && topbarData && topbarData.length > 0 && (
                  <>
                    <div className="border-t my-4"></div>
                    <h3 className="text-md font-semibold px-2 py-1 text-muted-foreground">Shop By Category</h3>
                    {topbarData.map((titleItem: TransformedTopbarTitle) => (
                      titleItem.active === 1 && (
                        <div key={titleItem.id} className="flex flex-col gap-1">
                          <button
                            onClick={() => setOpenMobileSubmenu(openMobileSubmenu === titleItem.id ? null : titleItem.id)}
                            className="flex items-center justify-between w-full text-lg font-medium transition-colors hover:text-foreground/80 px-2 py-1 text-left"
                          >
                            {titleItem.title.toUpperCase()}
                            {openMobileSubmenu === titleItem.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                          </button>
                          {openMobileSubmenu === titleItem.id && (
                            <div className="flex flex-col gap-1 pl-4 border-l ml-2">
                              {titleItem.categories.map((category: TransformedCategory) => (
                                <div key={category.id} className="flex flex-col gap-1">
                                   <Link
                                    href={`/products?category=${encodeURIComponent(category.id)}`}
                                    className="text-md font-medium transition-colors hover:text-foreground/80 px-2 py-1"
                                  >
                                    {category.name}
                                  </Link>
                                
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="PRINTDOOT Logo" 
              width={200}
              height={80}
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
          
          {/* Help/WhatsApp button - desktop only */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative hidden md:flex flex-col items-center gap-1 h-auto py-1 md:flex-row md:gap-2"
                  onClick={() => {
                    const phoneNumber = "7827303575";
                    const formattedNumber = `+91${phoneNumber}`;
                    const whatsappUrl = `https://wa.me/${formattedNumber.replace(/\D/g, '')}`;
                    window.open(whatsappUrl, "_blank");
                  }}
                >
                  <div className="relative">
                    <Headphones className="h-5 w-5 text-emerald-600" />
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      ?
                    </span>
                  </div>
                  <span className="sr-only md:not-sr-only md:text-xs">Help</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-black">Chat with us: +91-7827303575</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Cart button */}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/cart">
                  <Button variant="ghost" className="relative flex flex-col items-center gap-1 h-auto py-1 md:flex-row md:gap-2">                    <div className="relative">
                      <ShoppingCart className="h-5 w-5" />
                      {cartItemCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {cartItemCount > 99 ? '99+' : cartItemCount}
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
      <Topbar />
    </header>
  )
}