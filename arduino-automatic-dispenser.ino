#include <AccelStepper.h>
#include <HX711.h>

#define stepPin 3  // Stepper motor driver IN1 pin
#define dirPin 2   // Stepper motor driver IN2 pin
#define LOADCELL_DOUT_PIN 5
#define LOADCELL_SCK_PIN 4
#define BUTTON_PIN 6  // Button pin
#define ENABLE_PIN 7  // DRV8825

#define MotorInterfaceType 1  // for DRIVER not motor https://www.airspayce.com/mikem/arduino/AccelStepper/classAccelStepper.html#a73bdecf1273d98d8c5fbcb764cabeea5
#define BDT 100               // Button Debounce time in milliseconds
#define TARGET_WEIGHT 340     // Target weight in grams

HX711 scale;
float calibration_factor = -1001;  //-1001 for 1kg load cell

AccelStepper stepper(MotorInterfaceType, stepPin, dirPin);

bool buttonState = LOW;
bool lastButtonState = LOW;
bool activateAuger = false;
unsigned long lastButtonDebounceTime = 0;

void setup() {
  pinMode(ENABLE_PIN, OUTPUT);
  digitalWrite(ENABLE_PIN, HIGH); // Disable the stepper motor driver initially

  Serial.begin(115200); // Make sure baud rate is high enough not to slow stepper motor! 
  Serial.println("\nInitializing the scale");

  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare();

  pinMode(BUTTON_PIN, INPUT_PULLUP);

  stepper.setMaxSpeed(1000);  // Set maximum speed of the stepper motor
}

void loop() {
  float weight = getWeight();

  Serial.println(weight, 1);

  buttonState = digitalRead(BUTTON_PIN);
  if (buttonState != lastButtonState) {
    lastButtonDebounceTime = millis();
    lastButtonState = buttonState;
  }
  if ((millis() - lastButtonDebounceTime) > BDT) {
    if ((buttonState == LOW) && (activateAuger == false)) {
      activateAuger = true;
    }
  }

  if (activateAuger == true) {
    stepper.setSpeed(900);
    stepper.runSpeed(); 
    digitalWrite(ENABLE_PIN, LOW);
  } else {
    digitalWrite(ENABLE_PIN, HIGH);
  }

  if (weight >= TARGET_WEIGHT) {
    activateAuger = false;
    stepper.stop();
    stepper.setCurrentPosition(0);
  }

}

int getWeight() {
  static unsigned long lastMillis = 0;
  if (millis() - lastMillis > 500) { // Update weight every second
    lastMillis = millis();
    return scale.get_units();
  }
}
