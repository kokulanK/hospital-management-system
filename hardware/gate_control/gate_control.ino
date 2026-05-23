/*
 * ESP32 Gate Control System - Hospital Management System
 * 
 * Circuit connections:
 * - HC-SR04 Ultrasonic Sensor:
 *   - VCC -> ESP32 5V (VIN)
 *   - GND -> ESP32 GND
 *   - TRIG -> ESP32 GPIO 5
 *   - ECHO -> ESP32 GPIO 18
 * - Servo Motor:
 *   - RED -> ESP32 5V (VIN)
 *   - BROWN/BLACK -> ESP32 GND
 *   - ORANGE/YELLOW -> ESP32 GPIO 19
 * - Speaker (8 Ohm, 0.25W):
 *   - Positive (+) -> 150 Ohm Resistor -> ESP32 GPIO 25 (DAC1)
 *   - Negative (-) -> ESP32 GND
 */

#include <WiFi.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>

// --- Configuration ---
const char* ssid = "iPhone";
const char* password = "1234567890";
const char* laptop_ip = "172.20.10.2";
const int laptop_port = 8089;

// --- Hardware Pins ---
#define TRIG_PIN 5
#define ECHO_PIN 18
#define SERVO_PIN 19
#define SPEAKER_PIN 25
#define LED_PIN 2

// --- Constants ---
const int DISTANCE_THRESHOLD = 50;
const int CLOSE_DELAY_MS = 3000;

// --- State Variables ---
Servo gateServo;
WebServer server(80);
bool gateOpen = false;
bool visitorDetected = false;
unsigned long lastVisitorTime = 0;
unsigned long scanCooldownTime = 0;

// --- Tone Functions (ESP32 Core v3.x compatible) ---
void playTone(int frequency, int duration_ms) {
  ledcWriteTone(SPEAKER_PIN, frequency);
  delay(duration_ms);
  ledcWriteTone(SPEAKER_PIN, 0);  // Stop tone
}

void playChimeWelcome() {
  playTone(262, 100);  // C4
  playTone(330, 100);  // E4
  playTone(392, 100);  // G4
  playTone(523, 250);  // C5
}

void playChimeDenied() {
  playTone(392, 150);  // G4
  playTone(311, 150);  // D#4/Eb4
  playTone(220, 300);  // A3
}

void playChimeDetect() {
  playTone(587, 80);  // D5
  delay(50);
  playTone(587, 80);  // D5
}

void playChimeClosing() {
  playTone(220, 200);  // Low warning tone
}

// --- Ultrasonic Sensor Read ---
long getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return 999;

  long distance = duration * 0.034 / 2;
  return distance;
}

// --- Gate Functions ---
void openGate() {
  if (!gateOpen) {
    Serial.println("Opening Gate...");
    gateServo.write(90);
    gateOpen = true;
    playChimeWelcome();
  }
}

void closeGate() {
  if (gateOpen) {
    Serial.println("Closing Gate...");
    playChimeClosing();
    gateServo.write(0);
    gateOpen = false;
  }
}

// --- API Client: Notify Laptop ---
void notifyLaptopVisitorDetected() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = "http://" + String(laptop_ip) + ":" + String(laptop_port) + "/detect";
    Serial.print("Notifying laptop scanner: ");
    Serial.println(url);

    http.begin(url);
    http.setTimeout(1500);
    int httpResponseCode = http.GET();

    if (httpResponseCode > 0) {
      Serial.print("Laptop response: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error notifying laptop: ");
      Serial.println(http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }
}

// --- Web Server Request Handlers ---
void handleRoot() {
  String html = "<html><head><title>ESP32 Gate Status</title></head><body style='font-family:sans-serif; text-align:center;'>";
  html += "<h1>ESP32 Gate Controller</h1>";
  html += "<p>Gate State: <strong>" + String(gateOpen ? "OPEN" : "CLOSED") + "</strong></p>";
  html += "<p>Visitor Present: <strong>" + String(visitorDetected ? "YES" : "NO") + "</strong></p>";
  html += "<p><a href='/gate?action=open'><button style='padding:10px 20px;'>Force Open</button></a> ";
  html += "<a href='/gate?action=close'><button style='padding:10px 20px;'>Force Close</button></a></p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

void handleGateControl() {
  if (server.hasArg("action")) {
    String action = server.arg("action");
    if (action == "open") {
      openGate();
      server.send(200, "application/json", "{\"status\":\"success\",\"message\":\"Gate opened\"}");
    } else if (action == "close") {
      closeGate();
      server.send(200, "application/json", "{\"status\":\"success\",\"message\":\"Gate closed\"}");
    } else if (action == "deny") {
      Serial.println("Access Denied signal received");
      playChimeDenied();
      server.send(200, "application/json", "{\"status\":\"success\",\"message\":\"Access denied played\"}");
    } else {
      server.send(400, "application/json", "{\"status\":\"error\",\"message\":\"Invalid action\"}");
    }
  } else {
    server.send(400, "application/json", "{\"status\":\"error\",\"message\":\"Missing action argument\"}");
  }
}

// --- Setup ---
void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Setup Speaker PWM (ESP32 Core v3.x API)
  ledcAttach(SPEAKER_PIN, 2000, 8);

  // Setup Servo
  ESP32PWM::allocateTimer(0);
  ESP32PWM::allocateTimer(1);
  ESP32PWM::allocateTimer(2);
  ESP32PWM::allocateTimer(3);
  gateServo.setPeriodHertz(50);
  gateServo.attach(SERVO_PIN, 500, 2400);
  gateServo.write(0);

  // Connect to Wi-Fi
  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
    delay(500);
    Serial.print(".");
  }

  digitalWrite(LED_PIN, HIGH);
  Serial.println("");
  Serial.println("Wi-Fi connected!");
  Serial.print("ESP32 Local IP address: ");
  Serial.println(WiFi.localIP());

  // Setup HTTP Endpoints
  server.on("/", handleRoot);
  server.on("/gate", handleGateControl);
  server.begin();
  Serial.println("HTTP Server started.");
}

// --- Main Loop ---
void loop() {
  server.handleClient();

  long distance = getDistance();

  // Debug output every second
  static unsigned long lastDebugTime = 0;
  if (millis() - lastDebugTime > 1000) {
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.print(" cm | Gate: ");
    Serial.println(gateOpen ? "OPEN" : "CLOSED");
    lastDebugTime = millis();
  }

  // --- Ultrasonic Presence State Machine ---
  if (distance > 0 && distance < DISTANCE_THRESHOLD) {
    lastVisitorTime = millis();

    if (!visitorDetected) {
      Serial.println("Visitor entered range!");
      visitorDetected = true;

      if (millis() - scanCooldownTime > 8000) {
        playChimeDetect();
        notifyLaptopVisitorDetected();
        scanCooldownTime = millis();
      }
    }
  } else {
    if (visitorDetected && (millis() - lastVisitorTime > 1500)) {
      Serial.println("Visitor left range.");
      visitorDetected = false;
    }
  }

  // --- Auto-Close Logic ---
  if (gateOpen && (millis() - lastVisitorTime > CLOSE_DELAY_MS)) {
    closeGate();
  }

  delay(50);
}