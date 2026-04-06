import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt, FaMicroscope, FaComment, FaArrowRight,
  FaCheckCircle, FaClock, FaHeartbeat, FaBell, FaLightbulb  // ✅ added FaLightbulb
} from 'react-icons/fa';

export default function DashboardPatient() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [pastScans, setPastScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState('');           // ✅ NEW
  const [tipLoading, setTipLoading] = useState(true); // ✅ NEW

  const firstName = user?.name?.split(' ')[0] || 'Patient';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, scansRes] = await Promise.allSettled([
          api.get('/appointments/my'),
          api.get('/skin-images'),
        ]);
        if (appRes.status === 'fulfilled') setAppointments(appRes.value.data);
        if (scansRes.status === 'fulfilled') setPastScans(scansRes.value.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // ✅ NEW: fetch personalized tip
    const fetchTip = async () => {
      try {
        const { data } = await api.get('/patient/tip');
        setTip(data.tip);
      } catch (err) {
        console.error('Failed to load health tip');
      } finally {
        setTipLoading(false);
      }
    };
    fetchTip();
  }, []);

  const upcomingAppointments = appointments
    .filter(a => new Date(a.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 3);

  const nextAppointment = upcomingAppointments[0];

  const quickActions = [
    {
      label: 'Book Appointment',
      desc: 'Schedule with a specialist',
      icon: FaCalendarAlt,
      color: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-200',
      to: '/dashboard/patient/appointments',
    },
    {
      label: 'AI Skin Scanner',
      desc: 'Analyze your skin condition',
      icon: FaMicroscope,
      color: 'from-violet-500 to-violet-600',
      shadow: 'shadow-violet-200',
      to: '/dashboard/patient/ai-scanner',
    },
    {
      label: 'Leave Feedback',
      desc: 'Rate your experience',
      icon: FaComment,
      color: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-200',
      to: '/dashboard/patient/feedback',
    },
  ];

  const stats = [
    {
      label: 'Total Appointments',
      value: appointments.length,
      icon: FaCalendarAlt,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Upcoming',
      value: upcomingAppointments.length,
      icon: FaClock,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Skin Scans',
      value: pastScans.length,
      icon: FaMicroscope,
      color: 'text-violet-500',
      bg: 'bg-violet-50',
    },
    {
      label: 'Health Score',
      value: '92%',
      icon: FaHeartbeat,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <DashboardLayout activePage="home">
      <style>{` ... (keep existing styles) `}</style>

      <div className="dash-root max-w-5xl mx-auto space-y-6 pb-10">

        {/* Hero Banner (unchanged) */}
        <div className="hero-card rounded-2xl p-7 md:p-10 text-white relative">
          {/* ... existing hero content ... */}
        </div>

        {/* ── Stats Row (unchanged) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm fade-in">
              <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`${stat.color} text-lg`} />
              </div>
              {loading ? (
                <div className="h-7 w-10 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ✅ NEW: Personalized Health Tip Card */}
        {!tipLoading && tip && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 shadow-sm fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FaLightbulb className="text-blue-600 text-lg" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">✨ Personalized Health Tip</p>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick Actions (unchanged) ── */}
        <div>
          <h2 className="display-font text-xl font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.label}
                onClick={() => navigate(action.to)}
                className={`action-card bg-gradient-to-br ${action.color} ${action.shadow} shadow-lg rounded-2xl p-6 text-white`}
              >
                <action.icon className="text-white/80 text-2xl mb-4" />
                <p className="font-semibold text-base mb-0.5">{action.label}</p>
                <p className="text-white/70 text-xs">{action.desc}</p>
                <div className="mt-4 flex items-center text-white/60 text-xs gap-1">
                  Go <FaArrowRight className="text-[10px]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Upcoming Appointments (unchanged) ── */}
        {/* ... existing upcoming appointments block ... */}

        {/* ── Recent Scans (unchanged) ── */}
        {/* ... existing scans block ... */}

      </div>
    </DashboardLayout>
  );
}