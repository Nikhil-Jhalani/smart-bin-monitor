import React, { useState } from 'react';
import { X, Trash2, MapPin, Gauge } from 'lucide-react';
import { Bin } from '../types';

interface AddBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBin: (binData: Partial<Bin>) => Promise<void>;
  existingBinsCount: number;
}

export const AddBinModal: React.FC<AddBinModalProps> = ({
  isOpen,
  onClose,
  onAddBin,
  existingBinsCount
}) => {
  if (!isOpen) return null;

  const nextId = `BIN-${String(existingBinsCount + 1).padStart(3, '0')}`;

  const [id, setId] = useState(nextId);
  const [location, setLocation] = useState('');
  const [zone, setZone] = useState('Zone 1 - Civic Center');
  const [latitude, setLatitude] = useState('28.6150');
  const [longitude, setLongitude] = useState('77.2100');
  const [capacityLiters, setCapacityLiters] = useState('120');
  const [initialFillLevel, setInitialFillLevel] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !location.trim()) {
      setError('Bin ID and Location are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAddBin({
        id: id.trim().toUpperCase(),
        location: location.trim(),
        zone: zone.trim(),
        latitude: parseFloat(latitude) || 28.6150,
        longitude: parseFloat(longitude) || 77.2100,
        capacityLiters: parseInt(capacityLiters, 10) || 120,
        fillLevel: parseInt(initialFillLevel, 10) || 0,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register dustbin');
    } finally {
      setIsSubmitting(false);
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
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Register New Field Dustbin</h3>
              <p className="text-xs text-slate-500">Deploy a new monitored asset to the municipality registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Dustbin ID:
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                placeholder="BIN-009"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Zone / District:
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="Zone 1 - Civic Center">Zone 1 - Civic Center</option>
                <option value="Zone 2 - Education Hub">Zone 2 - Education Hub</option>
                <option value="Zone 3 - Transit Corridor">Zone 3 - Transit Corridor</option>
                <option value="Zone 4 - Healthcare District">Zone 4 - Healthcare District</option>
                <option value="Zone 5 - Sports Complex">Zone 5 - Sports Complex</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Location Description / Landmark:
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="e.g. City Railway Station Platform 1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Latitude:
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Longitude:
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Capacity (Liters):
              </label>
              <input
                type="number"
                value={capacityLiters}
                onChange={(e) => setCapacityLiters(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                min="20"
                max="1000"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Initial Fill (%):
              </label>
              <input
                type="number"
                value={initialFillLevel}
                onChange={(e) => setInitialFillLevel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                min="0"
                max="100"
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
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Save & Register Dustbin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
