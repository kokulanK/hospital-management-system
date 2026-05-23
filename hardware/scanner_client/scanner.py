import cv2
import requests
import time
import threading
from flask import Flask, jsonify
import urllib.parse

app = Flask(__name__)

# --- Configuration ---
ESP32_IP = "172.20.10.3"     # Replace with your ESP32's IP address (shown in Arduino serial monitor)
BACKEND_URL = "https://hospital-backend-myqc.onrender.com/api/visitors/scan" # Node.js backend URL
SCAN_TIMEOUT_SEC = 1000          # Auto-close webcam window after 15 seconds of inactivity

# Thread control variables
scanner_thread = None
is_scanning = False

def run_qr_scanner():
    global is_scanning
    is_scanning = True
    print("\n[INFO] Starting webcam QR scanner...")

    # Initialize OpenCV webcam capture (0 is usually the default laptop camera)
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Could not open laptop webcam. Make sure no other app is using it.")
        is_scanning = False
        return

    # Use OpenCV's built-in QR Code detector
    detector = cv2.QRCodeDetector()
    
    start_time = time.time()
    scan_success = False
    
    last_scanned_qr = None
    last_scanned_time = 0
    qr_removed = True
    
    # Non-blocking overlay state
    overlay_time = 0
    overlay_type = None
    overlay_text1 = ""
    overlay_text2 = ""
    overlay_details = ""

    while is_scanning:
        # Check if the scanning session has timed out
        if time.time() - start_time > SCAN_TIMEOUT_SEC:
            print(f"[TIMEOUT] No QR code detected within {SCAN_TIMEOUT_SEC} seconds.")
            # Send a deny signal to ESP32 on timeout so it alerts the user
            try:
                requests.get(f"http://{ESP32_IP}/gate?action=deny", timeout=2)
            except Exception as e:
                print(f"[WARN] Could not connect to ESP32: {e}")
            break

        ret, frame = cap.read()
        if not ret:
            print("[ERROR] Failed to grab frame from webcam.")
            break

        # Flip the image horizontally for natural mirror preview
        frame = cv2.flip(frame, 1)
        h, w, _ = frame.shape

        # Detect and decode QR Code
        try:
            data, bbox, _ = detector.detectAndDecode(frame)
        except cv2.error as e:
            # Catch OpenCV QR decoder errors on incomplete or bad contours
            data, bbox = "", None

        # Draw a scan target box on screen (center of feed)
        box_color = (255, 255, 255) # White normally
        
        if data:
            data_str = data.strip()
            
            # Prevent scanning the same QR code repeatedly unless it is removed from view or 15 seconds pass
            if qr_removed or (data_str != last_scanned_qr) or (time.time() - last_scanned_time > 15):
                qr_removed = False
                last_scanned_qr = data_str
                last_scanned_time = time.time()
                
                print(f"[SCAN] Detected QR Code content: {data_str}")
                
                # Draw green bounding box if QR detected
                if bbox is not None and len(bbox) > 0:
                    pts = bbox[0].astype(int)
                    for i in range(len(pts)):
                        cv2.line(frame, tuple(pts[i]), tuple(pts[(i+1)%len(pts)]), (0, 255, 0), 3)

                # --- Call Backend Node.js API to Validate Pass ---
                try:
                    print(f"[API] Sending validation request for {data_str}...")
                    response = requests.post(
                        BACKEND_URL, 
                        json={"qrCodeId": data_str}, 
                        headers={"Content-Type": "application/json"},
                        timeout=20
                    )
                    try:
                        res_data = response.json()
                    except ValueError:
                        print(f"[API ERROR] Server did not return JSON. Status Code: {response.status_code}")
                        print(f"Raw Response: {response.text[:200]}...")
                        res_data = {"success": False, "message": f"Server Error ({response.status_code})"}

                    print(f"[API] Response ({response.status_code}): {res_data}")

                    if response.status_code == 200 and res_data.get("success") == True:
                        print("[ACCESS] SUCCESS! Valid pass.")
                        scan_success = True
                        
                        # Prepare LCD Message
                        raw_msg = res_data.get("message", "Welcome!")
                        msg1 = "Goodbye!" if "Goodbye" in raw_msg else "Welcome!"
                        
                        visitor_name = res_data.get("visitorName", "")
                        msg2 = visitor_name if visitor_name else "Access Granted"
                        
                        # Instruct ESP32 to open the gate and update LCD in background thread
                        try:
                            url = f"http://{ESP32_IP}/gate?action=open&msg1={urllib.parse.quote(msg1)}&msg2={urllib.parse.quote(msg2)}"
                            def send_req(u):
                                try: requests.get(u, timeout=2)
                                except Exception as err: pass
                            threading.Thread(target=send_req, args=(url,)).start()
                        except Exception as esp_err:
                            print(f"[WARN] Could not contact ESP32: {esp_err}")
                        
                        # Trigger visual feedback overlay
                        overlay_time = time.time()
                        overlay_type = "success"
                        overlay_text1 = "ACCESS GRANTED"
                        overlay_text2 = res_data.get("message", "Welcome!")
                        details = ""
                        visitor_name = res_data.get("visitorName", "")
                        visitor_phone = res_data.get("visitorPhone", "")
                        if visitor_name or visitor_phone:
                            details = f"{visitor_name} - {visitor_phone}".strip(" -")
                        overlay_details = details
                        
                        # Reset timeout start time for the next person
                        start_time = time.time()
                    else:
                        print("[ACCESS] DENIED! Pass is invalid, expired, or out of visiting hours.")
                        
                        # Prepare LCD Error Message (max 16 chars per line)
                        err_msg = res_data.get("message", "Invalid Pass")
                        if "Visiting hours" in err_msg:
                            msg1 = "Not Visting Time"
                            msg2 = "See Receptionist"
                        elif "Maximum" in err_msg:
                            msg1 = "Limit Reached"
                            msg2 = "3 Visitors Max"
                        elif "admitted" in err_msg.lower():
                            msg1 = "Patient Left"
                            msg2 = "Not Admitted"
                        else:
                            msg1 = "Access Denied"
                            msg2 = "Invalid Pass"

                        # Instruct ESP32 to play access denied sound and update LCD in background thread
                        try:
                            url = f"http://{ESP32_IP}/gate?action=deny&msg1={urllib.parse.quote(msg1)}&msg2={urllib.parse.quote(msg2)}"
                            def send_req(u):
                                try: requests.get(u, timeout=2)
                                except Exception as err: pass
                            threading.Thread(target=send_req, args=(url,)).start()
                        except Exception as esp_err:
                            print(f"[WARN] Could not contact ESP32: {esp_err}")
                        
                        # Trigger visual feedback overlay
                        overlay_time = time.time()
                        overlay_type = "error"
                        overlay_text1 = "ACCESS DENIED"
                        overlay_text2 = res_data.get("message", "Invalid Pass")
                        overlay_details = ""
                        
                        # Reset timeout start time so they have time to scan another pass
                        start_time = time.time()
                except Exception as e:
                    print(f"[ERROR] API request failed: {e}")
                    # Tell ESP32 to beep error in background thread
                    try:
                        url = f"http://{ESP32_IP}/gate?action=deny"
                        def send_req(u):
                            try: requests.get(u, timeout=2)
                            except Exception as err: pass
                        threading.Thread(target=send_req, args=(url,)).start()
                    except:
                        pass
                        
                    # Trigger server error overlay
                    overlay_time = time.time()
                    overlay_type = "server_error"
                    overlay_text1 = "SERVER ERROR"
                    overlay_text2 = "API Failed"
                    overlay_details = ""
        else:
            # If no QR code is detected in this frame, reset the qr_removed flag
            qr_removed = True

        # Draw a scanning reticle/box in the middle of screen
        box_w, box_h = 300, 300
        box_x = (w - box_w) // 2
        box_y = (h - box_h) // 2
        cv2.rectangle(frame, (box_x, box_y), (box_x + box_w, box_y + box_h), (255, 255, 255), 2)
        cv2.putText(frame, "Position QR Code inside box", (box_x - 30, box_y - 15), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1, cv2.LINE_AA)
        
        # Display instructions/countdown at bottom
        remaining = int(SCAN_TIMEOUT_SEC - (time.time() - start_time))
        cv2.putText(frame, f"Scanner active. Timeout in {remaining}s...", (20, h - 20), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

        # Draw overlay if active
        if time.time() - overlay_time < 2.0:
            if overlay_type == "success":
                cv2.rectangle(frame, (0, 0), (w, h), (0, 255, 0), 10)
                cv2.putText(frame, overlay_text1, (w//4, h//2 - 20), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3, cv2.LINE_AA)
                cv2.putText(frame, overlay_text2, (w//6, h//2 + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)
                if overlay_details:
                    cv2.putText(frame, overlay_details, (w//6, h//2 + 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)
            elif overlay_type == "error":
                cv2.rectangle(frame, (0, 0), (w, h), (0, 0, 255), 10)
                cv2.putText(frame, overlay_text1, (w//4, h//2), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3, cv2.LINE_AA)
                cv2.putText(frame, overlay_text2, (w//12, h//2 + 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2, cv2.LINE_AA)
            elif overlay_type == "server_error":
                cv2.rectangle(frame, (0, 0), (w, h), (0, 165, 255), 10)
                cv2.putText(frame, overlay_text1, (w//4, h//2), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 165, 255), 3, cv2.LINE_AA)

        # Show the camera feed
        cv2.imshow("Hospital Gate QR Scanner", frame)

        # Press 'q' key to quit manually
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("[INFO] Scanner closed manually.")
            break

    # Clean up OpenCV windows and webcam
    cap.release()
    cv2.destroyAllWindows()
    is_scanning = False
    print("[INFO] Scanner closed.")

@app.route('/detect', methods=['GET'])
def on_visitor_detected():
    global scanner_thread, is_scanning
    
    # If the scanner is already running, don't start it again
    if is_scanning:
        return jsonify({"status": "already_active", "message": "Scanner is already scanning"}), 200
        
    print("\n[NOTIFICATION] ESP32 detected visitor. Spawning scanner...")
    
    # Start the OpenCV camera scanner in a background thread so the HTTP request completes immediately
    scanner_thread = threading.Thread(target=run_qr_scanner)
    scanner_thread.daemon = True
    scanner_thread.start()
    
    return jsonify({"status": "activated", "message": "Scanner window spawned"}), 200

@app.route('/status', methods=['GET'])
def get_status():
    return jsonify({
        "is_scanning": is_scanning,
        "esp32_ip": ESP32_IP,
        "backend_url": BACKEND_URL
    }), 200

if __name__ == '__main__':
    print("====================================================")
    print("      Hospital Gate Laptop QR Scanner Client        ")
    print("====================================================")
    print(f" * Target ESP32 IP: {ESP32_IP}")
    print(f" * Target Backend URL: {BACKEND_URL}")
    print(" * Listening for ESP32 triggers on http://0.0.0.0:8089")
    print("====================================================")
    app.run(host='0.0.0.0', port=8089, debug=False)
