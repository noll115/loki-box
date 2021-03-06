#include <TFT_eSPI.h>
#include <Arduino.h>
enum Errors {
  GENERAL,
  FAILED_TO_SERVER,
  FAILED_TO_NETWORK,

};

class ErrorHandler {
 private:
 public:
  static void printError(Errors error, TFT_eSPI &tft) {
    tft.fillScreen(TFT_BLACK);
    tft.setTextDatum(MC_DATUM);
    tft.setTextSize(1);
    switch (error) {
      case Errors::GENERAL:
        tft.drawString("Something went wrong. Restarting.", 160, 100);
        break;
      case Errors::FAILED_TO_SERVER:
        tft.drawString("Failed to contact servers", 160, 100);
        tft.drawString("Retrying...", 160, 140);
        break;
      case Errors::FAILED_TO_NETWORK:
        tft.drawString("Connection to WiFi failed", 160, 100);
        break;
      default:
        break;
    }
    delay(2000);
  }
  ErrorHandler() {}
  ~ErrorHandler() {}
};