# 🏥 Hospital Management System
A full‑stack hospital management platform with role‑based dashboards, AI skin scanning, lab result management, a chatbot, and a cross‑platform mobile app.

##  📌 Features
Role‑based access: Patient, Doctor, Receptionist, Lab Technician, Cleaning Staff, Admin.

Appointment booking: Real‑time doctor availability, 15‑minute slots, booking for self or on behalf of a patient.

AI skin scanner: Upload skin images, receive AI predictions (BCC, BKL, MEL, NV) via a separate Flask service.

Lab request management: Doctors request tests; lab techs upload results (images/PDF).

Cleaning tasks: Assign and track daily tasks for cleaning staff; supply requests.

Feedback system: Patients rate doctors after completed appointments.

Chatbot: AI‑powered (OpenAI) assistant for patients, with fallback responses.

Mobile app: Built with React Native (Expo), covering all roles with native date/time pickers, image upload, and text‑to‑speech.

##  🛠️ Tech Stack
Component	Technologies
Backend	Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary, Axios, OpenAI SDK
Frontend	React, Vite, Tailwind CSS, React Router, Axios, React Icons
Mobile	React Native (Expo), Expo Router, AsyncStorage, expo-image-picker, expo-speech, DateTimePicker
AI Service	Python, Flask, TensorFlow, Pillow, requests
Database	MongoDB Atlas (or local)
File Storage	Cloudinary (for images and lab result files)

##  📁 Project Structure


hospital-management-system/
├── backend/               # Node.js server
│   ├── config/            # DB, Cloudinary config
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth, uploads
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── utils/             # Helpers
│   └── server.js          # Entry point
├── frontend/              # React web app
│   ├── public/
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── components/    # Reusable UI (PrivateRoute, Chatbot)
│   │   ├── contexts/      # Auth context
│   │   ├── pages/         # Role‑based pages
│   │   ├── utils/         # Helpers
│   │   └── App.jsx        # Main app
│   ├── index.html
│   └── package.json
├── app/                   # React Native mobile app (Expo)
│   ├── assets/            # Icons, splash
  │   ├── src/
  │   │   ├── api/           # Axios instance
  │   │   ├── contexts/      # Auth context
  │   │   ├── navigation/    # Stack and tab navigators
  │   │   ├── screens/       # All role‑based screens
  │   │   ├── components/    # Reusable (Button, Input, etc.)
  │   │   └── utils/         # Helpers
  │   ├── app.json
  │   └── package.json
  ├── ai-service/            # Python AI service
  │   ├── inference.py       # Model loading and prediction
  │   ├── app.py             # Flask server
  │   └── improved_custom_cnn.keras  # Trained model
  └── README.md

##  🔧 Prerequisites

Node.js (v18+)

npm or yarn

MongoDB (local or Atlas)

Cloudinary account (for image/file uploads)

OpenAI API key (optional, for chatbot)

Python 3.11+ (for AI service)

Expo Go app (for mobile development)

##  ⚙️ Environment Setup

### Backend (.env in /backend)

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=admin123
OPENAI_API_KEY=your_openai_key   # optional
AI_SERVICE_URL=http://localhost:8001

### Frontend (.env in /frontend)

VITE_API_URL=http://localhost:5000/api

### Mobile (set in app.json or via .env)

"extra": {
  "apiUrl": "http://192.168.x.x:5000/api"   // your computer's local IP
}

AI Service
No environment file needed – it runs on port 8001.

##  🚀 Running the Project
  
  1. Start the Backend

    cd backend
    npm install
    npm run dev

    Server runs on http://localhost:5000.
    Super admin is seeded automatically from .env.

  2. Start the Frontend

    cd frontend
    npm install
    npm run dev

    Vite dev server runs on http://localhost:5173.

  3. Start the AI Service (Python)

    cd ai-service
    # Create a virtual environment (optional)
    cd D:\Y2S2\Final\hospital-management-system\ai-service

        # Create a Virtual Environment

            py -m venv venv

        # Activate the Virtual Environment

            .\venv\Scripts\activate

        # Install Required Dependencies

            pip install tensorflow flask numpy pillow requests

        # Run the Flask App

            py app.py

    AI service runs on http://localhost:8001.

  4. Start the Mobile App (Expo)

    cd app
    npm install
    npx expo start -c

    Scan the QR code with Expo Go (Android) or the Camera app (iOS).

##  🤖 AI Skin Scanner

The AI service uses a TensorFlow model (improved_custom_cnn.keras) trained to classify skin lesions into four categories: BCC (Basal Cell Carcinoma), BKL (Benign Keratosis), MEL (Melanoma), NV (Nevus). When a user uploads an image via the web or mobile app, the backend sends the Cloudinary URL to the AI service, which returns the prediction. The result is stored in the database and displayed to the user.

##  📱 Mobile App Features

Full role‑based navigation (tabs).

Native date/time pickers for appointments and availability.

Image picker (gallery and camera) for AI scans.

Text‑to‑speech for chatbot messages.

Works with Expo Go (SDK 54).

##  🔐 Default Admin Login

After seeding, you can log in with:

Email: admin@example.com (or the one set in .env)

Password: admin123 (or the one set in .env)

##  🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

##  📄 License

This project is for educational/demo purposes.

# Build By:-

Kokulan Kugathasan
📞 +94 76 752 0033
✉️ kokulankugathasan2003@gmail.com
🔗 linkedin.com/in/kokulan-kugathasan

  