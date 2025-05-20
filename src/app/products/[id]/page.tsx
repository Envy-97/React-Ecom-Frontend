
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

// Helper function to convert data URI to Blob
const dataURItoBlob = (dataURI: string): Blob => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};

async function saveGeneratedImageToDB(productId: string, imageDataUri: string, productName: string) {
  try {
    const imageBlob = dataURItoBlob(imageDataUri);
    const formData = new FormData();
    const filename = `product_${productId}_image.png`; 
    formData.append('file', imageBlob, filename);

    const response = await fetch(`http://localhost:8080/product/${productId}/image`, { 
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Backend error when saving image for ${productName} (ID: ${productId}): ${response.status} - ${errorData}`);
      toast({
        title: "DB Save Error",
        description: `Could not save image for ${productName} to DB. Status: ${response.status}. ${errorData}`,
        variant: "destructive",
      });
      throw new Error(`Failed to save image to DB for ${productName}: ${response.status} ${errorData}`);
    }
    const responseText = await response.text();
    toast({
      title: "Image Saved to DB",
      description: responseText || `Generated image for ${productName} uploaded to database.`,
    });
  } catch (error) {
    console.error(`Error saving generated image to DB for ${productName}:`, error);
    if (!(error instanceof Error && error.message.startsWith('Failed to save image to DB'))) {
        toast({
        title: "DB Save Error",
        description: `Could not save image for ${productName} to DB. ${error instanceof Error ? error.message : 'Unknown error.'}`,
        variant: "destructive",
        });
    }
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
          if (isMounted) setProduct(null);
          return; 
        }
        const foundProductData = await response.json();
        
        if (isMounted) {
          const typedProduct = foundProductData as Product;
          setProduct(typedProduct);
          
          // 1. Prioritize backend-provided imageData
          if (typedProduct.imageData && typedProduct.imageType && typedProduct.imageData.length > 50) { // Basic check for non-empty base64
            try {
              const dataUri = `data:${typedProduct.imageType};base64,${typedProduct.imageData}`;
              if (dataUri.startsWith('data:image')) {
                setCurrentImageUrl(dataUri);
                setIsGeneratingImage(false);
                setHasAttemptedGeneration(true);
                return; // Image found from backend
              } else {
                console.warn(`Product ${typedProduct.id} (detail) has invalid imageType or imageData.`);
              }
            } catch(e) {
              console.error(`Error constructing data URI for product detail ${typedProduct.id}:`, e);
            }
          }

          // 2. Fallback to placeholder and potential AI generation
          setCurrentImageUrl(detailPlaceholderUrl); 
          const productHintForGen = typedProduct.aiHint || typedProduct.name?.split(' ').slice(0, 2).join(' ').toLowerCase();
          if (productHintForGen) { 
            setIsGeneratingImage(true); 
            setHasAttemptedGeneration(false); // Allow generation
          } else { 
            setIsGeneratingImage(false); 
            setHasAttemptedGeneration(true); // No hint, so mark as "attempted"
          }
        }
      } catch (error) {
        console.error(`Failed to fetch product details for ${params.id}:`, error);
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setIsLoadingProduct(false);
      }
    }
    fetchProductDetails();
    return () => { isMounted = false; };
  }, [params.id, detailPlaceholderUrl]);

  const productHint = product?.aiHint || product?.name?.split(' ').slice(0, 2).join(' ').toLowerCase();

  const loadImageWithAI = useCallback(async () => {
    if (!product || !productHint || hasAttemptedGeneration || !isGeneratingImage) {
      if (isGeneratingImage) setIsGeneratingImage(false);
      return;
    }
    
    setHasAttemptedGeneration(true);

    try {
      const result = await generateProductImage({ aiHint: productHint });
      if (result.imageDataUri) {
        setCurrentImageUrl(result.imageDataUri);
        await saveGeneratedImageToDB(product.id, result.imageDataUri, product.name); 
      } else {
        // Toast for generation failure handled in flow
      }
    } catch (error) {
      console.error(`Failed to generate image for ${product.name}:`, error);
      toast({
        title: "Image Generation Failed",
        description: `Could not generate image for ${product.name}.`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  }, [product, productHint, isGeneratingImage, hasAttemptedGeneration]);

  useEffect(() => {
    let isMounted = true;
    if (isGeneratingImage && product && productHint && !hasAttemptedGeneration && isMounted) {
      const timer = setTimeout(() => { 
          if(isMounted) loadImageWithAI();
      }, 200); 
      return () => {
          isMounted = false;
          clearTimeout(timer);
      };
    } else if (product && !productHint && isGeneratingImage && isMounted) {
        setIsGeneratingImage(false);
    }
    return () => { isMounted = false; };
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
  
  const displayImageUrl = currentImageUrl || detailPlaceholderUrl;

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
            {(isGeneratingImage && displayImageUrl === detailPlaceholderUrl) && ( 
              <Skeleton className="absolute inset-0 h-full w-full flex items-center justify-center z-10">
                 <ImageIcon className="h-16 w-16 text-muted-foreground/50 animate-pulse" />
              </Skeleton>
            )}
            {displayImageUrl && (
              <Image
                key={displayImageUrl} 
                src={displayImageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={`object-contain p-4 transition-opacity duration-300 ${(isGeneratingImage && displayImageUrl === detailPlaceholderUrl) ? 'opacity-70' : 'opacity-100'}`}
                data-ai-hint={productHint} 
                priority={true} 
                onError={() => {
                    console.error(`Error loading image: ${displayImageUrl} for product ${product.name}`);
                    if (displayImageUrl !== detailPlaceholderUrl) { 
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
              {/* Pass the product object with potentially updated currentImageUrl */}
              <ProductDetailClient product={{...product, imageUrl: displayImageUrl }} />
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
