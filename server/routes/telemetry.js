import express from 'express';
import { db } from '../db.js';
import { evaluateBinAlertsAndStatus } from '../alertEngine.js';

const router = express.Router();

/**
 * ESP32 Hardware Integration Endpoint (Section 10)
 * 
 * Supports incoming telemetry from physical smart dustbin microcontrollers
 * (ESP32 / ESP8266 / Arduino + GSM / LoRaWAN gateway).
 * 
 * Expected payload:
 * {
 *   "bin_id": "BIN-001",
 *   "fill_level": 78,
 *   "latitude": 28.6139,
 *   "longitude": 77.2090,
 *   "timestamp": "2026-10-02T10:00:00Z",
 *   "last_cleaned": "2026-09-30T14:00:00Z",
 *   "battery_level": 92,
 *   "device_status": "online"
 * }
 */
router.post('/', (req, res) => {
  const {
    bin_id,
    binId = bin_id,
    fill_level,
    fillLevel = fill_level,
    latitude,
    longitude,
    timestamp = new Date().toISOString(),
    last_cleaned,
    lastCleaned = last_cleaned,
    battery_level,
    batteryLevel = battery_level,
    device_status = 'online',
    deviceStatus = device_status
  } = req.body;

  if (!binId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: bin_id or binId'
    });
  }

  if (fillLevel === undefined || isNaN(Number(fillLevel))) {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid field: fill_level (must be a number between 0 and 100)'
    });
  }

  const numFill = Math.min(100, Math.max(0, Math.round(Number(fillLevel))));
  const bins = db.getBins();
  let bin = db.getBinById(binId);

  // Auto-provision if bin does not exist yet
  if (!bin) {
    bin = {
      id: binId.toUpperCase().trim(),
      location: `Sensor Node ${binId} Location`,
      zone: 'Unassigned Zone',
      latitude: latitude ? Number(latitude) : 28.6139,
      longitude: longitude ? Number(longitude) : 77.2090,
      fillLevel: numFill,
      status: 'normal',
      priority: 'low',
      capacityLiters: 120,
      batteryLevel: batteryLevel !== undefined ? Number(batteryLevel) : 100,
      deviceStatus: deviceStatus || 'online',
      lastCleaned: lastCleaned || timestamp,
      lastUpdated: timestamp,
      fillHistory: [{ timestamp, level: numFill }]
    };
    bins.push(bin);
  } else {
    // Update existing bin
    bin.fillLevel = numFill;
    bin.lastUpdated = timestamp;
    if (latitude !== undefined) bin.latitude = Number(latitude);
    if (longitude !== undefined) bin.longitude = Number(longitude);
    if (batteryLevel !== undefined) bin.batteryLevel = Number(batteryLevel);
    if (lastCleaned) bin.lastCleaned = lastCleaned;
    bin.deviceStatus = deviceStatus;

    if (!bin.fillHistory) bin.fillHistory = [];
    bin.fillHistory.push({ timestamp, level: numFill });
    if (bin.fillHistory.length > 25) bin.fillHistory.shift();
  }

  const alertsBefore = db.getAlerts().length;
  evaluateBinAlertsAndStatus(bin);
  const alertsAfter = db.getAlerts().length;
  db.saveBins();

  res.status(200).json({
    success: true,
    message: `Telemetry processed for bin ${bin.id}`,
    bin_id: bin.id,
    current_fill_level: bin.fillLevel,
    status: bin.status,
    priority: bin.priority,
    battery_level: bin.batteryLevel,
    device_status: bin.deviceStatus,
    new_alerts_triggered: alertsAfter - alertsBefore,
    server_time: new Date().toISOString()
  });
});

// Sample telemetry schema helper for demonstration and teacher presentation
router.get('/sample', (req, res) => {
  res.json({
    description: "Sample payload format expected from ESP32 microcontroller with ultrasonic sensor",
    endpoint: "POST /api/telemetry",
    headers: {
      "Content-Type": "application/json"
    },
    sample_payload: {
      bin_id: "BIN-001",
      fill_level: 85,
      latitude: 28.6139,
      longitude: 77.2090,
      timestamp: new Date().toISOString(),
      last_cleaned: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      battery_level: 94,
      device_status: "online"
    },
    curl_example: `curl -X POST http://localhost:5001/api/telemetry -H "Content-Type: application/json" -d '{"bin_id":"BIN-001","fill_level":85,"battery_level":94,"device_status":"online"}'`
  });
});

export default router;
