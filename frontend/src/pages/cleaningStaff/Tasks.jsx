import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaClipboardList, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/cleaning-tasks/my');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/cleaning-tasks/${id}/complete`);
      setMessage('success:Task marked as completed');
      fetchTasks();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Failed to complete'));
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  const groupedByDate = tasks.reduce((acc, task) => {
    const date = new Date(task.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  return (
    <DashboardLayout activePage="tasks">
      <style>{`
        .hero-tasks {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .task-card { transition: transform 0.2s, box-shadow 0.2s; }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-tasks rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">My Cleaning Tasks</h1>
          <p className="text-blue-100 text-sm mt-2">View and update your assignments.</p>
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

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-3">{/* skeleton */}</div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaClipboardList className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No tasks assigned.</p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, tasks]) => (
            <div key={dateStr} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                <p className="text-sm font-semibold text-blue-700">{new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {tasks.map(task => (
                  <div key={task._id} className="task-card flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                        <FaClipboardList className="text-gray-500 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{task.area}</p>
                        <p className="text-xs text-gray-400">{task.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {task.status}
                      </span>
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleComplete(task._id)}
                          className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-emerald-600 transition"
                        >
                          Mark Complete
                        </button>
                      )}
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