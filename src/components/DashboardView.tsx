import React from 'react';
import { 
  Trash2, 
  MapPin, 
  AlertTriangle, 
  Flame, 
  Check, 
  ArrowRight, 
  Clock, 
  BarChart3, 
  PieChart, 
  ShieldCheck,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { Bin, SystemStats, Alert } from '../types';
import { StatsCards } from './StatsCards';
import { BinVisualGauge } from './BinVisualGauge';
import { getStatusColor, getPriorityBadge, formatRelativeTime } from '../utils/formatters';

interface DashboardViewProps {
  stats: SystemStats | null;
  bins: Bin[];
  alerts: Alert[];
  onSelectBin: (bin: Bin) => void;
  onCleanBin: (binId: string) => void;
  onNavigateTab: (tab: string) => void;
  onStatusFilterClick: (status: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  bins,
  alerts,
  onSelectBin,
  onCleanBin,
  onNavigateTab,
  onStatusFilterClick
}) => {
  // Urgent bins requiring immediate cleaning
  const urgentBins = bins.filter(b => b.status === 'urgent' || b.fillLevel >= 90 || b.status === 'cleaning_recommended');

  // Chart data calculations
  const total = bins.length || 1;
  const normalCount = bins.filter(b => b.status === 'normal' || b.fillLevel <= 15).length;
  const partialCount = bins.filter(b => b.status === 'partially_full' || (b.fillLevel >= 40 && b.fillLevel < 80)).length;
  const recommendedCount = bins.filter(b => b.status === 'cleaning_recommended' || (b.fillLevel >= 80 && b.fillLevel < 90)).length;
  const urgentCount = bins.filter(b => b.status === 'urgent' || b.fillLevel >= 90).length;
  const overdueCount = bins.filter(b => b.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* 6 Core KPI Status Cards (Section 3) */}
      <StatsCards stats={stats} onFilterClick={onStatusFilterClick} />

      {/* Main Grid: Urgent Dispatch & Fill Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bins Requiring Urgent Action Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Priority Dispatch Queue ({urgentBins.length} Bins)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bins requiring immediate emptying or approaching overflow
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('bins')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
              >
                View Directory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentBins.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">All municipal bins are within safe limits</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No immediate cleaning dispatches required right now</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentBins.slice(0, 5).map((bin) => {
                  const statusInfo = getStatusColor(bin.status);
                  const isCritical = bin.fillLevel >= 90;

                  return (
                    <div
                      key={bin.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                        isCritical ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onSelectBin(bin)}
                          className="font-mono font-bold text-xs text-slate-900 hover:text-emerald-700"
                        >
                          {bin.id}
                        </button>

                        <div>
                          <div className="text-xs font-semibold text-slate-800 flex items-center gap-1 line-clamp-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{bin.location}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Cleaned: {formatRelativeTime(bin.lastCleaned)} • Battery: {bin.batteryLevel}%
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Gauge */}
                        <div className="w-20 hidden sm:block">
                          <BinVisualGauge fillLevel={bin.fillLevel} size="sm" />
                        </div>

                        {/* Status Chip */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          {bin.fillLevel}%
                        </span>

                        {/* Clean Button */}
                        <button
                          onClick={() => onCleanBin(bin.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition active:scale-95"
                          title="Mark cleaned (resets to 0%)"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Clean</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dynamic dispatch saves ~1.8L fuel per skipped empty bin</span>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
            >
              Open City GIS Map <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Column: Visual Charts & Analytics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Fill Status Distribution Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Fill Level Distribution
              </h3>
              <span className="text-[11px] font-mono text-slate-400">{bins.length} total bins</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex mb-4 border border-slate-200">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${(normalCount / total) * 100}%` }}
                title={`Normal: ${normalCount}`}
              />
              <div 
                className="bg-yellow-500 h-full transition-all duration-500" 
                style={{ width: `${(partialCount / total) * 100}%` }}
                title={`Partially Full: ${partialCount}`}
              />
              <div 
                className="bg-orange-500 h-full transition-all duration-500" 
                style={{ width: `${(recommendedCount / total) * 100}%` }}
                title={`Recommended: ${recommendedCount}`}
              />
              <div 
                className="bg-rose-500 h-full transition-all duration-500" 
                style={{ width: `${(urgentCount / total) * 100}%` }}
                title={`Urgent/Full: ${urgentCount}`}
              />
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 font-medium">Normal Capacity (&lt;60%)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{normalCount} ({Math.round((normalCount / total) * 100)}%)</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-slate-700 font-medium">Partially Full (40% – 79%)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{partialCount} ({Math.round((partialCount / total) * 100)}%)</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-slate-700 font-medium">Cleaning Recommended (≥80%)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{recommendedCount} ({Math.round((recommendedCount / total) * 100)}%)</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-slate-700 font-medium">Full / Urgent Cleaning (≥90%)</span>
                </div>
                <span className="font-mono font-bold text-rose-700">{urgentCount} ({Math.round((urgentCount / total) * 100)}%)</span>
              </div>
            </div>
          </div>

          {/* Recent Alerts Feed (Section 3 requirement) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Recent System Alerts
              </h3>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                All Alerts <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active alerts recorded.</p>
            ) : (
              <div className="space-y-2.5">
                {alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs"
                  >
                    <span className="p-1 rounded-md bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{alert.title}</span>
                        <span className="text-[10px] text-slate-400">{formatRelativeTime(alert.time)}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">{alert.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
