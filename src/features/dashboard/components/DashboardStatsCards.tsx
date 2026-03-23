import { formatCurrency } from '@/lib/utils/format';
import type { DashboardStats } from '../queries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

const LOCALE_PT_BR = 'pt-BR';

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  const hasData =
    stats.totalMonetaryDonations > 0 ||
    stats.totalPhysicalFulfilled > 0 ||
    stats.totalPhysicalPending > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Total de Doações em Dinheiro
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(stats.totalMonetaryDonations, LOCALE_PT_BR)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total arrecadado em todas as doações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Itens Atendidos
            </h2>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${stats.totalPhysicalFulfilled > 0 ? 'text-green-700 dark:text-green-400' : ''}`}>
              {stats.totalPhysicalFulfilled}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Itens que atingiram a meta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Itens Pendentes
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalPhysicalPending}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Itens ainda sem meta atingida
            </p>
          </CardContent>
        </Card>
      </div>

      {!hasData && (
        <Card
          className="border-dashed"
          data-testid="dashboard-empty-state"
        >
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Ainda não há dados de doações. As métricas aparecerão quando
              doações ou compromissos forem registrados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
