import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BinTable } from './components/BinTable';
import { MapView } from './components/MapView';
import { AlertsView } from './components/AlertsView';
import { CleaningHistoryView } from './components/CleaningHistoryView';
import { SimulationPanel } from './components/SimulationPanel';
import { HardwareDocsView } from './components/HardwareDocsView';
import { BinDetailModal } from './components/BinDetailModal';
import { AddBinModal } from './components/AddBinModal';
import { SettingsModal } from './components/SettingsModal';
import { api } from './services/api';
import { Bin, SystemStats, Alert, CleaningRecord, SystemSettings, TelemetryPayload } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [bins, setBins] = useState<Bin[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [history, setHistory] = useState<CleaningRecord[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);
  const [isAddBinOpen, setIsAddBinOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [binsData, statsData, alertsData, historyData, settingsData] = await Promise.all([
        api.getBins(),
        api.getStats(),
        api.getAlerts(),
        api.getHistory({ limit: 50 }),
        api.getSettings()
      ]);

      setBins(binsData);
      setStats(statsData);
      setAlerts(alertsData.data || []);
      setHistory(historyData);
      setSettings(settingsData);

      // If a bin was selected in modal, keep its details fresh
      if (selectedBin) {
        const updatedSelected = binsData.find(b => b.id.toLowerCase() === selectedBin.id.toLowerCase());
        if (updatedSelected) {
          // fetch full details with alerts & history
          const detailed = await api.getBin(updatedSelected.id);
          setSelectedBin(detailed);
        }
      }
    } catch (err) {
      console.error('Error fetching system data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedBin?.id]);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // Periodic polling every 12 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      loadAllData();
    }, 12000);
    return () => clearInterval(timer);
  }, [loadAllData]);

  // Handle Mark Cleaned (Section 8)
  const handleCleanBin = async (binId: string, notes?: string) => {
    try {
      const res = await api.cleanBin(binId, {
        cleanedBy: 'Sanitation Route Crew Alpha',
        notes: notes || 'Emptied and disinfected via SmartBin Portal'
      });
      // Optimistic update
      setBins(prev => prev.map(b => b.id === binId ? res.bin : b));
      if (selectedBin && selectedBin.id === binId) {
        setSelectedBin(res.bin);
      }
      loadAllData();
    } catch (err) {
      console.error('Failed to clean bin:', err);
    }
  };

  // Handle Simulate Fill Level (Section 9)
  const handleSimulateLevel = async (binId: string, fillLevel: number) => {
    try {
      const updated = await api.simulateBinLevel(binId, fillLevel);
      setBins(prev => prev.map(b => b.id === binId ? updated : b));
      if (selectedBin && selectedBin.id === binId) {
        setSelectedBin(updated);
      }
      loadAllData();
    } catch (err) {
      console.error('Failed to simulate level:', err);
    }
  };

  // Reset Demo (Section 13)
  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      loadAllData();
    } catch (err) {
      console.error('Failed to reset demo:', err);
    }
  };

  // Apply Demonstration Scenario
  const handleApplyScenario = async (scenario: string) => {
    try {
      await api.applyScenario(scenario);
      loadAllData();
    } catch (err) {
      console.error('Failed to apply scenario:', err);
    }
  };

  // Trigger Fill Tick
  const handleTriggerTick = async () => {
    try {
      setIsSimulating(true);
      await api.triggerTick();
      await loadAllData();
    } finally {
      setIsSimulating(false);
    }
  };

  // Alerts Actions
  const handleMarkAlertRead = async (id: string) => {
    try {
      await api.markAlertRead(id);
      loadAllData();
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const handleMarkAllAlertsRead = async () => {
    try {
      await api.markAllAlertsRead();
      loadAllData();
    } catch (err) {
      console.error('Failed to mark all alerts as read:', err);
    }
  };

  const handleDismissAlert = async (id: string) => {
    try {
      await api.dismissAlert(id);
      loadAllData();
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
  };

  // Select bin for detailed modal
  const handleSelectBin = async (bin: Bin) => {
    try {
      const fullDetails = await api.getBin(bin.id);
      setSelectedBin(fullDetails);
    } catch (e) {
      setSelectedBin(bin);
    }
  };

  const handleSelectBinById = async (binId: string) => {
    try {
      const fullDetails = await api.getBin(binId);
      setSelectedBin(fullDetails);
    } catch (err) {
      console.error('Failed to load bin details:', err);
    }
  };

  // KPI card click to filter
  const handleStatusFilterClick = (status: string) => {
    setStatusFilter(status);
    setCurrentTab('bins');
  };

  // Add Bin
  const handleAddBin = async (binData: Partial<Bin>) => {
    await api.createBin(binData);
    await loadAllData();
  };

  // Update Settings
  const handleUpdateSettings = async (newSettings: Partial<SystemSettings>) => {
    await api.updateSettings(newSettings);
    await loadAllData();
  };

  // Send Telemetry
  const handleSendTelemetry = async (payload: TelemetryPayload) => {
    const res = await api.sendTelemetry(payload);
    await loadAllData();
    return res;
  };

  const unreadAlertsCount = alerts.filter(a => !a.read && !a.resolved).length;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        unreadAlertsCount={unreadAlertsCount}
        onOpenAddBin={() => setIsAddBinOpen(true)}
        onRefresh={loadAllData}
        isRefreshing={isRefreshing}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar
          currentTab={currentTab}
          lastUpdated={stats?.lastUpdated || ''}
          onResetDemo={handleResetDemo}
          onApplyScenario={handleApplyScenario}
          onTriggerTick={handleTriggerTick}
          isSimulating={isSimulating}
          onOpenDemoTab={() => setCurrentTab('simulation')}
        />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              bins={bins}
              alerts={alerts}
              onSelectBin={handleSelectBin}
              onCleanBin={handleCleanBin}
              onNavigateTab={setCurrentTab}
              onStatusFilterClick={handleStatusFilterClick}
            />
          )}

          {currentTab === 'bins' && (
            <BinTable
              bins={bins}
              onSelectBin={handleSelectBin}
              onCleanBin={handleCleanBin}
              onSimulateBin={(bin) => handleSelectBin(bin)}
              initialStatusFilter={statusFilter}
            />
          )}

          {currentTab === 'map' && (
            <MapView
              bins={bins}
              onSelectBin={handleSelectBin}
              onCleanBin={handleCleanBin}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onMarkRead={handleMarkAlertRead}
              onMarkAllRead={handleMarkAllAlertsRead}
              onDismissAlert={handleDismissAlert}
              onSelectBinById={handleSelectBinById}
              onCleanBin={handleCleanBin}
            />
          )}

          {currentTab === 'history' && (
            <CleaningHistoryView
              history={history}
              onSelectBinById={handleSelectBinById}
            />
          )}

          {currentTab === 'simulation' && (
            <SimulationPanel
              bins={bins}
              onSimulateLevel={handleSimulateLevel}
              onResetDemo={handleResetDemo}
              onApplyScenario={handleApplyScenario}
              onTriggerTick={handleTriggerTick}
              onCleanBin={handleCleanBin}
            />
          )}

          {currentTab === 'hardware' && (
            <HardwareDocsView
              onSendTelemetry={handleSendTelemetry}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <BinDetailModal
        bin={selectedBin}
        onClose={() => setSelectedBin(null)}
        onCleanBin={handleCleanBin}
        onSimulateLevel={handleSimulateLevel}
      />

      <AddBinModal
        isOpen={isAddBinOpen}
        onClose={() => setIsAddBinOpen(false)}
        onAddBin={handleAddBin}
        existingBinsCount={bins.length}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};

export default App;
