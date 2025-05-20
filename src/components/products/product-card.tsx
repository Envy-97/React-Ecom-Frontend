
"use client";

import Image from 'next/image';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { generateProductImage } from '@/ai/flows/generate-product-image-flow';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const placeholderUrl = `https://placehold.co/600x600.png`;
  const productHint = product.aiHint || product.name.split(' ').slice(0, 2).join(' ').toLowerCase();

  // Determine if the provided imageUrl is valid and not a placeholder
  const hasGoodProvidedUrl = product.imageUrl && product.imageUrl !== '' && !product.imageUrl.startsWith('https://placehold.co');
  
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(
    hasGoodProvidedUrl ? product.imageUrl : placeholderUrl
  );
  
  // Generate if no good URL is provided AND a hint exists
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(
    !hasGoodProvidedUrl && !!productHint 
  );

  useEffect(() => {
    let isMounted = true;

    // Re-evaluate based on product prop changes
    const newHasGoodProvidedUrl = product.imageUrl && product.imageUrl !== '' && !product.imageUrl.startsWith('https://placehold.co');
    const newBaseImageUrl = newHasGoodProvidedUrl ? product.imageUrl : placeholderUrl;
    const newNeedsAiGeneration = !newHasGoodProvidedUrl && !!productHint;

    // If AI image not yet loaded, update current image and generation status
    if (!currentImageUrl.startsWith('data:image')) {
      if (currentImageUrl !== newBaseImageUrl) {
        setCurrentImageUrl(newBaseImageUrl);
      }
      if (isGeneratingImage !== newNeedsAiGeneration) {
        setIsGeneratingImage(newNeedsAiGeneration);
      }
    } else {
      // AI image is loaded. Only turn off generation flag if it was true but no longer needed.
      if (isGeneratingImage && !newNeedsAiGeneration) {
         setIsGeneratingImage(false);
      }
    }

    async function loadImageWithAI() {
      if (!productHint) { // Should not happen if isGeneratingImage is true
        if(isMounted) setIsGeneratingImage(false);
        return;
      }

      try {
        const result = await generateProductImage({ aiHint: productHint });
        if (isMounted && result.imageDataUri) {
          setCurrentImageUrl(result.imageDataUri);
        }
      } catch (error) {
        console.error(`Failed to generate image for ${product.name}:`, error);
        // On failure, currentImageUrl (placeholder) remains
      } finally {
        if (isMounted) {
          setIsGeneratingImage(false);
        }
      }
    }
    
    if (isGeneratingImage) { // If flag indicates generation is needed
      const timer = setTimeout(() => {
        loadImageWithAI();
      }, 200);
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
    
    return () => { isMounted = false; };
  }, [product.name, product.imageUrl, productHint, isGeneratingImage, currentImageUrl]);


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
              key={currentImageUrl}
              src={currentImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-300 group-hover:scale-105 ${isGeneratingImage && currentImageUrl === placeholderUrl ? 'opacity-70' : 'opacity-100'}`}
              data-ai-hint={productHint}
              onLoadingComplete={() => {
                if (currentImageUrl === placeholderUrl && !isGeneratingImage) {
                    // Placeholder loaded, and no AI generation was intended or it finished (and possibly failed, leaving placeholder)
                }
              }}
              onError={() => {
                console.error(`Error loading image: ${currentImageUrl} for product ${product.name}`);
                if (currentImageUrl !== placeholderUrl) { // If error on AI image or provided URL
                    setCurrentImageUrl(placeholderUrl); // Fallback to placeholder
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
