import { Bin, Alert, CleaningRecord, SystemStats, SystemSettings, TelemetryPayload } from '../types';

const API_BASE = '/api';

export const api = {
  // Bins
  async getBins(params?: { status?: string; priority?: string; search?: string; zone?: string }): Promise<Bin[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params?.search) query.append('search', params.search);
    if (params?.zone && params.zone !== 'all') query.append('zone', params.zone);

    const res = await fetch(`${API_BASE}/bins?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bins');
    const json = await res.json();
    return json.data;
  },

  async getBin(id: string): Promise<Bin> {
    const res = await fetch(`${API_BASE}/bins/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch bin details');
    const json = await res.json();
    return json.data;
  },

  async createBin(bin: Partial<Bin>): Promise<Bin> {
    const res = await fetch(`${API_BASE}/bins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bin)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create bin');
    return json.data;
  },

  async updateBin(id: string, bin: Partial<Bin>): Promise<Bin> {
    const res = await fetch(`${API_BASE}/bins/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bin)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update bin');
    return json.data;
  },

  async deleteBin(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/bins/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete bin');
  },

  async cleanBin(id: string, details?: { cleanedBy?: string; notes?: string }): Promise<{ bin: Bin; cleaningRecord: CleaningRecord }> {
    const res = await fetch(`${API_BASE}/bins/${encodeURIComponent(id)}/clean`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details || {})
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to mark bin as cleaned');
    return json.data;
  },

  async simulateBinLevel(id: string, fillLevel: number): Promise<Bin> {
    const res = await fetch(`${API_BASE}/bins/${encodeURIComponent(id)}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fillLevel })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to simulate fill level');
    return json.data;
  },

  // Alerts
  async getAlerts(params?: { read?: boolean; resolved?: boolean; priority?: string }): Promise<{ total: number; unreadCount: number; data: Alert[] }> {
    const query = new URLSearchParams();
    if (params?.read !== undefined) query.append('read', String(params.read));
    if (params?.resolved !== undefined) query.append('resolved', String(params.resolved));
    if (params?.priority && params.priority !== 'all') query.append('priority', params.priority);

    const res = await fetch(`${API_BASE}/alerts?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return await res.json();
  },

  async markAlertRead(id: string): Promise<Alert> {
    const res = await fetch(`${API_BASE}/alerts/${encodeURIComponent(id)}/read`, {
      method: 'PUT'
    });
    const json = await res.json();
    return json.data;
  },

  async markAllAlertsRead(): Promise<void> {
    await fetch(`${API_BASE}/alerts/mark-all-read`, {
      method: 'PUT'
    });
  },

  async dismissAlert(id: string): Promise<void> {
    await fetch(`${API_BASE}/alerts/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  },

  // History & Analytics
  async getHistory(params?: { binId?: string; limit?: number }): Promise<CleaningRecord[]> {
    const query = new URLSearchParams();
    if (params?.binId) query.append('binId', params.binId);
    if (params?.limit) query.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/history?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch cleaning history');
    const json = await res.json();
    return json.data;
  },

  async getHistoryStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/history/stats`);
    if (!res.ok) throw new Error('Failed to fetch history stats');
    const json = await res.json();
    return json.data;
  },

  // Stats
  async getStats(): Promise<SystemStats> {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch system stats');
    const json = await res.json();
    return json.data;
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    const json = await res.json();
    return json.data;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const json = await res.json();
    return json.data;
  },

  // Demo Control
  async resetDemo(): Promise<void> {
    const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo');
  },

  async applyScenario(scenario: string): Promise<void> {
    const res = await fetch(`${API_BASE}/demo/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario })
    });
    if (!res.ok) throw new Error('Failed to apply demo scenario');
  },

  async triggerTick(): Promise<void> {
    const res = await fetch(`${API_BASE}/demo/tick`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger simulation tick');
  },

  // Hardware Telemetry
  async sendTelemetry(payload: TelemetryPayload): Promise<any> {
    const res = await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to send telemetry');
    return json;
  },

  async getTelemetrySample(): Promise<any> {
    const res = await fetch(`${API_BASE}/telemetry/sample`);
    if (!res.ok) throw new Error('Failed to fetch telemetry sample');
    return await res.json();
  }
};
