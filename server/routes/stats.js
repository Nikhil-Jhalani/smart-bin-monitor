import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const bins = db.getBins();
  const alerts = db.getAlerts();
  const settings = db.getSettings();
  const now = new Date();

  const total = bins.length;
  const empty = bins.filter(b => b.fillLevel <= 15).length;
  const normal = bins.filter(b => b.status === 'normal').length;
  const partiallyFull = bins.filter(b => b.status === 'partially_full' || (b.fillLevel >= 40 && b.fillLevel < 80)).length;
  const full = bins.filter(b => b.fillLevel >= 80).length;
  const urgent = bins.filter(b => b.status === 'urgent' || b.fillLevel >= 90).length;

  const overdue = bins.filter(b => {
    const diffDays = (now.getTime() - new Date(b.lastCleaned).getTime()) / (1000 * 3600 * 24);
    return diffDays >= settings.overdueDaysThreshold;
  }).length;

  const avgFillLevel = total > 0
    ? Math.round(bins.reduce((sum, b) => sum + b.fillLevel, 0) / total)
    : 0;

  const activeAlerts = alerts.filter(a => !a.resolved);
  const unreadAlerts = alerts.filter(a => !a.read && !a.resolved);

  res.json({
    success: true,
    data: {
      totalBins: total,
      emptyBins: empty,
      normalBins: normal,
      partiallyFullBins: partiallyFull,
      fullBins: full,
      urgentBins: urgent,
      overdueBins: overdue,
      avgFillLevel: avgFillLevel,
      activeAlertsCount: activeAlerts.length,
      unreadAlertsCount: unreadAlerts.length,
      recentAlerts: alerts.slice(0, 5),
      lastUpdated: new Date().toISOString()
    }
  });
});

export default router;
