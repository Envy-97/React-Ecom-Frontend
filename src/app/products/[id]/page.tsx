
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ImageIcon } from 'lucide-react';
import { ProductDetailClient } from '@/components/products/product-detail-client';
import { PincodeChecker } from '@/components/products/pincode-checker';
import { useState, useEffect, useCallback } from 'react';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

interface ProductDetailPageProps {
  params: { id: string };
}

async function saveGeneratedImageToDB(productId: string, imageDataUri: string, productName: string) {
  try {
    const response = await fetch(`http://localhost:8080/product/${productId}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageDataUri: imageDataUri }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to save image to DB for ${productName}: ${response.status} ${errorData}`);
    }
    toast({
      title: "Image Saved to DB",
      description: `Generated image for ${productName} sent to database.`,
    });
  } catch (error) {
    console.error(`Error saving generated image to DB for ${productName}:`, error);
    toast({
      title: "DB Save Error",
      description: `Could not save image for ${productName} to DB. ${error instanceof Error ? error.message : 'Unknown error.'}`,
      variant: "destructive",
    });
  }
}


export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(undefined);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState<boolean>(true);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState<boolean>(false);

  const detailPlaceholderUrl = `https://placehold.co/600x400.png`;

  useEffect(() => {
    let isMounted = true;
    async function fetchProductDetails() {
      if (!params.id) {
        if (isMounted) {
          setIsLoadingProduct(false);
          setProduct(null);
        }
        return;
      }

      setIsLoadingProduct(true);
      setProduct(undefined); 
      setCurrentImageUrl(undefined);
      setIsGeneratingImage(false);
      setHasAttemptedGeneration(false);
      
      try {
        const response = await fetch(`http://localhost:8080/product/${params.id}`);
        if (!response.ok) {
          if (isMounted) {
            setProduct(null);
            // No need to set isGeneratingImage here, handled by subsequent effects
          }
          return; 
        }
        const foundProductData = await response.json();
        
        if (isMounted) {
          const typedProduct = foundProductData as Product;
          setProduct(typedProduct);

          const hasValidUserProvidedUrl = typedProduct.imageUrl && typedProduct.imageUrl !== '' && !typedProduct.imageUrl.startsWith('https://placehold.co');
          const productHintForGen = typedProduct.aiHint || typedProduct.name?.split(' ').slice(0, 2).join(' ').toLowerCase();

          if (hasValidUserProvidedUrl) {
            setCurrentImageUrl(typedProduct.imageUrl);
            setIsGeneratingImage(false);
            setHasAttemptedGeneration(true); // No generation needed if valid URL exists
          } else {
            // Is empty or a placeholder, use placeholder and potentially generate
            setCurrentImageUrl(detailPlaceholderUrl);
            // Update product's imageUrl to placeholder if it was empty, for ProductDetailClient
            if (!typedProduct.imageUrl || typedProduct.imageUrl === '') {
                typedProduct.imageUrl = detailPlaceholderUrl;
            }
            if (productHintForGen) { // Only set to generate if hint exists
                 setIsGeneratingImage(true);
                 // hasAttemptedGeneration remains false, will be set by generation effect
            } else {
                 setIsGeneratingImage(false); // No hint, no generation
                 setHasAttemptedGeneration(true); // Mark as not needing generation
            }
          }
        }
      } catch (error) {
        console.error(`Failed to fetch product details for ${params.id}:`, error);
        if (isMounted) {
          setProduct(null);
          setIsGeneratingImage(false); // Ensure this is off on fetch error
          setHasAttemptedGeneration(true); // Don't attempt generation if product fetch fails
        }
      } finally {
        if (isMounted) setIsLoadingProduct(false);
      }
    }
    fetchProductDetails();
    return () => { isMounted = false; };
  }, [params.id, detailPlaceholderUrl]);

  const productHint = product?.aiHint || product?.name?.split(' ').slice(0, 2).join(' ').toLowerCase();

  const loadImageWithAI = useCallback(async () => {
    if (!product || !productHint || !isGeneratingImage || hasAttemptedGeneration) {
      if (isGeneratingImage) setIsGeneratingImage(false);
      return;
    }

    setHasAttemptedGeneration(true); // Mark that we are attempting generation

    try {
      // currentImageUrl is already set to placeholder
      const result = await generateProductImage({ aiHint: productHint });
      if (result.imageDataUri) {
        setCurrentImageUrl(result.imageDataUri);
        await saveGeneratedImageToDB(product.id, result.imageDataUri, product.name);
      } else {
        // Placeholder remains
      }
    } catch (error) {
      console.error(`Failed to generate image for ${product.name}:`, error);
      toast({
        title: "Image Generation Failed",
        description: `Could not generate image for ${product.name}.`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false); // Generation attempt is complete
    }
  }, [product, productHint, isGeneratingImage, hasAttemptedGeneration]);

  useEffect(() => {
    if (isGeneratingImage && product && productHint && !hasAttemptedGeneration) {
      const timer = setTimeout(() => {
          loadImageWithAI();
      }, 200); 
      return () => clearTimeout(timer);
    }
  }, [isGeneratingImage, product, productHint, hasAttemptedGeneration, loadImageWithAI]);


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
  
  // Ensure product passed to ProductDetailClient has an imageUrl, using current one if available, else placeholder
  const productForDetailClient = {
    ...product,
    imageUrl: currentImageUrl || product.imageUrl || detailPlaceholderUrl,
  };

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
                className={`object-contain p-4 transition-opacity duration-300 ${isGeneratingImage && currentImageUrl === detailPlaceholderUrl ? 'opacity-70' : 'opacity-100'}`}
                data-ai-hint={productHint}
                priority={true} 
                onError={() => {
                    console.error(`Error loading image: ${currentImageUrl} for product ${product.name}`);
                    if (currentImageUrl !== detailPlaceholderUrl) {
                        setCurrentImageUrl(detailPlaceholderUrl); 
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
              <ProductDetailClient product={productForDetailClient} />
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
