import { Package } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="flex justify-center mb-4 text-gray-400 dark:text-gray-500">
        {icon || <Package size={48} />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
