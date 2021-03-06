#include <WebSocketsClient.h>
#include <SocketIOclient.h>
#include <TFT_eSPI.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <qrcode.h>

#define PHOTOPIN A0

const char *const SEEN_MSG = "seenMsg";
const char *const GET_NEW_MSG = "getNewMsg";
const char *const GET_MSG = "getMsg";
const char *const URL = "192.168.1.3";
const char *const TOKEN = "cutie";
const char *const ID = "6010b0545bf32741e1a33c85";

class BoxSocket {
 private:
  TFT_eSPI &tft;
  SocketIOclient *socket = nullptr;
  const char *token = nullptr;
  char currentMsgID[25] = {0};
  boolean userReadMsg = false;
  boolean checkedForMsg = false;
  boolean shownQRCode = false;
  boolean fadeHeart = false;
  boolean boxClosed = false;
  float fade = (250.0F / 500.0F);
  float fadeAmount = 0;

  void noMsgDisplay() {
    tft.setTextDatum(MC_DATUM);
    tft.fillScreen(TFT_BLACK);
    tft.drawString("No messages.", 160, 100);
    tft.drawString("Please close the box.", 160, 140);
  }

  void drawMsg(JsonObject &msg) {
    if (!userReadMsg && hasMsg()) {
      return;
    }
    tft.fillScreen(TFT_BLACK);
    if (msg.isNull()) {
      currentMsgID[0] = 0;
      userReadMsg = true;
      return noMsgDisplay();
    }
    userReadMsg = false;
    strcpy(currentMsgID, msg["_id"].as<char *>());
    auto lines = msg["data"]["lines"];
    size_t numOfLines = lines.size();
    for (size_t i = 0; i < numOfLines; i++) {
      auto line = lines[i];
      auto color = line["color"].as<char *>();
      int number = (int)strtoll(color + 1, NULL, 16);
      auto points = line["points"];
      auto pointSize = points.size();
      auto strokeSize = (line["lineWidth"].as<float>() / 2);
      int r = number >> 16;
      int g = number >> 8 & 0xFF;
      int b = number & 0xFF;
      unsigned int rgb =
          ((r & 0b11111000) << 8) | ((g & 0b11111100) << 3) | (b >> 3);
      for (size_t i = 0; i < pointSize; i += 2) {
        auto x1 = points[i].as<uint>();
        auto y1 = points[i + 1].as<uint>();
        tft.fillCircle(x1, y1, strokeSize, rgb);
        if (i + 2 < pointSize) {
          auto x2 = points[i + 2].as<uint>();
          auto y2 = points[i + 3].as<uint>();
          int deltaX = x2 - x1;
          int deltaY = y2 - y1;
          uint numOfPoints = 5;
          for (size_t i = 1; i < numOfPoints; i++) {
            float percentage = (float)i / (float)numOfPoints;
            int betweenX = x1 + (deltaX * percentage);
            int betweenY = y1 + (deltaY * percentage);
            tft.fillCircle(betweenX, betweenY, strokeSize, rgb);
          }
        }
      }
    }
  }

  void parseEvent(char *payload, size_t length) {
    Serial.println((char *)payload);
    for (size_t i = 0; i < 5U; i++) {
      payload[i] = ' ';
    }
    DynamicJsonDocument doc(10192);
    DeserializationError err = deserializeJson(doc, payload);

    if (err) {
      Serial.println(err.c_str());
    } else {
      JsonArray arr = doc.as<JsonArray>();
      auto type = arr[0].as<char *>();
      if (!strcmp(type, GET_NEW_MSG)) {
        auto msg = arr[1].as<JsonObject>();
        drawMsg(msg);
      }
    }
  }

  void parseACK(char *payload, size_t length) {
    uint ackId = 0;
    for (size_t i = 0; i <= 5U; i++) {
      if (i == 5) {
        ackId = payload[i] - '0';
      }
      payload[i] = ' ';
    }

    DynamicJsonDocument doc(10192);
    DeserializationError err = deserializeJson(doc, payload);

    if (err) {
      Serial.println(err.c_str());
    } else {
      auto data = doc.as<JsonArray>();
      if (ackId == 0) {
        auto msg = data[0].as<JsonObject>();
        drawMsg(msg);
      }
    }
  }

  void socketIOEvent(socketIOmessageType_t type, uint8_t *payload,
                     size_t length) {
    switch (type) {
      case sIOtype_DISCONNECT:
        Serial.printf("[IOc] Disconnected!\n");
        break;
      case sIOtype_CONNECT:
        socket->send(sIOtype_CONNECT, "/box");
        break;
      case sIOtype_EVENT:
        parseEvent((char *)payload, length);
        break;
      case sIOtype_ACK:
        parseACK((char *)payload, length);
        break;
      case sIOtype_ERROR:
        Serial.printf("[IOc] get error: %u\n", length);
        hexdump(payload, length);
        break;
      case sIOtype_BINARY_EVENT:
        Serial.printf("[IOc] get binary: %u\n", length);
        hexdump(payload, length);
        break;
      case sIOtype_BINARY_ACK:
        Serial.printf("[IOc] get binary ack: %u\n", length);
        hexdump(payload, length);
        break;
    }
  }

