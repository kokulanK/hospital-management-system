import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FaStar, FaCalendarAlt, FaClock, FaSearch, FaCheckCircle,
  FaTimesCircle, FaUserMd, FaArrowRight, FaEdit, FaTrash,
  FaInfoCircle, FaChevronDown, FaChevronUp, FaHistory
} from 'react-icons/fa';

export default function Appointments() {
  const { t } = useLanguage();
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
  const [fetchError, setFetchError] = useState('');
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Reschedule state
  const [rescheduling, setRescheduling] = useState(null);
  const [rescheduleNewDate, setRescheduleNewDate] = useState('');
  const [rescheduleNewSlot, setRescheduleNewSlot] = useState(null);
  const [availableSlotsForReschedule, setAvailableSlotsForReschedule] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

  // Live countdown state
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/appointments/doctors');
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const { data } = await api.get('/appointments/patient');
      setAppointments(data);
      setFetchError('');
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setFetchError(t.appointments?.loadError || 'Failed to load appointments.');
    } finally {
      setLoadingAppointments(false);
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

  const fetchRescheduleSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    setLoadingRescheduleSlots(true);
    try {
      const { data } = await api.get(`/availability/doctor/${doctorId}?date=${date}`);
      setAvailableSlotsForReschedule(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRescheduleSlots(false);
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
    try {
      await api.post('/appointments', {
        doctorId: confirmation.doctor._id,
        startTime: confirmation.slot.start
      });
      setBookingMessage('success:' + (t.appointments?.bookingSuccess || 'Appointment booked successfully!'));
      setConfirmation(null);
      await fetchAppointments();
      fetchSlots(confirmation.doctor._id, selectedDate);
    } catch (err) {
      setBookingMessage('error:' + (err.response?.data?.message || t.appointments?.bookingFailed || 'Booking failed.'));
    }
  };

  // Format countdown string
  const formatCountdown = (targetTime) => {
    const diff = targetTime - currentTime;
    if (diff <= 0) return 'Now';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d ${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Upcoming: only scheduled appointments in the future
  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date() && a.status === 'scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastAppointments = appointments
    .filter(a => new Date(a.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');

  const msgType = bookingMessage.startsWith('success:') ? 'success' : 'error';
  const msgText = bookingMessage.replace(/^(success:|error:)/, '');

  const handleCancel = async (id) => {
    if (!window.confirm(t.appointments?.cancelConfirm || 'Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      setBookingMessage('success:' + (t.appointments?.appointmentCancelled || 'Appointment cancelled.'));
      await fetchAppointments();
      if (selectedDoctor) {
        fetchSlots(selectedDoctor._id, selectedDate);
      }
    } catch (err) {
      setBookingMessage('error:' + (err.response?.data?.message || t.appointments?.cancelFailed || 'Cancellation failed.'));
    }
  };

  const handleReschedule = (appointment) => {
    setRescheduling(appointment);
    const today = new Date().toISOString().split('T')[0];
    setRescheduleNewDate(today);
    fetchRescheduleSlots(appointment.doctor._id, today);
  };

  const handleRescheduleConfirm = async () => {
    if (!rescheduling || !rescheduleNewSlot) return;
    try {
      await api.put(`/appointments/${rescheduling._id}/reschedule`, {
        newStartTime: rescheduleNewSlot.start
      });
      setBookingMessage('success:' + (t.appointments?.appointmentRescheduled || 'Appointment rescheduled.'));
      setRescheduling(null);
      setRescheduleNewSlot(null);
      await fetchAppointments();
      if (selectedDoctor) {
        fetchSlots(selectedDoctor._id, selectedDate);
      }
    } catch (err) {
      setBookingMessage('error:' + (err.response?.data?.message || t.appointments?.rescheduleFailed || 'Rescheduling failed.'));
    }
  };

  // Statistics for summary card
  const stats = {
    upcoming: upcomingAppointments.length,
    total: appointments.length,
    completed: pastAppointments.length,
    cancelled: cancelledAppointments.length
  };

  return (
    <DashboardLayout activePage="appointments">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .appt-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }

        .hero-appt {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }

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
        .slot-btn:hover {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: white;
          border-color: transparent;
          transform: scale(1.04);
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
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

        .fade-in { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .fade-in:nth-child(1) { animation-delay: 0.05s; }
        .fade-in:nth-child(2) { animation-delay: 0.12s; }
        .fade-in:nth-child(3) { animation-delay: 0.19s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .timer-pill { transition: all 0.2s; }
        .tooltip-disabled { position: relative; }
        .tooltip-disabled:hover::after {
          content: "Cannot reschedule within 24 hours of appointment";
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          white-space: nowrap;
          margin-bottom: 8px;
          z-index: 10;
        }
      `}</style>

      <div className="appt-root max-w-5xl mx-auto space-y-6 pb-10 px-4 sm:px-0">

        {/* Hero Section */}
        <div className="hero-appt rounded-2xl p-6 sm:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:280,height:280,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-60,right:-40,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:160,height:160,background:'radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)',bottom:-30,left:60,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{t.appointments?.heroBadge || 'EASY SCHEDULING'}</p>
            <h1 className="display-font text-2xl sm:text-3xl font-semibold mb-2">{t.appointments?.title || 'Appointments'}</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">{t.appointments?.subtitle || 'Book, reschedule, or manage your doctor visits'}</p>
          </div>
        </div>

        {/* Stats & User Guide Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <FaHistory className="text-blue-500" />
              <h3 className="display-font font-semibold text-gray-800">Appointment Summary</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Visits</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Cancelled</p>
                <p className="text-2xl font-bold text-red-500">{stats.cancelled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer" onClick={() => setShowUserGuide(!showUserGuide)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-violet-500" />
                <h3 className="display-font font-semibold text-gray-800">User Guide</h3>
              </div>
              {showUserGuide ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {showUserGuide && (
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p>📅 <strong>Step 1:</strong> Search for a doctor by name.</p>
                <p>🕒 <strong>Step 2:</strong> Pick a date and select an available time slot.</p>
                <p>✅ <strong>Step 3:</strong> Confirm your booking – you'll receive a confirmation.</p>
                <p>✏️ <strong>Step 4:</strong> View upcoming appointments to reschedule or cancel.</p>
                <p className="text-xs text-gray-400 mt-2">💡 Tip: You can reschedule up to 24 hours before the appointment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          <button className={`tab-btn ${bookingMode ? 'active' : 'inactive'}`} onClick={() => setBookingMode(true)}>
            <FaCalendarAlt className="inline mr-2 text-sm" />{t.appointments?.bookTab || 'Book Appointment'}
          </button>
          <button className={`tab-btn ${!bookingMode ? 'active' : 'inactive'}`} onClick={() => setBookingMode(false)}>
            <FaCheckCircle className="inline mr-2 text-sm" />{t.appointments?.myAppointmentsTab || 'My Appointments'}
          </button>
        </div>

        {/* Toast Message */}
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

        {/* BOOKING MODE */}
        {bookingMode && (
          // (unchanged booking section)
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="display-font text-lg font-semibold text-gray-800 mb-4">{t.appointments?.findDoctor || 'Find a Doctor'}</h3>
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder={t.appointments?.searchPlaceholder || "Doctor's name..."}
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

            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
                <FaUserMd className="text-gray-200 text-5xl mx-auto mb-3" />
                <p className="text-gray-400 text-sm">{t.appointments?.noDoctors || 'No doctors found.'}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {filteredDoctors.map((doc) => (
                  <div
                    key={doc._id}
                    className={`doctor-card bg-white rounded-2xl border border-gray-100 shadow-sm p-6 fade-in ${selectedDoctor?._id === doc._id ? 'selected' : ''}`}
                    onClick={() => handleDoctorSelect(doc)}
                  >
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
                          <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">{t.appointments?.selected || 'Selected'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        <FaClock className="inline mr-1" />{t.appointments?.availableSlots || 'Available Slots'}
                      </p>
                      {selectedDoctor?._id !== doc._id ? (
                        <p className="text-sm text-gray-400 italic">{t.appointments?.clickToSee || 'Click to see slots'}</p>
                      ) : loadingSlots ? (
                        <div className="grid grid-cols-3 gap-2">
                          {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="skeleton h-9 rounded-lg" />
                          ))}
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-sm text-gray-400">{t.appointments?.noSlots || 'No available slots on this day.'}</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {slots.map((slot, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); setConfirmation({ doctor: doc, slot }); }}
                              className="slot-btn text-gray-700"
                            >
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

        {/* MY APPOINTMENTS MODE */}
        {!bookingMode && (
          <div className="space-y-6">
            {fetchError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                {fetchError}
              </div>
            )}

            {/* Upcoming */}
            <div>
              <h3 className="display-font text-lg font-semibold text-gray-800 mb-3">
                {t.appointments?.upcomingAppointments || 'Upcoming Appointments'} <span className="text-blue-500">({upcomingAppointments.length})</span>
              </h3>
              {loadingAppointments ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1,2].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                  <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">{t.appointments?.noUpcoming || 'No upcoming appointments.'}</p>
                  <button onClick={() => setBookingMode(true)} className="mt-3 text-blue-500 text-sm font-medium hover:underline flex items-center gap-1 mx-auto">
                    {t.appointments?.bookNow || 'Book now'} <FaArrowRight className="text-xs" />
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {upcomingAppointments.map((app) => {
                    const appointmentTime = new Date(app.date).getTime();
                    const editDeadline = appointmentTime - 24 * 60 * 60 * 1000;
                    const canReschedule = editDeadline > currentTime; // more than 24h away

                    return (
                      <div key={app._id} className="appt-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-in">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold">{app.doctor?.name?.[0]?.toUpperCase() || 'D'}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">Dr. {app.doctor?.name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <FaCalendarAlt className="text-blue-400" />
                                {new Date(app.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <FaClock className="text-blue-400" />
                                {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {/* Two Countdown Timers */}
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <div className="timer-pill flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                                <FaClock className="text-blue-500 text-[10px]" />
                                <span className="text-xs text-gray-600">Appointment in:</span>
                                <span className="text-xs font-mono font-medium text-blue-700">
                                  {appointmentTime > currentTime
                                    ? formatCountdown(appointmentTime)
                                    : 'Started'}
                                </span>
                              </div>
                              <div className="timer-pill flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                                <FaClock className="text-amber-500 text-[10px]" />
                                <span className="text-xs text-gray-600">Reschedule window:</span>
                                <span className="text-xs font-mono font-medium text-amber-700">
                                  {canReschedule ? formatCountdown(editDeadline) + ' left' : 'Locked'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-100 flex-shrink-0">
                            {t.appointments?.upcoming || 'Upcoming'}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <div className={`${!canReschedule ? 'tooltip-disabled' : ''}`}>
                            <button
                              onClick={() => canReschedule && handleReschedule(app)}
                              disabled={!canReschedule}
                              className={`text-sm flex items-center gap-1 ${
                                canReschedule
                                  ? 'text-blue-500 hover:text-blue-700'
                                  : 'text-gray-300 cursor-not-allowed'
                              }`}
                              title={!canReschedule ? 'Cannot reschedule within 24 hours of appointment' : ''}
                            >
                              <FaEdit /> {t.appointments?.reschedule || 'Reschedule'}
                            </button>
                          </div>
                          <button
                            onClick={() => handleCancel(app._id)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                          >
                            <FaTrash /> {t.appointments?.cancelAppointment || 'Cancel'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Visits */}
            {pastAppointments.length > 0 && (
              <div>
                <h3 className="display-font text-lg font-semibold text-gray-800 mb-3">
                  {t.appointments?.pastVisits || 'Past Visits'} <span className="text-gray-400">({pastAppointments.length})</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {pastAppointments.map((app) => (
                    <div key={app._id} className="appt-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 opacity-80 fade-in">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-500 font-bold">{app.doctor?.name?.[0]?.toUpperCase() || 'D'}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700">Dr. {app.doctor?.name}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <FaCalendarAlt />
                              {new Date(app.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <FaClock />
                              {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0">
                          {t.appointments?.completed || 'Completed'}
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

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-5">
              <FaCalendarAlt className="text-blue-600 text-2xl" />
            </div>
            <h3 className="display-font text-xl font-semibold text-gray-800 text-center mb-5">{t.appointments?.confirmBooking || 'Confirm Booking'}</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-500">{t.appointments?.doctor || 'Doctor'}</span>
                <span className="text-sm font-semibold text-gray-800">Dr. {confirmation.doctor.name}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-sm text-gray-500">{t.appointments?.date || 'Date'}</span>
                <span className="text-sm font-semibold text-gray-800">
                  {new Date(selectedDate).toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                <span className="text-sm text-blue-600">{t.appointments?.time || 'Time'}</span>
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
                {t.common?.cancel || 'Cancel'}
              </button>
              <button
                onClick={handleBook}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition"
                style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}
              >
                {t.appointments?.confirm || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduling && (
        <div className="modal-overlay fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="display-font text-xl font-semibold text-gray-800 mb-4">{t.appointments?.rescheduleTitle || 'Reschedule Appointment'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.appointments?.selectNewDate || 'Select new date'}</label>
                <input
                  type="date"
                  value={rescheduleNewDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setRescheduleNewDate(e.target.value);
                    fetchRescheduleSlots(rescheduling.doctor._id, e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.appointments?.selectNewTime || 'Select new time'}</label>
                {loadingRescheduleSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3].map(i => <div key={i} className="skeleton h-9 rounded-lg" />)}
                  </div>
                ) : availableSlotsForReschedule.length === 0 ? (
                  <p className="text-gray-400 text-sm">{t.appointments?.noRescheduleSlots || 'No available slots on this day.'}</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlotsForReschedule.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setRescheduleNewSlot(slot)}
                        className={`slot-btn text-gray-700 ${rescheduleNewSlot?.start === slot.start ? 'bg-blue-500 text-white border-blue-500' : ''}`}
                      >
                        {new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setRescheduling(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600"
              >
                {t.common?.cancel || 'Cancel'}
              </button>
              <button
                onClick={handleRescheduleConfirm}
                disabled={!rescheduleNewSlot}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl disabled:opacity-50"
              >
                {t.appointments?.confirm || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}