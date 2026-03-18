'use client';

import { formatCurrency } from '@/lib/utils/format';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays < 7) return `há ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
  return `há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
}

type FundTransfer = {
  id: string;
  sourceProductId: string;
  targetProductId: string;
  amount: number;
  adminUsername: string;
  createdAt: Date;
  sourceProduct?: {
    id: string;
    name: string;
  };
  targetProduct?: {
    id: string;
    name: string;
  };
};

type FundTransferHistoryProps = {
  transfers: FundTransfer[];
};

export function FundTransferHistory({
  transfers,
}: FundTransferHistoryProps) {
  if (transfers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Histórico de Transferências</h2>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nenhuma transferência realizada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Histórico de Transferências</h2>
        <p className="text-sm text-muted-foreground">
          Últimas {transfers.length} transferência{transfers.length !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>De</TableHead>
                <TableHead>Para</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Admin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="text-sm">
                    <div>
                      {new Date(transfer.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(transfer.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>{transfer.sourceProduct?.name || 'Desconhecido'}</TableCell>
                  <TableCell>{transfer.targetProduct?.name || 'Desconhecido'}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(transfer.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {transfer.adminUsername}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
