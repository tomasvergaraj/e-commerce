import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Edit, ExternalLink, Image, Plus, Trash2 } from 'lucide-react';
import { bannersApi } from '@/api/services';
import { PageLoader } from '@/components/common/Loading';
import BannerImageUploadField from '@/components/common/BannerImageUploadField';
import toast from 'react-hot-toast';

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position?: number | null;
  isActive: boolean;
};

type BannerFormValues = {
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  position: number;
  isActive: boolean;
};

const defaultValues: BannerFormValues = {
  title: '',
  subtitle: '',
  imageUrl: '',
  linkUrl: '',
  position: 0,
  isActive: true,
};

export default function AdminBannersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['admin-banners'], queryFn: () => bannersApi.adminGetAll() });
  const banners = ((data as any)?.data || data || []) as Banner[];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormValues>({ defaultValues });

  const imageUrl = watch('imageUrl');

  const saveMut = useMutation({
    mutationFn: (payload: BannerFormValues) => (editId ? bannersApi.update(editId, payload) : bannersApi.create(payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      setShowForm(false);
      setEditId(null);
      reset(defaultValues);
      toast.success(editId ? 'Banner actualizado.' : 'Banner creado.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'No se pudo guardar el banner.');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => bannersApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-banners'] });
      toast.success('Banner eliminado.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'No se pudo eliminar el banner.');
    },
  });

  const openCreateForm = () => {
    setEditId(null);
    reset(defaultValues);
    setShowForm((current) => {
      if (current && !editId) return false;
      return true;
    });
  };

  const openEditForm = (banner: Banner) => {
    setEditId(banner.id);
    reset({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      position: banner.position ?? 0,
      isActive: banner.isActive,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    reset(defaultValues);
  };

  const onSubmit = handleSubmit((values) => {
    if (!values.imageUrl.trim()) {
      toast.error('Sube una imagen o ingresa una URL valida para el banner.');
      return;
    }

    saveMut.mutate({
      title: values.title.trim(),
      subtitle: values.subtitle.trim(),
      imageUrl: values.imageUrl.trim(),
      linkUrl: values.linkUrl.trim(),
      position: Number.isFinite(values.position) ? values.position : 0,
      isActive: values.isActive,
    });
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Administra los banners del carrusel principal y reemplaza sus imagenes con recorte incluido.</p>
        </div>
        <button onClick={openCreateForm} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nuevo banner
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card p-6 mb-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{editId ? 'Editar banner' : 'Nuevo banner'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Usa imagenes panoramicas. El recorte exporta una version optimizada de 1920 x 600 px.
              </p>
            </div>
            <button type="button" onClick={handleCancel} className="btn-outline">
              Cancelar
            </button>
          </div>

          <BannerImageUploadField
            value={imageUrl}
            onChange={(url) => setValue('imageUrl', url, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
            disabled={saveMut.isPending}
          />

          <div>
            <label className="text-sm font-medium mb-1 block">URL final de imagen *</label>
            <input
              {...register('imageUrl', { required: true })}
              className="input-field"
              placeholder="/uploads/mi-banner.jpg o https://..."
            />
            {errors.imageUrl && <p className="text-xs text-red-500 mt-1">La imagen del banner es obligatoria.</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Titulo *</label>
              <input {...register('title', { required: true })} className="input-field" placeholder="Ej: Nueva coleccion de invierno" />
              {errors.title && <p className="text-xs text-red-500 mt-1">El titulo es obligatorio.</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Subtitulo</label>
              <input {...register('subtitle')} className="input-field" placeholder="Texto de apoyo del banner" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
            <div>
              <label className="text-sm font-medium mb-1 block">Link del banner</label>
              <input {...register('linkUrl')} className="input-field" placeholder="/productos/ofertas o https://..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Posicion</label>
              <input {...register('position', { valueAsNumber: true })} type="number" min={0} className="input-field" />
            </div>
          </div>

          <label className="inline-flex items-center gap-3 text-sm font-medium">
            <input {...register('isActive')} type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
            Banner activo
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saveMut.isPending} className="btn-primary inline-flex items-center gap-2">
              <Image size={16} />
              {saveMut.isPending ? 'Guardando...' : editId ? 'Actualizar banner' : 'Guardar banner'}
            </button>
            <button type="button" onClick={handleCancel} className="btn-outline">
              Cerrar formulario
            </button>
          </div>
        </form>
      )}

      {banners.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-medium text-gray-900 dark:text-white">Aun no hay banners registrados.</p>
          <p className="text-sm text-gray-500 mt-1">Crea el primero y sube una imagen panoramica para el carrusel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="card overflow-hidden">
              <div className="aspect-[16/5] bg-gray-100 dark:bg-gray-800">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{banner.title}</h3>
                    {banner.subtitle && <p className="text-sm text-gray-500 mt-1">{banner.subtitle}</p>}
                    {banner.linkUrl && (
                      <a
                        href={banner.linkUrl}
                        target={banner.linkUrl.startsWith('http') ? '_blank' : undefined}
                        rel={banner.linkUrl.startsWith('http') ? 'noreferrer' : undefined}
                        className="inline-flex items-center gap-1 text-xs text-primary-500 hover:underline mt-2"
                      >
                        <ExternalLink size={12} />
                        {banner.linkUrl}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditForm(banner)} className="btn-outline px-3 py-2 text-sm inline-flex items-center gap-2">
                      <Edit size={14} />
                      Editar
                    </button>
                    <button
                      onClick={() => deleteMut.mutate(banner.id)}
                      disabled={deleteMut.isPending}
                      className="btn-danger px-3 py-2 text-sm inline-flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`badge ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {banner.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="badge bg-gray-100 text-gray-700">
                    Posicion {banner.position ?? 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
