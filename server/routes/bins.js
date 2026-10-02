import express from 'express';
import { db } from '../db.js';
import { evaluateBinAlertsAndStatus } from '../alertEngine.js';

const router = express.Router();

// GET all bins with optional filters
router.get('/', (req, res) => {
  const { status, priority, search, zone } = req.query;
  let bins = db.getBins();

  if (search) {
    const q = search.toLowerCase();
    bins = bins.filter(b => 
      b.id.toLowerCase().includes(q) || 
      b.location.toLowerCase().includes(q) || 
      (b.zone && b.zone.toLowerCase().includes(q))
    );
  }

  if (status && status !== 'all') {
    bins = bins.filter(b => b.status === status);
  }

  if (priority && priority !== 'all') {
    bins = bins.filter(b => b.priority === priority);
  }

  if (zone && zone !== 'all') {
    bins = bins.filter(b => b.zone === zone);
  }

  res.json({ success: true, count: bins.length, data: bins });
});

// GET single bin details with its alerts & history
router.get('/:id', (req, res) => {
  const bin = db.getBinById(req.params.id);
  if (!bin) {
    return res.status(404).json({ success: false, error: 'Bin not found' });
  }

  const binAlerts = db.getAlerts().filter(a => a.binId.toLowerCase() === bin.id.toLowerCase());
  const binHistory = db.getHistory().filter(h => h.binId.toLowerCase() === bin.id.toLowerCase());

  res.json({
    success: true,
    data: {
      ...bin,
      alerts: binAlerts,
      cleaningHistory: binHistory,
    }
  });
});

// POST create new bin
router.post('/', (req, res) => {
  const { id, location, zone, latitude, longitude, capacityLiters, fillLevel = 0 } = req.body;

  if (!id || !location || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, error: 'ID, location, latitude, and longitude are required' });
  }

  const existing = db.getBinById(id);
  if (existing) {
    return res.status(409).json({ success: false, error: `Bin with ID ${id} already exists` });
  }

  const now = new Date().toISOString();
  const newBin = {
    id: id.toUpperCase().trim(),
    location: location.trim(),
    zone: zone || 'General Zone',
    latitude: Number(latitude),
    longitude: Number(longitude),
    fillLevel: Number(fillLevel),
    status: 'normal',
    priority: 'low',
    capacityLiters: Number(capacityLiters) || 120,
    batteryLevel: 100,
    deviceStatus: 'online',
    lastCleaned: now,
    lastUpdated: now,
    fillHistory: [{ timestamp: now, level: Number(fillLevel) }]
  };

  evaluateBinAlertsAndStatus(newBin);
  db.getBins().push(newBin);
  db.saveBins();

  res.status(201).json({ success: true, message: 'Bin registered successfully', data: newBin });
});

// PUT update bin
router.put('/:id', (req, res) => {
  const bin = db.getBinById(req.params.id);
  if (!bin) {
    return res.status(404).json({ success: false, error: 'Bin not found' });
  }

  const { location, zone, latitude, longitude, capacityLiters } = req.body;
  if (location) bin.location = location;
  if (zone) bin.zone = zone;
  if (latitude !== undefined) bin.latitude = Number(latitude);
  if (longitude !== undefined) bin.longitude = Number(longitude);
  if (capacityLiters !== undefined) bin.capacityLiters = Number(capacityLiters);

  evaluateBinAlertsAndStatus(bin);
  db.saveBins();

  res.json({ success: true, message: 'Bin updated', data: bin });
});

// POST mark bin as cleaned (Section 8)
router.post('/:id/clean', (req, res) => {
  const bin = db.getBinById(req.params.id);
  if (!bin) {
    return res.status(404).json({ success: false, error: 'Bin not found' });
  }

  const now = new Date().toISOString();
  const previousLevel = bin.fillLevel;
  const { cleanedBy = 'Sanitation Route Crew', notes = 'Standard emptying & sanitisation' } = req.body;

  // 1. Reset fill level to 0%
  bin.fillLevel = 0;
  // 2. Update last cleaned time
  bin.lastCleaned = now;
  bin.lastUpdated = now;
  // 3. Add to fill history
  if (!bin.fillHistory) bin.fillHistory = [];
  bin.fillHistory.push({ timestamp: now, level: 0 });
  if (bin.fillHistory.length > 20) bin.fillHistory.shift();

  // 4. Add an entry to cleaning history
  const historyEntry = {
    id: `CLN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    binId: bin.id,
    location: bin.location,
    cleanedAt: now,
    cleanedBy: cleanedBy,
    previousFillLevel: previousLevel,
    notes: notes,
    durationMinutes: Math.floor(Math.random() * 8) + 5
  };
  db.getHistory().unshift(historyEntry);
  db.saveHistory();

  // 5. Remove/resolve active cleaning alerts for this bin
  const alerts = db.getAlerts();
  alerts.forEach(a => {
    if (a.binId.toLowerCase() === bin.id.toLowerCase() && !a.resolved) {
      a.resolved = true;
      a.resolvedAt = now;
      a.read = true;
    }
  });
  db.saveAlerts();

  // 6. Recalculate status and priority
  evaluateBinAlertsAndStatus(bin);
  db.saveBins();

  res.json({
    success: true,
    message: `Bin ${bin.id} marked as cleaned`,
    data: {
      bin,
      cleaningRecord: historyEntry
    }
  });
});

// POST simulate fill level manually via slider (Section 9)
router.post('/:id/simulate', (req, res) => {
  const bin = db.getBinById(req.params.id);
  if (!bin) {
    return res.status(404).json({ success: false, error: 'Bin not found' });
  }

  const level = Number(req.body.fillLevel);
  if (isNaN(level) || level < 0 || level > 100) {
    return res.status(400).json({ success: false, error: 'fillLevel must be a number between 0 and 100' });
  }

  const now = new Date().toISOString();
  bin.fillLevel = Math.round(level);
  bin.lastUpdated = now;

  if (!bin.fillHistory) bin.fillHistory = [];
  bin.fillHistory.push({ timestamp: now, level: bin.fillLevel });
  if (bin.fillHistory.length > 20) bin.fillHistory.shift();

  // Re-evaluate alerts and status
  evaluateBinAlertsAndStatus(bin);
  db.saveBins();

  res.json({
    success: true,
    message: `Bin ${bin.id} fill level simulated to ${bin.fillLevel}%`,
    data: bin
  });
});

// DELETE remove bin
router.delete('/:id', (req, res) => {
  const binIndex = db.getBins().findIndex(b => b.id.toLowerCase() === req.params.id.toLowerCase());
  if (binIndex === -1) {
    return res.status(404).json({ success: false, error: 'Bin not found' });
  }

  const removed = db.getBins().splice(binIndex, 1);
  db.saveBins();

  res.json({ success: true, message: `Bin ${req.params.id} deleted`, data: removed[0] });
});

export default router;
