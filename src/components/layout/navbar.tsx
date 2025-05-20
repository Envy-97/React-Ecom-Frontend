"use client";

import Link from 'next/link';
import { ShoppingCart, User, LogOut, PlusCircle, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const { user, logout, isAdmin, isLoading } = useAuth();
  const { cartCount, isLoading: isCartLoading } = useCart();

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-primary hover:text-primary/80 transition-colors">
              <Store className="h-8 w-8 mr-2" />
              <span className="font-semibold text-xl">Ethereal Emporium</span>
            </Link>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {!isCartLoading && cartCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
            
            {isLoading ? (
              <div className="h-8 w-20 bg-muted rounded-md animate-pulse"></div>
            ) : user ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/add-product" aria-label="Add Product">
                      <PlusCircle className="h-5 w-5" />
                      <span className="hidden sm:ml-2 sm:inline">Add Product</span>
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground hidden sm:inline">Hi, {user.username}</span>
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" asChild>
                <Link href="/login">
                  <User className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
