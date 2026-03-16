import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Plus,
  Trash2,
} from 'lucide-react';
import { settingsApi } from '@/api/services';
import { PageLoader } from '@/components/common/Loading';
import toast from 'react-hot-toast';

type CmsPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  metaTitle?: string | null;
  metaDesc?: string | null;
  updatedAt: string;
};

type PageFormValues = {
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDesc: string;
  isActive: boolean;
};

const defaultValues: PageFormValues = {
  title: '',
  slug: '',
  content: '',
  metaTitle: '',
  metaDesc: '',
  isActive: true,
};

function buildSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export default function AdminPagesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: () => settingsApi.getPages(),
  });
  const pages = ((data as any)?.data || data || []) as CmsPage[];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<PageFormValues>({ defaultValues });

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  const previewSlug = useMemo(() => buildSlug(watchedSlug || watchedTitle || ''), [watchedSlug, watchedTitle]);

  const saveMutation = useMutation({
    mutationFn: (payload: PageFormValues) => (
      editId
        ? settingsApi.updatePage(editId, payload)
        : settingsApi.createPage(payload)
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] });
      qc.invalidateQueries({ queryKey: ['public-pages'] });
      setShowForm(false);
      setEditId(null);
      reset(defaultValues);
      toast.success(editId ? 'Página actualizada.' : 'Página creada.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'No se pudo guardar la página.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => settingsApi.deletePage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] });
      qc.invalidateQueries({ queryKey: ['public-pages'] });
      toast.success('Página eliminada.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'No se pudo eliminar la página.');
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

  const openEditForm = (page: CmsPage) => {
    setEditId(page.id);
    reset({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaTitle: page.metaTitle || '',
      metaDesc: page.metaDesc || '',
      isActive: page.isActive,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    reset(defaultValues);
  };

  const onSubmit = handleSubmit((values) => {
    const slug = buildSlug(values.slug || values.title);
    const title = values.title.trim();
    const content = values.content.trim();

    if (!title) {
      toast.error('El título es obligatorio.');
      return;
    }

    if (!slug) {
      toast.error('Ingresa un título o un slug válido.');
      return;
    }

    if (!content) {
      toast.error('El contenido de la página es obligatorio.');
      return;
    }

    saveMutation.mutate({
      title,
      slug,
      content,
      metaTitle: values.metaTitle.trim(),
      metaDesc: values.metaDesc.trim(),
      isActive: values.isActive,
    });
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Páginas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las páginas informativas del sitio, su contenido y si están publicadas o no.
          </p>
        </div>
        <button onClick={openCreateForm} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Nueva página
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="card p-6 mb-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{editId ? 'Editar página' : 'Nueva página'}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Puedes usar `##` para títulos, `###` para secciones, listas con `-` o `1.` y `**negritas**`.
              </p>
            </div>
            <button type="button" onClick={handleCancel} className="btn-outline">
              Cancelar
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Título *</label>
              <input
                {...register('title', { required: true })}
                className="input-field"
                placeholder="Ej: Política de envíos"
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">El título es obligatorio.</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug</label>
              <input
                {...register('slug')}
                className="input-field"
                placeholder="politica-envios"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL pública: <span className="font-mono">/pagina/{previewSlug || 'slug-de-la-pagina'}</span>
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Meta título</label>
              <input
                {...register('metaTitle')}
                className="input-field"
                placeholder="Título SEO opcional"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Meta descripción</label>
              <textarea
                {...register('metaDesc')}
                rows={3}
                className="input-field"
                placeholder="Resumen breve para SEO y cabecera"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Contenido *</label>
            <textarea
              {...register('content', { required: true })}
              rows={14}
              className="input-field min-h-[320px]"
              placeholder="Escribe aquí el contenido de la página..."
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">El contenido es obligatorio.</p>}
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-950/60 p-4 text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium text-gray-900 dark:text-white">Consejos rápidos</p>
            <ul className="mt-2 space-y-1">
              <li>Usa `##` para bloques principales y `###` para subtítulos internos.</li>
              <li>Las listas con `-` o `1.` se formatean automáticamente en la página pública.</li>
              <li>Si dejas el `slug` vacío, se generará a partir del título al guardar.</li>
            </ul>
          </div>

          <label className="inline-flex items-center gap-3 text-sm font-medium">
            <input
              {...register('isActive')}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            Página activa y visible en la tienda
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saveMutation.isPending} className="btn-primary inline-flex items-center gap-2">
              <FileText size={16} />
              {saveMutation.isPending ? 'Guardando...' : editId ? 'Actualizar página' : 'Guardar página'}
            </button>
            <button type="button" onClick={handleCancel} className="btn-outline">
              Cerrar formulario
            </button>
            {previewSlug && (
              <a
                href={`/pagina/${previewSlug}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline inline-flex items-center gap-2"
              >
                <ExternalLink size={16} />
                Abrir vista pública
              </a>
            )}
          </div>
        </form>
      )}

      {pages.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-medium text-gray-900 dark:text-white">Aún no hay páginas informativas registradas.</p>
          <p className="text-sm text-gray-500 mt-1">Crea la primera para mostrar contenido editorial o políticas en tu tienda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {pages.map((page) => (
            <div key={page.id} className="card p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
                  <FileText size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{page.title}</h3>
                    <span className={`badge ${page.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {page.isActive ? (
                        <>
                          <Eye size={12} className="mr-1" /> Activa
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} className="mr-1" /> Inactiva
                        </>
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-mono text-gray-500">/pagina/{page.slug}</p>

                  {page.metaDesc && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {page.metaDesc}
                    </p>
                  )}

                  {!page.metaDesc && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 whitespace-pre-line">
                      {page.content}
                    </p>
                  )}

                  <p className="mt-4 text-xs text-gray-500">
                    Última actualización: {new Date(page.updatedAt).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  onClick={() => openEditForm(page)}
                  className="btn-outline px-3 py-2 text-sm inline-flex items-center gap-2"
                >
                  <Edit size={14} />
                  Editar
                </button>
                {page.isActive && (
                  <a
                    href={`/pagina/${page.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline px-3 py-2 text-sm inline-flex items-center gap-2"
                  >
                    <ExternalLink size={14} />
                    Ver página
                  </a>
                )}
                <button
                  onClick={() => deleteMutation.mutate(page.id)}
                  disabled={deleteMutation.isPending}
                  className="btn-danger px-3 py-2 text-sm inline-flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
