import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Check, 
  Sliders, 
  ExternalLink, 
  Battery, 
  MapPin, 
  Clock, 
  Calendar, 
  LayoutList, 
  LayoutGrid,
  AlertTriangle
} from 'lucide-react';
import { Bin, BinStatus, PriorityLevel } from '../types';
import { BinVisualGauge } from './BinVisualGauge';
import { getStatusColor, getPriorityBadge, formatRelativeTime, formatDateTime } from '../utils/formatters';

interface BinTableProps {
  bins: Bin[];
  onSelectBin: (bin: Bin) => void;
  onCleanBin: (binId: string) => void;
  onSimulateBin: (bin: Bin) => void;
  initialStatusFilter?: string;
}

export const BinTable: React.FC<BinTableProps> = ({
  bins,
  onSelectBin,
  onCleanBin,
  onSimulateBin,
  initialStatusFilter = 'all'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter bins
  const filteredBins = bins.filter((bin) => {
    const matchesSearch = 
      bin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bin.zone && bin.zone.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'urgent' && (bin.status === 'urgent' || bin.fillLevel >= 90)) ||
      (statusFilter === 'normal' && (bin.status === 'normal' || bin.fillLevel <= 15)) ||
      bin.status === statusFilter;

    const matchesPriority = priorityFilter === 'all' || bin.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Bin ID, street, or zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">All Statuses ({bins.length})</option>
              <option value="normal">Normal (Green)</option>
              <option value="partially_full">Partially Full (Yellow)</option>
              <option value="cleaning_recommended">Cleaning Recommended</option>
              <option value="almost_full">Almost Full (Red)</option>
              <option value="urgent">Urgent / Overflowing (Red)</option>
              <option value="overdue">Cleaning Overdue (Orange)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-2 px-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 transition"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-end md:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
              viewMode === 'table' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Table View"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
              viewMode === 'cards' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing {filteredBins.length} of {bins.length} dustbins</span>
        <span className="text-[11px] text-slate-400">Green = Normal • Yellow = Partial • Red = Full/Urgent • Orange = Overdue</span>
      </div>

      {/* Empty State */}
      {filteredBins.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Trash2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No dustbins match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or status filters above to see more bins.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('all'); setPriorityFilter('all'); }}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Bin ID</th>
                  <th className="py-3.5 px-4">Location & Zone</th>
                  <th className="py-3.5 px-4">Fill Level</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Last Cleaned</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBins.map((bin) => {
                  const statusInfo = getStatusColor(bin.status);
                  const priorityInfo = getPriorityBadge(bin.priority);
                  const isUrgent = bin.status === 'urgent' || bin.fillLevel >= 90;

                  return (
                    <tr
                      key={bin.id}
                      className={`hover:bg-slate-50/80 transition ${isUrgent ? 'bg-rose-50/20' : ''}`}
                    >
                      {/* Bin ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectBin(bin)}
                            className="font-mono font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                          >
                            <span>{bin.id}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </button>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div>
                          <div className="font-semibold text-slate-800 text-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{bin.location}</span>
                          </div>
                          {bin.zone && (
                            <div className="text-[11px] text-slate-500 ml-4 font-medium">
                              {bin.zone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Fill Level */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <BinVisualGauge fillLevel={bin.fillLevel} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} ${isUrgent ? 'animate-ping' : ''}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${priorityInfo.bg}`}
                        >
                          {priorityInfo.text}
                        </span>
                      </td>

                      {/* Last Cleaned */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        <div className="flex items-center gap-1" title={formatDateTime(bin.lastCleaned)}>
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatRelativeTime(bin.lastCleaned)}</span>
                        </div>
                      </td>

                      {/* Last Updated */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatRelativeTime(bin.lastUpdated)}</span>
                        </div>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Mark Cleaned button */}
                          <button
                            onClick={() => onCleanBin(bin.id)}
                            className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center gap-1 transition active:scale-95"
                            title="Mark as cleaned (resets fill to 0%)"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Clean</span>
                          </button>

                          {/* Quick Simulate slider button */}
                          <button
                            onClick={() => onSimulateBin(bin)}
                            className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition"
                            title="Adjust fill level simulation"
                          >
                            <Sliders className="w-3.5 h-3.5 text-slate-600" />
                          </button>

                          {/* View Details */}
                          <button
                            onClick={() => onSelectBin(bin)}
                            className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBins.map((bin) => {
            const statusInfo = getStatusColor(bin.status);
            const priorityInfo = getPriorityBadge(bin.priority);
            const isUrgent = bin.status === 'urgent' || bin.fillLevel >= 90;

            return (
              <div
                key={bin.id}
                className={`bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                  isUrgent ? 'ring-2 ring-rose-400/50' : ''
                }`}
              >
                <div>
                  {/* Top Bar: ID and Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      {bin.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{bin.location}</span>
                    </div>
                    {bin.zone && (
                      <p className="text-[11px] text-slate-500 ml-4 font-medium">{bin.zone}</p>
                    )}
                  </div>

                  {/* Fill Level Gauge */}
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-medium text-slate-600">Capacity Usage</span>
                      <span className="font-mono font-bold text-slate-900">{bin.fillLevel}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          bin.fillLevel >= 90 ? 'bg-rose-500' :
                          bin.fillLevel >= 80 ? 'bg-orange-500' :
                          bin.fillLevel >= 40 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${bin.fillLevel}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mb-4">
                    <div>
                      <span className="text-slate-400 block">Cleaned</span>
                      <span className="font-medium text-slate-700">{formatRelativeTime(bin.lastCleaned)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Priority</span>
                      <span className={`font-bold px-1.5 py-0.2 rounded border text-[10px] ${priorityInfo.bg}`}>
                        {priorityInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onCleanBin(bin.id)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 flex items-center justify-center gap-1 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Clean
                  </button>
                  <button
                    onClick={() => onSimulateBin(bin)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
                    title="Simulate Fill Level"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectBin(bin)}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
