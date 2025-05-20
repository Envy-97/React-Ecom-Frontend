
'use client';

import Image from 'next/image';
import Link from 'next/link';
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
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false); // Default to false, determined after fetch
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(true);

  useEffect(() => { // Effect for fetching product data
    let isMounted = true;
    async function fetchProductDetails() {
      if (!params.id) {
        setIsLoadingProduct(false);
        setProduct(null);
        return;
      }

      setIsLoadingProduct(true);
      setProduct(undefined); 
      setCurrentImageUrl(undefined); // Reset
      // isGeneratingImage will be determined AFTER fetch
      
      try {
        const response = await fetch(`http://localhost:8080/product/${params.id}`);
        if (!response.ok) {
          if (isMounted) {
            if (response.status === 404) {
              setProduct(null);
            } else {
              console.error(`API error fetching product ${params.id}: ${response.status} ${response.statusText}`);
              setProduct(null);
            }
            setIsGeneratingImage(false); // No product, no image to generate
          }
          return; 
        }
        const foundProductData = await response.json();
        
        if (isMounted) {
          const typedProduct = foundProductData as Product;
          setProduct(typedProduct);

          const placeholderUrl = `https://placehold.co/600x400.png`;
          let initialDisplayUrl = placeholderUrl; 
          let attemptGeneration = false;

          if (typedProduct && typedProduct.imageUrl && typedProduct.imageUrl !== '' && !typedProduct.imageUrl.startsWith('https://placehold.co')) {
            initialDisplayUrl = typedProduct.imageUrl;
            attemptGeneration = false;
          } else if (typedProduct) { // imageUrl is empty, placeholder, or missing
            initialDisplayUrl = placeholderUrl; 
            // Attempt generation if hint exists
            if (typedProduct.aiHint || typedProduct.name) {
                 attemptGeneration = true;
            }
            // Ensure product object has a placeholder if its own imageUrl was empty or a placeholder, for consistency
            // This is useful if AI generation fails and ProductDetailClient needs an imageUrl
             if (!typedProduct.imageUrl || typedProduct.imageUrl === '' || typedProduct.imageUrl.startsWith('https://placehold.co')) {
                typedProduct.imageUrl = placeholderUrl; 
            }
          } else { // Product not found or malformed from API
            setProduct(null); // Explicitly set to null
            attemptGeneration = false;
          }
          
          setCurrentImageUrl(initialDisplayUrl);
          setIsGeneratingImage(attemptGeneration); // This flag triggers the image generation useEffect
        }
      } catch (error) {
        console.error(`Failed to fetch product details for ${params.id}:`, error);
        if (isMounted) {
          setProduct(null);
          setIsGeneratingImage(false);
        }
      } finally {
        if (isMounted) setIsLoadingProduct(false);
      }
    }
    fetchProductDetails();
    return () => { isMounted = false; };
  }, [params.id]);

  const productHint = product?.aiHint || product?.name?.split(' ').slice(0, 2).join(' ').toLowerCase();

  useEffect(() => { // Effect for AI image generation
    let isMounted = true;
    // This effect runs if isGeneratingImage is true AND product/hint are available
    if (product && productHint && isGeneratingImage) {
      async function loadImageWithAI() {
        try {
          // currentImageUrl is already set to placeholder, AI will replace it
          const result = await generateProductImage({ aiHint: productHint });
          if (isMounted && result.imageDataUri) {
            setCurrentImageUrl(result.imageDataUri);
          }
          // If result.imageDataUri is null, currentImageUrl remains the placeholder
        } catch (error) {
          console.error(`Failed to generate image for ${product.name}:`, error);
          // On error, currentImageUrl remains the placeholder
        } finally {
          if (isMounted) {
            setIsGeneratingImage(false); // Generation attempt is complete
          }
        }
      }
      
      const timer = setTimeout(() => {
          loadImageWithAI();
      }, 200); // Small delay to allow placeholder to render first
      
      return () => { 
        isMounted = false; 
        clearTimeout(timer);
      };
    } else if (isGeneratingImage && (!product || !productHint)) {
      // If it was set to generate, but product/hint became unavailable (e.g. product fetch failed after initial decision)
      if (isMounted) setIsGeneratingImage(false);
    }
    
    return () => { isMounted = false; };
  }, [product, productHint, isGeneratingImage]);

  if (isLoadingProduct || product === undefined) { 
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
              <Skeleton className="h-12 w-full md:w-2/3 rounded-md" /> 
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
          Sorry, we couldn't find the product you were looking for. Please check the ID or try again later.
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
            {(isGeneratingImage || !currentImageUrl) && ( 
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
                className={`object-contain p-4 transition-opacity duration-300 ${isGeneratingImage && currentImageUrl === product.imageUrl && currentImageUrl.startsWith('https://placehold.co') ? 'opacity-70' : 'opacity-100'}`}
                data-ai-hint={productHint}
                priority={true} 
                onLoadingComplete={() => {
                    // If currentImageUrl is the original product.imageUrl (placeholder) AND AI generation is not active (finished or not started)
                    if (currentImageUrl === product.imageUrl && !isGeneratingImage) {
                        // Placeholder loaded, and AI is done or wasn't needed.
                    }
                }}
                onError={() => {
                    console.error(`Error loading image: ${currentImageUrl} for product ${product.name}`);
                    // If the current (potentially AI-generated or direct) URL fails, fall back to original product.imageUrl (which should be a placeholder if direct one failed)
                    if (product.imageUrl && currentImageUrl !== product.imageUrl) {
                        setCurrentImageUrl(product.imageUrl); 
                    }
                    if(isGeneratingImage) setIsGeneratingImage(false); 
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
              {/* Ensure product passed to ProductDetailClient has an imageUrl, even if it's the placeholder */}
              <ProductDetailClient product={{...product, imageUrl: product.imageUrl || `https://placehold.co/600x400.png` }} />
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
