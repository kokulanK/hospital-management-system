import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaUsers, FaEdit, FaTrash, FaPlus, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'patient'
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'patient' });
    setShowModal(true);
  };

  const openEdit = (user) => {
    // Do not allow editing admin accounts
    if (user.role === 'admin') {
      setMessage('error:Admin accounts cannot be edited.');
      return;
    }
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser._id}`, formData);
        setMessage('success:User updated');
      } else {
        await api.post('/admin/users', formData);
        setMessage('success:User created');
      }
      fetchUsers();
      setShowModal(false);
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Operation failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, userRole) => {
    if (userRole === 'admin') {
      setMessage('error:Admin accounts cannot be deleted.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  return (
    <DashboardLayout activePage="users">
      <style>{`
        .hero-users {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .user-row { transition: background 0.15s; }
        .user-row:hover { background: #f8faff; }
        .modal-animation { animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-users rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Management</p>
              <h1 className="display-font text-3xl font-semibold mb-2">Users</h1>
              <p className="text-blue-100 text-sm max-w-md leading-relaxed">
                Create, edit, or delete users across all roles.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="bg-white text-blue-600 px-4 py-2 rounded-xl font-medium flex items-center gap-2"
            >
              <FaPlus /> New User
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

        {/* User List */}
        {loading ? (
          <div className="space-y-3">{/* skeleton */}</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaUsers className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No users found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
              <div className="col-span-3">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-3">Actions</div>
            </div>
            <div className="divide-y divide-gray-50">
              {users.map(u => (
                <div key={u._id} className="grid grid-cols-12 gap-2 px-6 py-3 user-row items-center">
                  <div className="col-span-3 text-sm font-medium text-gray-800">{u.name}</div>
                  <div className="col-span-4 text-sm text-gray-600">{u.email}</div>
                  <div className="col-span-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      u.role === 'admin' ? 'bg-red-50 text-red-600' :
                      u.role === 'doctor' ? 'bg-blue-50 text-blue-600' :
                      u.role === 'patient' ? 'bg-emerald-50 text-emerald-600' :
                      u.role === 'receptionist' ? 'bg-amber-50 text-amber-600' :
                      u.role === 'cleaningStaff' ? 'bg-violet-50 text-violet-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role === 'cleaningStaff' ? 'Cleaning Staff' : u.role}
                    </span>
                  </div>
                  <div className="col-span-3 flex gap-2">
                    {u.role !== 'admin' && (
                      <>
                        <button onClick={() => openEdit(u)} className="text-blue-500 hover:text-blue-700">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(u._id, u.role)} className="text-red-500 hover:text-red-700">
                          <FaTrash />
                        </button>
                      </>
                    )}
                    {u.role === 'admin' && (
                      <span className="text-xs text-gray-400 italic">Protected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="modal-animation bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="display-font text-xl font-semibold text-gray-800 mb-4">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required={!editingUser}
                />
              </div>

              {/* Role field - shown only when creating a new user */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="labTechnician">Lab Technician</option>
                    <option value="cleaningStaff">Cleaning Staff</option>
                    {/* Admin option removed */}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update' : 'Create'}
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