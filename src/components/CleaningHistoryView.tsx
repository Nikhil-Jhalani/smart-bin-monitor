import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Fuel, 
  Leaf, 
  TrendingUp, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  UserCheck 
} from 'lucide-react';
import { CleaningRecord } from '../types';
import { formatDateTime, formatRelativeTime } from '../utils/formatters';

interface CleaningHistoryViewProps {
  history: CleaningRecord[];
  onSelectBinById: (binId: string) => void;
}

export const CleaningHistoryView: React.FC<CleaningHistoryViewProps> = ({
  history,
  onSelectBinById
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter((rec) =>
    rec.binId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.cleanedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEmptied = history.length;
  const avgPreFill = totalEmptied > 0
    ? Math.round(history.reduce((acc, h) => acc + (h.previousFillLevel || 0), 0) / totalEmptied)
    : 0;

  // Environmental impact stats (from startup value prop)
  const fuelSavedLiters = Math.round(totalEmptied * 1.8 * 10) / 10;
  const co2AvoidedKg = Math.round(fuelSavedLiters * 2.68 * 10) / 10;

  return (
    <div className="space-y-4">
      {/* Startup Value Prop / Municipal Sustainability Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Bin Cleanings
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <History className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalEmptied}</div>
          <p className="text-[11px] text-slate-400 mt-1">Verified sanitation operations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Avg Fill Before Emptying
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700">{avgPreFill}%</div>
          <p className="text-[11px] text-slate-400 mt-1">Target ≥ 80% to avoid wasted trips</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Fuel Saved by Smart Routes
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{fuelSavedLiters} L</div>
          <p className="text-[11px] text-slate-400 mt-1">Eliminated unnecessary truck runs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              CO₂ Emissions Prevented
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{co2AvoidedKg} kg</div>
          <p className="text-[11px] text-slate-400 mt-1">Urban green sustainability metric</p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search cleaning records by Bin ID, crew, or street..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-500">
          Showing {filteredHistory.length} audit records
        </span>
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Bin ID & Location</th>
                <th className="py-3 px-4">Cleaned At</th>
                <th className="py-3 px-4">Sanitation Crew</th>
                <th className="py-3 px-4">Pre-Clean Fill</th>
                <th className="py-3 px-4">Notes & Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    No cleaning logs match your search.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {rec.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectBinById(rec.binId)}
                          className="font-mono font-bold text-xs text-emerald-700 hover:underline"
                        >
                          {rec.binId}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{rec.location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                      <div>{formatDateTime(rec.cleanedAt)}</div>
                      <div className="text-[10px] text-slate-400">{formatRelativeTime(rec.cleanedAt)}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{rec.cleanedBy}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {rec.previousFillLevel}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {rec.notes || 'Routine scheduled cleaning.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
