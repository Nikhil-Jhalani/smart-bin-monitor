import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import binsRouter from './routes/bins.js';
import alertsRouter from './routes/alerts.js';
import historyRouter from './routes/history.js';
import telemetryRouter from './routes/telemetry.js';
import demoRouter from './routes/demo.js';
import statsRouter from './routes/stats.js';
import settingsRouter from './routes/settings.js';
import { evaluateAllBins } from './alertEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Evaluate initial alerts
evaluateAllBins();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Smart Bin Monitoring System API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/bins', binsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/history', historyRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/demo', demoRouter);
app.use('/api/stats', statsRouter);
app.use('/api/settings', settingsRouter);

// Serve voiceover player & audio files
const VOICEOVER_DIR = path.join(__dirname, '..', 'voiceover');
if (fs.existsSync(VOICEOVER_DIR)) {
  app.use('/voiceover', express.static(VOICEOVER_DIR));
}

// Serve static frontend files in Express 5
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/voiceover')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SmartBin Monitoring System Server is running!`);
  console.log(`📡 API Base:        http://localhost:${PORT}/api`);
  console.log(`🌐 ESP32 Telemetry: http://localhost:${PORT}/api/telemetry`);
  console.log(`📊 Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
