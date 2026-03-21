# 🏥 Hospital Management System

A full‑stack hospital management platform with role‑based dashboards, AI skin scanning, lab result management, and a chatbot.

## 🚀 Tech Stack
- **Backend**: Node.js, Express, MongoDB, Cloudinary, JWT, OpenAI (optional)
- **Frontend**: React, Vite, Tailwind CSS, React Router, Axios

## 📋 Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)
- OpenAI API key (optional – chatbot falls back to rule‑based responses)

## ⚙️ Environment Setup

### Backend (`.env` in `/backend`)
  env
    PORT=5000   
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret
    SUPER_ADMIN_EMAIL=admin@example.com
    SUPER_ADMIN_PASSWORD=admin123
    OPENAI_API_KEY=your_openai_key   # optional

    Frontend (.env in /frontend)

        VITE_API_URL=http://localhost:5000/api

## 🏃 Running the Project

    1. Clone the repository

        git clone https://github.com/your-username/hospital-management-system.git
        cd hospital-management-system

    2. Backend

        cd backend
        npm install
        npm run dev   # starts on http://localhost:5000

    3. Frontend

            cd frontend
            npm install
            npm run dev   # starts on http://localhost:5173

##  📁 Folder Structure (simplified)

    backend/
    ├── config/          # DB, Cloudinary
    ├── controllers/     # Business logic
    ├── middleware/      # Auth, uploads
    ├── models/          # Mongoose schemas
    ├── routes/          # API endpoints
    └── server.js        # Entry point

    frontend/
    ├── src/
    │   ├── api/         # Axios instance
    │   ├── components/  # Reusable UI (PrivateRoute, Chatbot)
    │   ├── contexts/    # Auth context
    │   ├── pages/       # Role‑based pages
    │   └── App.jsx      # Main app
    └── index.html

##  🔐 Default Admin

    The first admin is seeded automatically from SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in your .env. Use these credentials to log in as admin.

##  🤝 Contributing

    Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

    Built by:-
    Kokulan Kugathasan
    📞 +94 76 752 0033
    ✉️ kokulankugathasan2003@gmail.com
    🔗 linkedin.com/in/kokulan-kugathasan


