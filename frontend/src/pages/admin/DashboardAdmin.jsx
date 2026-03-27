import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaCalendarAlt, FaComment, FaArrowRight, FaUserMd, FaUserInjured, FaUserTie, FaFlask } from 'react-icons/fa';

export default function DashboardAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    patients: 0,
    appointments: 0,
    feedback: 0,
  });
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Admin';
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, appsRes, fbRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/appointments'),
        api.get('/admin/feedback'),
      ]);
      const users = usersRes.data;
      setStats({
        users: users.length,
        doctors: users.filter(u => u.role === 'doctor').length,
        patients: users.filter(u => u.role === 'patient').length,
        appointments: appsRes.data.length,
        feedback: fbRes.data.length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: FaUsers, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Doctors', value: stats.doctors, icon: FaUserMd, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Patients', value: stats.patients, icon: FaUserInjured, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: 'Appointments', value: stats.appointments, icon: FaCalendarAlt, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Feedback', value: stats.feedback, icon: FaComment, color: 'text-rose-500', bg: 'bg-rose-50' },
  ];

  const quickActions = [
    { label: 'Manage Users', desc: 'Create, edit, delete users', icon: FaUsers, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200', to: '/dashboard/admin/users' },
    { label: 'Appointments', desc: 'View and manage all', icon: FaCalendarAlt, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-200', to: '/dashboard/admin/appointments' },
    { label: 'Feedback', desc: 'Review and delete', icon: FaComment, color: 'from-rose-500 to-pink-500', shadow: 'shadow-rose-200', to: '/dashboard/admin/feedback' },
  ];

  return (
    <DashboardLayout activePage="home">
      <style>{`
        .hero-admin {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09); }
        .action-card { transition: transform 0.22s, box-shadow 0.22s; cursor: pointer; }
        .action-card:hover { transform: translateY(-4px) scale(1.01); }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-admin rounded-2xl p-7 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{getGreeting()}, Admin</p>
            <h1 className="display-font text-3xl md:text-4xl font-semibold mb-1">{firstName}</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Full control over users, appointments, and feedback.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
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
      </div>
    </DashboardLayout>
  );
}