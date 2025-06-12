import type React from "react"
import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CartProvider from "@/lib/providers/cart-provider"
import { UserProvider } from "@/lib/context/user-context"
import { Toaster } from "@/components/toaster"
import { WhatsApp } from "@/components/floatingwhatsapp"
import { TextBanner } from "@/components/layout/TextBanner"
import { TextBannerProvider } from "@/lib/context/text-banner-context"
import { ClerkProvider } from "@clerk/nextjs"

// Replace Inter with Roboto, specifying weight 300 (Light)
const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '700'], // Include 300 (Light) and other weights you might need
  display: 'swap',
})

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
    <ClerkProvider> 
      <html lang="en">        
        <body className={`${roboto.className} flex flex-col min-h-screen overflow-x-hidden`}>
          <UserProvider>
            <CartProvider>           
              <TextBannerProvider>
                <Navbar />
                <TextBanner />
                <main className="flex-grow">{children}</main>
                <WhatsApp/>
                <Footer />
                <Toaster />
              </TextBannerProvider>
            </CartProvider>
          </UserProvider>
        </body>
      </html>
    </ClerkProvider> 
  )
}