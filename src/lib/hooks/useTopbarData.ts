"use client";

import { useState, useEffect } from 'react';
import { topbarApi } from '@/lib/api/topbar';

// Define interfaces for the data structure
export interface TransformedProduct {
  id: string;
  name: string;
}

export interface TransformedCategory {
  id: number;
  name: string;
  products: TransformedProduct[];
}

export interface TransformedTopbarTitle {
  id: number;
  title: string;
  display_order: number;
  active: number;
  categories: TransformedCategory[];
}

// Constants (can be centralized later if needed)
const MAX_CATEGORIES_PER_TITLE = 6; 
// Products are not sliced by this hook; rendering components will handle product limits.

export function useTopbarData() {
  const [topbarData, setTopbarData] = useState<TransformedTopbarTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopbarData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await topbarApi.getTopbars();
        const transformedData = response.titles.map((apiTitle: any) => ({
          id: apiTitle.id,
          title: apiTitle.title,
          display_order: apiTitle.display_order,
          active: apiTitle.active,
          categories: (apiTitle.categories || [])
            .slice(0, MAX_CATEGORIES_PER_TITLE) // Slice categories as per original logic
            .map((cat: any) => ({
              id: cat.id,
              name: cat.name,
              products: (cat.products || []).map((prod: any) => ({ // Keep all products
                id: prod.id,
                name: prod.name,
              })),
            })),
        }));
        setTopbarData(transformedData);
      } catch (err) {
        console.error("Error fetching topbar data:", err);
        setError("Failed to load navigation data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopbarData();
  }, []);

  return { topbarData, isLoading, error };
}
