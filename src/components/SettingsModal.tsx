import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, X, Sliders, Bell } from 'lucide-react';
import { SystemSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SystemSettings | null;
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen || !settings) return null;

  const [formData, setFormData] = useState<SystemSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings(formData);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-200 text-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Municipal Alerting & Threshold Settings</h3>
              <p className="text-xs text-slate-500">Configure operational rules and overdue timers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              Settings updated successfully and applied across all bins!
            </div>
          )}

          {/* Section 7 Overdue Days */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-800">
                Cleaning Overdue Threshold (Days):
              </label>
              <span className="font-mono font-bold text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                {formData.overdueDaysThreshold} Days
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={formData.overdueDaysThreshold}
              onChange={(e) => setFormData({ ...formData, overdueDaysThreshold: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Triggers the "Cleaning Overdue" alert when a dustbin has not been emptied for more than this number of days.
            </p>
          </div>

          {/* Fill Level Alert Thresholds */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Fill Level Threshold Triggers (%)
            </h4>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Cleaning Recommended Alert:</span>
                <span className="font-mono font-bold text-orange-600">{formData.recommendedLevelThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                value={formData.recommendedLevelThreshold}
                onChange={(e) => setFormData({ ...formData, recommendedLevelThreshold: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Bin Almost Full Alert:</span>
                <span className="font-mono font-bold text-red-600">{formData.almostFullLevelThreshold}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="98"
                value={formData.almostFullLevelThreshold}
                onChange={(e) => setFormData({ ...formData, almostFullLevelThreshold: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Immediate Cleaning Required (Full):</span>
                <span className="font-mono font-bold text-rose-700">{formData.fullLevelThreshold}%</span>
              </div>
              <input
                type="range"
                min="95"
                max="100"
                value={formData.fullLevelThreshold}
                onChange={(e) => setFormData({ ...formData, fullLevelThreshold: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
