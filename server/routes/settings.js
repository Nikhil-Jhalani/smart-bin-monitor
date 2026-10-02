import express from 'express';
import { db } from '../db.js';
import { evaluateAllBins } from '../alertEngine.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    data: db.getSettings()
  });
});

router.put('/', (req, res) => {
  const updated = db.updateSettings(req.body);
  // Re-evaluate all bins with new thresholds
  evaluateAllBins();

  res.json({
    success: true,
    message: 'System settings updated and applied across all bins',
    data: updated
  });
});

export default router;
