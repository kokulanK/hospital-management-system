import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUserPlus, FaMicroscope, FaArrowRight, FaCheckCircle, FaClock } from 'react-icons/fa';

export default function DashboardReceptionist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Receptionist';
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchAppointments();
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

  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const stats = [
    { label: 'Total Appointments', value: appointments.length, icon: FaCalendarAlt, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Upcoming', value: upcomingAppointments.length, icon: FaClock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Unregistered Patients', value: '—', icon: FaUserPlus, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'AI Scans Today', value: 0, icon: FaMicroscope, color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  const quickActions = [
    {
      label: 'Book Appointment',
      desc: 'For registered or new patients',
      icon: FaCalendarAlt,
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-200',
      to: '/dashboard/receptionist/appointments',
    },
    {
      label: 'AI Skin Scanner',
      desc: 'Assist patients with scans',
      icon: FaMicroscope,
      color: 'from-violet-500 to-violet-600',
      shadow: 'shadow-violet-200',
      to: '/dashboard/receptionist/ai-scanner',
    },
    {
      label: 'Create Patient',
      desc: 'Register a new patient',
      icon: FaUserPlus,
      color: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-200',
      to: '/dashboard/receptionist/appointments?action=create',
    },
  ];

  return (
    <DashboardLayout activePage="home">
      <style>{`
        .hero-recep {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09); }
        .action-card { transition: transform 0.22s, box-shadow 0.22s; cursor: pointer; }
        .action-card:hover { transform: translateY(-4px) scale(1.01); }
        .appt-row { transition: background 0.15s; }
        .appt-row:hover { background: #f8faff; }
        .fade-in { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .fade-in:nth-child(1) { animation-delay: 0.05s; }
        .fade-in:nth-child(2) { animation-delay: 0.12s; }
        .fade-in:nth-child(3) { animation-delay: 0.19s; }
        .fade-in:nth-child(4) { animation-delay: 0.26s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 pb-10">

        {/* Hero */}
        <div className="hero-recep rounded-2xl p-7 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{getGreeting()}, Receptionist</p>
            <h1 className="display-font text-3xl md:text-4xl font-semibold mb-1">{firstName}</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Manage appointments, assist patients, and handle walk‑ins efficiently.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm fade-in">
              <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`${s.color} text-lg`} />
              </div>
              {loading ? (
                <div className="h-7 w-10 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="display-font text-xl font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {quickActions.map((a) => (
              <div
                key={a.label}
                onClick={() => navigate(a.to)}
                className={`action-card bg-gradient-to-br ${a.color} ${a.shadow} shadow-lg rounded-2xl p-6 text-white`}
              >
                <a.icon className="text-white/80 text-2xl mb-4" />
                <p className="font-semibold text-base mb-0.5">{a.label}</p>
                <p className="text-white/70 text-xs">{a.desc}</p>
                <div className="mt-4 flex items-center text-white/60 text-xs gap-1">
                  Go <FaArrowRight className="text-[10px]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="display-font text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
            <button
              onClick={() => navigate('/dashboard/receptionist/appointments')}
              className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:underline"
            >
              View all <FaArrowRight className="text-xs" />
            </button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No upcoming appointments.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcomingAppointments.map((app) => (
                <div key={app._id} className="appt-row flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">
                        {app.patient?.name?.[0]?.toUpperCase() || 'P'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{app.patient?.name}</p>
                      <p className="text-xs text-gray-400">Dr. {app.doctor?.name}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}