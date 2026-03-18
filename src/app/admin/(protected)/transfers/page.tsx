import { getProductsForTransfer, getFundTransfers } from '@/features/donations/queries';
import { FundTransferForm } from '@/features/donations/components/FundTransferForm';
import { FundTransferHistory } from '@/features/donations/components/FundTransferHistory';

export const metadata = {
  title: 'Transferências de Fundos',
};

export default async function TransfersPage() {
  const [products, transfers] = await Promise.all([
    getProductsForTransfer(),
    getFundTransfers(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transferências de Fundos</h1>
        <p className="text-muted-foreground">
          Gerencie transferências de fundos monetários entre produtos com rastreamento de auditoria.
        </p>
      </div>

      {products.length > 0 ? (
        <FundTransferForm products={products} />
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          <p>
            É necessário ter pelo menos 2 produtos publicados e ao menos um com
            saldo disponível (mínimo R$ 1,00) para realizar transferências.
          </p>
        </div>
      )}
      <FundTransferHistory transfers={transfers} />
    </div>
  );
}
