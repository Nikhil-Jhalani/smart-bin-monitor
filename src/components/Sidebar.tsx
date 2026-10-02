import React from 'react';
import { 
  LayoutDashboard, 
  Trash2, 
  MapPin, 
  Bell, 
  History, 
  Sliders, 
  Cpu, 
  Settings, 
  ShieldCheck,
  Plus,
  RefreshCw
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  unreadAlertsCount: number;
  onOpenAddBin: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  unreadAlertsCount,
  onOpenAddBin,
  onRefresh,
  isRefreshing
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bins', label: 'Bins Directory', icon: Trash2 },
    { id: 'map', label: 'Live City Map', icon: MapPin },
    { 
      id: 'alerts', 
      label: 'Alerts Center', 
      icon: Bell, 
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : null 
    },
    { id: 'history', label: 'Cleaning History', icon: History },
    { 
      id: 'simulation', 
      label: 'Demo & Simulation', 
      icon: Sliders,
      highlight: true
    },
    { id: 'hardware', label: 'ESP32 Hardware API', icon: Cpu },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl z-20">
      {/* Platform Branding */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-inner">
            <Trash2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">SmartBin</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                Muni-OS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Urban Waste Platform</p>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onOpenAddBin}
          className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Register New Dustbin
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-950/20'
                  : item.highlight
                  ? 'text-amber-300 hover:bg-slate-800/80 hover:text-amber-200'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-sm animate-pulse">
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Demo
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Municipality Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300">System Live</span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition"
            title="Refresh Server Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Municipal Fleet Protocol v1.0</span>
        </div>
      </div>
    </aside>
  );
};
