import { useDeferredValue, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '@/api/services';
import { cn, formatPrice } from '@/lib/utils';

type SearchSuggestionProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand?: string | null;
  images?: Array<{ url: string }>;
};

type StoreSearchBoxProps = {
  storeName: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  placeholder?: string;
  autoFocus?: boolean;
  showSubmitButton?: boolean;
  onAfterNavigate?: () => void;
};

export default function StoreSearchBox({
  storeName,
  className,
  inputClassName,
  buttonClassName,
  placeholder,
  autoFocus = false,
  showSubmitButton = false,
  onAfterNavigate,
}: StoreSearchBoxProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const deferredQuery = useDeferredValue(query.trim());

  const { data, isLoading } = useQuery({
    queryKey: ['store-search-suggestions', deferredQuery],
    queryFn: () => productsApi.getAll({ page: 1, limit: 5, search: deferredQuery }),
    enabled: deferredQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  const result = (data as any)?.data || data || { items: [] };
  const suggestions = (Array.isArray(result.items) ? result.items : []) as SearchSuggestionProduct[];
  const canSuggest = deferredQuery.length >= 2;
  const shouldShowSuggestions = isOpen && canSuggest;
  const totalOptions = suggestions.length + 1;

  useEffect(() => {
    setActiveIndex(-1);
  }, [deferredQuery]);

  const finishNavigation = () => {
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    onAfterNavigate?.();
  };

  const submitSearch = (term = query) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    navigate(`/productos?search=${encodeURIComponent(trimmed)}`);
    finishNavigation();
  };

  const openSuggestion = (slug: string) => {
    navigate(`/productos/${slug}`);
    finishNavigation();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!canSuggest) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current >= totalOptions - 1 ? 0 : current + 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => (current <= 0 ? totalOptions - 1 : current - 1));
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();

      if (activeIndex < suggestions.length) {
        openSuggestion(suggestions[activeIndex].slug);
        return;
      }

      submitSearch(deferredQuery);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      }}
      className={cn('relative w-full', className)}
    >
      <div className="relative w-full">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Buscar en ${storeName}...`}
          autoFocus={autoFocus}
          className={cn(
            showSubmitButton
              ? 'w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-11 pr-28 text-sm text-gray-700 outline-none transition-colors focus:border-primary-500 focus:bg-white dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200'
              : 'input-field pl-10 pr-12',
            inputClassName,
          )}
        />
        {showSubmitButton ? (
          <button
            type="submit"
            className={cn(
              'absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600',
              buttonClassName,
            )}
          >
            Buscar
          </button>
        ) : (
          <button
            type="submit"
            className={cn(
              'absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-primary-500 transition-colors hover:bg-primary-50 dark:hover:bg-primary-950/40',
              buttonClassName,
            )}
            aria-label="Buscar productos"
          >
            <Search size={16} />
          </button>
        )}
      </div>

      {shouldShowSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.65rem)] z-50 overflow-hidden rounded-[26px] border border-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/95">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
              Sugerencias
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isLoading ? 'Buscando coincidencias...' : `Resultados rapidos para "${deferredQuery}"`}
            </p>
          </div>

          <div className="max-h-[22rem] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 size={16} className="animate-spin text-primary-500" />
                Cargando sugerencias...
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((product, index) => (
                <button
                  key={product.id}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => openSuggestion(product.slug)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors',
                    activeIndex === index
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900',
                  )}
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                    <img
                      src={product.images?.[0]?.url || 'https://placehold.co/120x120/e2e8f0/94a3b8?text=Producto'}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    {product.brand ? (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                        {product.brand}
                      </p>
                    ) : null}
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="mt-1 text-sm text-primary-600 dark:text-primary-300">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                No encontramos productos que coincidan, pero puedes buscar en todo el catalogo.
              </div>
            )}

            <button
              type="button"
              onMouseEnter={() => setActiveIndex(suggestions.length)}
              onClick={() => submitSearch(deferredQuery)}
              className={cn(
                'mt-1 flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium transition-colors',
                activeIndex === suggestions.length
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-200'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900',
              )}
            >
              <span>Ver todos los resultados para "{deferredQuery}"</span>
              <Search size={15} className="shrink-0" />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
