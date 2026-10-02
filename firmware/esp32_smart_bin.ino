/*
  =============================================================================
  SMART DUSTBIN MONITORING SYSTEM - ESP32 FIRMWARE
  =============================================================================
  Project: Smart Bin Monitoring System for Municipal Waste Management
  Microcontroller: ESP32 DevKit V1 (30-pin or 36-pin)
  Sensors: 
    - HC-SR04 / JSN-SR04T Waterproof Ultrasonic Sensor (Distance / Fill Level)
    - Battery Voltage Divider (ADC Analog Pin)
  Connectivity: 2.4GHz Wi-Fi (802.11 b/g/n) -> HTTP REST API
  =============================================================================
  
  HARDWARE WIRING:
  ----------------
  ESP32 Pin       HC-SR04 Ultrasonic Sensor
  ---------       -------------------------
  5V / VIN  --->  VCC (5V)
  GND       --->  GND
  GPIO 5    --->  TRIG (Trigger Pin)
  GPIO 18   <---  ECHO (Echo Pin through 1k/2k resistor voltage divider to 3.3V)

  ESP32 Pin       Battery Monitor (Optional)
  ---------       --------------------------
  GPIO 34   <---  Center tap of 100k/100k voltage divider connected to 3.7V Li-ion

  =============================================================================
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Install "ArduinoJson" v6 or v7 via Library Manager

// -----------------------------------------------------------------------------
// 1. NETWORK & SERVER CONFIGURATION
// -----------------------------------------------------------------------------
const char* WIFI_SSID     = "YOUR_WIFI_SSID";         // Replace with your Wi-Fi name
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";     // Replace with your Wi-Fi password

// Replace with your computer's local IP address (e.g., http://192.168.1.100:5001/api/telemetry)
const char* SERVER_ENDPOINT = "http://192.168.1.100:5001/api/telemetry";

// -----------------------------------------------------------------------------
// 2. DUSTBIN PHYSICAL PARAMETERS & METADATA
// -----------------------------------------------------------------------------
const char* BIN_ID        = "BIN-001";                // Unique Dustbin ID
const float LATITUDE      = 28.6139;                  // GPS Latitude
const float LONGITUDE     = 77.2090;                  // GPS Longitude
const float BIN_HEIGHT_CM = 100.0;                    // Total depth of empty dustbin (in cm)
const float SENSOR_OFFSET = 5.0;                      // Minimum dead-zone offset (in cm)

// -----------------------------------------------------------------------------
// 3. PIN DEFINITIONS
// -----------------------------------------------------------------------------
#define PIN_TRIG 5
#define PIN_ECHO 18
#define PIN_BATTERY_ADC 34
#define PIN_STATUS_LED 2 // Built-in Blue LED

// -----------------------------------------------------------------------------
// 4. ULTRASONIC DISTANCE MEASUREMENT
// -----------------------------------------------------------------------------
float measureDistanceCm() {
  // Send 10-microsecond trigger pulse
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  // Measure round-trip echo pulse duration in microseconds (timeout 30ms ~ 5m)
  long duration = pulseIn(PIN_ECHO, HIGH, 30000);

  if (duration == 0) {
    // Timeout: assume bin is empty / sensor unobstructed
    return BIN_HEIGHT_CM;
  }

  // Speed of sound = 343 m/s = 0.0343 cm/microsecond
  // Distance = (Duration * Speed) / 2
  float distanceCm = (duration * 0.0343) / 2.0;

  // Clamp within realistic physical boundaries
  if (distanceCm < SENSOR_OFFSET) distanceCm = SENSOR_OFFSET;
  if (distanceCm > BIN_HEIGHT_CM) distanceCm = BIN_HEIGHT_CM;

  return distanceCm;
}

// -----------------------------------------------------------------------------
// 5. FILL LEVEL PERCENTAGE CALCULATION
// -----------------------------------------------------------------------------
int calculateFillPercentage(float distanceCm) {
  // Fill Height = Total Depth - Distance to Trash
  float filledHeight = BIN_HEIGHT_CM - distanceCm;
  float usableHeight = BIN_HEIGHT_CM - SENSOR_OFFSET;

  int percentage = (int)round((filledHeight / usableHeight) * 100.0);
  return constrain(percentage, 0, 100);
}

// -----------------------------------------------------------------------------
// 6. BATTERY LEVEL ESTIMATE
// -----------------------------------------------------------------------------
int readBatteryPercentage() {
  // Read analog value (0 - 4095 for 12-bit ADC)
  int raw = analogRead(PIN_BATTERY_ADC);
  float voltage = (raw / 4095.0) * 3.3 * 2.0; // Assuming 1:1 voltage divider
  int pct = (int)((voltage - 3.2) / (4.2 - 3.2) * 100.0);
  return constrain(pct, 10, 100);
}

// -----------------------------------------------------------------------------
// 7. SETUP
// -----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);

  Serial.println("==========================================");
  Serial.println("SmartBin IoT Node Starting Up...");
  Serial.printf("Bin ID: %s | Height: %.1f cm\n", BIN_ID, BIN_HEIGHT_CM);
  Serial.println("==========================================");

  // Connect to Wi-Fi
  Serial.printf("Connecting to Wi-Fi: %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(PIN_STATUS_LED, HIGH);
    Serial.println("\nWiFi Connected successfully!");
    Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    digitalWrite(PIN_STATUS_LED, LOW);
    Serial.println("\nWiFi Connection failed. Running in standalone mode.");
  }
}

// -----------------------------------------------------------------------------
// 8. MAIN TELEMETRY LOOP
// -----------------------------------------------------------------------------
void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    // 1. Take average of 3 ultrasonic samples to filter noise
    float totalDist = 0;
    for (int i = 0; i < 3; i++) {
      totalDist += measureDistanceCm();
      delay(50);
    }
    float avgDistance = totalDist / 3.0;
    int fillLevel = calculateFillPercentage(avgDistance);
    int batteryLevel = readBatteryPercentage();

    Serial.println("------------------------------------------");
    Serial.printf("Distance: %.1f cm | Calculated Fill Level: %d%% | Battery: %d%%\n", 
                  avgDistance, fillLevel, batteryLevel);

    // 2. Build JSON Payload matching Section 10 API Specification
    StaticJsonDocument<384> doc;
    doc["bin_id"] = BIN_ID;
    doc["fill_level"] = fillLevel;
    doc["latitude"] = LATITUDE;
    doc["longitude"] = LONGITUDE;
    doc["battery_level"] = batteryLevel;
    doc["device_status"] = "online";

    String jsonString;
    serializeJson(doc, jsonString);

    // 3. Send HTTP POST to Municipality Backend
    HTTPClient http;
    http.begin(SERVER_ENDPOINT);
    http.addHeader("Content-Type", "application/json");

    Serial.printf("Posting telemetry to: %s\n", SERVER_ENDPOINT);
    int httpResponseCode = http.POST(jsonString);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.printf("Server Response (%d): %s\n", httpResponseCode, response.c_str());
    } else {
      Serial.printf("HTTP Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }

  // Wait 15 seconds before next reading (or configure ESP32 Deep Sleep for battery operation)
  Serial.println("Entering standby delay (15s)...");
  delay(15000);
}
