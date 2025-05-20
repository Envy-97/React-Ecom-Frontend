
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { mockProducts } from '@/lib/mock-data';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react'; // ShoppingCart is in ProductDetailClient
import { ProductDetailClient } from '@/components/products/product-detail-client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductDetailPageProps {
  params: { id: string };
}

async function getProduct(id: string): Promise<Product | undefined> {
  // Simulate API call
  return mockProducts.find((p) => p.id === id);
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) {
    return {
      title: 'Product Not Found - Ethereal Emporium',
    };
  }
  return {
    title: `${product.name} - Ethereal Emporium`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-destructive mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn't find the product you were looking for.
        </p>
        <Button asChild variant="outline">
          <Link href="/products">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }
  
  const productHint = product.name.split(' ').slice(0, 2).join(' ').toLowerCase();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/products">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to All Products
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square md:aspect-auto md:min-h-[400px] min-h-[300px] bg-muted/30">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill // Replaced layout="fill" and objectFit="contain" with fill and object-contain
              objectFit="contain" // Ensure this is a valid prop for next/image with fill
              className="p-4" 
              data-ai-hint={productHint} 
            />
          </div>
          <div className="flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="text-3xl lg:text-4xl font-bold text-primary">{product.name}</CardTitle>
              {product.category && (
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{product.category}</p>
              )}
            </CardHeader>
            <CardContent className="flex-grow space-y-6 pt-0">
              <CardDescription className="text-base lg:text-lg leading-relaxed text-foreground/90">
                {product.description}
              </CardDescription>

              {/* Pincode Check Section */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="pincode" className="font-semibold text-sm">Check Delivery Availability</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    id="pincode" 
                    name="pincode" 
                    placeholder="Enter Pincode" 
                    className="max-w-[180px] h-9 text-sm" // Adjusted width and height
                    maxLength={6} 
                    pattern="\d{6}" // Basic pattern for 6 digits
                    title="Please enter a 6-digit pincode"
                  />
                  <Button variant="outline" type="button" size="sm">Check</Button>
                </div>
                 {/* Placeholder for delivery message - uncomment and style as needed 
                 <p id="delivery-message" className="text-xs text-muted-foreground mt-1">
                   Standard delivery in 3-5 days.
                 </p> 
                 */}
              </div>

              <div>
                <p className="text-3xl lg:text-4xl font-extrabold text-accent mb-1">₹{product.price.toFixed(2)}</p>
                <p className="text-sm text-green-600 font-semibold">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="p-6 border-t mt-auto">
              <ProductDetailClient product={product} />
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
