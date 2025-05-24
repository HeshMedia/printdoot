// app/products/[id]/customize/page.tsx
'use client';

import ProductCustomizer from '@/components/product/ProductCustomizer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const CustomizeProductPage = () => {
  const { id: productId } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Customize Your Product
      </h1>
      
      <ProductCustomizer />
      
      <div className="flex justify-center mt-6">
        <Button asChild variant="outline" className="mr-2">
          <Link href={`/products/${productId}`}>Cancel</Link>
        </Button>
        <Button>Save Design</Button>
      </div>
    </div>
  );
};

export default CustomizeProductPage;
