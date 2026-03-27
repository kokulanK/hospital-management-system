import { useState, useEffect } from 'react';
import DashboardLayout from "./DashboardLayout";
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaStar, FaArrowRight, FaCheckCircle, FaUserInjured } from 'react-icons/fa';

export default function DashboardDoctor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Doctor';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, fbRes] = await Promise.allSettled([
          api.get('/appointments/doctor'),
          api.get('/feedback/doctor'),
        ]);
        if (appRes.status === 'fulfilled') setAppointments(appRes.value.data);
        if (fbRes.status === 'fulfilled') setFeedbacks(fbRes.value.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const upcoming = appointments
    .filter(a => a.status === 'scheduled' && new Date(a.startTime || a.date) >= new Date())
    .sort((a, b) => new Date(a.startTime || a.date) - new Date(b.startTime || b.date));

  const completed = appointments.filter(a => a.status === 'completed');
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  const quickActions = [
    { label: 'Manage Availability', desc: 'Set your open slots', icon: FaClock, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200', to: '/dashboard/doctor/availability' },
    { label: 'View Appointments', desc: 'See all scheduled visits', icon: FaCalendarAlt, color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-200', to: '/dashboard/doctor/appointments' },
    { label: 'Patient Feedback', desc: 'Read your reviews', icon: FaStar, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-200', to: '/dashboard/doctor/feedback' },
  ];

  const stats = [
    { label: 'Total Appointments', value: appointments.length, icon: FaCalendarAlt, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Upcoming', value: upcoming.length, icon: FaClock, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Completed', value: completed.length, icon: FaCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Avg Rating', value: avgRating, icon: FaStar, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <DashboardLayout activePage="home">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .doc-home { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }
        .hero-doc { background: linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1d4ed8 100%); }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09); }
        .action-card { transition: transform 0.22s, box-shadow 0.22s; cursor: pointer; }
        .action-card:hover { transform: translateY(-4px) scale(1.01); }
        .appt-row { transition: background 0.15s; }
        .appt-row:hover { background: #f8faff; }
        .fade-in { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .fade-in:nth-child(1){animation-delay:0.05s} .fade-in:nth-child(2){animation-delay:0.12s}
        .fade-in:nth-child(3){animation-delay:0.19s} .fade-in:nth-child(4){animation-delay:0.26s}
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .pulse-dot { animation: pulseAnim 2s infinite; }
        @keyframes pulseAnim { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .skeleton { background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="doc-home max-w-5xl mx-auto space-y-6 pb-10">

        {/* Hero */}
        <div className="hero-doc rounded-2xl p-7 md:p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:300,height:300,background:'radial-gradient(circle,rgba(96,165,250,0.18) 0%,transparent 70%)',top:-60,right:-50,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:180,height:180,background:'radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)',bottom:-40,left:40,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{getGreeting()}, Doctor</p>
            <h1 className="display-font text-3xl md:text-4xl font-semibold mb-1">
              Dr. {firstName} <span className="italic font-light text-blue-200">👨‍⚕️</span>
            </h1>
            <p className="text-blue-100 text-sm max-w-md mt-2 leading-relaxed">
              Here's your practice overview. Manage your schedule, review patients, and track your performance.
            </p>
            {upcoming[0] ? (
              <div className="mt-6 inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                <div>
                  <p className="text-xs text-blue-200">Next Patient</p>
                  <p className="text-sm font-semibold text-white">
                    {upcoming[0].patient?.name} &mdash;{' '}
                    {new Date(upcoming[0].startTime || upcoming[0].date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}{' '}
                    at {new Date(upcoming[0].startTime || upcoming[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                <FaCalendarAlt className="text-blue-300 text-sm" />
                <p className="text-sm text-blue-100">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm fade-in">
              <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`${s.color} text-lg`} />
              </div>
              {loading ? <div className="h-7 w-10 skeleton rounded mb-1" /> : <p className="text-2xl font-bold text-gray-800">{s.value}</p>}
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="display-font text-xl font-semibold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {quickActions.map(a => (
              <div key={a.label} onClick={() => navigate(a.to)}
                className={`action-card bg-gradient-to-br ${a.color} ${a.shadow} shadow-lg rounded-2xl p-6 text-white`}>
                <a.icon className="text-white/80 text-2xl mb-4" />
                <p className="font-semibold text-base mb-0.5">{a.label}</p>
                <p className="text-white/70 text-xs">{a.desc}</p>
                <div className="mt-4 flex items-center text-white/60 text-xs gap-1">Go <FaArrowRight className="text-[10px]" /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="display-font text-lg font-semibold text-gray-800">Upcoming Patients</h2>
            <button onClick={() => navigate('/dashboard/doctor/appointments')}
              className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:underline">
              View all <FaArrowRight className="text-xs" />
            </button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">{[1,2].map(i => <div key={i} className="h-12 skeleton rounded-xl" />)}</div>
          ) : upcoming.length === 0 ? (
            <div className="p-8 text-center">
              <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No upcoming appointments. Update your availability.</p>
              <button onClick={() => navigate('/dashboard/doctor/availability')}
                className="mt-3 text-blue-500 text-sm font-medium hover:underline">Set availability →</button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcoming.slice(0, 4).map(app => (
                <div key={app._id} className="appt-row flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                      <span className="text-violet-600 font-bold text-sm">{app.patient?.name?.[0]?.toUpperCase() || 'P'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{app.patient?.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(app.startTime || app.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-3 py-1 rounded-full border border-emerald-100">
                    {new Date(app.startTime || app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent feedback */}
        {!loading && feedbacks.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h2 className="display-font text-lg font-semibold text-gray-800">Recent Reviews</h2>
              <button onClick={() => navigate('/dashboard/doctor/feedback')}
                className="text-amber-500 text-sm font-medium flex items-center gap-1 hover:underline">
                View all <FaArrowRight className="text-xs" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {feedbacks.slice(0, 3).map(fb => (
                <div key={fb._id} className="appt-row px-6 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-700">{fb.patient?.name || 'Anonymous Patient'}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(n => <FaStar key={n} className={`text-xs ${n <= fb.rating ? 'text-amber-400' : 'text-gray-200'}`} />)}
                    </div>
                  </div>
                  {fb.comment && <p className="text-xs text-gray-500 italic">"{fb.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}