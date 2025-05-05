import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CartProvider } from "@/lib/context/cart-context"
import { UserProvider } from "@/lib/context/user-context"
import { Toaster } from "@/components/toaster"
import { WhatsApp } from "@/components/floatingwhatsapp"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Printdoot - One Stop Printing",
  description: "Your one-stop shop for all printing needs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <WhatsApp/>
            <Footer />
            <Toaster />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  )
}

