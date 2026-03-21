import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaCalendarAlt, FaClock, FaUser, FaSearch, FaCheckCircle, FaTimesCircle, FaPlus, FaUserPlus } from 'react-icons/fa';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    patientName: '',
    patientEmail: '',
    doctorId: '',
    startTime: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/all');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/appointments/doctors');
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (bookingData.doctorId && selectedDate) {
      fetchSlots(bookingData.doctorId, selectedDate);
    } else {
      setSlots([]);
    }
  }, [bookingData.doctorId, selectedDate]);

  const fetchSlots = async (doctorId, date) => {
    try {
      const { data } = await api.get(`/availability/doctor/${doctorId}?date=${date}`);
      setSlots(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/appointments/receptionist', bookingData);
      setMessage('success:Appointment booked successfully');
      setBookingData({ patientName: '', patientEmail: '', doctorId: '', startTime: '' });
      setShowBooking(false);
      fetchAppointments();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Booking failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  const groupedAppointments = appointments.reduce((acc, app) => {
    const date = new Date(app.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(app);
    return acc;
  }, {});

  return (
    <DashboardLayout activePage="appointments">
      <style>{`
        .hero-appt-recep {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .booking-modal { animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-appt-recep rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Appointments</p>
            <h1 className="display-font text-3xl font-semibold mb-2">Manage All Appointments</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              View, book, and manage appointments for both registered and new patients.
            </p>
            <button
              onClick={() => setShowBooking(true)}
              className="mt-5 bg-white text-blue-600 px-5 py-2 rounded-xl font-medium flex items-center gap-2"
            >
              <FaPlus /> New Booking
            </button>
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            msgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {msgType === 'success' ? <FaCheckCircle className="text-emerald-500" /> : <FaTimesCircle className="text-red-400" />}
            <p className="text-sm font-medium">{msgText}</p>
            <button onClick={() => setMessage('')} className="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
          </div>
        )}

        {/* Appointments List */}
        {loading ? (
          <div className="space-y-3">{/* skeleton */}</div>
        ) : Object.keys(groupedAppointments).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No appointments found.</p>
          </div>
        ) : (
          Object.entries(groupedAppointments).map(([dateStr, apps]) => (
            <div key={dateStr} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                <p className="text-sm font-semibold text-blue-700">{new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {apps.map(app => (
                  <div key={app._id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-sm">{app.patient?.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{app.patient?.name}</p>
                        <p className="text-xs text-gray-400">Dr. {app.doctor?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FaClock className="text-blue-300" /> {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                        app.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="booking-modal bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="display-font text-xl font-semibold text-gray-800 mb-4">Book Appointment</h2>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={bookingData.patientName}
                  onChange={e => setBookingData({ ...bookingData, patientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Email</label>
                <input
                  type="email"
                  value={bookingData.patientEmail}
                  onChange={e => setBookingData({ ...bookingData, patientEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                <select
                  value={bookingData.doctorId}
                  onChange={e => setBookingData({ ...bookingData, doctorId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                >
                  <option value="">Choose doctor</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>Dr. {doc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Available Slots</label>
                {slots.length === 0 ? (
                  <p className="text-sm text-gray-400">No slots available for this date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setBookingData({ ...bookingData, startTime: slot.start })}
                        className={`px-2 py-1 text-xs rounded-lg border ${
                          bookingData.startTime === slot.start
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-blue-50'
                        }`}
                      >
                        {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !bookingData.startTime}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {submitting ? 'Booking...' : 'Confirm Booking'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBooking(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}