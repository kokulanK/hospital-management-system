require("dotenv").config(); // MUST be first

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import cloudinary config so it initializes
require('./config/cloudinary');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const skinImageRoutes = require('./routes/skinImageRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const labRequestRoutes = require('./routes/labRequestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cleaningTaskRoutes = require('./routes/cleaningTaskRoutes');
const supplyRequestRoutes = require('./routes/supplyRequestRoutes');

const User = require('./models/User');
const bcrypt = require('bcryptjs');

connectDB();


// ===============================
// Seed Super Admin
// ===============================
const seedSuperAdmin = async () => {
  try {

    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@gmail.com';
    const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'Kokulan2003';

    const exists = await User.findOne({ email: SUPER_ADMIN_EMAIL });

    if (!exists) {
      await User.create({
        name: 'Super Admin',
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        role: 'admin',
        status: 'approved'
      });

      console.log('Super admin created');
    } else {
      console.log('Super admin already exists');
    }

  } catch (error) {
    console.error('Error creating super admin:', error);
  }
};

// call after DB connection
seedSuperAdmin();


const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Hospital Management Backend Running...");
});


// ===============================
// API Routes
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skin-images', skinImageRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/lab-requests', labRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cleaning-tasks', cleaningTaskRoutes);
app.use('/api/supply-requests', supplyRequestRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chat', chatRoutes);