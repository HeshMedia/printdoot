import { config } from "../config";

const API_BASE_URL = config.apiUrl;

// Types for Topbar
export interface TopbarCategoryProduct {
  id: string; // Product ID
  name: string; // Product Name
}

export interface TopbarCategory {
  id: string; // Category ID or name, based on your API (property1, property2)
  name: string; // Category display name
  products: TopbarCategoryProduct[];
}

export interface TopbarTitle {
  id: number;
  title: string;
  display_order: number;
  active: number;
  categories: TopbarCategory[]; // Derived from categories_and_products for frontend use
}

export interface TopbarTitleResponse extends Omit<TopbarTitle, 'categories'> {
  categories_and_products: Record<string, string[]>; // Raw from API { "category_id_or_name": ["product_id1", "product_id2"] }
  created_at: string;
}


export interface GetTopbarsResponse {
  total: number;
  titles: TopbarTitleResponse[];
}

export interface CreateTopbarTitleInput {
  title: string;
  display_order: number;
  categories_and_products: Record<string, string[]>; // e.g., { "categoryId1": ["productId1", "productId2"] }
}

export interface UpdateTopbarTitleInput extends Partial<CreateTopbarTitleInput> {}

export const topbarApi = {
  /**
   * Fetch the list of topbar titles from the server
   * GET /topbar
   */
  async getTopbars(): Promise<GetTopbarsResponse> {
    const response = await fetch(`${API_BASE_URL}/topbar`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch topbar data");
    }
    return response.json();
  },

  /**
   * Create a new topbar title
   * POST /admin/topbar
   */
  async createTopbarTitle(data: CreateTopbarTitleInput): Promise<TopbarTitleResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/topbar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create topbar title");
    }
    return response.json();
  },

  /**
   * Update an existing topbar title
   * PUT /admin/topbar/{title_id}
   */
  async updateTopbarTitle(
    titleId: number,
    data: UpdateTopbarTitleInput
  ): Promise<TopbarTitleResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/topbar/${titleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update topbar title");
    }
    return response.json();
  },

  /**
   * Delete a topbar title
   * DELETE /admin/topbar/title/{title_id}
   */
  async deleteTopbarTitle(titleId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/admin/topbar/title/${titleId}`,
      {
        method: "DELETE",
        headers: { Accept: "application/json" },
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete topbar title");
    }
    // Assuming 200 OK with no body means success, or adapt if API returns a message
  },

  /**
   * Remove a product from a category within a topbar title
   * DELETE /admin/topbar/title/{title_id}/category/{category_id}/product/{product_id}
   */
  async removeProductFromCategoryInTitle(
    titleId: number,
    categoryId: string,
    productId: string
  ): Promise<TopbarTitleResponse> {
    const response = await fetch(
      `${API_BASE_URL}/admin/topbar/title/${titleId}/category/${categoryId}/product/${productId}`,
      {
        method: "DELETE",
        headers: { Accept: "application/json" },
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to remove product from category");
    }
    return response.json();
  },
};
