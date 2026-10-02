import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET cleaning history logs
router.get('/', (req, res) => {
  const { binId, limit = 50 } = req.query;
  let history = db.getHistory();

  if (binId) {
    history = history.filter(h => h.binId.toLowerCase() === binId.toLowerCase());
  }

  const result = history.slice(0, Number(limit));

  res.json({
    success: true,
    total: history.length,
    data: result
  });
});

// GET cleaning summary statistics
router.get('/stats', (req, res) => {
  const history = db.getHistory();
  const totalCleanings = history.length;

  const now = new Date();
  const todayCleanings = history.filter(h => {
    const d = new Date(h.cleanedAt);
    return d.toDateString() === now.toDateString();
  }).length;

  const avgFillLevelBeforeCleaning = totalCleanings > 0
    ? Math.round(history.reduce((acc, h) => acc + (h.previousFillLevel || 0), 0) / totalCleanings)
    : 0;

  // Estimated fuel / carbon saved by smart dynamic routing vs fixed daily routes
  const estimatedFuelSavedLiters = Math.round(totalCleanings * 1.8 * 10) / 10;
  const estimatedCO2SavedKg = Math.round(estimatedFuelSavedLiters * 2.68 * 10) / 10;

  res.json({
    success: true,
    data: {
      totalCleanings,
      todayCleanings,
      avgFillLevelBeforeCleaning,
      estimatedFuelSavedLiters,
      estimatedCO2SavedKg
    }
  });
});

export default router;
