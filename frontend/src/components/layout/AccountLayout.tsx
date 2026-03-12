import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, User, MapPin, Heart, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/cuenta/pedidos', label: 'Mis Pedidos', icon: Package },
  { path: '/cuenta/perfil', label: 'Mi Perfil', icon: User },
  { path: '/cuenta/direcciones', label: 'Direcciones', icon: MapPin },
  { path: '/cuenta/favoritos', label: 'Favoritos', icon: Heart },
];

export default function AccountLayout() {
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500 mb-2">
          <ChevronLeft size={16} /> Volver a la tienda
        </Link>
        <h1 className="text-2xl font-bold">Mi Cuenta</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  active
                    ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
