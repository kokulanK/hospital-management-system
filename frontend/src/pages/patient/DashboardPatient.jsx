import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt, FaMicroscope, FaComment, FaArrowRight,
  FaCheckCircle, FaClock, FaHeartbeat, FaBell, FaLightbulb
} from 'react-icons/fa';

export default function DashboardPatient() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [pastScans, setPastScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tip, setTip] = useState('');
  const [tipLoading, setTipLoading] = useState(true);

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

  const nextAppointment = upcomingAppointments[0];

  const quickActions = [
    { label: 'Book Appointment', desc: 'Schedule with a specialist', icon: FaCalendarAlt, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200', to: '/dashboard/patient/appointments' },
    { label: 'AI Skin Scanner', desc: 'Analyze your skin condition', icon: FaMicroscope, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-200', to: '/dashboard/patient/ai-scanner' },
    { label: 'Leave Feedback', desc: 'Rate your experience', icon: FaComment, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200', to: '/dashboard/patient/feedback' },
  ];

  const stats = [
    { label: 'Total Appointments', value: appointments.length, icon: FaCalendarAlt, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Upcoming', value: upcomingAppointments.length, icon: FaClock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Skin Scans', value: pastScans.length, icon: FaMicroscope, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Health Score', value: '92%', icon: FaHeartbeat, color: 'text-emerald-500', bg: 'bg-emerald-50' },
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
      `}</style>

      <div className="dash-root max-w-5xl mx-auto space-y-5 pb-8">

        {/* Hero Banner – compact padding */}
        <div className="hero-card rounded-2xl p-6 md:p-8 text-white relative">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-0.5">{getGreeting()}</p>
            <h1 className="display-font text-2xl md:text-3xl font-semibold mb-0.5">{firstName} <span className="italic font-light text-blue-200">👋</span></h1>
            <p className="text-blue-100 text-sm max-w-md">Your health summary – appointments, scans & insights.</p>

            {nextAppointment ? (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                <div>
                  <p className="text-xs text-blue-200">Next Appointment</p>
                  <p className="text-sm font-semibold text-white">
                    Dr. {nextAppointment.doctor?.name} – {new Date(nextAppointment.date).toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' })} at {new Date(nextAppointment.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                <FaBell className="text-blue-300 text-xs" />
                <p className="text-sm text-blue-100">No upcoming appointments</p>
              </div>
            )}
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center opacity-10">
            <div className="w-32 h-32 rounded-full border-4 border-white" />
            <div className="absolute w-20 h-20 rounded-full border-2 border-white" />
          </div>
        </div>

        {/* Stats Row – tighter gap */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card bg-white rounded-xl p-3 border border-gray-100 shadow-sm fade-in">
              <div className={`${stat.bg} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
                <stat.icon className={`${stat.color} text-sm`} />
              </div>
              {loading ? <div className="h-6 w-8 bg-gray-100 rounded animate-pulse mb-0.5" /> : <p className="text-xl font-bold text-gray-800">{stat.value}</p>}
              <p className="text-[11px] text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Personalized Health Tip Card – compact */}
        {!tipLoading && tip && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100 shadow-sm fade-in">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FaLightbulb className="text-blue-600 text-sm" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">✨ Personalized Health Tip</p>
                <p className="text-xs text-gray-700 leading-relaxed">{tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions – tighter cards */}
        <div>
          <h2 className="display-font text-lg font-semibold text-gray-800 mb-2">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <div key={action.label} onClick={() => navigate(action.to)} className={`action-card bg-gradient-to-br ${action.color} ${action.shadow} shadow-md rounded-xl p-4 text-white`}>
                <action.icon className="text-white/80 text-xl mb-2" />
                <p className="font-semibold text-sm mb-0.5">{action.label}</p>
                <p className="text-white/70 text-[11px]">{action.desc}</p>
                <div className="mt-2 flex items-center text-white/60 text-[10px] gap-1">Go <FaArrowRight className="text-[8px]" /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments – tighter spacing */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
            <h2 className="display-font text-base font-semibold text-gray-800">Upcoming Appointments</h2>
            <button onClick={() => navigate('/dashboard/patient/appointments')} className="text-blue-500 text-xs font-medium flex items-center gap-0.5 hover:underline">View all <FaArrowRight className="text-[9px]" /></button>
          </div>
          {loading ? (
            <div className="p-4 space-y-2">{[1,2].map(i=><div key={i} className="h-10 bg-gray-50 rounded-lg animate-pulse" />)}</div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="p-6 text-center">
              <FaCalendarAlt className="text-gray-200 text-3xl mx-auto mb-2" />
              <p className="text-gray-400 text-xs">No upcoming appointments.</p>
              <button onClick={() => navigate('/dashboard/patient/appointments')} className="mt-2 text-blue-500 text-xs font-medium hover:underline">Book one now →</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcomingAppointments.map((app) => (
                <div key={app._id} className="appt-row flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{app.doctor?.name?.[0]?.toUpperCase() || 'D'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Dr. {app.doctor?.name}</p>
                      <p className="text-[11px] text-gray-400">{new Date(app.date).toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' })}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5"><FaCheckCircle className="text-[9px]" /> {new Date(app.date).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Skin Scans – tighter */}
        {!loading && pastScans.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
              <h2 className="display-font text-base font-semibold text-gray-800">Recent Skin Scans</h2>
              <button onClick={() => navigate('/dashboard/patient/ai-scanner')} className="text-violet-500 text-xs font-medium flex items-center gap-0.5 hover:underline">View all <FaArrowRight className="text-[9px]" /></button>
            </div>
            <div className="p-3 flex gap-3 overflow-x-auto">
              {pastScans.slice(0, 5).map((scan) => (
                <div key={scan._id} className="flex-shrink-0 w-24 group">
                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={scan.imageUrl} alt="Scan" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 text-center">{new Date(scan.createdAt).toLocaleDateString([], { month:'short', day:'numeric' })}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}