import express from 'express';
import { db } from '../db.js';
import { evaluateBinAlertsAndStatus } from '../alertEngine.js';

const router = express.Router();

// Reset to standard Demo specification (Section 13)
router.post('/reset', (req, res) => {
  db.resetToDefault();
  const bins = db.getBins();
  bins.forEach(bin => evaluateBinAlertsAndStatus(bin));
  db.saveBins();

  res.json({
    success: true,
    message: 'Demo dataset reset to initial presentation state',
    bins: db.getBins(),
    alerts: db.getAlerts()
  });
});

// Load specific demonstration scenario
router.post('/scenario', (req, res) => {
  const { scenario } = req.body;
  const bins = db.getBins();
  const now = new Date().toISOString();

  if (scenario === 'rush_hour') {
    // Heavy public usage scenario
    bins.forEach(b => {
      b.fillLevel = Math.min(100, Math.max(75, Math.floor(Math.random() * 25) + 75));
      b.lastUpdated = now;
      if (!b.fillHistory) b.fillHistory = [];
      b.fillHistory.push({ timestamp: now, level: b.fillLevel });
      evaluateBinAlertsAndStatus(b);
    });
  } else if (scenario === 'all_cleaned') {
    // Post-shift clean state
    bins.forEach(b => {
      b.fillLevel = Math.floor(Math.random() * 10);
      b.lastCleaned = now;
      b.lastUpdated = now;
      if (!b.fillHistory) b.fillHistory = [];
      b.fillHistory.push({ timestamp: now, level: b.fillLevel });
      evaluateBinAlertsAndStatus(b);
    });
    // Resolve all alerts
    db.getAlerts().forEach(a => a.resolved = true);
    db.saveAlerts();
  } else if (scenario === 'urgent_crisis') {
    // Critical presentation moment: 3 bins overflowing
    const bin1 = db.getBinById('BIN-003');
    const bin2 = db.getBinById('BIN-004');
    const bin3 = db.getBinById('BIN-005');
    if (bin1) bin1.fillLevel = 92;
    if (bin2) bin2.fillLevel = 98;
    if (bin3) bin3.fillLevel = 100;
    bins.forEach(b => evaluateBinAlertsAndStatus(b));
  } else {
    // Standard presentation preset (Section 13)
    const preset = {
      'BIN-001': 25,
      'BIN-002': 55,
      'BIN-003': 82,
      'BIN-004': 94,
      'BIN-005': 100
    };
    bins.forEach(b => {
      if (preset[b.id] !== undefined) {
        b.fillLevel = preset[b.id];
      }
      evaluateBinAlertsAndStatus(b);
    });
  }

  db.saveBins();

  res.json({
    success: true,
    message: `Scenario '${scenario || 'standard'}' applied`,
    bins: db.getBins(),
    alerts: db.getAlerts()
  });
});

// Single simulation tick: gradually increases fill level of random bins
router.post('/tick', (req, res) => {
  const bins = db.getBins();
  const now = new Date().toISOString();
  let updatedCount = 0;

  bins.forEach(bin => {
    // 60% chance to accumulate trash on tick
    if (Math.random() > 0.4 && bin.fillLevel < 100) {
      const increment = Math.floor(Math.random() * 6) + 2; // +2% to +7%
      bin.fillLevel = Math.min(100, bin.fillLevel + increment);
      bin.lastUpdated = now;
      if (!bin.fillHistory) bin.fillHistory = [];
      bin.fillHistory.push({ timestamp: now, level: bin.fillLevel });
      if (bin.fillHistory.length > 20) bin.fillHistory.shift();
      evaluateBinAlertsAndStatus(bin);
      updatedCount++;
    }
  });

  db.saveBins();

  res.json({
    success: true,
    message: `Simulation tick executed: ${updatedCount} bins updated`,
    bins: db.getBins(),
    alerts: db.getAlerts()
  });
});

export default router;
