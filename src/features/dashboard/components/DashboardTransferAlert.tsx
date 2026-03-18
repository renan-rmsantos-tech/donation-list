import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface DashboardTransferAlertProps {
  hasTransfersAvailable: boolean;
}

export function DashboardTransferAlert({
  hasTransfersAvailable,
}: DashboardTransferAlertProps) {
  if (!hasTransfersAvailable) {
    return null;
  }

  return (
    <Alert className="border-primary/50 bg-primary/5" data-testid="dashboard-transfer-alert">
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span>Há transferências de fundos disponíveis para realizar.</span>
        <Button asChild size="sm" variant="default">
          <Link href="/admin/transfers">Ir para Transferências</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
