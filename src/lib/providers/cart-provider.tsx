'use client';

import { ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { cartItemsAtom, discountCodeAtom, CartItem, DiscountCodeState } from '@/lib/atoms/cartAtoms';

type HydrateAtomsProps = {
  children: ReactNode;
  initialCartItems?: CartItem[];
  initialDiscountCode?: DiscountCodeState;
};

/**
 * This component hydrates Jotai atoms with initial values from props
 */
function HydrateAtoms({
  children,
  initialCartItems,
  initialDiscountCode,
}: HydrateAtomsProps) {
  // Initialize atoms with the values from localStorage if available
  useHydrateAtoms([
    [cartItemsAtom, initialCartItems ?? []],
    [
      discountCodeAtom,
      initialDiscountCode ?? {
        code: '',
        discountPercentage: 0,
        isValid: false,
      },
    ],
  ]);

  return <>{children}</>;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  return (
    <JotaiProvider>
      <HydrateAtoms>{children}</HydrateAtoms>
    </JotaiProvider>
  );
}
