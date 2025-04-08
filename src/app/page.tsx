import HeroSection from "@/components/hero-section"
import BestSellers from "@/components/best-sellers"
import Categories from "@/components/categories"
import ShopByNeeds from "@/components/shop-by-needs"
import Testimonials from "@/components/testimonials"
import AboutUs from "@/components/about-us"
import { OnsaleSection } from "@/components/features/home/onsale-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection />
      <BestSellers />
      <Categories />
      <OnsaleSection/>
      <ShopByNeeds />
      <Testimonials />
      <AboutUs />
    </div>
  )
}

