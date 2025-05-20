
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

async function saveGeneratedImageToDB(productId: string, imageDataUri: string, productName: string) {
  try {
    const response = await fetch(`http://localhost:8080/product/${productId}/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header if your backend requires it
      },
      body: JSON.stringify({ imageDataUri: imageDataUri }), // Send as JSON
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

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const placeholderUrl = `https://placehold.co/600x600.png`;
  const productHint = product.aiHint || product.name.split(' ').slice(0, 2).join(' ').toLowerCase();

  const [currentImageUrl, setCurrentImageUrl] = useState<string>(placeholderUrl);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState<boolean>(false);

  useEffect(() => {
    // Initialize image URL and generation state based on product prop
    const hasValidUserProvidedUrl = product.imageUrl && product.imageUrl !== '' && !product.imageUrl.startsWith('https://placehold.co');
    
    if (hasValidUserProvidedUrl) {
      setCurrentImageUrl(product.imageUrl);
      setIsGeneratingImage(false);
      setHasAttemptedGeneration(true); // Mark as attempted (or rather, not needed)
    } else {
      // Is empty or a placeholder, so use placeholder and potentially generate
      setCurrentImageUrl(placeholderUrl);
      if (productHint && !hasAttemptedGeneration) { // Only generate if hint exists and not already attempted
        setIsGeneratingImage(true);
      } else {
        setIsGeneratingImage(false);
      }
    }
  }, [product.imageUrl, productHint, placeholderUrl, hasAttemptedGeneration]);

  const loadImageWithAI = useCallback(async () => {
    if (!productHint || !isGeneratingImage || hasAttemptedGeneration) {
        if (isGeneratingImage) setIsGeneratingImage(false); // Turn off if it was on but no longer should run
        return;
    }
    
    setHasAttemptedGeneration(true); // Mark that we are attempting generation now

    try {
      const result = await generateProductImage({ aiHint: productHint });
      if (result.imageDataUri) {
        setCurrentImageUrl(result.imageDataUri);
        // Attempt to save to DB
        await saveGeneratedImageToDB(product.id, result.imageDataUri, product.name);
      } else {
         // If generation returns null, currentImageUrl (placeholder) remains.
         // No explicit message here as user sees placeholder. Console logs in flow.
      }
    } catch (error) {
      console.error(`Failed to generate image for ${product.name}:`, error);
      // On failure, currentImageUrl (placeholder) remains.
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
    // Trigger AI image loading if conditions are met
    if (isGeneratingImage && productHint && !hasAttemptedGeneration) {
      const timer = setTimeout(() => {
        loadImageWithAI();
      }, 200); // Small delay
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
            {isGeneratingImage && (
              <Skeleton className="absolute inset-0 h-full w-full flex items-center justify-center z-10">
                <ImageIcon className="h-12 w-12 text-muted-foreground/50 animate-pulse" />
              </Skeleton>
            )}
            <Image
              key={currentImageUrl} // Re-render if URL changes
              src={currentImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-300 group-hover:scale-105 ${isGeneratingImage && currentImageUrl === placeholderUrl ? 'opacity-70' : 'opacity-100'}`}
              data-ai-hint={productHint}
              priority={false} // Avoid multiple priority images on a list page
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
