import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaCheckCircle, FaClock, FaArrowRight } from 'react-icons/fa';

export default function DashboardCleaningStaff() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Staff';
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

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

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const stats = [
    { label: 'Pending Tasks', value: pendingTasks.length, icon: FaClock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Completed', value: completedTasks.length, icon: FaCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const todayTasks = tasks.filter(t => {
    const taskDate = new Date(t.date).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  });

  return (
    <DashboardLayout activePage="home">
      <style>{`
        .hero-clean {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,0,0,0.09); }
        .task-row { transition: background 0.15s; }
        .task-row:hover { background: #f8faff; }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-clean rounded-2xl p-7 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{getGreeting()}, Cleaning Staff</p>
            <h1 className="display-font text-3xl md:text-4xl font-semibold mb-1">{firstName}</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              View and manage your assigned cleaning tasks.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className={`${s.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`${s.color} text-lg`} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="display-font text-lg font-semibold text-gray-800">Today's Tasks</h2>
            <button
              onClick={() => navigate('/dashboard/cleaning/tasks')}
              className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:underline"
            >
              View all <FaArrowRight className="text-xs" />
            </button>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[1,2].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="p-8 text-center">
              <FaClipboardList className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No tasks scheduled for today.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {todayTasks.slice(0, 5).map(task => (
                <div key={task._id} className="task-row flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{task.area}</p>
                    <p className="text-xs text-gray-400">{task.description || 'No description'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {task.status}
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