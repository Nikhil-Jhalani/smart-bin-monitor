import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET all alerts
router.get('/', (req, res) => {
  const { read, priority, type, resolved } = req.query;
  let alerts = db.getAlerts();

  if (read !== undefined) {
    const isRead = read === 'true';
    alerts = alerts.filter(a => a.read === isRead);
  }

  if (resolved !== undefined) {
    const isResolved = resolved === 'true';
    alerts = alerts.filter(a => !!a.resolved === isResolved);
  }

  if (priority && priority !== 'all') {
    alerts = alerts.filter(a => a.priority === priority);
  }

  if (type && type !== 'all') {
    alerts = alerts.filter(a => a.type === type);
  }

  res.json({
    success: true,
    total: alerts.length,
    unreadCount: db.getAlerts().filter(a => !a.read).length,
    data: alerts
  });
});

// PUT mark single alert as read
router.put('/:id/read', (req, res) => {
  const alerts = db.getAlerts();
  const alert = alerts.find(a => a.id === req.params.id);

  if (!alert) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  alert.read = true;
  db.saveAlerts();

  res.json({ success: true, message: 'Alert marked as read', data: alert });
});

// PUT mark all as read
router.put('/mark-all-read', (req, res) => {
  const alerts = db.getAlerts();
  alerts.forEach(a => a.read = true);
  db.saveAlerts();

  res.json({ success: true, message: 'All alerts marked as read' });
});

// DELETE remove or dismiss alert
router.delete('/:id', (req, res) => {
  const alerts = db.getAlerts();
  const index = alerts.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Alert not found' });
  }

  const removed = alerts.splice(index, 1);
  db.saveAlerts();

  res.json({ success: true, message: 'Alert dismissed', data: removed[0] });
});

export default router;
