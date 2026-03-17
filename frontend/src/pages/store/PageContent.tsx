import { Fragment, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  ChevronRight,
  FileText,
  LifeBuoy,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { settingsApi } from '@/api/services';
import { PageLoader } from '@/components/common/Loading';
import { asArray } from '@/lib/utils';

type CmsPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
};

type PublicPageLink = {
  id: string;
  title: string;
  slug: string;
};

type PublicSettings = {
  store_name?: string;
  store_description?: string;
  store_email?: string;
  store_phone?: string;
  store_address?: string;
};

type ContentBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] };

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function renderInlineContent(text: string) {
  return text
    .split(/(\*\*.*?\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={`${part}-${index}`} className="font-semibold text-gray-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }

      return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
    });
}

function parseContent(content: string, pageTitle: string) {
  const blocks: ContentBlock[] = [];
  const lines = content.replace(/\r/g, '').split('\n');
  let currentParagraph: string[] = [];
  let currentList: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (!currentParagraph.length) return;
    blocks.push({ type: 'paragraph', text: currentParagraph.join(' ') });
    currentParagraph = [];
  };

  const flushList = () => {
    if (!currentList || currentList.items.length === 0) return;
    blocks.push({ type: 'list', ordered: currentList.ordered, items: currentList.items });
    currentList = null;
  };

  const pushHeading = (level: 2 | 3, text: string) => {
    flushParagraph();
    flushList();

    const isRepeatedTitle =
      blocks.length === 0 && normalizeText(text) === normalizeText(pageTitle);

    if (!isRepeatedTitle) {
      blocks.push({ type: 'heading', level, text });
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('### ')) {
      pushHeading(3, line.slice(4).trim());
      continue;
    }

    if (line.startsWith('## ')) {
      pushHeading(2, line.slice(3).trim());
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (!currentList || !currentList.ordered) {
        flushList();
        currentList = { ordered: true, items: [] };
      }
      currentList.items.push(line.replace(/^\d+\.\s+/, '').trim());
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      if (!currentList || currentList.ordered) {
        flushList();
        currentList = { ordered: false, items: [] };
      }
      currentList.items.push(line.replace(/^[-*]\s+/, '').trim());
      continue;
    }

    flushList();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}

function getIntro(blocks: ContentBlock[], fallback?: string | null) {
  const firstParagraph = blocks.find((block) => block.type === 'paragraph') as
    | Extract<ContentBlock, { type: 'paragraph' }>
    | undefined;

  return fallback?.trim() || firstParagraph?.text || 'Información importante para tu compra y experiencia en la tienda.';
}

