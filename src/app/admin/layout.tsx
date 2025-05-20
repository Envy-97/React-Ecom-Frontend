import { AuthGuard } from '@/components/auth/auth-guard';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAdmin={true}>
      <div className="py-4">
        {/* You can add admin-specific layout elements here, like a sub-navbar or sidebar */}
        {/* <h1 className="text-2xl font-semibold mb-4 text-primary">Admin Panel</h1> */}
        {children}
      </div>
    </AuthGuard>
  );
}
