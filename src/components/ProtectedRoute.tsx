import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

interface ProtectedRouteProps {
  role?: UserRole;
}

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && currentUser.role !== role) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<ShieldAlert className="h-9 w-9" />}
          title="This area is restricted"
          description="The studio dashboard is available to store administrators. Sign in with the admin demo account to explore it."
          action={<Button to="/account">Back to my account</Button>}
        />
      </div>
    );
  }

  return <Outlet />;
}
