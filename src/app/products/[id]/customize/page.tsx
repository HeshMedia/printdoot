'use client';

import { Suspense, use } from 'react';
import dynamic from 'next/dynamic';

const ProductCustomizer = dynamic(() => import('@/components/product/ProductCustomizerNew'), {
  ssr: false,
  loading: () => <p>Loading Customizer...</p>, // Optional: a loading component specific to the dynamic import
});

interface CustomizePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomizePage({ params }: CustomizePageProps) {
  const { id } = use(params);

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading product details...</div>}>
        <ProductCustomizer productId={id} />
      </Suspense>
    </div>
  );
}
