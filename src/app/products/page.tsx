
import { ProductList } from '@/components/products/product-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Products - Ethereal Emporium',
  description: 'Browse our collection of unique and enchanting products.',
};

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-lg shadow-inner">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Our Products
        </h1>
        <p className="mt-4 text-lg leading-8 text-foreground/80 sm:mt-6">
          Explore the full collection of Ethereal Emporium's exquisite offerings.
        </p>
      </section>
      
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-center text-primary/90">All Products</h2>
        <ProductList />
      </section>
    </div>
  );
}
