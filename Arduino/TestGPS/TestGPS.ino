#include <SoftwareSerial.h>

SoftwareSerial gps(D5, D6); // RX, TX

void setup() {
  Serial.begin(9600);   // Serial Monitor
  gps.begin(9600);      // GPS baud rate
}

void loop() {
  while (gps.available()) {
    Serial.write(gps.read());
  }
}