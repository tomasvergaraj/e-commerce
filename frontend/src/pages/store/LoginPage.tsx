import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/api/services';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit } = useForm({ defaultValues: { email: '', password: '' } });

  const from = (location.state as any)?.from?.pathname || '/';

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      const d = (res as any)?.data || res;
      setAuth(d.token, d.user);
      toast.success(`¡Bienvenido, ${d.user.firstName}!`);
      navigate(d.user.role === 'ADMIN' || d.user.role === 'SUPER_ADMIN' ? '/admin' : from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input {...register('email', { required: true })} type="email" className="input-field" placeholder="tu@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Contraseña</label>
            <input {...register('password', { required: true })} type="password" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            Ingresar
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta? <Link to="/registro" className="text-primary-500 hover:underline font-medium">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
