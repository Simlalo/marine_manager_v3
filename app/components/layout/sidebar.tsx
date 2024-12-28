import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { 
  Ship, 
  Users, 
  Settings,
  BarChart,
  CreditCard
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { UserRole } from '../../types/auth';

const navItems = [
  {
    title: 'Tableau de bord',
    href: '/',
    icon: BarChart,
    roles: [UserRole.ADMIN, UserRole.GERANT],
  },
  {
    title: 'Barques',
    href: '/barques',
    icon: Ship,
    roles: [UserRole.ADMIN, UserRole.GERANT],
  },
  {
    title: 'Gérants',
    href: '/gerants',
    icon: Users,
    roles: [UserRole.ADMIN],
  },
  {
    title: 'Responsables',
    href: '/responsables',
    icon: Users,
    roles: [UserRole.GERANT],
  },
  {
    title: 'Paiements',
    href: '/paiements',
    icon: CreditCard,
    roles: [UserRole.GERANT],
  },
  {
    title: 'Paramètres',
    href: '/settings',
    icon: Settings,
    roles: [UserRole.ADMIN, UserRole.GERANT],
  },
];

export function Sidebar() {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  const authorizedItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <nav className="hidden lg:flex h-screen w-64 flex-col border-r bg-white px-4 py-8">
      <div className="space-y-4">
        {authorizedItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900',
                isActive ? 'bg-gray-100 text-gray-900' : ''
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
