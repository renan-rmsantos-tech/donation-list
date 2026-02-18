import { calculateProgressPercentage, formatCurrency } from '@/lib/utils/format';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentAmount: number;
  targetAmount: number;
}

export function ProgressBar({ currentAmount, targetAmount }: ProgressBarProps) {
  const percentage = calculateProgressPercentage(currentAmount, targetAmount);
  const isComplete = percentage >= 100;

  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Progresso</span>
        <span
          className={cn(
            'text-sm font-semibold',
            isComplete ? 'text-green-600' : 'text-muted-foreground'
          )}
        >
          {percentage}%
        </span>
      </div>
      <Progress value={Math.min(percentage, 100)} className="h-2" />
      <div className="text-xs text-muted-foreground">
        {formatCurrency(currentAmount)} de {formatCurrency(targetAmount)}
      </div>
    </div>
  );
}
