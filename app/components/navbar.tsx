import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '~/stores/auth.store';
import { Button } from './ui/button';
import { UserRole } from '~/types/auth';
import { Ship, Users, Home, User } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/barques', label: 'Barques', icon: Ship },
    ...(user?.role === UserRole.ADMIN ? [{ path: '/gerants', label: 'Gérants', icon: Users }] : []),
    { path: '/profile', label: 'Profil', icon: User },
  ];

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">GestMarine</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                    isActive(path)
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
