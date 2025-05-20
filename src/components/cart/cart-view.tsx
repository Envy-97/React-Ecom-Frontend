"use client";

import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';
import { CartItem } from './cart-item';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag } from 'lucide-react';

export function CartView() {
  const { cartItems, cartTotal, clearCart, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-muted rounded-md animate-pulse w-1/2 mx-auto"></div>
        {Array.from({length: 2}).map((_,i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg shadow-sm bg-card">
                <div className="w-24 h-24 bg-muted rounded-md animate-pulse"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                    <div className="h-8 bg-muted rounded w-1/4 animate-pulse"></div>
                </div>
                <div className="h-6 bg-muted rounded w-1/6 animate-pulse"></div>
            </div>
        ))}
        <div className="h-20 bg-muted rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button asChild>
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {cartItems.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>

      <Card className="lg:col-span-1 shadow-xl sticky top-24"> {/* Sticky for larger screens */}
        <CardHeader>
          <CardTitle className="text-2xl">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="text-green-600">FREE</span> {/* Or calculate shipping */}
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" size="lg">Proceed to Checkout</Button>
          <Button variant="outline" className="w-full" onClick={clearCart}>
            Clear Cart
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
