
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { mockProducts } from '@/lib/mock-data';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ImageIcon } from 'lucide-react';
import { ProductDetailClient } from '@/components/products/product-detail-client';
import { PincodeChecker } from '@/components/products/pincode-checker';
import { useState, useEffect } from 'react';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      setIsLoadingProduct(true);
      // Simulate API call to get product
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
      const foundProduct = mockProducts.find((p) => p.id === params.id);
      
      if (isMounted) {
        setProduct(foundProduct);
        if (foundProduct) {
          setCurrentImageUrl(foundProduct.imageUrl); // Start with placeholder
          // Determine if image generation is needed
          setIsGeneratingImage(!!(foundProduct.aiHint || foundProduct.name));
        } else {
            setIsGeneratingImage(false); // No product, no image to generate
        }
        setIsLoadingProduct(false);
      }
    }
    fetchProduct();
    return () => { isMounted = false; };
  }, [params.id]);

  const productHint = product?.aiHint || product?.name?.split(' ').slice(0, 2).join(' ').toLowerCase();

  useEffect(() => {
    let isMounted = true;
    if (product && productHint) {
      // isGeneratingImage should already be true from product load if hint exists
      async function loadImageWithAI() {
        try {
          const result = await generateProductImage({ aiHint: productHint });
          if (isMounted && result.imageDataUri) {
            setCurrentImageUrl(result.imageDataUri);
          }
        } catch (error) {
          console.error(`Failed to generate image for ${product.name}:`, error);
        } finally {
          if (isMounted) {
            setIsGeneratingImage(false);
          }
        }
      }
       // Use a small timeout to allow initial placeholders to render before kicking off generation
      const timer = setTimeout(() => {
        loadImageWithAI();
      }, 200);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else if (product) { // Product loaded but no hint or name for hint
        setIsGeneratingImage(false);
    }
  }, [product, productHint]);

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6 rounded-md" />
        <Card className="overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-2 gap-0">
            <Skeleton className="aspect-square md:aspect-auto md:min-h-[400px] min-h-[300px] rounded-none md:rounded-l-lg" />
            <div className="flex flex-col p-6 space-y-4">
              <Skeleton className="h-10 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/4 rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-12 w-full md:w-2/3 rounded-md" /> {/* Pincode checker area */}
              <Skeleton className="h-10 w-1/3 rounded-md" />
              <Skeleton className="h-12 w-full rounded-md" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

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
          <div className="relative aspect-square md:aspect-auto md:min-h-[400px] min-h-[300px] bg-muted/20">
            {isGeneratingImage && (
              <Skeleton className="absolute inset-0 h-full w-full flex items-center justify-center z-10">
                 <ImageIcon className="h-16 w-16 text-muted-foreground/50 animate-pulse" />
              </Skeleton>
            )}
            {currentImageUrl && (
              <Image
                key={currentImageUrl}
                src={currentImageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-contain p-4 transition-opacity duration-300 ${isGeneratingImage && currentImageUrl === product.imageUrl ? 'opacity-70' : 'opacity-100'}`}
                data-ai-hint={productHint}
                onLoadingComplete={() => {
                     if (currentImageUrl === product.imageUrl && !productHint) {
                        setIsGeneratingImage(false);
                    }
                }}
                onError={() => {
                    console.error(`Error loading image: ${currentImageUrl} for product ${product.name}`);
                    if (currentImageUrl !== product.imageUrl) {
                        setCurrentImageUrl(product.imageUrl);
                    }
                    setIsGeneratingImage(false);
                }}
              />
            )}
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

              <PincodeChecker />

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

