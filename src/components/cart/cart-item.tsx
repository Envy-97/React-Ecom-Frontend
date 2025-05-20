"use client";

import Image from 'next/image';
import type { CartItem as CartItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { X, Plus, Minus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(item.id);
      toast({ title: `${item.name} removed from cart.`, variant: "default" });
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.id);
    toast({ title: `${item.name} removed from cart.`, variant: "default" });
  };

  return (
    <div className="flex items-center space-x-4 p-4 border-b bg-card rounded-lg shadow-sm mb-4">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden">
        <Image src={item.imageUrl} alt={item.name} layout="fill" objectFit="cover" data-ai-hint="product item" />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold">{item.name}</h3>
        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
        <div className="flex items-center space-x-2 mt-2">
          <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.quantity - 1)} disabled={item.quantity <= 1 && false}> {/* Allow decrement to 0, then remove */}
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10))}
            className="w-16 h-9 text-center"
            min="1"
          />
          <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
        <Button variant="ghost" size="icon" onClick={handleRemove} className="text-destructive hover:text-destructive/80 mt-2">
          <X className="h-5 w-5" />
          <span className="sr-only">Remove item</span>
        </Button>
      </div>
    </div>
  );
}
