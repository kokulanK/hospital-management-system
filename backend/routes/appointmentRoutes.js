const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');

const {
  bookAppointment,
  receptionistBookAppointment,          // ✅ added
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,                   // ✅ added
  updateAppointmentStatus,
  getDoctorsWithRatings,
  getCompletedAppointmentsWithoutFeedback
} = require('../controllers/appointmentController');

const router = express.Router();


// =====================
// Patient routes
// =====================
router.post('/', protect, authorize('patient'), bookAppointment);
router.get('/patient', protect, authorize('patient'), getPatientAppointments);
router.get(
  '/completed-without-feedback',
  protect,
  authorize('patient'),
  getCompletedAppointmentsWithoutFeedback
);


// =====================
// Receptionist routes
// =====================
router.post(
  '/receptionist',
  protect,
  authorize('receptionist'),
  receptionistBookAppointment
);

router.get(
  '/all',
  protect,
  authorize('receptionist', 'admin'),
  getAllAppointments
);


// =====================
// Doctor routes
// =====================
router.get('/doctor', protect, authorize('doctor'), getDoctorAppointments);
router.put('/:id', protect, authorize('doctor'), updateAppointmentStatus);


// =====================
// Doctors list (with ratings)
// =====================
router.get('/doctors', protect, getDoctorsWithRatings);


module.exports = router;