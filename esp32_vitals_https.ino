#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"

// ---------------- DS18B20 ----------------
#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

// ---------------- MAX30102 ----------------
MAX30105 particleSensor;

// ---------------- Wi-Fi ----------------
const char* ssid      = "Aradhana Broadband #12090";
const char* password  = "Sunil2418";
const char* serverUrl = "https://neuronest-backend-2rn0.onrender.com/api/vitals/update";

// ---------------- Buffers / Algo ----------------
uint32_t irBuffer[100];
uint32_t redBuffer[100];

int32_t bufferLength   = 100;
int32_t spo2           = 0;
int8_t  validSPO2      = 0;
int32_t heartRate      = 0;
int8_t  validHeartRate = 0;

// ---------------- LKG ----------------
int32_t lastGoodHR   = 0;
int32_t lastGoodSpO2 = 0;
float   lastGoodTemp = 0.0;

// ---------------- Post Timing ----------------
unsigned long lastPost = 0;
const unsigned long postInterval = 250;

// ---------------- Temp Read Timing ----------------
unsigned long lastTempRead = 0;
const unsigned long tempInterval = 2000; // read temp every 2 sec
float currentTemp = 0.0;

// ---------------- WiFi Check Timing ----------------
unsigned long lastWiFiCheck = 0;
const unsigned long wifiCheckInterval = 5000;

// ---------------- Finger Detection ----------------
const uint32_t FINGER_THRESHOLD     = 20000;
const unsigned long FINGER_GRACE_MS = 15000;
unsigned long lastFingerTime = 0;
bool fingerPresent           = false;

// ---------------- Thresholds ----------------
const int HR_MIN    = 40;
const int HR_MAX    = 120;
const int SPO2_MIN  = 85;
const int SPO2_MAX  = 100;

// ---------------- Alert Thresholds ----------------
const int HR_ALERT_MIN   = 50;
const int SPO2_ALERT_MIN = 85;
const int DROP_COUNT_MAX = 10;

// Fever threshold
const float TEMP_FEVER = 37.2;
const float TEMP_LOW   = 34.5;

// ---------------- Alert State ----------------
int  hrDropCount   = 0;
int  spo2DropCount = 0;
bool hrAlert       = false;
bool spo2Alert     = false;
bool tempAlert     = false;

// ---------------- Helpers ----------------
void ensureWiFi() {
  if (millis() - lastWiFiCheck < wifiCheckInterval) return;
  lastWiFiCheck = millis();
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    WiFi.disconnect();
    WiFi.reconnect();
  }
}

// Read temperature (non-blocking by interval)
void updateTemperature() {
  if (millis() - lastTempRead < tempInterval) return;
  lastTempRead = millis();

  tempSensor.requestTemperatures();
  float t = tempSensor.getTempCByIndex(0);

  if (t != DEVICE_DISCONNECTED_C && t > 0) {
    currentTemp  = t;
    lastGoodTemp = t;

    // Temp alert check
    tempAlert = (t >= TEMP_FEVER || t < TEMP_LOW);

    Serial.print(F("Temp: "));
    Serial.print(t);
    Serial.println(F(" °C"));
    if (tempAlert) Serial.println(F("⚠ TEMP ALERT!"));
  }
}

void postVitals(int hr, int s, float temp,
                const char* signalLabel,
                bool hrAlertFlag, bool spo2AlertFlag, bool tempAlertFlag) {

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure(); // Skip certificate validation (ok for testing)
  HTTPClient http;

  if (!http.begin(client, serverUrl)) {
    Serial.println("HTTPS begin failed");
    return;
  }

  http.setTimeout(1500);
  http.addHeader("Content-Type", "application/json");

  String body = "{\"hr\":"         + String(hr) +
                ",\"spo2\":"       + String(s) +
                ",\"temp\":"       + String(temp, 2) +
                ",\"signal\":\""   + String(signalLabel) + "\"" +
                ",\"hr_alert\":"   + String(hrAlertFlag ? 1 : 0) +
                ",\"spo2_alert\":" + String(spo2AlertFlag ? 1 : 0) +
                ",\"temp_alert\":" + String(tempAlertFlag ? 1 : 0) +
                "}";

  Serial.print("POST URL: ");
  Serial.println(serverUrl);
  Serial.print("POST BODY: ");
  Serial.println(body);

  int code = http.POST(body);
  Serial.print("POST code: ");
  Serial.println(code);

  String response = http.getString();
  Serial.print("Response: ");
  Serial.println(response);

  http.end();
}

void resetAlertState() {
  hrDropCount   = 0;
  spo2DropCount = 0;
  hrAlert       = false;
  spo2Alert     = false;
}

bool isFingerOn() {
  return (particleSensor.getIR() > FINGER_THRESHOLD);
}

void updateAlertCounters(int hr, int s) {
  if (hr < HR_ALERT_MIN) {
    hrDropCount++;
    if (hrDropCount >= DROP_COUNT_MAX) {
      hrAlert = true;
      Serial.println(F("⚠ HR ALERT: sustained low heart rate!"));
    }
  } else {
    hrDropCount = 0;
    hrAlert     = false;
  }

  if (s < SPO2_ALERT_MIN) {
    spo2DropCount++;
    if (spo2DropCount >= DROP_COUNT_MAX) {
      spo2Alert = true;
      Serial.println(F("⚠ SpO2 ALERT: sustained low oxygen!"));
    }
  } else {
    spo2DropCount = 0;
    spo2Alert     = false;
  }
}

