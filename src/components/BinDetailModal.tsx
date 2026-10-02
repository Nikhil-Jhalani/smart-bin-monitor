import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  Battery, 
  Check, 
  Sliders, 
  AlertTriangle, 
  History, 
  Activity, 
  Trash2,
  Radio,
  FileText
} from 'lucide-react';
import { Bin } from '../types';
import { BinVisualGauge } from './BinVisualGauge';
import { getStatusColor, getPriorityBadge, formatDateTime, formatRelativeTime } from '../utils/formatters';

interface BinDetailModalProps {
  bin: Bin | null;
  onClose: () => void;
  onCleanBin: (binId: string, notes?: string) => void;
  onSimulateLevel: (binId: string, fillLevel: number) => void;
}

export const BinDetailModal: React.FC<BinDetailModalProps> = ({
  bin,
  onClose,
  onCleanBin,
  onSimulateLevel
}) => {
  if (!bin) return null;

  const [simLevel, setSimLevel] = useState<number>(bin.fillLevel);
  const [cleaningNote, setCleaningNote] = useState('');
  const [showCleanForm, setShowCleanForm] = useState(false);

  const statusInfo = getStatusColor(bin.status);
  const priorityInfo = getPriorityBadge(bin.priority);

  const handleSimulateChange = (val: number) => {
    setSimLevel(val);
    onSimulateLevel(bin.id, val);
  };

  const handleCleanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCleanBin(bin.id, cleaningNote || 'Standard scheduled sanitization');
    setShowCleanForm(false);
    setCleaningNote('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                {bin.id}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                {statusInfo.label}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${priorityInfo.bg}`}
              >
                {priorityInfo.text} Priority
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{bin.location}</span>
              {bin.zone && <span>• {bin.zone}</span>}
              <span>• Coords: {bin.latitude.toFixed(4)}, {bin.longitude.toFixed(4)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Visual Bin Model & Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center bg-slate-50/70 p-6 rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
              Real-time Physical Container State
            </span>

            {/* Visual 3D Cylinder Gauge */}
            <BinVisualGauge fillLevel={bin.fillLevel} size="lg" />

            {/* Interactive Live Slider */}
            <div className="w-full mt-6 pt-5 border-t border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  Live Fill Level Simulator
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {simLevel}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={simLevel}
                onChange={(e) => handleSimulateChange(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>0% (Empty)</span>
                <span>50%</span>
                <span>80%</span>
                <span>100% (Urgent)</span>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5 mt-3">
                {[0, 40, 80, 100].map((presetVal) => (
                  <button
                    key={presetVal}
                    onClick={() => handleSimulateChange(presetVal)}
                    className="py-1 text-[10px] font-semibold rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition"
                  >
                    {presetVal}%
                  </button>
                ))}
              </div>
            </div>

            {/* Mark as Cleaned Primary Action */}
            <div className="w-full mt-4">
              {!showCleanForm ? (
                <button
                  onClick={() => setShowCleanForm(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  Mark Bin as Cleaned (0%)
                </button>
              ) : (
                <form onSubmit={handleCleanSubmit} className="space-y-2 bg-white p-3 rounded-xl border border-emerald-200">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Sanitation Dispatch Log Note:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Cleared by Team 4, disinfected"
                    value={cleaningNote}
                    onChange={(e) => setCleaningNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                    >
                      Confirm Emptied
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCleanForm(false)}
                      className="px-2.5 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Hardware Metrics, Alerts, and History (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Telemetry Hardware Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Battery Level
                </span>
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Battery className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-extrabold font-mono">{bin.batteryLevel}%</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Device State
                </span>
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold capitalize">{bin.deviceStatus || 'Online'}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Capacity
                </span>
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Trash2 className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-extrabold font-mono">{bin.capacityLiters || 120} L</span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Last Cleaned:
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDateTime(bin.lastCleaned)} ({formatRelativeTime(bin.lastCleaned)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  Last Telemetry Packet:
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDateTime(bin.lastUpdated)} ({formatRelativeTime(bin.lastUpdated)})
                </span>
              </div>
            </div>

            {/* Fill-level History Log */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                Fill-Level History ({bin.fillHistory?.length || 0} telemetry points)
              </h4>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 max-h-36 overflow-y-auto divide-y divide-slate-100">
                {bin.fillHistory && bin.fillHistory.length > 0 ? (
                  bin.fillHistory.slice().reverse().map((point, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-mono text-[11px]">
                        {formatDateTime(point.timestamp)}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${point.level}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800 w-8 text-right">
                          {point.level}%
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2 text-center">No history points logged yet</p>
                )}
              </div>
            </div>

            {/* Cleaning History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2.5">
                <History className="w-3.5 h-3.5 text-emerald-600" />
                Sanitation Cleaning History ({bin.cleaningHistory?.length || 0} records)
              </h4>
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 max-h-40 overflow-y-auto space-y-2">
                {bin.cleaningHistory && bin.cleaningHistory.length > 0 ? (
                  bin.cleaningHistory.map((rec) => (
                    <div key={rec.id} className="bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{rec.cleanedBy}</span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatDateTime(rec.cleanedAt)}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{rec.notes}</p>
                      <div className="mt-1 flex gap-3 text-[10px] text-slate-400">
                        <span>Pre-clean fill: {rec.previousFillLevel}%</span>
                        {rec.durationMinutes && <span>Duration: {rec.durationMinutes} mins</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2 text-center">No previous cleanings recorded</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Node ID: <code className="font-mono text-slate-600">{bin.id}</code> • Ready for ESP32 connection
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
