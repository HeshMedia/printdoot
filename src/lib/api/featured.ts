// lib/api/featured.ts
import { config } from "../config";

// Base URL for featured sections
const BASE_URL = `${config.apiUrl}/admin`;
const PUBLIC_BASE_URL = `${config.apiUrl}`;

// Common Types
export interface FeaturedProductResponse {
  product_id: string;
  created_at: string;
  id: number;
  name: string;
  price: number;
  description: string;
  main_image_url: string;
  category_name: string;
  average_rating: number;
}

export interface FeaturedProductsResponse {
  total: number;
  products: FeaturedProductResponse[];
}

// ShopByNeed Types
export interface NeedResponse {
  need: string;
  count: number;
}

export interface ShopByNeedResponse {
  total: number;
  needs: NeedResponse[];
}

export interface ShopByNeedProductsResponse {
  total: number;
  products: FeaturedProductResponse[];
}

// Bestselling API
export const bestsellingApi = {
  add: async (productIds: string[]): Promise<{ message: string }> => {
    const url = `${BASE_URL}/bestselling`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ product_ids: productIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add bestselling products');
    }

    return response.json();
  },

   get: async (skip = 0, limit = 12): Promise<FeaturedProductsResponse> => {
    const url = `${PUBLIC_BASE_URL}/bestselling?skip=${skip}&limit=${limit}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bestselling products');
    }

    return response.json();
  },

  remove: async (productId: string): Promise<void> => {
    const url = `${BASE_URL}/bestselling/${productId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove bestselling product');
    }

    if (response.status !== 204) {
      return response.json();
    }
  },
};

// Onsale API (same pattern as bestselling)
export const onsaleApi = {
  add: async (productIds: string[]): Promise<{ message: string }> => {
    const url = `${BASE_URL}/onsale`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ product_ids: productIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add onsale products');
    }

    return response.json();
  },
 get: async (skip = 0, limit = 12): Promise<FeaturedProductsResponse> => {
    const url = `${PUBLIC_BASE_URL}/onsale?skip=${skip}&limit=${limit}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch onsale products');
    }

    return response.json();
  },

  remove: async (productId: string): Promise<void> => {
    const url = `${BASE_URL}/onsale/${productId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove onsale product');
    }

    if (response.status !== 204) {
      return response.json();
    }
  },
};

// Trending API (same pattern)
export const trendingApi = {
  add: async (productIds: string[]): Promise<{ message: string }> => {
    const url = `${BASE_URL}/trending`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ product_ids: productIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add trending products');
    }

    return response.json();
  },
  
  get: async (limit = 6, skip = 0): Promise<FeaturedProductsResponse> => {
    const url = `${PUBLIC_BASE_URL}/trending?limit=${limit}&skip=${skip}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trending products');
    }

    return response.json();
  },

  remove: async (productId: string): Promise<void> => {
    const url = `${BASE_URL}/trending/${productId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove trending product');
    }

    if (response.status !== 204) {
      return response.json();
    }
  },
};

// Newarrivals API (same pattern)
export const newarrivalsApi = {
  add: async (productIds: string[]): Promise<{ message: string }> => {
    const url = `${BASE_URL}/newarrivals`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ product_ids: productIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add new arrivals products');
    }

    return response.json();
  },
  
 get: async (skip = 0, limit = 12): Promise<FeaturedProductsResponse> => {
    const url = `${PUBLIC_BASE_URL}/newarrivals?skip=${skip}&limit=${limit}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch new arrivals products');
    }

    return response.json();
  },

  remove: async (productId: string): Promise<void> => {
    const url = `${BASE_URL}/newarrivals/${productId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove new arrivals product');
    }

    if (response.status !== 204) {
      return response.json();
    }
  },
};

// ShopByNeed API
export const shopByNeedApi = {
  add: async (need: string, productIds: string[]): Promise<{ message: string }> => {
    const url = `${BASE_URL}/shopbyneed`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ need, product_ids: productIds }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add shopbyneed products');
    }

    return response.json();
  },

  getNeeds: async (): Promise<ShopByNeedResponse> => {
    const url = `${PUBLIC_BASE_URL}/shopbyneed`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch needs');
    }

    return response.json();
  },

  getProducts: async (need: string, skip = 0, limit = 12): Promise<ShopByNeedProductsResponse> => {
  const url = `${PUBLIC_BASE_URL}/shopbyneed/${encodeURIComponent(need)}?skip=${skip}&limit=${limit}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products for need: ${need}`);
  }

  return response.json();
},

  remove: async (need: string, productId: string): Promise<void> => {
    const url = new URL(`${BASE_URL}/shopbyneed`);
    url.searchParams.append('need', need);
    url.searchParams.append('product_id', productId);

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove shopbyneed product');
    }

    if (response.status !== 204) {
      return response.json();
    }
  },
};

// Utility function to handle errors
function handleError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }
  throw new Error('An unknown error occurred');
}

export default {
  bestsellingApi,
  onsaleApi,
  trendingApi,
  newarrivalsApi,
  shopByNeedApi,
};

