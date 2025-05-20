
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
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
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
    // Use a generic filename or derive one, backend might not use it if storing as LOB directly.
    const filename = `product_${productId}_image.png`; // Example filename
    formData.append('file', imageBlob, filename);

    const response = await fetch(`http://localhost:8080/product/${productId}/image`, {
      method: 'POST',
      // Content-Type header is automatically set by the browser when using FormData
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text(); // Or response.json() if backend sends JSON error
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

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const placeholderUrl = `https://placehold.co/600x600.png`;
  const productHint = product.aiHint || product.name.split(' ').slice(0, 2).join(' ').toLowerCase();

  const [currentImageUrl, setCurrentImageUrl] = useState<string>(placeholderUrl);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState<boolean>(false);

  useEffect(() => {
    const hasValidUserProvidedUrl = product.imageUrl && product.imageUrl !== '' && !product.imageUrl.startsWith('https://placehold.co');
    
    if (hasValidUserProvidedUrl) {
      setCurrentImageUrl(product.imageUrl);
      setIsGeneratingImage(false);
      setHasAttemptedGeneration(true); 
    } else {
      setCurrentImageUrl(placeholderUrl);
      if (productHint && !hasAttemptedGeneration) {
        setIsGeneratingImage(true);
      } else {
        setIsGeneratingImage(false);
        if (!productHint) setHasAttemptedGeneration(true); // No hint, so mark as "attempted"
      }
    }
  }, [product.imageUrl, productHint, placeholderUrl, hasAttemptedGeneration]);

  const loadImageWithAI = useCallback(async () => {
    if (!productHint || !isGeneratingImage || hasAttemptedGeneration) {
      if (isGeneratingImage) setIsGeneratingImage(false);
      return;
    }
    
    setHasAttemptedGeneration(true); 

    try {
      const result = await generateProductImage({ aiHint: productHint });
      if (result.imageDataUri) {
        setCurrentImageUrl(result.imageDataUri);
        await saveGeneratedImageToDB(product.id, result.imageDataUri, product.name);
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
  }, [product.id, product.name, productHint, isGeneratingImage, hasAttemptedGeneration]);

  useEffect(() => {
    if (isGeneratingImage && productHint && !hasAttemptedGeneration) {
      const timer = setTimeout(() => {
        loadImageWithAI();
      }, 200); 
      return () => clearTimeout(timer);
    }
  }, [isGeneratingImage, productHint, hasAttemptedGeneration, loadImageWithAI]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    addToCart(product);
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
            {(isGeneratingImage || (!currentImageUrl && !hasAttemptedGeneration)) && ( // Show skeleton if generating OR if no URL yet and no attempt made
              <Skeleton className="absolute inset-0 h-full w-full flex items-center justify-center z-10">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50 animate-pulse" />
              </Skeleton>
            )}
            <Image
              key={currentImageUrl} 
              src={currentImageUrl || placeholderUrl} // Fallback to placeholder if currentImageUrl is somehow null/empty
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-300 group-hover:scale-105 ${isGeneratingImage && currentImageUrl === placeholderUrl ? 'opacity-70' : 'opacity-100'}`}
              data-ai-hint={productHint}
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
