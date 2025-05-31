'use client';

import { Suspense, use } from 'react';
import dynamic from 'next/dynamic';
import Loader from '@/components/ui/loader';

const ProductCustomizer = dynamic(() => import('@/components/product/ProductCustomizerNew'), {
  ssr: false,
  loading: () => <div className='h-screen flex items-center justify-center'> 
    <Loader />
  </div>
});

interface CustomizePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CustomizePage({ params }: CustomizePageProps) {
  const { id } = use(params);

  return (
    <div className="container mx-auto px-4 pb-8 ">
      <Suspense fallback={<div className='h-screen'>
        <Loader/>
      </div>}>
        <ProductCustomizer productId={id} />
      </Suspense>
    </div>
  );
}
