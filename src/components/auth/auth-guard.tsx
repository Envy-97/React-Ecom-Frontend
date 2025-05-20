"use client";

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (requireAdmin && !isAdmin) {
        // User is logged in but not an admin, redirect to home or an unauthorized page
        router.replace('/'); 
        // Optionally, show a toast message for unauthorized access
        // toast({ title: "Unauthorized", description: "You do not have permission to access this page.", variant: "destructive" });
      }
    }
  }, [user, isLoading, isAdmin, requireAdmin, router]);

  if (isLoading || !user || (requireAdmin && !isAdmin && user)) {
    // Show a loading state or skeleton while checking auth or if redirection is imminent
    return (
        <div className="space-y-8 p-8">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-64 w-full" />
            <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
