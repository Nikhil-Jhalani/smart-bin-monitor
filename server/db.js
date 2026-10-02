import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const BINS_FILE = path.join(DATA_DIR, 'bins.json');
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Default initial settings
export const defaultSettings = {
  overdueDaysThreshold: 3,
  recommendedLevelThreshold: 80,
  almostFullLevelThreshold: 90,
  fullLevelThreshold: 100,
  alertSoundEnabled: true,
  autoRefreshIntervalSec: 15
};

// Default seed bins as requested in section 13
export const initialBins = [
  {
    id: "BIN-001",
    location: "City Central Square - Main Fountain",
    zone: "Zone 1 - Civic Center",
    latitude: 28.6139,
    longitude: 77.2090,
    fillLevel: 25,
    status: "normal",
    priority: "low",
    capacityLiters: 120,
    batteryLevel: 96,
    deviceStatus: "online",
    lastCleaned: new Date(Date.now() - 18 * 3600 * 1000).toISOString(), // 18 hrs ago
    lastUpdated: new Date().toISOString(),
    fillHistory: [
      { timestamp: new Date(Date.now() - 16 * 3600 * 1000).toISOString(), level: 5 },
      { timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), level: 14 },
      { timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), level: 20 },
      { timestamp: new Date().toISOString(), level: 25 }
    ]
  },
  {
    id: "BIN-002",
    location: "Municipal Library Park - West Gate",
    zone: "Zone 2 - Education Hub",
    latitude: 28.6185,
    longitude: 77.2140,
    fillLevel: 55,
    status: "partially_full",
    priority: "medium",
    capacityLiters: 100,
    batteryLevel: 88,
    deviceStatus: "online",
    lastCleaned: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), // 1.5 days ago
    lastUpdated: new Date().toISOString(),
    fillHistory: [
      { timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), level: 20 },
      { timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), level: 38 },
      { timestamp: new Date().toISOString(), level: 55 }
    ]
  },
  {
    id: "BIN-003",
    location: "Metro Station North Exit - Bus Interchange",
    zone: "Zone 3 - Transit Corridor",
    latitude: 28.6210,
    longitude: 77.2050,
    fillLevel: 82,
    status: "cleaning_recommended",
    priority: "high",
    capacityLiters: 150,
    batteryLevel: 82,
    deviceStatus: "online",
    lastCleaned: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), // 2 days ago
    lastUpdated: new Date().toISOString(),
    fillHistory: [
      { timestamp: new Date(Date.now() - 30 * 3600 * 1000).toISOString(), level: 40 },
      { timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), level: 65 },
      { timestamp: new Date().toISOString(), level: 82 }
    ]
  },
  {
    id: "BIN-004",
    location: "Central Vegetable & Fruit Bazaar",
    zone: "Zone 1 - Civic Center",
    latitude: 28.6100,
    longitude: 77.2170,
    fillLevel: 94,
    status: "almost_full",
    priority: "urgent",
    capacityLiters: 200,
    batteryLevel: 79,
    deviceStatus: "online",
    lastCleaned: new Date(Date.now() - 54 * 3600 * 1000).toISOString(), // 2.25 days ago
    lastUpdated: new Date().toISOString(),
    fillHistory: [
      { timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), level: 50 },
      { timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), level: 75 },
      { timestamp: new Date().toISOString(), level: 94 }
    ]
  },
  {
    id: "BIN-005",
    location: "City General Hospital - Emergency Walkway",
    zone: "Zone 4 - Healthcare District",
    latitude: 28.6080,
    longitude: 77.2020,
    fillLevel: 100,
    status: "urgent",
    priority: "urgent",
    capacityLiters: 150,
    batteryLevel: 91,
    deviceStatus: "online",
    lastCleaned: new Date(Date.now() - 60 * 3600 * 1000).toISOString(), // 2.5 days ago
    lastUpdated: new Date().toISOString(),
    fillHistory: [
      { timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), level: 60 },
      { timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), level: 85 },
      { timestamp: new Date().toISOString(), level: 100 }
    ]
  },
  {
    id: "BIN-006",
    location: "Botanical Garden - East Pavilion",
    zone: "Zone 2 - Education Hub",
    latitude: 28.6250,
    longitude: 77.2200,
    fillLevel: 42,
    status: "overdue",
    priority: "high",
    capacityLiters: 120,
    batteryLevel: 74,
    deviceStatus: "online",
    lastCleaned: new Date(Date.now() - 96 * 3600 * 1000).toISOString(), // 4 days ago (>3 days threshold)
    lastUpdated: new Date().toISOString(),
    fillHistory: [
      { timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), level: 25 },
      { timestamp: new Date().toISOString(), level: 42 }
    ]
  },
  {
    id: "BIN-007",
    location: "Sports Stadium - Ticket Counter 3",
    zone: "Zone 5 - Sports Complex",
    latitude: 28.6170,
    longitude: 77.2280,
    fillLevel: 12,
    status: "normal",
    priority: "low",
    capacityLiters: 150,
    batteryLevel: 98,
    deviceStatus: "online",
    lastCleaned: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    lastUpdated: new Date().toISOString(),
    fillHistory: [
      { timestamp: new Date().toISOString(), level: 12 }
    ]
  },
  {
    id: "BIN-008",
    location: "Heritage Art Promenade - South Lane",
    zone: "Zone 1 - Civic Center",
    latitude: 28.6050,
    longitude: 77.2120,
    fillLevel: 0,
    status: "normal",
    priority: "low",
    capacityLiters: 100,
    batteryLevel: 95,
    deviceStatus: "online",
    lastCleaned: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // Just cleaned
    lastUpdated: new Date().toISOString(),
    fillHistory: [
      { timestamp: new Date().toISOString(), level: 0 }
    ]
  }
];

