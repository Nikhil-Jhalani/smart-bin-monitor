import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Play, 
  Pause, 
  AlertTriangle, 
  Sparkles, 
  Check, 
  Flame, 
  Clock, 
  HelpCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Bin } from '../types';
import { getStatusColor, getPriorityBadge } from '../utils/formatters';

interface SimulationPanelProps {
  bins: Bin[];
  onSimulateLevel: (binId: string, level: number) => void;
  onResetDemo: () => void;
  onApplyScenario: (scenario: string) => void;
  onTriggerTick: () => void;
  onCleanBin: (binId: string) => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  bins,
  onSimulateLevel,
  onResetDemo,
  onApplyScenario,
  onTriggerTick,
  onCleanBin
}) => {
  const [autoTickActive, setAutoTickActive] = useState(false);
  const [tickIntervalSec, setTickIntervalSec] = useState(4);
  const [sliderValues, setSliderValues] = useState<{ [id: string]: number }>({});

  // Sync initial slider values
  useEffect(() => {
    const map: { [id: string]: number } = {};
    bins.forEach((b) => {
      map[b.id] = b.fillLevel;
    });
    setSliderValues(map);
  }, [bins]);

  // Handle auto-tick timer
  useEffect(() => {
    let timer: any = null;
    if (autoTickActive) {
      timer = setInterval(() => {
        onTriggerTick();
      }, tickIntervalSec * 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoTickActive, tickIntervalSec, onTriggerTick]);

  const handleSliderChange = (binId: string, val: number) => {
    setSliderValues(prev => ({ ...prev, [binId]: val }));
    onSimulateLevel(binId, val);
  };

  return (
    <div className="space-y-6">
      {/* Presentation Header Hero Banner */}
      <div className="bg-linear-to-r from-amber-600 via-amber-700 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-white/20 text-white backdrop-blur-xs">
                <Sparkles className="w-5 h-5 text-amber-200" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">Interactive Presentation & Demo Engine</h2>
            </div>
            <p className="text-xs text-amber-100 max-w-2xl leading-relaxed">
              Use this simulator during your viva / teacher demonstration to showcase how the smart bin system instantly responds to real-time waste level transitions, triggers municipality alerts, and coordinates cleaning dispatch without requiring physical sensors.
            </p>
          </div>

          {/* Auto Simulation Toggle */}
          <div className="bg-black/30 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5 text-white">
                <span>Dynamic Live Fill Engine</span>
              </div>
              <p className="text-[10px] text-amber-200">Simulates real public trash accumulation</p>
            </div>
            <button
              onClick={() => setAutoTickActive(!autoTickActive)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                autoTickActive
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {autoTickActive ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Engine</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Live Engine</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Demo Scenario Presets */}
        <div className="mt-6 pt-5 border-t border-white/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200 block mb-2.5">
            Teacher Presentation Presets (Section 13)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={onResetDemo}
              className="bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-xl text-left transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">1. Standard 5 Demo Bins</span>
                <RotateCcw className="w-3.5 h-3.5 text-amber-200" />
              </div>
              <p className="text-[11px] text-amber-100">
                BIN-001 (25%), BIN-002 (55%), BIN-003 (82%), BIN-004 (94%), BIN-005 (100%)
              </p>
            </button>

            <button
              onClick={() => onApplyScenario('rush_hour')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-xl text-left transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">2. Peak Rush Hour Surge</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
              </div>
              <p className="text-[11px] text-amber-100">
                Simulates shopping/transit crowds filling bins to 85% - 100%
              </p>
            </button>

            <button
              onClick={() => onApplyScenario('urgent_crisis')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-xl text-left transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">3. Overflow Emergency</span>
                <Flame className="w-3.5 h-3.5 text-red-300" />
              </div>
              <p className="text-[11px] text-amber-100">
                Multiple bins hit 100% to demonstrate urgent municipality dispatching
              </p>
            </button>

            <button
              onClick={() => onApplyScenario('all_cleaned')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 p-3 rounded-xl text-left transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">4. All Cleared Shift</span>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <p className="text-[11px] text-amber-100">
                Empties all dustbins back to 0-5% and clears active alerts
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Threshold Guide */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          Color Threshold Scale:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>0% – 39%: Normal (Empty/Low)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>40% – 79%: Partially Full</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500" />
          <span>80% – 89%: Cleaning Recommended</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>90% – 99%: Almost Full</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
          <span>100%: Full – Immediate Dispatch</span>
        </div>
      </div>

      {/* Individual Bin Interactive Simulation Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">
          Individual Bin Live Fill Sliders ({bins.length} Active Dustbins)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bins.map((bin) => {
            const currentVal = sliderValues[bin.id] !== undefined ? sliderValues[bin.id] : bin.fillLevel;
            const statusInfo = getStatusColor(bin.status);
            const isUrgent = bin.status === 'urgent' || currentVal >= 90;

            return (
              <div
                key={bin.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between ${
                  isUrgent ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-extrabold text-base text-slate-900">
                      {bin.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-4 line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{bin.location}</span>
                  </p>

                  {/* Visual Progress Bar with Value Display */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-500 font-medium">Simulated Fill Level</span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {currentVal}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          currentVal >= 90 ? 'bg-rose-500' :
                          currentVal >= 80 ? 'bg-orange-500' :
                          currentVal >= 40 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${currentVal}%` }}
                      />
                    </div>
                  </div>

                  {/* Interactive Slider Input */}
                  <div className="mb-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentVal}
                      onChange={(e) => handleSliderChange(bin.id, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>0%</span>
                      <span>40%</span>
                      <span>80%</span>
                      <span>90%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Preset Stepper Buttons */}
                  <div className="grid grid-cols-5 gap-1 mb-4">
                    {[
                      { val: 0, label: '0%' },
                      { val: 40, label: '40%' },
                      { val: 80, label: '80%' },
                      { val: 90, label: '90%' },
                      { val: 100, label: '100%' }
                    ].map((step) => (
                      <button
                        key={step.val}
                        onClick={() => handleSliderChange(bin.id, step.val)}
                        className={`py-1 text-[10px] font-mono font-bold rounded border transition ${
                          currentVal === step.val
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {step.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Action: Instant Clean */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Battery: {bin.batteryLevel}%
                  </span>
                  <button
                    onClick={() => {
                      onCleanBin(bin.id);
                      setSliderValues(prev => ({ ...prev, [bin.id]: 0 }));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1 transition active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Clean (0%)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
