// lib/api/banners.ts
import { config } from "../config";

const BASE_URL = `${config.apiUrl}`;
const ADMIN_BASE_URL = `${config.apiUrl}/admin`;

// Banner types
export interface Banner {
  id: number;
  image_url: string;
  display_order: number;
  active: number; // Using number as it comes as 0 or 1 from API
  created_at: string;
}

export interface BannersResponse {
  total: number;
  banners: Banner[];
}

// Banner API functions
export const bannerApi = {
  // Public API
  getBanners: async (activeOnly: boolean = false): Promise<BannersResponse> => {
    const url = `${BASE_URL}/banners${activeOnly ? '?active_only=true' : ''}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store', // Don't cache to always get fresh banners
    });

    if (!response.ok) {
      throw new Error('Failed to fetch banners');
    }

    return response.json();
  },

  // Admin API
  addBanner: async (
    imageBase64: string,
    imageExtension: string,
    displayOrder: number,
    active: boolean
  ): Promise<Banner> => {
    const url = `${ADMIN_BASE_URL}/banners`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        image_extension: imageExtension,
        display_order: displayOrder,
        active: active ? 1 : 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add banner');
    }

    return response.json();
  },

  updateBanner: async (
    bannerId: number,
    displayOrder: number,
    active: boolean
  ): Promise<Banner> => {
    const url = `${ADMIN_BASE_URL}/banners/${bannerId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        display_order: displayOrder,
        active: active ? 1 : 0,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update banner');
    }

    return response.json();
  },

  deleteBanner: async (bannerId: number): Promise<void> => {
    const url = `${ADMIN_BASE_URL}/banners/${bannerId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Failed to delete banner');
    }
    
    return;
  },
};