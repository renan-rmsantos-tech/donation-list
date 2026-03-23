import { getProductsForTransfer, getFundTransfers } from '@/features/donations/queries';
import { FundTransferForm } from '@/features/donations/components/FundTransferForm';
import { FundTransferHistory } from '@/features/donations/components/FundTransferHistory';

export const metadata = {
  title: 'Transferências de Fundos',
};

export default async function TransfersPage() {
  const [{ sourceProducts, targetProducts }, transfers] = await Promise.all([
    getProductsForTransfer(),
    getFundTransfers(),
  ]);

  const canTransfer =
    sourceProducts.length > 0 &&
    targetProducts.length >= 2;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-serif">Transferências de Fundos</h1>
        <p className="text-muted-foreground">
          Gerencie transferências de fundos monetários entre produtos com rastreamento de auditoria.
        </p>
      </div>

      {canTransfer ? (
        <FundTransferForm
          sourceProducts={sourceProducts}
          targetProducts={targetProducts}
        />
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          <p>
            {sourceProducts.length === 0
              ? 'Nenhum produto com saldo disponível (mínimo R$ 1,00) para transferência.'
              : 'É necessário ter pelo menos 2 produtos que ainda não atingiram a meta para realizar transferências.'}
          </p>
        </div>
      )}
      <FundTransferHistory transfers={transfers} />
    </div>
  );
}
