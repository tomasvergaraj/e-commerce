import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { authApi } from '@/api/services';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    if (data.password !== data.confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }
    setLoading(true);
    try {
      const res = await authApi.register({ email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName, phone: data.phone });
      const d = (res as any)?.data || res;
      setAuth(d.token, d.user);
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Crear cuenta</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nombre *</label>
              <input {...register('firstName', { required: true })} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Apellido *</label>
              <input {...register('lastName', { required: true })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email *</label>
            <input {...register('email', { required: true })} type="email" className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Teléfono</label>
            <input {...register('phone')} className="input-field" placeholder="+56 9 1234 5678" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Contraseña *</label>
            <input {...register('password', { required: true, minLength: 6 })} type="password" className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Confirmar contraseña *</label>
            <input {...register('confirmPassword', { required: true })} type="password" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null} Crear cuenta
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary-500 hover:underline font-medium">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
