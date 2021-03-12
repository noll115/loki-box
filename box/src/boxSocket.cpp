#include <WebSocketsClient.h>
#include <SocketIOclient.h>
#include <TFT_eSPI.h>
#include <ArduinoJson.h>
#include <ESP8266HTTPClient.h>
#include <qrcode.h>

#define MAGNET_PIN D0

const char *const SEEN_MSG = "seenMsg";
const char *const CHECK_FOR_MSG = "checkForMsg";
const char *const GOT_NEW_MSG = "gotNewMsg";
const char *const GET_MSG = "getMsg";
const char *const URL = "192.168.1.2";
const char *const TOKEN = "cutie";
const char *const ID = "6010b0545bf32741e1a33c85";

enum ACK_TYPE : byte { NEW_MSG_ACK = 0, REDRAW_MSG_ACK, CHECK_MSG_ACK };
enum GET_MSG_TYPE : byte { NEW_MSG = 0, REDRAW_MSG };
enum TXT_SIZE : byte { SMALL = 18, MEDIUM = 35, LARGE = 50 };
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
  boolean boxOpen = false;
  boolean gettingMsg = false;
  float fade = (250.0F / 500.0F);
  float fadeAmount = 0;

  boolean hasMsg() { return currentMsgID[0]; }

  void noMsgDisplay() {
    userReadMsg = true;
    tft.setTextDatum(MC_DATUM);
    tft.fillScreen(TFT_BLACK);
    tft.setTextSize(1);
    tft.drawString("No messages.", 160, 100);
    tft.drawString("Please close the box.", 160, 140);
  }

  void drawMsg(JsonObject &msg) {
    tft.fillScreen(TFT_BLACK);
    auto lines = msg["data"]["lines"].as<JsonArray>();
    size_t numOfLines = lines.size();
    for (size_t i = 0; i < numOfLines; i++) {
      auto line = lines[i];
      auto points = line["points"];
      auto pointSize = points.size();
      auto strokeSize = line["lineWidth"].as<float>() / 2;
      auto color = line["color"].as<char *>();
      int number = (int)strtoll(color + 1, NULL, 16);
      int r = number >> 16;
      int g = number >> 8 & 0xFF;
      int b = number & 0xFF;
      uint rgb = ((r & 0b11111000) << 8) | ((g & 0b11111100) << 3) | (b >> 3);
      for (size_t i = 0; i < pointSize; i += 2) {
        auto x1 = points[i].as<uint>();
        auto y1 = points[i + 1].as<uint>();
        tft.fillCircle(x1, y1, strokeSize, rgb);
        if (i + 2 < pointSize) {
          auto x2 = points[i + 2].as<uint>();
          auto y2 = points[i + 3].as<uint>();
          int deltaX = x2 - x1;
          int deltaY = y2 - y1;
          uint numOfPoints = 10;
          for (size_t i = 1; i < numOfPoints; i++) {
            float percentage = (float)i / (float)numOfPoints;
            int betweenX = x1 + (deltaX * percentage);
            int betweenY = y1 + (deltaY * percentage);
            tft.fillCircle(betweenX, betweenY, strokeSize, rgb);
          }
        }
      }
    }
    auto texts = msg["data"]["texts"].as<JsonArray>();
    serializeJson(texts, Serial);
    size_t numOfTexts = texts.size();
    tft.setTextDatum(TL_DATUM);
    for (size_t i = 0; i < numOfTexts; i++) {
      auto text = texts[i];
      auto msg = text["text"].as<char *>();
      auto pos = text["pos"];
      uint xPos = pos[0].as<uint>();
      uint yPos = pos[1].as<uint>();
      TXT_SIZE textSize = text["txtSize"].as<TXT_SIZE>();
      if (textSize == TXT_SIZE::SMALL) {
        tft.setFreeFont(FSS8);
      } else if (textSize == TXT_SIZE::MEDIUM) {
        tft.setFreeFont(FSS16);
      } else {
        tft.setFreeFont(FSS24);
      }
      auto color = text["color"].as<char *>();
      int number = (int)strtoll(color + 1, NULL, 16);
      int r = number >> 16;
      int g = number >> 8 & 0xFF;
      int b = number & 0xFF;
      uint rgb = ((r & 0b11111000) << 8) | ((g & 0b11111100) << 3) | (b >> 3);
      Serial.println(rgb);
      tft.setTextColor(rgb, TFT_BLACK);
      tft.drawString(msg, xPos, yPos);
    }
    tft.setTextFont(4);
    tft.setTextSize(1);
    tft.setTextDatum(MC_DATUM);
    tft.setTextColor(TFT_WHITE, TFT_BLACK);
  }

  void firstDisplayMessage(JsonObject &msg) {
    checkedForMsg = false;
    userReadMsg = true;
    readMsg();
    tft.setTextDatum(MC_DATUM);
    tft.fillScreen(TFT_BLACK);
    auto fromNickName = msg["fromSeenAs"].as<char *>();
    tft.drawString("Message from:", 160, 100);
    tft.drawString(fromNickName, 160, 140);
    delay(2000);
    drawMsg(msg);
  }

  void parseEvent(char *payload, size_t length) {
    for (size_t i = 0; i < 5U; i++) {
      payload[i] = ' ';
    }
    Serial.println((char *)payload);
    StaticJsonDocument<96> doc;
    deserializeJson(doc, payload);
    JsonArray arr = doc.as<JsonArray>();
    auto type = arr[0].as<char *>();
    serializeJson(arr, Serial);
    if (!strcmp(type, GOT_NEW_MSG)) {
      if (!hasMsg() && !boxOpen && checkedForMsg) {
        auto msgID = arr[1].as<char *>();
        strncpy(currentMsgID, msgID, 25);
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
    Serial.println("GOT MSG");
    deserializeJson(doc, payload);
    auto data = doc.as<JsonArray>();
    auto msg = data[0].as<JsonObject>();
    if (ackId == ACK_TYPE::NEW_MSG_ACK) {
      gettingMsg = false;
      firstDisplayMessage(msg);
    } else if (ackId == ACK_TYPE::REDRAW_MSG_ACK) {
      gettingMsg = false;
      drawMsg(msg);
    } else if (ackId == ACK_TYPE::CHECK_MSG_ACK) {
      if (!msg.isNull()) {
        serializeJson(msg, Serial);
        Serial.println();
        strncpy(currentMsgID, msg["_id"].as<char *>(), 25);
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
    StaticJsonDocument<256> authDoc;
    String json;
    authDoc["token"] = TOKEN;
    authDoc["boxID"] = ID;
    serializeJson(authDoc, json);
    authDoc.clear();
    if (http.begin(client, String("http://") + URL + ":3000/box/auth")) {
      http.addHeader("Content-type", "application/json");
      int httpCode = http.POST(json);
      if (httpCode > 0 && httpCode == HTTP_CODE_OK) {
        deserializeJson(authDoc, http.getStream());
        token = authDoc["token"].as<char *>();
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

  void checkForMsg() {
    if (!checkedForMsg && userReadMsg) {
      currentMsgID[0] = 0;
      userReadMsg = false;
      checkedForMsg = true;
      tft.fillScreen(TFT_BLACK);
      StaticJsonDocument<128> getMsg;
      JsonArray arr = getMsg.to<JsonArray>();
      arr.add(CHECK_FOR_MSG);
      String output("/box,");
      output += ACK_TYPE::CHECK_MSG_ACK;
      serializeJson(arr, output);
      socket->sendEVENT(output);
      Serial.println(output);
    }
  }

 public:
  boolean isConnected() { return socket->isConnected(); }

  void getMsg(GET_MSG_TYPE getType) {
    Serial.println("GETTING MSG");
    if (hasMsg() && !gettingMsg) {
      gettingMsg = true;
      StaticJsonDocument<128> getMsg;
      JsonArray arr = getMsg.to<JsonArray>();
      String output("/box,");
      arr.add(GET_MSG);
      arr.add(currentMsgID);
      output += getType == GET_MSG_TYPE::NEW_MSG ? ACK_TYPE::NEW_MSG_ACK
                                                 : ACK_TYPE ::REDRAW_MSG_ACK;
      serializeJson(arr, output);
      socket->sendEVENT(output);
      Serial.println(output);
    } else if (!hasMsg()) {
      checkedForMsg = false;
      noMsgDisplay();
    }
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
    if (hasMsg()) {
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
    tft.setTextSize(1);

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
    boxOpen = digitalRead(MAGNET_PIN);
    boolean showQR = digitalRead(D8);
    if (boxOpen) {
      if (showQR && !shownQRCode) {
        return showQRCode();
      } else if (!showQR && shownQRCode) {
        shownQRCode = false;
        return getMsg(GET_MSG_TYPE::REDRAW_MSG);
      }
    }
    socket->loop();
    if (socket->isConnected()) {
      if (!boxOpen) {
        checkForMsg();
        if (hasMsg()) {
          fadeAmount += fade;
          analogWrite(D6, (int)fadeAmount);
          if (fadeAmount <= 0 || fadeAmount >= 255) {
            fade = -fade;
          }
        }
      } else {
        fadeAmount = 0;
        fade = fabs(fade);
        analogWrite(D6, (int)fadeAmount);
        if (!userReadMsg) getMsg(GET_MSG_TYPE::NEW_MSG);
      }
    }
  }

  BoxSocket(TFT_eSPI &tft) : tft(tft) { socket = new SocketIOclient(); }
  ~BoxSocket() {}
};