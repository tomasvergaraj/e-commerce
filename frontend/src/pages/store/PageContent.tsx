import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/api/services';
import { PageLoader } from '@/components/common/Loading';

export default function PageContent() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => settingsApi.getPage(slug!),
    enabled: !!slug,
  });

  const page = (data as any)?.data || data;

  if (isLoading) return <PageLoader />;
  if (!page) return <div className="text-center py-20 text-gray-500">Página no encontrada</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
      <div className="prose dark:prose-invert max-w-none leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
        {page.content}
      </div>
    </div>
  );
}
