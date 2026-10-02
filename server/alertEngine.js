import { db } from './db.js';

export function evaluateBinAlertsAndStatus(bin) {
  const settings = db.getSettings();
  const now = new Date();
  const lastCleanedDate = new Date(bin.lastCleaned);
  const diffDays = (now.getTime() - lastCleanedDate.getTime()) / (1000 * 3600 * 24);
  const isOverdue = diffDays >= (settings.overdueDaysThreshold || 3);

  const fillLevel = Number(bin.fillLevel);

  // Determine Bin Status
  if (fillLevel >= (settings.fullLevelThreshold || 100)) {
    bin.status = "urgent";
    bin.priority = "urgent";
  } else if (fillLevel >= (settings.almostFullLevelThreshold || 90)) {
    bin.status = "almost_full";
    bin.priority = "urgent";
  } else if (fillLevel >= (settings.recommendedLevelThreshold || 80)) {
    bin.status = "cleaning_recommended";
    bin.priority = "high";
  } else if (isOverdue) {
    bin.status = "overdue";
    bin.priority = "high";
  } else if (fillLevel >= 40) {
    bin.status = "partially_full";
    bin.priority = "medium";
  } else {
    bin.status = "normal";
    bin.priority = "low";
  }

  bin.lastUpdated = now.toISOString();

  // Evaluate Alerts
  const alerts = db.getAlerts();

  // Helper to find active alert of a given type
  const findActiveAlert = (type) => 
    alerts.find(a => a.binId.toLowerCase() === bin.id.toLowerCase() && a.type === type && !a.resolved);

  // Rule 1: 100% -> Bin Full – Immediate Cleaning Required
  if (fillLevel >= (settings.fullLevelThreshold || 100)) {
    if (!findActiveAlert('full')) {
      alerts.unshift({
        id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        binId: bin.id,
        location: bin.location,
        type: 'full',
        title: 'Bin Full – Immediate Cleaning Required',
        message: `${bin.id} at ${bin.location} is at 100% capacity. Immediate dispatch required to prevent overflow.`,
        fillLevel: fillLevel,
        time: now.toISOString(),
        priority: 'urgent',
        read: false,
        resolved: false
      });
    }
  }

  // Rule 2: 90% -> Bin Almost Full
  if (fillLevel >= (settings.almostFullLevelThreshold || 90) && fillLevel < (settings.fullLevelThreshold || 100)) {
    if (!findActiveAlert('almost_full') && !findActiveAlert('full')) {
      alerts.unshift({
        id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        binId: bin.id,
        location: bin.location,
        type: 'almost_full',
        title: 'Bin Almost Full',
        message: `${bin.id} at ${bin.location} has reached ${fillLevel}%. Schedule collection soon.`,
        fillLevel: fillLevel,
        time: now.toISOString(),
        priority: 'high',
        read: false,
        resolved: false
      });
    }
  }

  // Rule 3: 80% -> Cleaning Recommended
  if (fillLevel >= (settings.recommendedLevelThreshold || 80) && fillLevel < (settings.almostFullLevelThreshold || 90)) {
    if (!findActiveAlert('cleaning_recommended') && !findActiveAlert('almost_full') && !findActiveAlert('full')) {
      alerts.unshift({
        id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        binId: bin.id,
        location: bin.location,
        type: 'cleaning_recommended',
        title: 'Cleaning Recommended',
        message: `${bin.id} at ${bin.location} reached ${fillLevel}%. Recommended to add to upcoming route.`,
        fillLevel: fillLevel,
        time: now.toISOString(),
        priority: 'medium',
        read: false,
        resolved: false
      });
    }
  }

  // Rule 4: Cleaning Overdue (has not been cleaned for configurable days)
  if (isOverdue) {
    if (!findActiveAlert('cleaning_overdue')) {
      alerts.unshift({
        id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        binId: bin.id,
        location: bin.location,
        type: 'cleaning_overdue',
        title: 'Cleaning Overdue',
        message: `${bin.id} at ${bin.location} has not been cleaned for ${Math.floor(diffDays)} days (threshold: ${settings.overdueDaysThreshold} days). Risk of bad smell and bacterial buildup.`,
        fillLevel: fillLevel,
        time: now.toISOString(),
        priority: 'high',
        read: false,
        resolved: false
      });
    }
  }

  db.saveAlerts();
}

// Initial evaluation on system boot
export function evaluateAllBins() {
  const bins = db.getBins();
  bins.forEach(bin => evaluateBinAlertsAndStatus(bin));
  db.saveBins();
}
