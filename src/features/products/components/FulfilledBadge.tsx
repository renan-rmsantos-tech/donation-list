import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FulfilledBadgeProps {
  isFulfilled: boolean;
}

export function FulfilledBadge({ isFulfilled }: FulfilledBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-2',
        isFulfilled
          ? 'border-green-500 text-green-700 bg-green-50 dark:bg-green-950/30 dark:text-green-400'
          : 'border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400'
      )}
    >
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          isFulfilled ? 'bg-green-600' : 'bg-orange-600'
        )}
      />
      {isFulfilled ? 'Atendido' : 'Necessário'}
    </Badge>
  );
}
