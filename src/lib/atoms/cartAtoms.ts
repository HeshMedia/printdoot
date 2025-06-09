import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Product } from '../api/products';

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
    // Mock API call to validate discount code
    // In a real app, you would call an API endpoint
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock discount codes for testing
      const discountCodes: Record<string, number> = {
        'WELCOME10': 10,
        'SUMMER20': 20,
        'SPECIAL50': 50
      };
      
      if (code in discountCodes) {
        set(discountCodeAtom, {
          code,
          discountPercentage: discountCodes[code],
          isValid: true
        });
        return true;
      } else {
        set(discountCodeAtom, {
          code: '',
          discountPercentage: 0,
          isValid: false
        });
        return false;
      }
    } catch (error) {
      console.error('Error applying discount code:', error);
      return false;
    }
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