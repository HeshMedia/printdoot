"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Search, ShoppingCart, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            PRINTDOOT
          </Link>

          {/* Search Bar - Hidden on Mobile */}
          <div className="hidden md:flex relative max-w-md w-full mx-4">
            <Input type="text" placeholder="Search here" className="w-full rounded-md bg-muted" />
            <Button size="icon" variant="ghost" className="absolute right-0 top-0">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="nav-link text-sm font-medium">
              Home
            </Link>
            <Link href="/products" className="nav-link text-sm font-medium">
              Products
            </Link>
            <Link href="/contacts" className="nav-link text-sm font-medium">
              Contacts
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping cart</span>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <User className="h-5 w-5" />
              <span className="sr-only">User account</span>
            </Button>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full py-6">
                  <div className="mb-6">
                    <Input type="text" placeholder="Search here" className="w-full" />
                  </div>
                  <nav className="flex flex-col space-y-4">
                    <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                      Home
                    </Link>
                    <Link href="/products" className="text-lg font-medium hover:text-primary transition-colors">
                      Products
                    </Link>
                    <Link href="/contacts" className="text-lg font-medium hover:text-primary transition-colors">
                      Contacts
                    </Link>
                    <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
                      About
                    </Link>
                    <Link href="/blog" className="text-lg font-medium hover:text-primary transition-colors">
                      Blog
                    </Link>
                  </nav>
                  <div className="mt-auto flex flex-col space-y-4">
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                    <Button className="w-full">Sign Up</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

