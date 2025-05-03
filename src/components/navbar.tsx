"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, ShoppingCart, User, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/lib/context/cart-context"
import { useUser } from "@/lib/context/user-context"

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { totalItems } = useCart()
  const { user } = useUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between w-[90%]">
        <div className="flex items-center gap-6">
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

            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="PRINTDOOT Logo" className="w-[12rem]" />
            </Link>

          <div className="hidden md:flex md:w-[300px] lg:w-[400px]">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search here" className="w-full pl-8 bg-muted/50" />
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
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

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          {user ? (
            <Link href="/account">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon">
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {isSearchOpen && (
        <div className="container py-2 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search here" className="w-full pl-8 bg-muted/50" />
          </div>
        </div>
      )}
    </header>
  )
}

