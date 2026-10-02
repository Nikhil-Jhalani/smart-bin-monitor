export type BinStatus = 
  | 'normal' 
  | 'partially_full' 
  | 'cleaning_recommended' 
  | 'almost_full' 
  | 'urgent' 
  | 'overdue';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface FillHistoryPoint {
  timestamp: string;
  level: number;
}

export interface Bin {
  id: string;
  location: string;
  zone?: string;
  latitude: number;
  longitude: number;
  fillLevel: number;
  status: BinStatus;
  priority: PriorityLevel;
  capacityLiters: number;
  batteryLevel: number;
  deviceStatus: 'online' | 'offline' | 'simulated';
  lastCleaned: string;
  lastUpdated: string;
  fillHistory?: FillHistoryPoint[];
  alerts?: Alert[];
  cleaningHistory?: CleaningRecord[];
}

export interface Alert {
  id: string;
  binId: string;
  location: string;
  type: 'cleaning_recommended' | 'almost_full' | 'full' | 'cleaning_overdue';
  title: string;
  message: string;
  fillLevel: number;
  time: string;
  priority: PriorityLevel;
  read: boolean;
  resolved: boolean;
  resolvedAt?: string;
}

export interface CleaningRecord {
  id: string;
  binId: string;
  location: string;
  cleanedAt: string;
  cleanedBy: string;
  previousFillLevel: number;
  notes: string;
  durationMinutes?: number;
}

export interface SystemStats {
  totalBins: number;
  emptyBins: number;
  normalBins: number;
  partiallyFullBins: number;
  fullBins: number;
  urgentBins: number;
  overdueBins: number;
  avgFillLevel: number;
  activeAlertsCount: number;
  unreadAlertsCount: number;
  recentAlerts: Alert[];
  lastUpdated: string;
}

export interface SystemSettings {
  overdueDaysThreshold: number;
  recommendedLevelThreshold: number;
  almostFullLevelThreshold: number;
  fullLevelThreshold: number;
  alertSoundEnabled: boolean;
  autoRefreshIntervalSec: number;
}

export interface TelemetryPayload {
  bin_id: string;
  fill_level: number;
  latitude?: number;
  longitude?: number;
  timestamp?: string;
  last_cleaned?: string;
  battery_level?: number;
  device_status?: 'online' | 'offline' | 'simulated';
}
