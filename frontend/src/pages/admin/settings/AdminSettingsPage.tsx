import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { settingsApi } from '@/api/services';
import { PageLoader } from '@/components/common/Loading';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-settings'], queryFn: () => settingsApi.adminGetAll() });
  const settings = (data as any)?.data || data || {};

  const { register, handleSubmit } = useForm({ values: settings });

  const mutation = useMutation({
    mutationFn: (data: any) => settingsApi.bulkUpdate(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-settings'] }); toast.success('Configuración guardada'); },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="max-w-2xl space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Tienda</h2>
          <div><label className="text-sm font-medium mb-1 block">Nombre de la tienda</label>
            <input {...register('store_name')} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Descripción</label>
            <input {...register('store_description')} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Email</label><input {...register('store_email')} className="input-field" /></div>
            <div><label className="text-sm font-medium mb-1 block">Teléfono</label><input {...register('store_phone')} className="input-field" /></div>
          </div>
          <div><label className="text-sm font-medium mb-1 block">Dirección</label>
            <input {...register('store_address')} className="input-field" /></div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold">Redes sociales</h2>
          <div><label className="text-sm font-medium mb-1 block">Instagram</label><input {...register('social_instagram')} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Facebook</label><input {...register('social_facebook')} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Twitter / X</label><input {...register('social_twitter')} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">LinkedIn</label><input {...register('social_linkedin')} className="input-field" /></div>
        </div>

        <button type="submit" disabled={mutation.isPending} className="btn-primary flex items-center gap-2">
          <Save size={18} /> Guardar configuración
        </button>
      </form>
    </div>
  );
}