// ================================================================
void setup() {
  Serial.begin(115200);
  delay(200);

  // DS18B20 init
  tempSensor.begin();
  Serial.println(F("DS18B20 initialized"));

  // WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi connected!");
    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi FAILED.");
  }

  // MAX30102 init
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println(F("MAX30102 not found! Check wiring."));
    while (1) delay(1000);
  }
  particleSensor.setup(60, 4, 2, 100, 411, 4096);

  Serial.println(F("Place your finger on the MAX30102 sensor..."));
}

// ================================================================
void loop() {

  // Always keep reading temperature in background
  updateTemperature();

  // PHASE 1 — Wait for finger
  while (!isFingerOn()) {
    Serial.print(F("IR Value: "));
    Serial.println(particleSensor.getIR());
    Serial.println(F("No finger detected. Waiting..."));
    updateTemperature(); // keep updating temp even without finger

    if (millis() - lastPost >= postInterval) {
      postVitals(0, 0, currentTemp, "no_finger", false, false, tempAlert);
      lastPost = millis();
    }
    ensureWiFi();
    delay(500);
  }

  fingerPresent  = true;
  lastFingerTime = millis();
  resetAlertState();
  Serial.println(F("Finger detected! Filling buffer..."));

  // PHASE 2 — Fill buffer
  for (byte i = 0; i < bufferLength; i++) {
    while (particleSensor.available() == false) particleSensor.check();
    redBuffer[i] = particleSensor.getRed();
    irBuffer[i]  = particleSensor.getIR();
    particleSensor.nextSample();
  }

  // PHASE 3 — Continuous measurement
  while (true) {

    updateTemperature(); // non-blocking temp update

    uint32_t currentIR = particleSensor.getIR();

    if (currentIR > FINGER_THRESHOLD) {
      fingerPresent  = true;
      lastFingerTime = millis();
    } else {
      if (millis() - lastFingerTime > FINGER_GRACE_MS) {
        fingerPresent = false;
      }
    }

    if (!fingerPresent) {
      Serial.println(F("Finger removed. Resetting..."));
      lastGoodHR   = 0;
      lastGoodSpO2 = 0;
      resetAlertState();

      if (millis() - lastPost >= postInterval) {
        postVitals(0, 0, currentTemp, "no_finger", false, false, tempAlert);
        lastPost = millis();
      }
      ensureWiFi();
      delay(500);
      break;
    }

    // Shift buffer
    for (byte i = 25; i < 100; i++) {
      redBuffer[i - 25] = redBuffer[i];
      irBuffer[i - 25]  = irBuffer[i];
    }
    for (byte i = 75; i < 100; i++) {
      while (particleSensor.available() == false) particleSensor.check();
      redBuffer[i] = particleSensor.getRed();
      irBuffer[i]  = particleSensor.getIR();
      particleSensor.nextSample();
    }

    // Run algorithm
    maxim_heart_rate_and_oxygen_saturation(
      irBuffer, bufferLength, redBuffer,
      &spo2, &validSPO2, &heartRate, &validHeartRate
    );

    bool hrOk   = (validHeartRate && heartRate >= HR_MIN  && heartRate <= HR_MAX);
    bool spo2Ok = (validSPO2      && spo2      >= SPO2_MIN && spo2     <= SPO2_MAX);

    if (hrOk && spo2Ok) {
      lastGoodHR   = heartRate;
      lastGoodSpO2 = spo2;
      updateAlertCounters(heartRate, spo2);

      Serial.print(F("HR: "));      Serial.print(heartRate);
      Serial.print(F(" | SpO2: ")); Serial.print(spo2);
      Serial.print(F(" | Temp: ")); Serial.print(currentTemp);
      if (hrAlert)   Serial.print(F(" [HR ALERT]"));
      if (spo2Alert) Serial.print(F(" [SpO2 ALERT]"));
      if (tempAlert) Serial.print(F(" [TEMP ALERT]"));
      Serial.println();

      if (millis() - lastPost >= postInterval) {
        postVitals(heartRate, spo2, currentTemp, "ok",
                   hrAlert, spo2Alert, tempAlert);
        lastPost = millis();
      }

    } else {
      if (lastGoodHR > 0) {
        Serial.print(F("HR (LKG): "));    Serial.print(lastGoodHR);
        Serial.print(F(" | SpO2 (LKG): ")); Serial.print(lastGoodSpO2);
        Serial.print(F(" | Temp: "));    Serial.print(currentTemp);
        Serial.println(F(" [Weak Signal]"));

        if (millis() - lastPost >= postInterval) {
          postVitals(lastGoodHR, lastGoodSpO2, currentTemp, "weak",
                     hrAlert, spo2Alert, tempAlert);
          lastPost = millis();
        }
      } else {
        Serial.println(F("Initialising... keep finger still."));
        if (millis() - lastPost >= postInterval) {
          postVitals(0, 0, currentTemp, "initialising",
                     false, false, tempAlert);
          lastPost = millis();
        }
      }
    }

    ensureWiFi();
    delay(20);
  }
}
