import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaCalendarAlt, FaClock, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/admin/appointments');
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      setMessage('success:Appointment deleted');
      fetchAppointments();
    } catch (err) {
      setMessage('error:Delete failed');
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  const grouped = appointments.reduce((acc, app) => {
    const date = new Date(app.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(app);
    return acc;
  }, {});

  return (
    <DashboardLayout activePage="appointments">
      <style>{`
        .hero-admin-appts {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .appt-row { transition: background 0.15s; }
        .appt-row:hover { background: #f8faff; }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-admin-appts rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">All Appointments</h1>
          <p className="text-blue-100 text-sm mt-2">View and manage all appointments.</p>
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

        {/* List */}
        {loading ? (
          <div className="space-y-3">{/* skeleton */}</div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaCalendarAlt className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No appointments found.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateStr, apps]) => (
            <div key={dateStr} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                <p className="text-sm font-semibold text-blue-700">{new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {apps.map(app => (
                  <div key={app._id} className="appt-row flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-600 font-bold text-sm">{app.patient?.name?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{app.patient?.name}</p>
                        <p className="text-xs text-gray-400">Dr. {app.doctor?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
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
                      <button onClick={() => handleDelete(app._id)} className="text-red-400 hover:text-red-600">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}