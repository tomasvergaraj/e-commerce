import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/authStore';
import { authApi, usersApi } from '@/api/services';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' },
  });
  const { register: regPwd, handleSubmit: handlePwd, reset } = useForm();

  const onSaveProfile = async (data: any) => {
    setSaving(true);
    try {
      const res = await usersApi.updateProfile(data);
      const d = (res as any)?.data || res;
      setUser({ ...user!, ...d });
      toast.success('Perfil actualizado');
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  const onChangePassword = async (data: any) => {
    if (data.newPassword !== data.confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }
    try {
      await authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Contraseña actualizada');
      reset();
    } catch (e: any) { toast.error(e.message || 'Error'); }
  };

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Datos personales</h2>
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <input value={user?.email} disabled className="input-field bg-gray-50 dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Nombre</label><input {...register('firstName')} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Apellido</label><input {...register('lastName')} className="input-field" /></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Teléfono</label><input {...register('phone')} className="input-field" /></div>
          <button type="submit" disabled={saving} className="btn-primary">Guardar cambios</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Cambiar contraseña</h2>
        <form onSubmit={handlePwd(onChangePassword)} className="space-y-4 max-w-md">
          <div><label className="text-sm font-medium mb-1 block">Contraseña actual</label><input {...regPwd('currentPassword', { required: true })} type="password" className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Nueva contraseña</label><input {...regPwd('newPassword', { required: true })} type="password" className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Confirmar nueva contraseña</label><input {...regPwd('confirmPassword', { required: true })} type="password" className="input-field" /></div>
          <button type="submit" className="btn-primary">Cambiar contraseña</button>
        </form>
      </div>
    </div>
  );
}
