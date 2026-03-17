import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

// Layouts
import StoreLayout from '@/components/layout/StoreLayout';
import AccountLayout from '@/components/layout/AccountLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Store pages
import HomePage from '@/pages/store/HomePage';
import CatalogPage from '@/pages/store/CatalogPage';
import ProductDetailPage from '@/pages/store/ProductDetailPage';
import CartPage from '@/pages/store/CartPage';
import CheckoutPage from '@/pages/store/CheckoutPage';
import OrderConfirmationPage from '@/pages/store/OrderConfirmationPage';
import PageContent from '@/pages/store/PageContent';
import LoginPage from '@/pages/store/LoginPage';
import RegisterPage from '@/pages/store/RegisterPage';

// Account pages
import OrdersPage from '@/pages/account/OrdersPage';
import OrderDetailPage from '@/pages/account/OrderDetailPage';
import ProfilePage from '@/pages/account/ProfilePage';
import AddressesPage from '@/pages/account/AddressesPage';
import WishlistPage from '@/pages/account/WishlistPage';

// Admin pages
import DashboardPage from '@/pages/admin/dashboard/DashboardPage';
import AdminProductsPage from '@/pages/admin/products/AdminProductsPage';
import AdminProductFormPage from '@/pages/admin/products/AdminProductFormPage';
import AdminOrdersPage from '@/pages/admin/orders/AdminOrdersPage';
import AdminOrderDetailPage from '@/pages/admin/orders/AdminOrderDetailPage';
import AdminCustomersPage from '@/pages/admin/customers/AdminCustomersPage';
import AdminSettingsPage from '@/pages/admin/settings/AdminSettingsPage';
import AdminPagesPage from '@/pages/admin/settings/AdminPagesPage';
import AdminBannersPage from '@/pages/admin/banners/AdminBannersPage';
import AdminReviewsPage from '@/pages/admin/reviews/AdminReviewsPage';
import AdminCategoriesPage from '@/pages/admin/settings/AdminCategoriesPage';

// Guards
import ProtectedRoute from '@/components/common/ProtectedRoute';
import AdminRoute from '@/components/common/AdminRoute';
import ScrollToTop from '@/components/common/ScrollToTop';

export default function App() {
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Store */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/productos" element={<CatalogPage />} />
          <Route path="/categorias/:slug" element={<CatalogPage />} />
          <Route path="/productos/:slug" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedido-confirmado/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/pagina/:slug" element={<PageContent />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
        </Route>

        {/* Customer Account */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AccountLayout />}>
            <Route path="/cuenta/pedidos" element={<OrdersPage />} />
            <Route path="/cuenta/pedidos/:orderNumber" element={<OrderDetailPage />} />
            <Route path="/cuenta/perfil" element={<ProfilePage />} />
            <Route path="/cuenta/direcciones" element={<AddressesPage />} />
            <Route path="/cuenta/favoritos" element={<WishlistPage />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/productos" element={<AdminProductsPage />} />
            <Route path="/admin/productos/nuevo" element={<AdminProductFormPage />} />
            <Route path="/admin/productos/:id/editar" element={<AdminProductFormPage />} />
            <Route path="/admin/pedidos" element={<AdminOrdersPage />} />
            <Route path="/admin/pedidos/:id" element={<AdminOrderDetailPage />} />
            <Route path="/admin/clientes" element={<AdminCustomersPage />} />
            <Route path="/admin/configuracion" element={<AdminSettingsPage />} />
            <Route path="/admin/paginas" element={<AdminPagesPage />} />
            <Route path="/admin/categorias" element={<AdminCategoriesPage />} />
            <Route path="/admin/banners" element={<AdminBannersPage />} />
            <Route path="/admin/resenas" element={<AdminReviewsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
