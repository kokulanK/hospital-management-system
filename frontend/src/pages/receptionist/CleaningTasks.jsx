import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaBroom, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function CleaningTasks() {
  const [tasks, setTasks] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    assignedTo: '',
    area: '',
    date: '',
    description: '',
    status: 'pending'
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchStaff();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/cleaning-tasks');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const { data } = await api.get('/users/cleaning-staff');
      setStaffList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      assignedTo: '',
      area: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      status: 'pending'
    });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      assignedTo: task.assignedTo?._id || '',
      area: task.area,
      date: new Date(task.date).toISOString().split('T')[0],
      description: task.description || '',
      status: task.status
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      if (editingTask) {
        await api.put(`/cleaning-tasks/${editingTask._id}`, formData);
        setMessage('success:Task updated');
      } else {
        await api.post('/cleaning-tasks', formData);
        setMessage('success:Task created');
      }
      fetchTasks();
      setShowModal(false);
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Operation failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/cleaning-tasks/${id}`);
      setMessage('success:Task deleted');
      fetchTasks();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Delete failed'));
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  // Group tasks by date
  const grouped = tasks.reduce((acc, task) => {
    const date = new Date(task.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  return (
    <DashboardLayout activePage="cleaning">
      <style>{`
        .hero-cleaning {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .task-card { transition: transform 0.2s, box-shadow 0.2s; }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .modal-animation { animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-cleaning rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Housekeeping</p>
              <h1 className="display-font text-3xl font-semibold mb-2">Cleaning Tasks</h1>
              <p className="text-blue-100 text-sm max-w-md leading-relaxed">
                Assign and manage cleaning tasks for staff.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-white text-blue-600 px-4 py-2 rounded-xl font-medium flex items-center gap-2"
            >
              <FaPlus /> New Task
            </button>
          </div>
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
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaBroom className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No cleaning tasks yet.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateStr, tasks]) => (
            <div key={dateStr} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                <p className="text-sm font-semibold text-blue-700">
                  {new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="divide-y divide-gray-50">
                {tasks.map(task => (
                  <div key={task._id} className="task-card p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <FaBroom className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{task.area}</p>
                            <p className="text-xs text-gray-500">
                              Assigned to: {task.assignedTo?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                        {task.description && (
                          <p className="mt-2 text-sm text-gray-600 ml-13">{task.description}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {task.status}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(task)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(task._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="modal-animation bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="display-font text-xl font-semibold text-gray-800 mb-4">
              {editingTask ? 'Edit Task' : 'New Cleaning Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                >
                  <option value="">Select staff</option>
                  {staffList.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  placeholder="e.g., Ward 3, Reception"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  placeholder="Additional details..."
                />
              </div>
              {editingTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingTask ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}