import { getDashboardStats } from '@/features/dashboard/queries';
import { DashboardStatsCards } from '@/features/dashboard/components/DashboardStatsCards';
import { DashboardTransferAlert } from '@/features/dashboard/components/DashboardTransferAlert';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 font-serif">Painel</h1>
      <div className="space-y-6">
        <DashboardTransferAlert hasTransfersAvailable={stats.hasTransfersAvailable} />
        <DashboardStatsCards stats={stats} />
      </div>
    </div>
  );
}
