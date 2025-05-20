import { CartView } from '@/components/cart/cart-view';

export default function CartPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center">Your Shopping Cart</h1>
      <CartView />
    </div>
  );
}
