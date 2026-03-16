import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings, Image,
  Star, Tag, Menu, X, ChevronLeft, LogOut, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/productos', label: 'Productos', icon: Package },
  { path: '/admin/categorias', label: 'Categorías', icon: Tag },
  { path: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { path: '/admin/clientes', label: 'Clientes', icon: Users },
  { path: '/admin/banners', label: 'Banners', icon: Image },
  { path: '/admin/paginas', label: 'Páginas', icon: FileText },
  { path: '/admin/resenas', label: 'Reseñas', icon: Star },
  { path: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">N</div>
              <span className="font-bold text-lg">Nexo Admin</span>
            </Link>
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
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

          {/* Bottom */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 mb-3">
              <ChevronLeft size={16} /> Ir a la tienda
            </Link>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">{user?.firstName}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button onClick={() => { logout(); navigate('/login'); }} className="p-2 text-gray-400 hover:text-red-500">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center px-4 lg:px-6 gap-4">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-gray-500">{user?.email}</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
