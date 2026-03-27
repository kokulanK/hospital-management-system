import { useState, useEffect } from 'react';
import DashboardLayout from "./DashboardLayout";
import api from '../../api/axios';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaUserInjured, FaArrowRight } from 'react-icons/fa';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/doctor');
      setAppointments(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch { alert('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  const filtered = filter === 'all' ? appointments
    : appointments.filter(a => a.status === filter);

  const counts = {
    all: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const statusConfig = {
    scheduled: { label: 'Scheduled', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100' },
  };

  return (
    <DashboardLayout activePage="appointments">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .appts-root { font-family:'DM Sans',sans-serif; }
        .display-font { font-family:'Fraunces',serif; }
        .hero-appts { background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1d4ed8 100%); }
        .filter-btn { padding:8px 18px;border-radius:10px;font-size:0.85rem;font-weight:500;cursor:pointer;border:1.5px solid #e5e7eb;background:white;color:#6b7280;transition:all 0.15s;font-family:'DM Sans',sans-serif; }
        .filter-btn.active { background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:white;border-color:transparent;box-shadow:0 4px 12px rgba(59,130,246,0.3); }
        .filter-btn:hover:not(.active) { background:#f9fafb; }
        .apt-card { transition:transform 0.2s,box-shadow 0.2s; }
        .apt-card:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.08); }
        .action-btn { padding:7px 14px;border-radius:9px;font-size:0.8rem;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;font-family:'DM Sans',sans-serif; }
        .btn-complete { background:#dcfce7;color:#16a34a; }
        .btn-complete:hover { background:#bbf7d0; }
        .btn-cancel { background:#fee2e2;color:#dc2626; }
        .btn-cancel:hover { background:#fecaca; }
        .skeleton { background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.4s infinite; }
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .fade-in{animation:fadeUp 0.4s ease forwards;opacity:0;}
        .fade-in:nth-child(1){animation-delay:0.05s}.fade-in:nth-child(2){animation-delay:0.1s}.fade-in:nth-child(3){animation-delay:0.15s}.fade-in:nth-child(4){animation-delay:0.2s}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="appts-root max-w-4xl mx-auto space-y-6 pb-10">

        {/* Hero */}
        <div className="hero-appts rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:260,height:260,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-50,right:-40,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Your Practice</p>
            <h1 className="display-font text-3xl font-semibold mb-2">My Appointments</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">Review and manage all your patient appointments in one place.</p>
            <div className="mt-5 flex gap-3 flex-wrap">
              {[
                { label: 'Scheduled', val: counts.scheduled, color: 'text-blue-200' },
                { label: 'Completed', val: counts.completed, color: 'text-emerald-300' },
                { label: 'Cancelled', val: counts.cancelled, color: 'text-red-300' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm">
                  <span className={`${s.color} text-xs block`}>{s.label}</span>
                  <span className="font-semibold">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all','scheduled','completed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`filter-btn ${filter === f ? 'active' : ''}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No {filter !== 'all' ? filter : ''} appointments found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(apt => {
              const cfg = statusConfig[apt.status] || statusConfig.scheduled;
              const dt = new Date(apt.startTime || apt.date);
              return (
                <div key={apt._id} className="apt-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4 flex-wrap fade-in">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-violet-600 font-bold">{apt.patient?.name?.[0]?.toUpperCase() || 'P'}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{apt.patient?.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <FaCalendarAlt className="text-blue-300" />
                          {dt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <FaClock className="text-blue-300" />
                          {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                    {apt.status === 'scheduled' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(apt._id, 'completed')}
                          disabled={updatingId === apt._id}
                          className="action-btn btn-complete flex items-center gap-1"
                        >
                          <FaCheckCircle className="text-xs" /> Complete
                        </button>
                        <button
                          onClick={() => handleStatusChange(apt._id, 'cancelled')}
                          disabled={updatingId === apt._id}
                          className="action-btn btn-cancel flex items-center gap-1"
                        >
                          <FaTimesCircle className="text-xs" /> Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}