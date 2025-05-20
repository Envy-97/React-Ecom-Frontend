"use client";

import React, { type ReactNode } from 'react';
import { AuthProvider } from './auth-context';
import { CartProvider } from './cart-context';
import { TooltipProvider } from '@/components/ui/tooltip'; // Required for ShadCN Tooltip

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  );
}
