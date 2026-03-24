import { formatCurrency } from '@/lib/utils/format';
import type { DashboardStats } from '../queries';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
}

const LOCALE_PT_BR = 'pt-BR';

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  return (
    <div className="flex gap-6">
      <div
        className="flex-1 bg-white border border-[#EDE5DA] rounded-xl flex flex-col gap-3 pt-7 pl-7 pr-7 pb-6"
        style={{ boxShadow: '#1C14100D 0px 2px 12px' }}
      >
        <p className="text-[12px] uppercase tracking-[1px] leading-4 text-[#9B7B5A] m-0">
          Total de Doações em Dinheiro
        </p>
        <p className="font-serif font-bold text-[36px] leading-none text-[#1E3D59] m-0">
          {formatCurrency(stats.totalMonetaryDonations, LOCALE_PT_BR)}
        </p>
        <p className="text-[12px] leading-4 text-[#9B7B5A] m-0">
          Total arrecadado em todas as doações
        </p>
      </div>

      <div
        className="flex-1 bg-white border border-[#EDE5DA] rounded-xl flex flex-col gap-3 pt-7 pl-7 pr-7 pb-6"
        style={{ boxShadow: '#1C14100D 0px 2px 12px' }}
      >
        <p className="text-[12px] uppercase tracking-[1px] leading-4 text-[#9B7B5A] m-0">
          Itens Atendidos
        </p>
        <p
          className={`font-serif font-bold text-[36px] leading-none m-0 ${
            stats.totalPhysicalFulfilled > 0 ? 'text-[#22A55A]' : 'text-[#1E3D59]'
          }`}
        >
          {stats.totalPhysicalFulfilled}
        </p>
        <p className="text-[12px] leading-4 text-[#9B7B5A] m-0">
          Itens que atingiram a meta
        </p>
      </div>

      <div
        className="flex-1 bg-white border border-[#EDE5DA] rounded-xl flex flex-col gap-3 pt-7 pl-7 pr-7 pb-6"
        style={{ boxShadow: '#1C14100D 0px 2px 12px' }}
      >
        <p className="text-[12px] uppercase tracking-[1px] leading-4 text-[#9B7B5A] m-0">
          Itens Pendentes
        </p>
        <p className="font-serif font-bold text-[36px] leading-none text-[#1E3D59] m-0">
          {stats.totalPhysicalPending}
        </p>
        <p className="text-[12px] leading-4 text-[#9B7B5A] m-0">
          Itens ainda sem meta atingida
        </p>
      </div>
    </div>
  );
}
