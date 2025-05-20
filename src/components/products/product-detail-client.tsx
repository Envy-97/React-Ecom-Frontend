
"use client";

import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1); // Basic quantity selector, can be enhanced

  const handleAddToCart = () => {
    if (product.stock <= 0) {
        toast({
            title: "Out of Stock",
            description: `${product.name} is currently unavailable.`,
            variant: "destructive",
        });
        return;
    }
    addToCart(product, quantity);
    toast({
      title: `${product.name} added to cart!`,
      description: `Quantity: ${quantity}. You can view your cart or continue shopping.`,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full">
        {/* Basic quantity controls - can be replaced with a more sophisticated Input component later */}
        {/* For now, default to adding 1 item, or implement a simple number input if needed */}
        {/* <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
            <Input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} className="w-16 text-center h-10" />
            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><Plus className="h-4 w-4" /></Button>
        </div> */}
        <Button 
            onClick={handleAddToCart} 
            className="w-full sm:flex-grow bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
            disabled={product.stock <= 0}
        >
            <ShoppingCart className="mr-2 h-5 w-5" /> 
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
    </div>
  );
}
