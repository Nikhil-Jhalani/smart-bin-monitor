import React, { useState } from 'react';
import { 
  Cpu, 
  Send, 
  CheckCircle2, 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  Wifi, 
  Radio, 
  Zap, 
  Info 
} from 'lucide-react';
import { TelemetryPayload } from '../types';

interface HardwareDocsViewProps {
  onSendTelemetry: (payload: TelemetryPayload) => Promise<any>;
}

export const HardwareDocsView: React.FC<HardwareDocsViewProps> = ({ onSendTelemetry }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Interactive hardware test form state
  const [testPayload, setTestPayload] = useState<TelemetryPayload>({
    bin_id: 'BIN-001',
    fill_level: 88,
    latitude: 28.6139,
    longitude: 77.2090,
    battery_level: 93,
    device_status: 'online'
  });

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTestResult(null);
    try {
      const res = await onSendTelemetry({
        ...testPayload,
        timestamp: new Date().toISOString()
      });
      setTestResult({ success: true, data: res });
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const curlCommand = `curl -X POST http://localhost:5001/api/telemetry \\
  -H "Content-Type: application/json" \\
  -d '{
    "bin_id": "${testPayload.bin_id}",
    "fill_level": ${testPayload.fill_level},
    "latitude": ${testPayload.latitude},
    "longitude": ${testPayload.longitude},
    "battery_level": ${testPayload.battery_level},
    "device_status": "${testPayload.device_status}"
  }'`;

  const esp32CodeSnippet = `/*
  ==============================================================
  Smart Dustbin IoT Node - ESP32 Firmware
  Sensor: HC-SR04 Ultrasonic Distance Sensor
  Microcontroller: ESP32 DevKit V1
  Protocol: HTTP POST (REST Telemetry)
  ==============================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // ArduinoJson v6 library

// Wi-Fi Configuration
const char* ssid = "MUNICIPAL_IOT_WIFI";
const char* password = "WiFiPassword123";

// Backend API Server Address
const char* serverUrl = "http://192.168.1.100:5001/api/telemetry";

// Ultrasonic Pins
const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const float BIN_DEPTH_CM = 100.0; // Total height of the dustbin

// Dustbin Unique Identifier
const char* BIN_ID = "BIN-001";
const float LATITUDE = 28.6139;
const float LONGITUDE = 77.2090;

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nConnected! IP: " + WiFi.localIP().toString());
}

float measureDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return BIN_DEPTH_CM;
  return (duration * 0.0343) / 2.0;
}

int calculateFillPercentage(float distanceCm) {
  if (distanceCm < 5.0) distanceCm = 5.0; // Sensor dead zone limit
  if (distanceCm > BIN_DEPTH_CM) distanceCm = BIN_DEPTH_CM;

  // Fill percentage = ((Total Height - Measured Distance) / Total Height) * 100
  float filledCm = BIN_DEPTH_CM - distanceCm;
  int percentage = (int)round((filledCm / BIN_DEPTH_CM) * 100.0);
  return constrain(percentage, 0, 100);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    float distance = measureDistanceCm();
    int fillLevel = calculateFillPercentage(distance);

    Serial.printf("Measured: %.1f cm -> Fill Level: %d%%\\n", distance, fillLevel);

    // Build JSON Payload (Section 10 specification)
    StaticJsonDocument<256> doc;
    doc["bin_id"] = BIN_ID;
    doc["fill_level"] = fillLevel;
    doc["latitude"] = LATITUDE;
    doc["longitude"] = LONGITUDE;
    doc["battery_level"] = 95; // Or measure via analogRead(ADC_BATTERY)
    doc["device_status"] = "online";

    String jsonString;
    serializeJson(doc, jsonString);

    // Send HTTP POST
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST(jsonString);
    if (httpCode > 0) {
      String response = http.getString();
      Serial.printf("Server Response (%d): %s\\n", httpCode, response.c_str());
    } else {
      Serial.printf("HTTP Error: %s\\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }

  // Deep sleep for 5 minutes (300 seconds) to conserve battery
  // esp_sleep_enable_timer_wakeup(300ULL * 1000000ULL);
  // esp_deep_sleep_start();
  delay(15000); // For bench test, wait 15 seconds
}`;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Future ESP32 Microcontroller Architecture</h2>
            <p className="text-xs text-slate-400">
              Complete hardware schema, REST endpoint specification, and physical sensor mapping
            </p>
          </div>
        </div>

        {/* 3-Step Hardware Architecture Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Step 1: Distance Sensing</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              An ultrasonic distance sensor (HC-SR04 / JSN-SR04T waterproof) is attached under the dustbin lid pointing downwards, measuring the distance to the accumulated trash layer.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 mb-1.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <Radio className="w-4 h-4" />
              <span>Step 2: Processing & Wi-Fi</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The ESP32 microcontroller calculates the capacity fill percentage <code className="font-mono text-emerald-300">((H - D)/H)*100</code> and packages battery voltage, timestamp, and device health into JSON.
            </p>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
            <div className="flex items-center gap-2 mb-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Wifi className="w-4 h-4" />
              <span>Step 3: Municipality API</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              The device makes an HTTP POST request to <code className="font-mono text-amber-300">/api/telemetry</code>. The server logs the reading, updates GIS coordinates, and alerts cleaning crews.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Live Hardware Telemetry Tester */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-600" />
              Live Hardware Telemetry Tester (Demonstrate to Teachers)
            </h3>
            <p className="text-xs text-slate-500">
              Submit a real JSON payload to the <code className="font-mono text-emerald-700">POST /api/telemetry</code> endpoint to test how real ESP32 packets update the system.
            </p>
          </div>
        </div>

        <form onSubmit={handleTestSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Dustbin ID (<code className="font-mono">bin_id</code>):
            </label>
            <input
              type="text"
              value={testPayload.bin_id}
              onChange={(e) => setTestPayload({ ...testPayload, bin_id: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Fill Level (%) (<code className="font-mono">fill_level</code>):
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={testPayload.fill_level}
              onChange={(e) => setTestPayload({ ...testPayload, fill_level: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Battery Level (%) (<code className="font-mono">battery_level</code>):
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={testPayload.battery_level}
              onChange={(e) => setTestPayload({ ...testPayload, battery_level: Number(e.target.value) })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3 flex items-center justify-between pt-2">
            <div className="flex gap-2">
              {[25, 60, 85, 95, 100].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setTestPayload({ ...testPayload, fill_level: preset })}
                  className="px-2.5 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono transition"
                >
                  Set {preset}%
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Transmitting Packet...' : 'Transmit ESP32 Telemetry'}
            </button>
          </div>
        </form>

        {/* Test Result Feedback */}
        {testResult && (
          <div className={`mt-4 p-4 rounded-xl border text-xs ${
            testResult.success ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>HTTP 200 OK — Packet Acknowledged by Municipality Core</span>
            </div>
            <pre className="font-mono bg-white/80 p-3 rounded-lg border border-emerald-200 overflow-x-auto text-[11px] mt-2">
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* cURL & Arduino Code Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* cURL Example */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Terminal cURL Test Command
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(curlCommand);
                  setCopiedCurl(true);
                  setTimeout(() => setCopiedCurl(false), 2000);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-emerald-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {curlCommand}
            </pre>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Run this in any terminal to simulate a physical hardware sensor transmission.
          </p>
        </div>

        {/* ESP32 Arduino Sketch */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-400" />
                Ready-to-Flash ESP32 Sketch (.ino)
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(esp32CodeSnippet);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto font-mono text-[11px] text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
              <pre>{esp32CodeSnippet}</pre>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Flash this code using Arduino IDE or PlatformIO directly to an ESP32 with HC-SR04.
          </p>
        </div>
      </div>
    </div>
  );
};
