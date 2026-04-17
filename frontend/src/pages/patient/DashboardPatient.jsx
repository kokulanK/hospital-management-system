import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt, FaMicroscope, FaComment, FaArrowRight,
  FaCheckCircle, FaClock, FaHeartbeat, FaBell, FaLightbulb
} from 'react-icons/fa';

export default function DashboardPatient() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [pastScans, setPastScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState('');
  const [tipLoading, setTipLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Patient';
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard?.goodMorning || 'Good morning';
    if (hour < 18) return t.dashboard?.goodAfternoon || 'Good afternoon';
    return t.dashboard?.goodEvening || 'Good evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, scansRes] = await Promise.allSettled([
          api.get('/appointments/patient'),
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
    .filter(a => new Date(a.date) >= new Date() && a.status === 'scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const pastAppointments = appointments.filter(a => new Date(a.date) < new Date() || a.status === 'completed');
  const completedCount = pastAppointments.length;

  const nextAppointment = upcomingAppointments[0];

  const quickActions = [
    { label: t.dashboard?.bookAppointment || 'Book Appointment', desc: t.dashboard?.bookDesc || 'Schedule a visit with a doctor', icon: FaCalendarAlt, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200', to: '/dashboard/patient/appointments' },
    { label: t.dashboard?.aiScanner || 'AI Scanner', desc: t.dashboard?.scannerDesc || 'Analyze skin conditions', icon: FaMicroscope, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-200', to: '/dashboard/patient/ai-scanner' },
    { label: t.dashboard?.feedback || 'Feedback', desc: t.dashboard?.feedbackDesc || 'Share your experience', icon: FaComment, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200', to: '/dashboard/patient/feedback' },
  ];

  const stats = [
    { label: t.dashboard?.statTotalAppointments || 'Total Appointments', value: appointments.length, icon: FaCalendarAlt, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: t.dashboard?.statUpcoming || 'Upcoming', value: upcomingAppointments.length, icon: FaClock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: t.dashboard?.statSkinScans || 'Skin Scans', value: pastScans.length, icon: FaMicroscope, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: t.dashboard?.statCompleted || 'Completed', value: completedCount, icon: FaCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <DashboardLayout activePage="home">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .dash-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }
        .hero-card { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%); position: relative; overflow: hidden; }
        .hero-card::before { content: ''; position: absolute; width: 320px; height: 320px; background: radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%); top: -60px; right: -60px; border-radius: 50%; }
        .hero-card::after { content: ''; position: absolute; width: 200px; height: 200px; background: radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%); bottom: -40px; left: 40px; border-radius: 50%; }
        .stat-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09); }
        .action-card { transition: transform 0.22s ease, box-shadow 0.22s ease; cursor: pointer; }
        .action-card:hover { transform: translateY(-4px) scale(1.01); }
        .appt-row { transition: background 0.15s; }
        .appt-row:hover { background: #f8faff; }
        .pulse-dot { animation: pulse-anim 2s infinite; }
        @keyframes pulse-anim { 0%,100%{ opacity: 1; } 50%{ opacity: 0.4; } }
        .fade-in { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .fade-in:nth-child(1) { animation-delay: 0.05s; }
        .fade-in:nth-child(2) { animation-delay: 0.12s; }
        .fade-in:nth-child(3) { animation-delay: 0.19s; }
        .fade-in:nth-child(4) { animation-delay: 0.26s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .tip-card {
          background: linear-gradient(135deg, #fef9c3 0%, #fde047 100%);
          border: 1px solid #facc15;
          box-shadow: 0 8px 20px rgba(250, 204, 21, 0.25);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .tip-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(250, 204, 21, 0.35);
        }
        @media (max-width: 640px) {
          .tip-card { padding: 1rem !important; }
          .tip-card .tip-content { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="dash-root max-w-6xl mx-auto space-y-6 pb-10">

        {/* Hero Banner */}
        <div className="hero-card rounded-2xl p-6 md:p-10 text-white relative">
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium tracking-widest uppercase mb-1">{getGreeting()}</p>
            <h1 className="display-font text-2xl md:text-4xl font-semibold mb-1">{firstName} <span className="italic font-light text-blue-200">👋</span></h1>
            <p className="text-blue-100 text-sm md:text-base max-w-md">{t.dashboard?.welcomeBack || 'Welcome back to your health hub'}</p>

            {nextAppointment ? (
              <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                <div>
                  <p className="text-xs text-blue-200">{t.dashboard?.nextAppointment || 'Next appointment'}</p>
                  <p className="text-sm font-semibold text-white">
                    Dr. {nextAppointment.doctor?.name} – {new Date(nextAppointment.date).toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' })} at {new Date(nextAppointment.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <FaBell className="text-blue-300 text-sm" />
                <p className="text-sm text-blue-100">{t.dashboard?.noUpcoming || 'No upcoming appointments'}</p>
              </div>
            )}
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center opacity-10">
            <div className="w-40 h-40 rounded-full border-4 border-white" />
            <div className="absolute w-24 h-24 rounded-full border-2 border-white" />
          </div>
        </div>

        {/* Health Tip Card - Now directly after hero */}
        {!tipLoading && tip && (
          <div className="tip-card rounded-xl p-5 transition-all duration-200 fade-in">
            <div className="flex items-start gap-3 tip-content">
              <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center flex-shrink-0 shadow-sm">
                <FaLightbulb className="text-amber-600 text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
                  <span className="text-base">✨</span> {t.dashboard?.healthTip || 'Health Tip'}
                </p>
                <p className="text-sm text-gray-800 mt-1 leading-relaxed font-medium break-words">{tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm fade-in">
              <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`${stat.color} text-lg`} />
              </div>
              {loading ? <div className="h-7 w-10 bg-gray-100 rounded animate-pulse mb-1" /> : <p className="text-2xl font-bold text-gray-800">{stat.value}</p>}
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="display-font text-xl font-semibold text-gray-800 mb-3">{t.dashboard?.quickActions || 'Quick Actions'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div key={action.label} onClick={() => navigate(action.to)} className={`action-card bg-gradient-to-br ${action.color} ${action.shadow} shadow-lg rounded-2xl p-6 text-white`}>
                <action.icon className="text-white/80 text-2xl mb-3" />
                <p className="font-semibold text-base mb-0.5">{action.label}</p>
                <p className="text-white/70 text-xs">{action.desc}</p>
                <div className="mt-3 flex items-center text-white/60 text-xs gap-1">{t.dashboard?.go || 'Go'} <FaArrowRight className="text-[10px]" /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="display-font text-lg font-semibold text-gray-800">{t.dashboard?.upcomingAppointments || 'Upcoming Appointments'}</h2>
            <button onClick={() => navigate('/dashboard/patient/appointments')} className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:underline">{t.dashboard?.viewAll || 'View all'} <FaArrowRight className="text-xs" /></button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1,2].map(i=><div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{t.dashboard?.noUpcoming || 'No upcoming appointments'}</p>
              <button onClick={() => navigate('/dashboard/patient/appointments')} className="mt-3 text-blue-500 text-sm font-medium hover:underline">{t.dashboard?.bookOneNow || 'Book one now'} →</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcomingAppointments.map((app) => (
                <div key={app._id} className="appt-row flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{app.doctor?.name?.[0]?.toUpperCase() || 'D'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Dr. {app.doctor?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(app.date).toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' })}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1"><FaCheckCircle className="text-[10px]" /> {new Date(app.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Skin Scans */}
        {!loading && pastScans.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="display-font text-lg font-semibold text-gray-800">{t.dashboard?.recentScans || 'Recent Skin Scans'}</h2>
              <button onClick={() => navigate('/dashboard/patient/ai-scanner')} className="text-violet-500 text-sm font-medium flex items-center gap-1 hover:underline">{t.dashboard?.viewAll || 'View all'} <FaArrowRight className="text-xs" /></button>
            </div>
            <div className="p-5 flex gap-4 overflow-x-auto">
              {pastScans.slice(0, 5).map((scan) => (
                <div key={scan._id} className="flex-shrink-0 w-28 group">
                  <div className="w-28 h-28 rounded-xl overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={scan.imageUrl} alt="Scan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 text-center">{new Date(scan.createdAt).toLocaleDateString([], { month:'short', day:'numeric' })}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}