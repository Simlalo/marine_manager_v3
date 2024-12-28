import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout';
import { LoginPage } from './pages/auth/login-page';
import { RegisterPage } from './pages/auth/register-page';
import { DashboardPage } from './pages/dashboard/dashboard-page';
import BarquesPage from './pages/barques/barques-page';
import { GerantsPage } from './pages/gerants/gerants-page';
import { GerantBarquesPage } from './pages/gerants/gerant-barques-page';
import { ProfilePage } from './pages/profile/profile-page';
import { UnauthorizedPage } from './pages/unauthorized-page';
import { ProtectedRoute } from './components/auth/protected-route';
import { UserRole } from './types/auth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'barques',
        element: (
          <ProtectedRoute>
            <BarquesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'gerants',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <GerantsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: ':gerantId/barques',
            element: (
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <GerantBarquesPage />
              </ProtectedRoute>
            ),
          },
        ],
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
]);
