import { getDashboardStats } from '@/features/dashboard/queries';
import { DashboardStatsCards } from '@/features/dashboard/components/DashboardStatsCards';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Painel</h1>
      <DashboardStatsCards stats={stats} />
    </div>
  );
}
