import { ProductList } from '@/components/products/product-list';

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-gradient-to-r from-primary/10 via-background to-accent/10 rounded-lg shadow-inner">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          Welcome to Ethereal Emporium
        </h1>
        <p className="mt-4 text-lg leading-8 text-foreground/80 sm:mt-6">
          Discover a curated selection of unique and enchanting products.
        </p>
      </section>
      
      <section>
        <h2 className="text-3xl font-semibold mb-6 text-center text-primary/90">Featured Products</h2>
        <ProductList />
      </section>
    </div>
  );
}
