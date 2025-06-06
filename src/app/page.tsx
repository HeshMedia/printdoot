import HeroSection from "@/components/hero-section"
import Categories from "@/components/categories"
import ShopByNeeds from "@/components/shop-by-needs"
import Testimonials from "@/components/testimonials"
import AboutUs from "@/components/about-us"
import { OnsaleSection } from "@/components/features/home/onsale-section"
import { TrendingSection } from "@/components/features/home/trending-section"
import { NewArrivalsSection } from "@/components/features/home/newarrivals-section"
import { TextBannerProvider } from "@/lib/context/text-banner-context"

export default function Home() {
  return (
    <>
      <TextBannerProvider>
        <div className="flex flex-col min-h-screen">
          <HeroSection />
          <Categories />
          <TrendingSection />
          <NewArrivalsSection />
          <OnsaleSection />
          <ShopByNeeds />
          <Testimonials />
          <AboutUs />
        </div>
    </TextBannerProvider>
    </>
  )
}

