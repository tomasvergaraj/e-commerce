import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
      <h1 className="text-3xl font-bold mb-4">¡Pedido confirmado!</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-2">Tu pedido ha sido procesado exitosamente.</p>
      <p className="text-lg font-semibold text-primary-500 mb-8">N° {orderNumber}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/cuenta/pedidos" className="btn-primary flex items-center justify-center gap-2">
          <Package size={18} /> Ver mis pedidos
        </Link>
        <Link to="/productos" className="btn-outline">Seguir comprando</Link>
      </div>
    </div>
  );
}
