#include <Arduino.h>
#include <DNSServer.h>
#include <ArduinoJson.h>
#include <ESP8266WebServer.h>
#include <boxSocket.cpp>
#include "LittleFS.h"
#include <TFT_eSPI.h>
#include <SPI.h>
#include <errorHandler.cpp>

DNSServer *dnsServer = nullptr;
ESP8266WebServer *server = nullptr;
BoxSocket *boxSocket = nullptr;

const char *ssid = "Loki-box";
const char *pass = "lokiiscute";

const byte DNS_PORT = 53;
TFT_eSPI tft = TFT_eSPI();

boolean StartAp();
boolean StartStation(File);
boolean ConnectToAP(const char *, const char *, boolean);
boolean serverOn;

const char *netDataFileLocation = "/netData.json";

void setup() {
  Serial.begin(9600);
  boolean stationConnected = false;
  WiFi.setAutoConnect(false);
  pinMode(D8, INPUT);
  pinMode(D6, OUTPUT);
  pinMode(D0, INPUT);
  tft.init();
  tft.setRotation(3);
  tft.fillScreen(TFT_BLACK);
  tft.setTextFont(4);

  tft.setTextColor(TFT_WHITE, TFT_BLACK);
  WiFi.mode(WIFI_STA);
  if (!LittleFS.begin()) {
    Serial.println("LittleFS Failed");
    return;
  }
  File networkData = LittleFS.open(netDataFileLocation, "r");
  if (networkData) {
    stationConnected = StartStation(networkData);
    if (stationConnected) {
      boxSocket = new BoxSocket(tft);
      while (!boxSocket->init()) {
        Serial.println("Socket not connected!");
        ErrorHandler::printError(Errors::FAILED_TO_SERVER, tft);
      }
    }
  }
  if (!stationConnected) {
    WiFi.mode(WIFI_AP);
    while (!serverOn) {
      serverOn = StartAp();
      if (!serverOn) {
        Serial.println("Server Failed!");
      }
    }
  }
  networkData.close();
}

void loop() {
  if (serverOn) {
    dnsServer->processNextRequest();
    server->handleClient();
  } else {
    boxSocket->loop();
  }
}

boolean StartAp() {
  if (!WiFi.softAP(ssid, pass)) {
    return false;
  }
  tft.fillScreen(TFT_BLACK);
  tft.drawString("Connect to WiFi Network", 160, 80);
  tft.drawString(ssid, 160, 115);
  tft.drawString(String("Password: ") + pass, 160, 150);
  dnsServer = new DNSServer();
  server = new ESP8266WebServer();
  if (!dnsServer->start(DNS_PORT, "*", WiFi.softAPIP())) {
    return false;
  }

  server->onNotFound([]() {
    File file = LittleFS.open("/index.html", "r");
    server->streamFile(file, "text/html");
    file.close();
  });

  server->on("/data", []() {
    size_t numOfssids = WiFi.scanNetworks();
    String str = "[";
    for (size_t i = 0; i < numOfssids; i++) {
      str += '"' + WiFi.SSID(i) + '"';
      if (i != numOfssids - 1) {
        str += ',';
      }
    }
    str += "]";
    Serial.println(str);
    server->send(200, "application/javascript", str);
  });
  server->on("/style.css", []() {
    File file = LittleFS.open("/style.css", "r");
    server->streamFile(file, "text/css");
    file.close();
  });
  server->on("/form", HTTP_POST, []() {
    String ssid = server->arg("ssid");
    String password = server->arg("password");
    Serial.println(ssid + "|" + password);
    if (ssid.isEmpty()) {
      return server->send(200, "text/plain", "failed");
    }
    server->send(200, "text/plain", "ok");
    boolean connected = ConnectToAP(ssid.c_str(), password.c_str(), true);
    if (!connected) {
      WiFi.mode(WIFI_AP);
    } else {
      WiFi.mode(WIFI_STA);
      serverOn = false;
      delete dnsServer;
      delete server;
      boxSocket = new BoxSocket(tft);
      while (!boxSocket->init()) {
        ErrorHandler::printError(Errors::FAILED_TO_SERVER, tft);
      }
    }
  });
  server->begin();
  return true;
}

boolean StartStation(File networkData) {
  StaticJsonDocument<265> doc;
  DeserializationError err = deserializeJson(doc, networkData);
  if (err) {
    Serial.print("Failed to deserialize");
    Serial.println(err.c_str());
  }
  auto ssid = doc["ssid"].as<char *>();
  auto password = doc["password"].as<char *>();
  boolean stationStarted = ConnectToAP(ssid, password, false);
  return stationStarted;
}

boolean ConnectToAP(const char *ssid, const char *password,
                    boolean writeToFile) {
  tft.fillScreen(TFT_BLACK);
  if (WiFi.begin(ssid, password) == WL_CONNECT_FAILED) {
    ErrorHandler::printError(Errors::GENERAL, tft);
    return false;
  }
  char dots[4] = {0, 0, 0, 0};
  uint8 numOfDots = 1;
  String connectText("Connecting to:");

  long lastReport = millis();
  const uint dotFontSize = 2;
  tft.setTextSize(dotFontSize);
  uint16 textSize = tft.textWidth("...");
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastReport > 500) {
      tft.fillRect(160 - ((float)textSize / 2), 120, textSize, 52, TFT_BLACK);
      numOfDots++;
      lastReport = millis();
    }

    if (numOfDots > 3) {
      numOfDots = 1;
      tft.fillRect(160 - ((float)textSize / 2), 120, textSize, 52, TFT_BLACK);
    }
    size_t i = 0;
    for (; i < numOfDots; i++) {
      dots[i] = '.';
    }
    for (; i < 4; i++) {
      dots[i] = 0;
    }
    tft.setTextDatum(TL_DATUM);
    tft.setTextSize(dotFontSize);
    tft.drawString(dots, 160 - ((float)textSize / 2), 120);
    tft.setTextSize(1);
    tft.setTextDatum(MC_DATUM);
    tft.drawString(connectText, 160, 80);
    tft.drawString(ssid, 160, 110);
    delay(1);
    if (WiFi.status() == WL_CONNECT_FAILED) {
      ErrorHandler::printError(Errors::FAILED_TO_NETWORK, tft);
      return false;
    }
  }
  if (writeToFile) {
    File networkData = LittleFS.open(netDataFileLocation, "w");
    StaticJsonDocument<256> doc;
    doc["ssid"] = ssid;
    doc["password"] = password;
    serializeJson(doc, networkData);
    networkData.close();
  }
  return true;
}