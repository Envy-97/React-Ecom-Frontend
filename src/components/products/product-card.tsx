
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
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(product.imageUrl);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(true); // Start true to show loader initially

  const productHint = product.aiHint || product.name.split(' ').slice(0, 2).join(' ').toLowerCase();

  useEffect(() => {
    let isMounted = true;
    // Set initial loading state based on whether we have a hint to generate an image
    setIsGeneratingImage(!!productHint);

    async function loadImageWithAI() { // Corrected: Added space here
      if (!productHint) {
        setIsGeneratingImage(false); // No hint, so no generation needed
        return;
      }

      try {
        const result = await generateProductImage({ aiHint: productHint });
        if (isMounted && result.imageDataUri) {
          setCurrentImageUrl(result.imageDataUri);
        }
      } catch (error) {
        console.error(`Failed to generate image for ${product.name}:`, error);
        // If generation fails, keep the placeholder. isGeneratingImage will be set to false in finally.
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
  }, [product.name, productHint]);


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
              key={currentImageUrl} // Add key to force re-render if currentImageUrl changes (e.g. from placeholder to data URI)
              src={currentImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-300 group-hover:scale-105 ${isGeneratingImage && currentImageUrl === product.imageUrl ? 'opacity-70' : 'opacity-100'}`}
              data-ai-hint={productHint}
              onLoadingComplete={() => {
                // If the loaded image is the initial placeholder, and we were not trying to generate (no hint), stop loading state.
                if (currentImageUrl === product.imageUrl && !productHint) {
                    setIsGeneratingImage(false);
                }
                // If it's the generated image that just loaded, isGeneratingImage would have been set to false by the flow's finally block.
              }}
              onError={() => {
                console.error(`Error loading image: ${currentImageUrl} for product ${product.name}`);
                // If the generated image fails to load from its data URI, revert to placeholder
                if (currentImageUrl !== product.imageUrl) {
                    setCurrentImageUrl(product.imageUrl);
                }
                setIsGeneratingImage(false); // Stop loading state on error
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
      <CardFooter className="p-4 border-t flex justify-between items-center">
        <p className="text-lg font-bold text-primary">₹{product.price.toFixed(2)}</p>
        <Button
          onClick={handleAddToCart}
          size="icon"
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
