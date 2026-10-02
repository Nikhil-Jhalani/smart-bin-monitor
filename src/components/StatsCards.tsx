import React from 'react';
import { 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { SystemStats } from '../types';

interface StatsCardsProps {
  stats: SystemStats | null;
  onFilterClick?: (status: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, onFilterClick }) => {
  if (!stats) return null;

  const cards = [
    {
      id: 'total',
      label: 'Total Monitored Bins',
      value: stats.totalBins,
      subtitle: `${stats.normalBins} operational bins in field`,
      icon: Trash2,
      bgColor: 'bg-white',
      borderColor: 'border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
      statusKey: 'all'
    },
    {
      id: 'empty',
      label: 'Empty / Low Bins',
      value: stats.emptyBins,
      subtitle: 'Fill level ≤ 15% (Normal)',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700',
      valueColor: 'text-emerald-700',
      badge: 'Green: Normal',
      statusKey: 'normal'
    },
    {
      id: 'partially_full',
      label: 'Partially Full Bins',
      value: stats.partiallyFullBins,
      subtitle: 'Fill level 40% – 79%',
      icon: AlertCircle,
      bgColor: 'bg-yellow-50/50',
      borderColor: 'border-yellow-200',
      iconBg: 'bg-yellow-100 text-yellow-700',
      valueColor: 'text-yellow-700',
      badge: 'Yellow: Partial',
      statusKey: 'partially_full'
    },
    {
      id: 'full',
      label: 'Full Bins',
      value: stats.fullBins,
      subtitle: 'Fill level ≥ 80%',
      icon: AlertTriangle,
      bgColor: 'bg-red-50/60',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100 text-red-700',
      valueColor: 'text-red-700',
      badge: 'Red: Full',
      statusKey: 'almost_full'
    },
    {
      id: 'urgent',
      label: 'Urgent Cleaning Needed',
      value: stats.urgentBins,
      subtitle: 'Fill level ≥ 90% or 100%',
      icon: Flame,
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      iconBg: 'bg-rose-600 text-white',
      valueColor: 'text-rose-700',
      pulse: stats.urgentBins > 0,
      badge: 'Red: Urgent',
      statusKey: 'urgent'
    },
    {
      id: 'overdue',
      label: 'Cleaning Overdue',
      value: stats.overdueBins,
      subtitle: 'Not cleaned for > 3 days',
      icon: Clock,
      bgColor: 'bg-orange-50/60',
      borderColor: 'border-orange-200',
      iconBg: 'bg-orange-100 text-orange-700',
      valueColor: 'text-orange-700',
      badge: 'Orange: Overdue',
      statusKey: 'overdue'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onFilterClick && onFilterClick(card.statusKey)}
            className={`${card.bgColor} ${card.borderColor} border rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg ${card.iconBg} ${card.pulse ? 'animate-bounce' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-extrabold tracking-tight ${card.valueColor}`}>
                  {card.value}
                </span>
                {card.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-600">
                    {card.badge}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
              <span className="truncate">{card.subtitle}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