export const initialHistory = [
  {
    id: "CLN-001",
    binId: "BIN-008",
    location: "Heritage Art Promenade - South Lane",
    cleanedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    cleanedBy: "Sanitation Team Gamma - Route 1",
    previousFillLevel: 95,
    notes: "Regular morning round. Bin power-washed and QR sticker inspected.",
    durationMinutes: 8
  },
  {
    id: "CLN-002",
    binId: "BIN-007",
    location: "Sports Stadium - Ticket Counter 3",
    cleanedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    cleanedBy: "Sanitation Team Alpha - Route 4",
    previousFillLevel: 88,
    notes: "Post-match clearance round.",
    durationMinutes: 12
  },
  {
    id: "CLN-003",
    binId: "BIN-001",
    location: "City Central Square - Main Fountain",
    cleanedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    cleanedBy: "Sanitation Team Beta - Route 2",
    previousFillLevel: 92,
    notes: "Nightly sanitization shift.",
    durationMinutes: 10
  }
];

class Database {
  constructor() {
    this.bins = this.load(BINS_FILE, initialBins);
    this.alerts = this.load(ALERTS_FILE, []);
    this.history = this.load(HISTORY_FILE, initialHistory);
    this.settings = this.load(SETTINGS_FILE, defaultSettings);
  }

  load(filePath, defaultData) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err);
    }
    this.save(filePath, defaultData);
    return defaultData;
  }

  save(filePath, data) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error writing ${filePath}:`, err);
    }
  }

  getBins() {
    return this.bins;
  }

  getBinById(id) {
    return this.bins.find(b => b.id.toLowerCase() === id.toLowerCase());
  }

  saveBins() {
    this.save(BINS_FILE, this.bins);
  }

  getAlerts() {
    return this.alerts;
  }

  saveAlerts() {
    this.save(ALERTS_FILE, this.alerts);
  }

  getHistory() {
    return this.history;
  }

  saveHistory() {
    this.save(HISTORY_FILE, this.history);
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.save(SETTINGS_FILE, this.settings);
    return this.settings;
  }

  resetToDefault() {
    this.bins = JSON.parse(JSON.stringify(initialBins));
    this.history = JSON.parse(JSON.stringify(initialHistory));
    this.alerts = [];
    this.settings = JSON.parse(JSON.stringify(defaultSettings));
    this.saveBins();
    this.saveHistory();
    this.saveAlerts();
    this.save(SETTINGS_FILE, this.settings);
  }
}

export const db = new Database();
