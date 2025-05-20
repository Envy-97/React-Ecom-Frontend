
"use client";

import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { ProductCard } from './product-card';
// Removed: import { mockProducts } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

// Fetch products from the live API
async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch('http://localhost:8080/product/all');
    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      // You might want to throw an error here or return a specific error object
      return [];
    }
    const data = await response.json();
    return data as Product[]; // Assuming the API returns data compatible with Product[]
  } catch (error) {
    console.error("Failed to fetch products from API:", error);
    return []; // Return empty array on error
  }
}

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const fetchedProducts = await fetchProducts();
      setProducts(fetchedProducts);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-center text-muted-foreground">No products found. Check if the backend is running and returning data.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg shadow-md bg-card">
      <Skeleton className="h-[200px] w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-6 w-[100px] mt-2" />
      </div>
      <Skeleton className="h-10 w-full mt-4" />
    </div>
  );
}