  boolean getAuth() {
    Serial.println("Getting auth");
    WiFiClient client;
    HTTPClient http;
    StaticJsonDocument<256> doc;
    String json;
    doc["token"] = TOKEN;
    doc["boxID"] = ID;
    serializeJson(doc, json);
    doc.clear();
    if (http.begin(client, String("http://") + URL + ":3000/box/auth")) {
      http.addHeader("Content-type", "application/json");
      int httpCode = http.POST(json);
      if (httpCode > 0 && httpCode == HTTP_CODE_OK) {
        deserializeJson(doc, http.getStream());
        token = doc["token"].as<char *>();
        http.end();
        return true;
      }
    }
    http.end();
    return false;
  }
  SocketIOclient::SocketIOclientEvent handleEvents() {
    return [this](socketIOmessageType_t type, uint8_t *payload, size_t length) {
      this->socketIOEvent(type, payload, length);
    };
  }

  boolean hasMsg() { return currentMsgID[0]; }

 public:
  boolean isConnected() { return socket->isConnected(); }

  void getNewMsg() {
    if (userReadMsg && !checkedForMsg) {
      checkedForMsg = true;
      StaticJsonDocument<128> doc;
      JsonArray arr = doc.to<JsonArray>();
      arr.add(GET_NEW_MSG);
      String output("/box,0");
      serializeJson(doc, output);
      socket->sendEVENT(output);
      Serial.println(output);
    }
  }

  void getMsg() {
    if (hasMsg()) {
      StaticJsonDocument<128> doc;
      JsonArray arr = doc.to<JsonArray>();
      arr.add(GET_MSG);
      arr.add(currentMsgID);
      String output("/box,0");
      serializeJson(arr, output);
      socket->sendEVENT(output);
    }
    return noMsgDisplay();
  }

  void showQRCode() {
    shownQRCode = true;
    QRCode qrcode;
    uint8 qrcodeBytes[qrcode_getBufferSize(4)];
    String data("{boxID:\"");
    data += ID;
    data += "\"}";
    uint boxSize = 7;
    tft.fillScreen(TFT_BLACK);
    qrcode_initText(&qrcode, qrcodeBytes, 4, ECC_HIGH, data.c_str());
    for (size_t y = 0; y < qrcode.size; y++) {
      for (size_t x = 0; x < qrcode.size; x++) {
        if (qrcode_getModule(&qrcode, x, y)) {
          tft.fillRect(44 + (x * boxSize), 4 + (y * boxSize), boxSize, boxSize,
                       TFT_WHITE);
        }
      }
      yield();
    }
  }

  void readMsg() {
    checkedForMsg = false;
    if (!userReadMsg && hasMsg()) {
      userReadMsg = true;
      StaticJsonDocument<128> doc;
      JsonArray arr = doc.to<JsonArray>();
      arr.add(SEEN_MSG);
      arr.add(currentMsgID);
      String output("/box,");
      serializeJson(doc, output);
      socket->sendEVENT(output);
      Serial.println(output);
    }
  }

  boolean init() {
    tft.fillScreen(TFT_BLACK);
    tft.setTextDatum(MC_DATUM);
    tft.setTextSize(2);

    tft.drawString("Contacting server", 160, 100);
    if (!getAuth()) {
      return false;
    }
    String auth = "authorization: Bearer " + String(token);
    socket->setExtraHeaders(auth.c_str());
    socket->begin(URL, 3000, "/socket.io/?EIO=4");
    socket->onEvent(handleEvents());
    return true;
  }

  void loop() {
    delay(3);
    boxClosed = analogRead(PHOTOPIN) < 200;
    boolean showQR = digitalRead(D8);
    if (!boxClosed) {
      if (showQR && !shownQRCode) {
        Serial.println("Show QR");
        return showQRCode();
      } else if (!showQR && shownQRCode) {
        Serial.println("stop show");
        shownQRCode = false;
        return getMsg();
      }
    }
    socket->loop();
    if (socket->isConnected()) {
      if (boxClosed) {
        getNewMsg();
        if (!userReadMsg && hasMsg()) {
          fadeAmount += fade;
          analogWrite(D6, (int)fadeAmount);
          if (fadeAmount <= 0 || fadeAmount >= 255) {
            fade = -fade;
          }
        }
      } else if (!boxClosed) {
        fadeAmount = 0;
        analogWrite(D6, (int)fadeAmount);

        readMsg();
      }
    }
  }

  BoxSocket(TFT_eSPI &tft) : tft(tft) { socket = new SocketIOclient(); }
  ~BoxSocket() {}
};