import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit } from 'lucide-react';
import { bannersApi } from '@/api/services';
import { PageLoader } from '@/components/common/Loading';
import toast from 'react-hot-toast';

export default function AdminBannersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['admin-banners'], queryFn: () => bannersApi.adminGetAll() });
  const banners = (data as any)?.data || data || [];

  const { register, handleSubmit, reset } = useForm();

  const saveMut = useMutation({
    mutationFn: (d: any) => editId ? bannersApi.update(editId, d) : bannersApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-banners'] }); setShowForm(false); setEditId(null); reset(); toast.success('Guardado'); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => bannersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Eliminado'); },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <button onClick={() => { setEditId(null); reset({}); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Nuevo</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit((d) => saveMut.mutate({ ...d, isActive: true, position: 0 }))} className="card p-6 mb-6 space-y-4 max-w-lg">
          <div><label className="text-sm font-medium mb-1 block">Título *</label><input {...register('title', { required: true })} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Subtítulo</label><input {...register('subtitle')} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">URL de imagen *</label><input {...register('imageUrl', { required: true })} className="input-field" /></div>
          <div><label className="text-sm font-medium mb-1 block">Link</label><input {...register('linkUrl')} className="input-field" /></div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary">Guardar</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancelar</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner: any) => (
          <div key={banner.id} className="card overflow-hidden">
            <div className="h-40 bg-gray-100 dark:bg-gray-800">
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{banner.title}</h3>
              {banner.subtitle && <p className="text-sm text-gray-500">{banner.subtitle}</p>}
              <div className="flex gap-2 mt-3">
                <span className={`badge ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {banner.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <button onClick={() => deleteMut.mutate(banner.id)} className="ml-auto text-red-500 hover:underline text-sm"><Trash2 size={14} className="inline" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