export default function PageContent() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => settingsApi.getPage(slug!),
    enabled: !!slug,
  });
  const { data: publicSettingsData } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => settingsApi.getPublic(),
    staleTime: 5 * 60 * 1000,
  });
  const { data: publicPagesData } = useQuery({
    queryKey: ['public-pages'],
    queryFn: () => settingsApi.getPublicPages(),
    staleTime: 5 * 60 * 1000,
  });

  const pageCandidate = (data as any)?.data || data;
  const page = pageCandidate && typeof pageCandidate === 'object' ? (pageCandidate as CmsPage) : null;
  const settings = ((publicSettingsData as any)?.data || publicSettingsData || {}) as PublicSettings;
  const publicPages = asArray<PublicPageLink>(publicPagesData);
  const storeName = settings.store_name?.trim() || 'Nexo';
  const storeEmail = settings.store_email?.trim() || 'contacto@nexo.cl';
  const storePhone = settings.store_phone?.trim() || '+56 9 1234 5678';
  const storeAddress = settings.store_address?.trim() || 'Santiago, Chile';

  const pageTitle = typeof page?.title === 'string' ? page.title : 'Página informativa';
  const pageContent = typeof page?.content === 'string' ? page.content : '';
  const blocks = page ? parseContent(pageContent, pageTitle) : [];
  const intro = getIntro(blocks, page?.metaDesc);
  const readingMinutes = page ? Math.max(1, Math.round(pageContent.split(/\s+/).filter(Boolean).length / 180)) : 1;
  const navigationItems = page
    ? (
      publicPages.some((item) => item.slug === page.slug)
        ? publicPages
        : [{ id: page.id, slug: page.slug, title: page.title }, ...publicPages]
    )
    : publicPages;

  useEffect(() => {
    if (!page) return;

    const previousTitle = document.title;
    const metaDescription = document.querySelector('meta[name="description"]');
    const previousDescription = metaDescription?.getAttribute('content') ?? null;

    document.title = page.metaTitle?.trim() || `${page.title} | ${storeName}`;

    if (metaDescription) {
      metaDescription.setAttribute('content', intro);
    }

    return () => {
      document.title = previousTitle;
      if (metaDescription && previousDescription !== null) {
        metaDescription.setAttribute('content', previousDescription);
      }
    };
  }, [intro, page, storeName]);

  if (isLoading) return <PageLoader />;

  if (!page) {
    return (
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.14),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_30%),linear-gradient(180deg,rgba(2,6,23,0.95),rgba(3,7,18,1))]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <div className="card p-8 md:p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
              <FileText size={28} />
            </div>
            <h1 className="mt-6 text-3xl md:text-4xl font-bold">Página no encontrada</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              La sección que buscas no está disponible o fue movida. Puedes volver al inicio o explorar los productos de la tienda.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/" className="btn-primary inline-flex items-center gap-2">
                Volver al inicio <ArrowRight size={16} />
              </Link>
              <Link to="/productos" className="btn-outline">
                Ver productos
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-gray-50/70 dark:bg-gray-950">
      <section className="relative overflow-hidden border-b border-gray-200/80 dark:border-gray-800 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.24),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,1))]">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.04))] dark:bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-white/80 dark:bg-gray-900/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300 backdrop-blur-sm">
              <FileText size={14} />
              Información de la tienda
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/" className="hover:text-primary-500 transition-colors">Inicio</Link>
              <ChevronRight size={14} />
              <span className="text-gray-700 dark:text-gray-300">{page.title}</span>
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight text-gray-950 dark:text-white">
              {page.title}
            </h1>

            <p className="mt-5 text-lg md:text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl">
              {intro}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 px-4 py-2">
                Lectura estimada: {readingMinutes} min
              </span>
              <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 px-4 py-2">
                {storeName}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="relative isolate overflow-hidden rounded-[30px] border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/90 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.34)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_55%),linear-gradient(180deg,rgba(240,249,255,0.9),transparent)] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_52%),linear-gradient(180deg,rgba(8,47,73,0.24),transparent)]" />
            <div className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full bg-primary-400/10 blur-3xl dark:bg-primary-500/10" />
            <div className="pointer-events-none absolute left-10 top-28 h-24 w-24 rounded-full border border-primary-200/70 dark:border-primary-500/10" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[29px] border border-white/70 dark:border-white/5" />
            <div className="relative h-1.5 bg-[linear-gradient(90deg,rgba(6,182,212,1),rgba(14,165,233,0.6),rgba(34,211,238,0.22))]" />
            <div className="relative px-6 py-8 md:px-10 md:py-10">
              <div className="rounded-[24px] border border-primary-100/80 dark:border-primary-500/15 bg-[linear-gradient(135deg,rgba(240,249,255,0.92),rgba(255,255,255,0.9)_42%,rgba(236,254,255,0.85))] dark:bg-[linear-gradient(135deg,rgba(8,47,73,0.36),rgba(17,24,39,0.92)_45%,rgba(2,132,199,0.12))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:px-6">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-300">
                        Guía y políticas
                      </span>
                      <span className="inline-flex h-2 w-2 rounded-full bg-primary-400/80" />
                      <span className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                        Lectura clara para clientes
                      </span>
                    </div>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300 md:text-[15px]">
                      Revisa esta información antes de comprar o solicitar soporte. Organizamos el contenido para que sea fácil de escanear, consultar y volver a revisar cuando lo necesites.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-white/80 dark:border-white/10 bg-white/80 dark:bg-gray-950/50 px-4 py-4 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                      Consulta rápida
                    </p>
                    <div className="mt-3 space-y-3">
                      <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Lectura
                        </p>
                        <p className="mt-1 text-xl font-semibold text-gray-950 dark:text-white">
                          {readingMinutes} min
                        </p>
                      </div>
                      <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                          Tienda
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                          {storeName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative mt-10 space-y-8 md:pl-6 before:hidden before:content-[''] md:before:absolute md:before:left-0 md:before:top-2 md:before:bottom-2 md:before:block md:before:w-px md:before:bg-[linear-gradient(180deg,rgba(6,182,212,0),rgba(6,182,212,0.35),rgba(14,165,233,0.14),rgba(6,182,212,0))] dark:md:before:bg-[linear-gradient(180deg,rgba(34,211,238,0),rgba(34,211,238,0.26),rgba(14,165,233,0.12),rgba(34,211,238,0))]">
                {blocks.map((block, index) => {
                  if (block.type === 'heading') {
                    if (block.level === 2) {
                      return (
                        <div key={`${block.text}-${index}`} className="pt-2">
                          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-950 dark:text-white">
                            {renderInlineContent(block.text)}
                          </h2>
                        </div>
                      );
                    }

                    return (
                      <div key={`${block.text}-${index}`} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/70 px-5 py-4">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                          {renderInlineContent(block.text)}
                        </h3>
                      </div>
                    );
                  }

                  if (block.type === 'list') {
                    const ListTag = block.ordered ? 'ol' : 'ul';

                    return (
                      <div key={`${block.type}-${index}`} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950/60 px-5 py-5">
                        <ListTag className={block.ordered ? 'space-y-3 list-decimal pl-5 marker:text-primary-500' : 'space-y-3 list-disc pl-5 marker:text-primary-500'}>
                          {block.items.map((item, itemIndex) => (
                            <li key={`${item}-${itemIndex}`} className="pl-1 text-[15px] leading-7 text-gray-700 dark:text-gray-300">
                              {renderInlineContent(item)}
                            </li>
                          ))}
                        </ListTag>
                      </div>
                    );
                  }

                  return (
                    <p key={`${block.text}-${index}`} className="text-[15px] md:text-base leading-8 text-gray-700 dark:text-gray-300">
                      {renderInlineContent(block.text)}
                    </p>
                  );
                })}
              </div>
            </div>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 self-start">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-semibold">Más información</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Accede rápido a otras páginas útiles.</p>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = item.slug === page.slug;

                  return (
                    <Link
                      key={item.id}
                      to={`/pagina/${item.slug}`}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-all ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="font-medium">{item.title}</span>
                      <ChevronRight size={16} />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/10 text-primary-500">
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <p className="font-semibold">¿Necesitas ayuda?</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Nuestro equipo puede orientarte.</p>
                </div>
              </div>

              <div className="mt-5 space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-3">
                  <Mail size={18} className="mt-0.5 shrink-0 text-primary-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Correo</p>
                    <a href={`mailto:${storeEmail}`} className="hover:text-primary-500 transition-colors">
                      {storeEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="mt-0.5 shrink-0 text-primary-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Teléfono</p>
                    <a href={`tel:${storePhone.replace(/\s+/g, '')}`} className="hover:text-primary-500 transition-colors">
                      {storePhone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-primary-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Ubicación</p>
                    <p>{storeAddress}</p>
                  </div>
                </div>
              </div>

              <Link to="/productos" className="btn-primary mt-6 inline-flex w-full items-center justify-center gap-2">
                Explorar productos <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
