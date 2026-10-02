import React from 'react';

interface BinVisualGaugeProps {
  fillLevel: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const BinVisualGauge: React.FC<BinVisualGaugeProps> = ({
  fillLevel,
  size = 'md',
  showLabel = true
}) => {
  const clamped = Math.min(100, Math.max(0, fillLevel));

  // Determine fill color
  const getFillStyle = () => {
    if (clamped >= 90) return { bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-rose-600', light: 'bg-rose-100' };
    if (clamped >= 80) return { bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-orange-600', light: 'bg-orange-100' };
    if (clamped >= 40) return { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-600', light: 'bg-yellow-100' };
    return { bg: 'bg-emerald-500', border: 'border-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-100' };
  };

  const style = getFillStyle();

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-20 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${style.bg}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        {showLabel && (
          <span className={`text-xs font-bold font-mono ${style.text}`}>
            {clamped}%
          </span>
        )}
      </div>
    );
  }

  if (size === 'lg') {
    // 3D-styled physical dustbin cylinder for Bin Details modal
    return (
      <div className="flex flex-col items-center">
        {/* Bin Lid */}
        <div className="w-36 h-4 bg-slate-700 rounded-t-lg shadow-sm border-t border-slate-600 flex items-center justify-center">
          <div className="w-12 h-1.5 bg-slate-500 rounded-full" />
        </div>
        <div className="w-40 h-2 bg-slate-800 rounded-sm mb-1 shadow-sm" />

        {/* Bin Body Cylinder */}
        <div className="w-32 h-56 bg-slate-100 rounded-b-2xl border-2 border-slate-300 relative overflow-hidden flex flex-col justify-end shadow-inner">
          {/* Fill Level Markers (25%, 50%, 75%, 100%) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-2 px-1 text-[9px] font-mono text-slate-400 opacity-60">
            <div className="border-b border-dashed border-slate-300 text-right pr-1">100%</div>
            <div className="border-b border-dashed border-slate-300 text-right pr-1">75%</div>
            <div className="border-b border-dashed border-slate-300 text-right pr-1">50%</div>
            <div className="border-b border-dashed border-slate-300 text-right pr-1">25%</div>
            <div className="text-right pr-1">0%</div>
          </div>

          {/* Waste Fill Height */}
          <div
            className={`w-full transition-all duration-700 ease-out relative ${style.bg} ${
              clamped >= 90 ? 'animate-pulse' : ''
            }`}
            style={{ height: `${clamped}%` }}
          >
            {/* Liquid wavy surface line */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-white/30 rounded-full" />
          </div>

          {/* Central Percentage Overlay Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-xs border border-slate-200/80 shadow-md flex flex-col items-center">
              <span className={`text-2xl font-extrabold font-mono tracking-tight ${style.text}`}>
                {clamped}%
              </span>
              <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
                Fill Level
              </span>
            </div>
          </div>
        </div>

        {/* Base shadow */}
        <div className="w-24 h-2 bg-slate-300/60 rounded-full blur-xs mt-2" />
      </div>
    );
  }

  // Medium size
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 bg-slate-100 rounded-full h-3.5 overflow-hidden border border-slate-200 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bg}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-sm font-bold font-mono ${style.text}`}>
          {clamped}%
        </span>
      )}
    </div>
  );
};
