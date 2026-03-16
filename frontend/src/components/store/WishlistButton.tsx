import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { wishlistApi } from '@/api/services';
import { useAuthStore } from '@/stores/authStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type WishlistButtonProps = {
  productId: string;
  className?: string;
  iconClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  iconSize?: number;
};

export default function WishlistButton({
  productId,
  className,
  iconClassName,
  activeClassName,
  inactiveClassName,
  iconSize = 20,
}: WishlistButtonProps) {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const { ids, isLoaded, sync, setInWishlist, clear } = useWishlistStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const isWishlisted = isAuthenticated && ids.includes(productId);

  useEffect(() => {
    if (!isAuthenticated) {
      clear();
      return;
    }

    if (user?.id && !isLoaded) {
      sync(user.id).catch(() => {
        toast.error('No se pudieron cargar tus favoritos');
      });
    }
  }, [clear, isAuthenticated, isLoaded, sync, user?.id]);

  useEffect(() => {
    if (!isAnimating) return;

    const timerId = window.setTimeout(() => setIsAnimating(false), 360);
    return () => window.clearTimeout(timerId);
  }, [isAnimating]);

  const toggleMutation = useMutation({
    mutationFn: () => wishlistApi.toggle(productId),
    onMutate: async () => {
      const nextValue = !isWishlisted;
      setInWishlist(productId, nextValue);

      if (nextValue) {
        setIsAnimating(false);
        window.requestAnimationFrame(() => setIsAnimating(true));
      }

      return { previousValue: isWishlisted };
    },
    onError: (error: any, _variables, context) => {
      setInWishlist(productId, context?.previousValue ?? false);
      toast.error(error.message || 'No se pudo actualizar favoritos');
    },
    onSuccess: (response, _variables, context) => {
      const payload = (response as any)?.data || response || {};
      const added = typeof payload.added === 'boolean' ? payload.added : !context?.previousValue;
      setInWishlist(productId, added);
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(payload.message || (added ? 'Agregado a favoritos' : 'Eliminado de favoritos'));
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Inicia sesión para usar favoritos');
      return;
    }

    if (!user?.id) {
      toast.error('No pudimos identificar tu sesión');
      return;
    }

    toggleMutation.mutate();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isWishlisted ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={isWishlisted}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden transition-all duration-200',
        isWishlisted
          ? activeClassName || 'bg-red-50 text-red-500 border border-red-200 dark:bg-red-950/50 dark:border-red-900/60'
          : inactiveClassName || 'bg-white/90 text-gray-500 border border-white/70 dark:bg-gray-900/85 dark:border-gray-700/70 dark:text-gray-300',
        toggleMutation.isPending ? 'opacity-90' : 'hover:scale-105',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rounded-full bg-red-500/15 opacity-0',
          isAnimating && 'wishlist-ring-pop',
        )}
      />
      <Heart
        size={iconSize}
        className={cn(
          'relative z-10 transition-all duration-200',
          isWishlisted ? 'fill-red-500 text-red-500' : '',
          isAnimating && 'wishlist-icon-pop',
          iconClassName,
        )}
      />
    </button>
  );
}
