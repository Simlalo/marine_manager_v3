import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '~/stores/auth.store';
import { UserRole } from '~/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" state={{ from: location.pathname, requiredRole }} replace />;
  }

  return <>{children}</>;
};
