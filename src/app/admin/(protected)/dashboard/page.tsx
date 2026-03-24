import { getDashboardStats } from '@/features/dashboard/queries';
import { DashboardStatsCards } from '@/features/dashboard/components/DashboardStatsCards';
import { DashboardTransferAlert } from '@/features/dashboard/components/DashboardTransferAlert';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-serif font-bold text-[36px] leading-[44px] text-[#1E3D59]">
        Painel
      </h1>
      <div className="flex flex-col gap-6">
        <DashboardTransferAlert hasTransfersAvailable={stats.hasTransfersAvailable} />
        <DashboardStatsCards stats={stats} />
      </div>
    </div>
  );
}
