# Hospital Access Gate: ESP32 & Laptop Camera QR Scanner Setup

This directory contains the code and configuration instructions for building a smart gate that uses an ESP32, an ultrasonic sensor, a servo motor, a mini speaker, and a laptop camera to scan visitor QR passes and open/close the hospital gate.

---

## 🛠️ Required Hardware Components
1. **ESP32 Development Board** (e.g. ESP32-WROOM-32)
2. **Ultrasonic Sensor (HC-SR04)** - Detects if a visitor is standing at the gate.
3. **Servo Motor (SG90 or MG90S)** - Represents the mechanical gate arm.
4. **Normal Mini Speaker (8 Ohm, 0.25W - 3W)** - Outputs gate chime audio alerts.
5. **150Ω (Ohm) Resistor** - **CRITICAL!** Connected in series with the speaker to limit current and protect the ESP32 pin from burning out.
6. **Jumper Wires and Breadboard**
7. **USB Cable** - To upload code to the ESP32.
8. **Laptop with Webcam** - Runs the QR code scanning software.

---

## 🔌 Circuit Wiring Diagram

Please connect the components to the ESP32 according to the table below:

| Component | Pin | ESP32 Pin | Note / Connection Details |
| :--- | :--- | :--- | :--- |
| **HC-SR04 (Ultrasonic)** | VCC | **5V (VIN / 5V)** | Connect to the 5V input source |
| | GND | **GND** | Common ground |
| | TRIG | **GPIO 5** | Trigger pulse pin |
| | ECHO | **GPIO 18** | Echo return pulse pin |
| **Servo Motor (SG90)** | Orange/Yellow (Signal) | **GPIO 19** | PWM control signal |
| | Red (Power) | **5V (VIN / 5V)** | Connect to 5V power |
| | Brown/Black (Ground) | **GND** | Common ground |
| **Speaker (8Ω 0.25W)** | Positive (+) | **GPIO 25 (DAC1)** | **MUST** go through the **150 Ohm Resistor** in series |
| | Negative (-) | **GND** | Common ground |

### ⚠️ IMPORTANT: Speaker Wiring Safety Warning
An 8-ohm speaker has very low resistance. If connected directly between an ESP32 output pin and ground, it will draw about **400mA** which **will overload and burn out your ESP32 board**. 
* **Safe Connection**: Connect **GPIO 25** to one end of a **150 Ohm resistor**, connect the other end of the resistor to the **Speaker (+)** pin, and connect **Speaker (-)** to **GND**.
* **Optional - Louder Sound**: If you want the alerts to be louder, connect the speaker to a **PAM8302 or LM386** audio amplifier module instead of directly to the pin.

---

## 💻 Software Setup

### Step 1: Program the ESP32
1. Open the [Arduino IDE](https://www.arduino.cc/en/software).
2. Install the ESP32 Board Package (if not already done):
   * Go to **File > Preferences**.
   * Add this link to *Additional Boards Manager URLs*: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
   * Go to **Tools > Board > Boards Manager**, search for `esp32` and install the package.
3. Install the **ESP32Servo** Library:
   * Go to **Sketch > Include Library > Manage Libraries...**.
   * Search for `ESP32Servo` and click **Install**.
4. Open the Arduino sketch: [gate_control.ino](file:///d:/Y2S2/Final/hospital-management-system/hardware/gate_control/gate_control.ino).
5. Modify the configuration variables at the top of the file:
   * `ssid` - Your home/mobile hotspot Wi-Fi name.
   * `password` - Your Wi-Fi password.
   * `laptop_ip` - Your laptop's local IP address (find it by running `ipconfig` in CMD on Windows).
6. Connect the ESP32 to your laptop using a USB cable.
7. Select your Board (**Tools > Board > ESP32 Arduino > ESP32 Dev Module**) and the correct COM Port.
8. Click **Upload** (the Arrow icon).
9. Once uploaded, open the **Serial Monitor** (set baud rate to `115200`).
10. Note the **ESP32 Local IP address** printed in the serial monitor once connected (e.g., `192.168.1.150`).

### Step 2: Configure the Laptop QR Scanner
1. Make sure you have **Python 3** installed on your laptop.
2. Open terminal/PowerShell in the scanner client folder:
   `cd d:\Y2S2\Final\hospital-management-system\hardware\scanner_client`
3. Install the required Python packages:
   `pip install -r requirements.txt`
4. Open [scanner.py](file:///d:/Y2S2/Final/hospital-management-system/hardware/scanner_client/scanner.py) in a code editor.
5. Update the configuration variables at the top of the file:
   * `ESP32_IP` - Set this to the ESP32 IP address you noted in Step 1 (e.g. `"192.168.1.150"`).
   * Verify `BACKEND_URL` is pointing to your running Node.js backend (default: `http://localhost:5000/api/visitors/scan`).
6. Start the scanner python script:
   `python scanner.py`

---

## 🏃 Testing & Run Walkthrough

1. **Start the Hospital Management System Backend**:
   Make sure your Node.js server is running (e.g. `npm run dev` in the `backend` folder).
2. **Generate a Visitor Pass**:
   * Log into the Patient Portal of your web app.
   * Go to **My Ward & Visitors**.
   * Add a visitor and click **Generate Pass**.
   * An active visitor pass with a QR code will be displayed. Keep this QR code visible on your phone screen.
3. **Stand in Front of the Ultrasonic Sensor**:
   * Wave your hand in front of the ultrasonic sensor (within 50cm).
   * The ESP32 speaker will play a double-beep tone.
   * The ESP32 will notify the Python script on your laptop over Wi-Fi.
   * The laptop camera preview window will automatically pop open, showing your webcam feed.
4. **Scan the Pass**:
   * Hold your phone with the QR code up to the laptop camera, fitting it inside the white target box.
   * The Python script reads the QR Code ID, contacts the Node.js backend, and verifies the pass.
   * **If the QR Pass is Valid & inside visiting hours**:
     * Laptop displays **ACCESS GRANTED** in green.
     * Laptop sends an HTTP request to the ESP32.
     * The ESP32 plays a rising **Success Chime** on the speaker.
     * The Servo Gate swings open to 90°.
     * The laptop camera feed closes automatically.
     * **As long as you stand near the sensor**, the gate stays open.
     * **Once you walk away** (distance > 50cm), the ESP32 waits **3 seconds** before playing a low warning tone and closing the gate (servo returns to 0°).
   * **If the QR Pass is Invalid or Denied**:
     * Laptop displays **ACCESS DENIED** in red.
     * Laptop sends a deny signal to the ESP32.
     * The ESP32 plays a low **Access Denied buzzer chime** on the speaker.
     * The gate stays closed.
