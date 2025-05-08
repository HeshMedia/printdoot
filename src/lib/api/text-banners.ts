import axios from 'axios';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
// Type definitions for text banner data
export interface TextBannerBase {
  text: string;
  display_order: number;
  active: number; // 0 or 1
}

export interface TextBannerCreate extends TextBannerBase {}

export interface TextBannerUpdate extends Partial<TextBannerBase> {}

export interface TextBannerResponse extends TextBannerBase {
  id: number;
  created_at: string;
}

export interface TextBannerListResponse {
  total: number;
  text_banners: TextBannerResponse[];
}

// Fetch all text banners, optionally filtering by active status
export async function fetchTextBanners(activeOnly?: boolean): Promise<TextBannerListResponse> {
  try {
    const params = activeOnly ? { active_only: true } : {};
    const response = await axios.get(`${API_BASE_URL}/text-banners`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching text banners:', error);
    throw new Error('Failed to fetch text banners');
  }
}

// Create a new text banner
export async function createTextBanner(banner: TextBannerCreate): Promise<TextBannerResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/admin/text-banners`, banner);
    return response.data;
  } catch (error) {
    console.error('Error creating text banner:', error);
    throw new Error('Failed to create text banner');
  }
}

// Update an existing text banner
export async function updateTextBanner(id: number, updates: TextBannerUpdate): Promise<TextBannerResponse> {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/text-banners/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating text banner with id ${id}:`, error);
    throw new Error('Failed to update text banner');
  }
}

// Delete a text banner
export async function deleteTextBanner(id: number): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/admin/text-banners/${id}`);
  } catch (error) {
    console.error(`Error deleting text banner with id ${id}:`, error);
    throw new Error('Failed to delete text banner');
  }
}

// For development with mock data before API integration
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
];
