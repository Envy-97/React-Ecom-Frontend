
"use client";

import Image from 'next/image';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardProps {
  product: Product;
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

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const placeholderUrl = `https://placehold.co/600x600.png`;
  const productHintForGen = product.aiHint || product.name?.split(' ').slice(0, 2).join(' ').toLowerCase();

  const [currentImageUrl, setCurrentImageUrl] = useState<string>(placeholderUrl);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!isMounted) return;

    // 1. Prioritize backend-provided imageData
    if (product.imageData && product.imageType && product.imageData.length > 50) { // Basic check for non-empty base64
      try {
        const dataUri = `data:${product.imageType};base64,${product.imageData}`;
        if (dataUri.startsWith('data:image')) {
          setCurrentImageUrl(dataUri);
          setIsGeneratingImage(false);
          setHasAttemptedGeneration(true);
          return; // Image found from backend, no further action needed
        } else {
          console.warn(`Product ${product.id} (card) has invalid imageType or imageData format.`);
        }
      } catch (e) {
        console.error(`Error constructing data URI for product card ${product.id}:`, e);
      }
    }

    // 2. If no valid imageData, decide on AI generation or placeholder
    setCurrentImageUrl(placeholderUrl); // Show placeholder initially
    if (productHintForGen) { // If hint exists, attempt generation
      setIsGeneratingImage(true);
      setHasAttemptedGeneration(false); // Allow generation attempt
    } else { // No hint, so no generation possible
      setIsGeneratingImage(false);
      setHasAttemptedGeneration(true); // Mark as "attempted" since no hint
    }
    return () => { isMounted = false; };
  }, [product.id, product.imageData, product.imageType, productHintForGen, placeholderUrl]);

  const loadImageWithAI = useCallback(async () => {
    if (!productHintForGen || hasAttemptedGeneration || !isGeneratingImage || !product) {
      if(isGeneratingImage) setIsGeneratingImage(false);
      return;
    }
    
    setHasAttemptedGeneration(true); 

    try {
      const result = await generateProductImage({ aiHint: productHintForGen });
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
  }, [product, productHintForGen, isGeneratingImage, hasAttemptedGeneration]);

  useEffect(() => {
    let isMounted = true;
    if (isGeneratingImage && productHintForGen && !hasAttemptedGeneration && isMounted) {
      const timer = setTimeout(() => {
        if(isMounted) loadImageWithAI();
      }, 200); 
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else if (!productHintForGen && isGeneratingImage && isMounted) {
      setIsGeneratingImage(false);
    }
    return () => { isMounted = false; };
  }, [isGeneratingImage, productHintForGen, hasAttemptedGeneration, loadImageWithAI]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product); // The product object here will have original imageUrl/imageData
    toast({
      title: `${product.name} added to cart!`,
      description: "You can view your cart or continue shopping.",
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <Link href={`/products/${product.id}`} className="flex flex-col flex-grow cursor-pointer">
        <CardHeader className="p-0">
          <div className="aspect-square relative w-full overflow-hidden bg-muted/20">
            {(isGeneratingImage && currentImageUrl === placeholderUrl) && ( 
              <Skeleton className="absolute inset-0 h-full w-full flex items-center justify-center z-10">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50 animate-pulse" />
              </Skeleton>
            )}
            <Image
              key={currentImageUrl} 
              src={currentImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-300 group-hover:scale-105 ${isGeneratingImage && currentImageUrl === placeholderUrl ? 'opacity-70' : 'opacity-100'}`}
              data-ai-hint={productHintForGen}
              priority={false} 
              onError={() => {
                console.error(`Error loading image: ${currentImageUrl} for product ${product.name}`);
                if (currentImageUrl !== placeholderUrl) { 
                    setCurrentImageUrl(placeholderUrl); 
                }
                if(isGeneratingImage) setIsGeneratingImage(false); 
              }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-1 truncate" title={product.name}>{product.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mb-2 h-10 overflow-hidden text-ellipsis">
            {product.description}
          </CardDescription>
        </CardContent>
      </Link>
      <CardFooter className="p-4 border-t flex justify-between items-center mt-auto">
        <p className="text-lg font-bold text-primary">₹{product.price.toFixed(2)}</p>
        <Button
          onClick={handleAddToCart}
          size="icon"
          variant="default"
          className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="sr-only">Add to Cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
