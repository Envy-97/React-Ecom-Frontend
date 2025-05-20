
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

    const response = await fetch(`http://localhost:8080/${productId}/image`, { // Updated URL
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to save image to DB for ${productName}: ${response.status} ${errorData}`);
    }
    toast({
      title: "Image Saved to DB",
      description: `Generated image for ${productName} uploaded to database.`,
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
      
      try {
        const response = await fetch(`http://localhost:8080/product/${params.id}`);
        if (!response.ok) {
          if (isMounted) {
            setProduct(null);
            setIsGeneratingImage(false); 
            setHasAttemptedGeneration(true); 
          }
          return; 
        }
        const foundProductData = await response.json();
        
        if (isMounted) {
          const typedProduct = foundProductData as Product;
          setProduct(typedProduct);
          setHasAttemptedGeneration(false); 

          const hasValidUserProvidedUrl = typedProduct.imageUrl && typedProduct.imageUrl !== '' && !typedProduct.imageUrl.startsWith('https://placehold.co');
          const productHintForGen = typedProduct.aiHint || typedProduct.name?.split(' ').slice(0, 2).join(' ').toLowerCase();

          if (hasValidUserProvidedUrl) {
            setCurrentImageUrl(typedProduct.imageUrl);
            setIsGeneratingImage(false);
            setHasAttemptedGeneration(true); 
          } else { // Empty string or placeholder
            setCurrentImageUrl(detailPlaceholderUrl); // Show placeholder initially
            if (productHintForGen) { // If hint exists, attempt generation
                 setIsGeneratingImage(true);
                 // hasAttemptedGeneration remains false, will be set by generation effect
            } else { // No hint, no generation possible
                 setIsGeneratingImage(false); 
                 setHasAttemptedGeneration(true); 
            }
          }
        }
      } catch (error) {
        console.error(`Failed to fetch product details for ${params.id}:`, error);
        if (isMounted) {
          setProduct(null);
          setIsGeneratingImage(false); 
          setHasAttemptedGeneration(true); 
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
    if (!product || !productHint || hasAttemptedGeneration) {
      if (isGeneratingImage) setIsGeneratingImage(false);
      return;
    }
    
    // Ensure isGeneratingImage is true before proceeding
    if (!isGeneratingImage) {
      return;
    }

    setHasAttemptedGeneration(true); 

    try {
      const result = await generateProductImage({ aiHint: productHint });
      if (result.imageDataUri) {
        setCurrentImageUrl(result.imageDataUri);
        // Pass the original product name for user-facing messages
        await saveGeneratedImageToDB(product.id, result.imageDataUri, product.name); 
      } else {
        // Placeholder remains if imageDataUri is null
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
    if (isGeneratingImage && product && productHint && !hasAttemptedGeneration) {
      const timer = setTimeout(() => {
          loadImageWithAI();
      }, 200); 
      return () => clearTimeout(timer);
    } else if (!productHint && isGeneratingImage) {
        setIsGeneratingImage(false);
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
  
  // Create a product object for ProductDetailClient that uses the currentImageUrl
  // for display, but keeps original product details for cart logic.
  const productForDisplay = {
    ...product, // Spread original product details
    imageUrl: currentImageUrl || product.imageUrl || detailPlaceholderUrl, // Prioritize currentImageUrl for display
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
            {(isGeneratingImage) && ( 
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
              {/* Pass the original product (or productForDisplay if its imageUrl is now primary) to ProductDetailClient.
                  If your backend updates the product's main imageUrl after saving the BLOB,
                  passing the original 'product' object might be fine if it's re-fetched or updated.
                  For now, passing 'productForDisplay' ensures the cart uses the most up-to-date visible image.
                  However, 'addToCart' in CartContext expects a 'Product' type, which doesn't change based on display.
                  So, we pass the 'product' object (which has original details) to ensure cart operations use stable data.
                  If the backend serves images via LOB, the 'imageUrl' property for the cart item should reflect that.
                  Let's pass the original 'product' to ProductDetailClient.
              */}
              <ProductDetailClient product={product} />
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
