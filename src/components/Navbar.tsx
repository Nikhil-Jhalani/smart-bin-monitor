import React from 'react';
import { Play, RotateCcw, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

interface NavbarProps {
  currentTab: string;
  lastUpdated: string;
  onResetDemo: () => void;
  onApplyScenario: (scenario: string) => void;
  onTriggerTick: () => void;
  isSimulating: boolean;
  onOpenDemoTab: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  lastUpdated,
  onResetDemo,
  onApplyScenario,
  onTriggerTick,
  isSimulating,
  onOpenDemoTab
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Municipality Overview', subtitle: 'Real-time citywide dustbin fill levels and sanitation telemetry' };
      case 'bins':
        return { title: 'Dustbins Directory', subtitle: 'Comprehensive registry with live capacity, priority, and maintenance state' };
      case 'map':
        return { title: 'Geospatial Waste Map', subtitle: 'Live geographic coordinates and spatial cluster status of municipal bins' };
      case 'alerts':
        return { title: 'Alerts & Incidents Center', subtitle: 'Automated threshold notifications and cleaning dispatch triggers' };
      case 'history':
        return { title: 'Cleaning Logs & Analytics', subtitle: 'Audit log of emptied bins, carbon reductions, and route efficiency' };
      case 'simulation':
        return { title: 'Demo & Hardware Simulator', subtitle: 'Presentation tools to adjust fill levels and test IoT threshold rules' };
      case 'hardware':
        return { title: 'ESP32 Hardware Integration', subtitle: 'REST telemetry specification, payload tester, and microcontroller firmware' };
      case 'settings':
        return { title: 'System Configuration', subtitle: 'Manage alerting thresholds, overdue cleaning limits, and system parameters' };
      default:
        return { title: 'Smart Bin Monitor', subtitle: 'Municipal waste management portal' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      {/* Demo Controls Bar */}
      <div className="flex items-center flex-wrap gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Demo Mode Active</span>
        </div>

        {/* Quick Presentation Shortcuts */}
        <button
          onClick={onResetDemo}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition active:scale-95"
          title="Reset to 5 initial presentation bins (BIN-001 to BIN-005)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Preset</span>
        </button>

        <button
          onClick={() => onApplyScenario('rush_hour')}
          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 border border-rose-200 transition active:scale-95"
          title="Simulate busy rush hour with critical fill levels"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          <span className="hidden sm:inline">Simulate</span> Rush Hour
        </button>

        <button
          onClick={onTriggerTick}
          disabled={isSimulating}
          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 transition active:scale-95 disabled:opacity-50"
          title="Increment fill level slightly on active bins"
        >
          <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
          <span>+ Fill Tick</span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden md:block" />

        {/* Last updated badge */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Updated: {lastUpdated ? formatRelativeTime(lastUpdated) : 'Just now'}</span>
        </div>
      </div>
    </header>
  );
};
