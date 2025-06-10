import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Product } from '../api/products';
import type { VerifyCouponRequest, VerifyCouponResponse } from '../api/coupon';

// Define types
export interface CustomizationOption {
  type: "text" | "image" | "color";
  value: string;
}

export interface CartItem {
  id: string; // Unique identifier for the cart item
  product: Product;
  quantity: number;
  selectedCustomizations: Record<string, string>;
  userCustomization?: {
    design_id?: string; // Reference to the design in IndexedDB
    customPreviewUrl?: string; // URL of the customized image
  };
  addedAt: number; // Timestamp to track when the item was added
}

export interface DiscountCodeState {
  code: string;
  discountPercentage: number;
  isValid: boolean;
}

// Define initial state for cart
const initialCartState: CartItem[] = [];

// Cart atoms
export const cartItemsAtom = atomWithStorage<CartItem[]>('cart-items', initialCartState);

// Derived atoms
export const cartCountAtom = atom(
  (get) => get(cartItemsAtom).reduce((total, item) => total + item.quantity, 0)
);

export const cartSubtotalAtom = atom(
  (get) => get(cartItemsAtom).reduce((total, item) => total + (item.product.price * item.quantity), 0)
);

// Discount code atom
export const discountCodeAtom = atomWithStorage<DiscountCodeState>('discount-code', {
  code: '',
  discountPercentage: 0,
  isValid: false
});

// Shipping cost atom
export const shippingCostAtom = atom(100); // Default shipping cost of ₹100

// Cart total with taxes and discounts
export const cartTotalAtom = atom((get) => {
  const subtotal = get(cartSubtotalAtom);
  const discountInfo = get(discountCodeAtom);
  const shippingCost = get(shippingCostAtom);
  
  // Calculate discount amount
  const discountAmount = discountInfo.isValid 
    ? (subtotal * discountInfo.discountPercentage / 100) 
    : 0;
  
  // Calculate taxes (assuming 18% GST)
  const taxRate = 0.18;
  const taxAmount = (subtotal - discountAmount) * taxRate;
  
  return {
    subtotal,
    discountAmount,
    taxAmount,
    shippingCost,
    total: subtotal - discountAmount + taxAmount + shippingCost
  };
});

// Helper functions
export const findCartItemById = (cartItems: CartItem[], id: string): CartItem | undefined => {
  return cartItems.find(item => item.id === id);
};

// Find cart item with same product (for non-customized items only)
export const findSimilarCartItem = (
  cartItems: CartItem[], 
  productId: number | string,
  designId?: string
): CartItem | undefined => {
  // We only match non-customized items
  // For all customized items, we always add them as new items
  return cartItems.find(
    item => item.product.product_id === productId && 
            !item.userCustomization
  );
};

// Generate a unique ID for cart items
export const generateCartItemId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Action atoms
export const addToCartAtom = atom(
  null,
  (get, set, payload: {
    product: Product, 
    quantity: number, 
    selectedCustomizations: Record<string, string>,
    designId?: string, 
    customPreviewUrl?: string
  }) => {
    const { product, quantity, selectedCustomizations, designId, customPreviewUrl } = payload;
    const cartItems = get(cartItemsAtom);
    
    // For customized products with designs, ALWAYS add as a new item
    // For non-customized products, look for similar non-customized items
    let existingItem = null;
    
    // Only find existing items for non-customized products
    if (!designId && !customPreviewUrl) {
      existingItem = findSimilarCartItem(cartItems, product.product_id);
    }
    
    if (existingItem) {
      // If item exists and is non-customized, update quantity
      const updatedItems = cartItems.map(item => 
        item.id === existingItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      set(cartItemsAtom, updatedItems);
    } else {
      // Otherwise, add a new item - for non-customized items or ANY customized item
      const newItem: CartItem = {
        id: generateCartItemId(),
        product,
        quantity,
        selectedCustomizations,
        userCustomization: designId || customPreviewUrl ? {
          design_id: designId,
          customPreviewUrl
        } : undefined,
        addedAt: Date.now()
      };
      
      set(cartItemsAtom, [...cartItems, newItem]);
    }
  }
);

export const updateCartItemQuantityAtom = atom(
  null,
  (get, set, payload: { itemId: string, quantity: number }) => {
    const { itemId, quantity } = payload;
    const cartItems = get(cartItemsAtom);
    
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      set(cartItemsAtom, cartItems.filter(item => item.id !== itemId));
    } else {
      // Otherwise, update the quantity
      const updatedItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      set(cartItemsAtom, updatedItems);
    }
  }
);

export const removeCartItemAtom = atom(
  null,
  (get, set, itemId: string) => {
    const cartItems = get(cartItemsAtom);
    set(cartItemsAtom, cartItems.filter(item => item.id !== itemId));
  }
);

export const clearCartAtom = atom(
  null,
  (_, set) => {
    set(cartItemsAtom, []);
    set(discountCodeAtom, { code: '', discountPercentage: 0, isValid: false });
  }
);

export const applyDiscountCodeAtom = atom(
  null,
  async (get, set, code: string) => {
    // Import the verifyCoupon function from our API
    const { verifyCoupon } = await import('../api/coupon');
    
    try {
      // Call the actual API endpoint with cart information
      const cartItems = get(cartItemsAtom);
      
      // Get category IDs and product IDs from cart for better coupon validation
      // Prioritize first item for simplicity (could be enhanced to check all items)
      let category_id: number | undefined = undefined;
      let product_id: string | undefined = undefined;
      
      if (cartItems.length > 0) {
        const firstItem = cartItems[0];
        if (firstItem.product.category_id) {
          category_id = firstItem.product.category_id;
        }
        if (firstItem.product.product_id) {
          product_id = String(firstItem.product.product_id);
        }
      }
      
      // Call the coupon verification API
      const response = await verifyCoupon({
        code,
        category_id,
        product_id
      });
      
      if (response.valid) {
        // If valid, update the discount code atom with the verified info
        set(discountCodeAtom, {
          code,
          discountPercentage: response.discount_percentage,
          isValid: true
        });
        return true;
      } else {
        // If invalid, clear the discount code atom
        set(discountCodeAtom, {
          code: '',
          discountPercentage: 0,
          isValid: false
        });
        return false;
      }
    } catch (error) {
      console.error('Error applying discount code:', error);
      // On error, clear the discount code atom
      set(discountCodeAtom, {
        code: '',
        discountPercentage: 0,
        isValid: false
      });
      return false;
    }
  }
);

export const removeDiscountCodeAtom = atom(
  null,
  (get, set) => {
    set(discountCodeAtom, {
      code: '',
      discountPercentage: 0,
      isValid: false
    });
    return true;
  }
);

// IndexedDB related functions
import { getDesignImageFromDB } from '../utils/indexedDB';

export const getImageFromIndexedDBAtom = atom(
  null,
  async (_, __, designId: string): Promise<string | null> => {
    try {
      return await getDesignImageFromDB(designId);
    } catch (error) {
      console.error("Error fetching design from IndexedDB:", error);
      return null;
    }
  }
);