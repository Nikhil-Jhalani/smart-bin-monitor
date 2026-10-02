import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Check, 
  Trash2, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Flame, 
  Calendar,
  ExternalLink,
  Info
} from 'lucide-react';
import { Alert, Bin } from '../types';
import { getPriorityBadge, formatRelativeTime, formatDateTime } from '../utils/formatters';

interface AlertsViewProps {
  alerts: Alert[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDismissAlert: (id: string) => void;
  onSelectBinById: (binId: string) => void;
  onCleanBin: (binId: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onMarkRead,
  onMarkAllRead,
  onDismissAlert,
  onSelectBinById,
  onCleanBin
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'urgent' | 'overdue'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filterTab === 'unread') return !alert.read;
    if (filterTab === 'urgent') return alert.priority === 'urgent' || alert.type === 'full';
    if (filterTab === 'overdue') return alert.type === 'cleaning_overdue';
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-4">
      {/* Alert Policy Explanation Header Card */}
      <div className="bg-linear-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Bell className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold">Automated Municipality Threshold Rules</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Alerts trigger instantaneously when telemetry indicates critical capacity thresholds or sanitation neglect. Sanitation dispatch crews receive real-time notifications to prevent street litter and odor.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 shrink-0"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* 4 Core Threshold Chips (from section 7) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="bg-slate-800/60 backdrop-blur-xs p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block mb-1">
              Threshold 80%
            </span>
            <div className="text-xs font-semibold text-white">"Cleaning Recommended"</div>
            <p className="text-[10px] text-slate-400 mt-1">Schedules bin for upcoming route</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
              Threshold 90%
            </span>
            <div className="text-xs font-semibold text-white">"Bin Almost Full"</div>
            <p className="text-[10px] text-slate-400 mt-1">High priority dispatch notice</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block mb-1">
              Threshold 100%
            </span>
            <div className="text-xs font-semibold text-white">"Immediate Cleaning Required"</div>
            <p className="text-[10px] text-slate-400 mt-1">Critical overflow prevention dispatch</p>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-xs p-3 rounded-xl border border-slate-700/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
              Time Threshold
            </span>
            <div className="text-xs font-semibold text-white">"Cleaning Overdue"</div>
            <p className="text-[10px] text-slate-400 mt-1">Bin uncleaned for &gt; 3 days</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Alerts ({alerts.length})
          </button>

          <button
            onClick={() => setFilterTab('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterTab === 'unread'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => setFilterTab('urgent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterTab === 'urgent'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Urgent / 100% Full ({alerts.filter(a => a.priority === 'urgent' || a.type === 'full').length})
          </button>

          <button
            onClick={() => setFilterTab('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterTab === 'overdue'
                ? 'bg-amber-600 text-white'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            Overdue ({alerts.filter(a => a.type === 'cleaning_overdue').length})
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredAlerts.length} alerts
        </span>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">All Clean! No active alerts</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All dustbins in your municipality are currently within safe thresholds and on schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const priorityBadge = getPriorityBadge(alert.priority);
            const isUrgent = alert.priority === 'urgent' || alert.type === 'full';

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border p-4.5 shadow-xs transition hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  !alert.read ? 'border-l-4 border-l-rose-500 bg-rose-50/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      alert.type === 'full' ? 'bg-rose-100 text-rose-700' :
                      alert.type === 'almost_full' ? 'bg-red-100 text-red-700' :
                      alert.type === 'cleaning_overdue' ? 'bg-amber-100 text-amber-700' :
                      'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {alert.type === 'full' ? <Flame className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                        {alert.title}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {alert.binId}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${priorityBadge.bg}`}
                      >
                        {priorityBadge.text}
                      </span>
                      {!alert.read && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex items-center flex-wrap gap-4 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600 font-medium">{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatRelativeTime(alert.time)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alert Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {/* Clean Bin Action (Instantly resolves alert) */}
                  <button
                    onClick={() => onCleanBin(alert.binId)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition active:scale-95"
                    title="Dispatch cleaning & mark bin emptied"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Clean Bin Now
                  </button>

                  {/* Mark Read */}
                  {!alert.read && (
                    <button
                      onClick={() => onMarkRead(alert.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium border border-slate-200 transition"
                      title="Mark as read"
                    >
                      Mark Read
                    </button>
                  )}

                  {/* View Bin */}
                  <button
                    onClick={() => onSelectBinById(alert.binId)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
                    title="View Bin Details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  {/* Dismiss */}
                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Dismiss alert"
                  >
                    <Trash2 className="w-4 h-4" />
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
