#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <TinyGPS++.h>
#include <SoftwareSerial.h>

// ---------- WIFI ----------
const char* ssid = "Vitthal's S24 FE";
const char* password = "66666666";

// ---------- API ----------
const char* serverUrl = "http://10.130.238.58:8080/api/sensor-data";

// ---------- PINS ----------
#define DHTPIN D1
#define DHTTYPE DHT11
#define MQ135_PIN A0

// GPS (RX, TX)
SoftwareSerial gpsSerial(D5, D6);
TinyGPSPlus gps;
DHT dht(DHTPIN, DHTTYPE);

// ---------- CONSTANTS ----------
#define ADC_MAX 1023
#define V_REF 3.3

void setup() {
  Serial.begin(9600);
  dht.begin();
  gpsSerial.begin(9600);

  Serial.println("System Starting...");
  delay(20000);  // MQ warmup

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("-----------------------------------");
}

void loop() {

  // -------- READ MQ135 --------
  int rawAir = analogRead(MQ135_PIN);
  int approxAQI = map(rawAir, 0, 1023, 0, 500);

  // -------- READ DHT --------
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  // -------- READ GPS --------
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  int satelliteCount = gps.satellites.value();

  // Print satellite count always
  Serial.print("Satellite Count: ");
  Serial.println(satelliteCount);

  if (WiFi.status() == WL_CONNECTED &&
      !isnan(temperature) &&
      !isnan(humidity)) {

    WiFiClient client;
    HTTPClient http;

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-KEY", "pollusense-secret-node-key-2026");

    StaticJsonDocument<256> doc;

    doc["nodeId"] = "node_01";
    doc["aqi"] = approxAQI;
    doc["temperature"] = temperature;
    doc["humidity"] = humidity;
    doc["satellites"] = satelliteCount;   // ✅ Added satellite count
    doc["timestamp"] = millis();

    if (gps.location.isValid()) {
      doc["latitude"] = gps.location.lat();
      doc["longitude"] = gps.location.lng();

      Serial.print("Latitude: ");
      Serial.println(gps.location.lat(), 6);

      Serial.print("Longitude: ");
      Serial.println(gps.location.lng(), 6);
    } else {
      doc["latitude"] = nullptr;
      doc["longitude"] = nullptr;
      Serial.println("GPS: No valid fix yet.");
    }

    String jsonData;
    serializeJson(doc, jsonData);

    int httpResponseCode = http.POST(jsonData);

    Serial.print("HTTP Response Code: ");
    Serial.println(httpResponseCode);

    http.end();
  }

  Serial.println("-----------------------------------");
  delay(60000);  // Send every 60 seconds
}