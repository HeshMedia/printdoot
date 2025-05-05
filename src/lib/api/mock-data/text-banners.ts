import { TextBannerResponse } from "../text-banners"

// Mock data for text banners
export const MOCK_TEXT_BANNERS: TextBannerResponse[] = [
  {
    id: 1,
    text: "🚚 FREE SHIPPING ON ALL ORDERS OVER $50",
    display_order: 1,
    active: 1,
    created_at: "2025-04-01T10:00:00Z"
  },
  {
    id: 2,
    text: "🔥 SUMMER SALE: 25% OFF ALL NOTEBOOKS AND PLANNERS",
    display_order: 2,
    active: 1,
    created_at: "2025-04-02T10:00:00Z"
  },
  {
    id: 3,
    text: "🎁 BUY ONE GET ONE FREE ON ALL STICKERS THIS WEEK",
    display_order: 3,
    active: 1,
    created_at: "2025-04-03T10:00:00Z"
  },
  {
    id: 4,
    text: "⏰ LIMITED TIME OFFER: CUSTOM PRINTING SERVICES 15% OFF",
    display_order: 4,
    active: 1,
    created_at: "2025-04-04T10:00:00Z"
  },
  {
    id: 5,
    text: "📱 DOWNLOAD OUR APP FOR EXCLUSIVE MOBILE-ONLY DEALS",
    display_order: 5,
    active: 0, // This one is inactive
    created_at: "2025-04-05T10:00:00Z"
  },
  {
    id: 6,
    text: "🌱 WE USE ECO-FRIENDLY MATERIALS FOR ALL OUR PRODUCTS",
    display_order: 6,
    active: 1,
    created_at: "2025-04-06T10:00:00Z"
  }
]