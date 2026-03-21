// frontend/src/pages/patient/Appointments.jsx
import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaStar, FaCalendarAlt, FaClock, FaSearch, FaCheckCircle, FaTimesCircle, FaUserMd, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Appointments() {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingMode, setBookingMode] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/appointments/doctors');
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/my');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    try {
      const { data } = await api.get(`/availability/doctor/${doctorId}?date=${date}`);
      setSlots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const filteredDoctors = doctors.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (filteredDoctors.length === 1) {
      setSelectedDoctor(filteredDoctors[0]);
      fetchSlots(filteredDoctors[0]._id, selectedDate);
    } else {
      setSlots([]);
      setSelectedDoctor(null);
    }
  }, [searchQuery, selectedDate, doctors]);

  const handleDoctorSelect = (doc) => {
    setSelectedDoctor(doc);
    fetchSlots(doc._id, selectedDate);
    setSearchQuery(doc.name);
  };

  const handleBook = async () => {
    if (!confirmation) return;

    const exists = appointments.some(
      app =>
        app.doctor._id === confirmation.doctor._id &&
        new Date(app.startTime).getTime() === new Date(confirmation.slot.start).getTime()
    );
    if (exists) {
      setBookingMessage('You have already booked this appointment!');
      setConfirmation(null);
      return;
    }

    try {
      await api.post('/appointments', {
        doctorId: confirmation.doctor._id,
        startTime: confirmation.slot.start
      });
      setBookingMessage('success:Appointment booked successfully!');
      setConfirmation(null);
      fetchAppointments();
      fetchSlots(confirmation.doctor._id, selectedDate);
    } catch (err) {
      setBookingMessage('error:' + (err.response?.data?.message || 'Booking failed'));
    }
  };

  const bookedSlots = appointments.map(app => ({
    doctorId: app.doctor._id,
    start: app.startTime
  }));

  const isSlotBooked = (doctorId, slotStart) => {
    return bookedSlots.some(
      b => b.doctorId === doctorId && new Date(b.start).getTime() === new Date(slotStart).getTime()
    );
  };

  const upcomingAppointments = appointments
    .filter(a => new Date(a.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const pastAppointments = appointments
    .filter(a => new Date(a.startTime) < new Date())
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  const msgType = bookingMessage.startsWith('success:') ? 'success' : 'error';
  const msgText = bookingMessage.replace(/^(success:|error:)/, '');

  return (
    <DashboardLayout activePage="appointments">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .appt-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }

        .tab-btn {
          position: relative;
          padding: 10px 24px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          outline: none;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: white;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
        }
        .tab-btn.inactive {
          background: white;
          color: #6b7280;
          border: 1.5px solid #e5e7eb;
        }
        .tab-btn.inactive:hover { background: #f9fafb; }

        .doctor-card {
          cursor: pointer;
          transition: all 0.22s ease;
          border: 2px solid transparent;
        }
        .doctor-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); }
        .doctor-card.selected { border-color: #3b82f6; }

        .slot-btn {
          transition: all 0.15s ease;
          font-size: 0.82rem;
          font-weight: 500;
          border-radius: 10px;
          padding: 8px;
          border: 1.5px solid #e5e7eb;
          background: white;
          cursor: pointer;
        }
        .slot-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: white;
          border-color: transparent;
          transform: scale(1.04);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
        }
        .slot-btn:disabled {
          background: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
          border-color: #e5e7eb;
        }

        .appt-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .appt-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

        .modal-overlay {
          animation: fadeIn 0.2s ease;
        }
        .modal-box {
          animation: slideUp 0.25s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .search-bar:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .date-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }

        .hero-appt {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }

        .fade-in { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .fade-in:nth-child(1) { animation-delay: 0.05s; }
        .fade-in:nth-child(2) { animation-delay: 0.12s; }
        .fade-in:nth-child(3) { animation-delay: 0.19s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div className="appt-root max-w-5xl mx-auto space-y-6 pb-10">

        {/* ── Hero ── */}
        <div className="hero-appt rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:280,height:280,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-60,right:-40,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:160,height:160,background:'radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)',bottom:-30,left:60,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Appointments</p>
            <h1 className="display-font text-3xl font-semibold mb-2">Manage Your Schedule</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Search for a doctor, pick a date, and book your slot — or review your upcoming and past visits.
            </p>
            <div className="mt-5 flex gap-4 flex-wrap">
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm">
                <span className="text-blue-200 text-xs block">Upcoming</span>
                <span className="font-semibold">{upcomingAppointments.length} appointment{upcomingAppointments.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm">
                <span className="text-blue-200 text-xs block">Total Visits</span>
                <span className="font-semibold">{appointments.length} visits</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-3">
          <button className={`tab-btn ${bookingMode ? 'active' : 'inactive'}`} onClick={() => setBookingMode(true)}>
            <FaCalendarAlt className="inline mr-2 text-sm" />Book Appointment
          </button>
          <button className={`tab-btn ${!bookingMode ? 'active' : 'inactive'}`} onClick={() => setBookingMode(false)}>
            <FaCheckCircle className="inline mr-2 text-sm" />My Appointments
          </button>
        </div>

        {/* ── Toast Message ── */}
        {bookingMessage && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            msgType === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {msgType === 'success'
              ? <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
              : <FaTimesCircle className="text-red-400 flex-shrink-0" />}
            <p className="text-sm font-medium">{msgText}</p>
            <button onClick={() => setBookingMessage('')} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>
        )}

        {/* ══════════════════════════════════
            BOOKING MODE
        ══════════════════════════════════ */}
        {bookingMode && (
          <>
            {/* Search & Date */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="display-font text-lg font-semibold text-gray-800 mb-4">Find a Doctor</h3>
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search by doctor name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-bar w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm transition-all"
                  />
                </div>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none" />
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="date-input pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Doctor Cards */}
            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <FaUserMd className="text-gray-200 text-5xl mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No doctors found matching your search.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    className={`doctor-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 fade-in ${selectedDoctor?._id === doc._id ? 'selected' : ''}`}
                    onClick={() => handleDoctorSelect(doc)}
                  >
                    {/* Doctor Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-lg">{doc.name[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Dr. {doc.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-xs ${i < Math.round(doc.averageRating) ? 'text-amber-400' : 'text-gray-200'}`}
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-400">({doc.averageRating?.toFixed(1) || '0.0'})</span>
                        </div>
                      </div>
                      {selectedDoctor?._id === doc._id && (
                        <div className="ml-auto">
                          <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">Selected</span>
                        </div>
                      )}
                    </div>

                    {/* Slots */}
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        <FaClock className="inline mr-1" />Available Slots
                      </p>
                      {selectedDoctor?._id !== doc._id ? (
                        <p className="text-sm text-gray-400 italic">Click to see available slots</p>
                      ) : loadingSlots ? (
                        <div className="grid grid-cols-3 gap-2">
                          {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="skeleton h-9 rounded-lg" />
                          ))}
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-gray-400">No available slots on this date.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot, idx) => (
                            <button
                              key={idx}
                              disabled={isSlotBooked(doc._id, slot.start)}
                              onClick={(e) => { e.stopPropagation(); setConfirmation({ doctor: doc, slot }); }}
                              className={`slot-btn text-gray-700 ${isSlotBooked(doc._id, slot.start) ? '' : ''}`}
                            >
                              {isSlotBooked(doc._id, slot.start) && (
                                <FaCheckCircle className="inline mr-1 text-gray-400 text-xs" />
                              )}
                              {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════
            MY APPOINTMENTS MODE
        ══════════════════════════════════ */}
        {!bookingMode && (
          <div className="space-y-6">
            {/* Upcoming */}
            <div>
              <h3 className="display-font text-lg font-semibold text-gray-800 mb-3">
                Upcoming <span className="text-blue-500">({upcomingAppointments.length})</span>
              </h3>
              {upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                  <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No upcoming appointments.</p>
                  <button onClick={() => setBookingMode(true)} className="mt-3 text-blue-500 text-sm font-medium hover:underline flex items-center gap-1 mx-auto">
                    Book one now <FaArrowRight className="text-xs" />
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {upcomingAppointments.map((app) => (
                    <div key={app._id} className="appt-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-in">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">{app.doctor?.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">Dr. {app.doctor?.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <FaCalendarAlt className="text-blue-400" />
                              {new Date(app.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <FaClock className="text-blue-400" />
                              {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-100 flex-shrink-0">
                          Upcoming
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {pastAppointments.length > 0 && (
              <div>
                <h3 className="display-font text-lg font-semibold text-gray-800 mb-3">
                  Past Visits <span className="text-gray-400">({pastAppointments.length})</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {pastAppointments.map((app) => (
                    <div key={app._id} className="appt-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 opacity-80 fade-in">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-500 font-bold">{app.doctor?.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700">Dr. {app.doctor?.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <FaCalendarAlt />
                              {new Date(app.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <FaClock />
                              {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          CONFIRMATION MODAL
      ══════════════════════════════════ */}
      {confirmation && (
        <div className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-5">
              <FaCalendarAlt className="text-blue-600 text-2xl" />
            </div>
            <h3 className="display-font text-xl font-semibold text-gray-800 text-center mb-5">Confirm Booking</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-500">Doctor</span>
                <span className="text-sm font-semibold text-gray-800">Dr. {confirmation.doctor.name}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-sm font-semibold text-gray-800">
                  {new Date(selectedDate).toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                <span className="text-sm text-blue-600">Time</span>
                <span className="text-sm font-bold text-blue-700">
                  {new Date(confirmation.slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmation(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}