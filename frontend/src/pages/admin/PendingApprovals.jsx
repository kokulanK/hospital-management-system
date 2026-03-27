// frontend/src/pages/admin/PendingApprovals.jsx
import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaCheckCircle, FaTimesCircle, FaUserClock } from 'react-icons/fa';

export default function PendingApprovals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const { data } = await api.get('/admin/pending-users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/approve-user/${id}`);
      setMessage('success:User approved');
      fetchPending();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Approval failed'));
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/admin/reject-user/${id}`);
      setMessage('success:User rejected');
      fetchPending();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Rejection failed'));
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  return (
    <DashboardLayout activePage="pending">
      <style>{`
        .hero-pending {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .user-row { transition: background 0.15s; }
        .user-row:hover { background: #f8faff; }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-pending rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">Pending Approvals</h1>
          <p className="text-blue-100 text-sm mt-2">Review and approve new registrations.</p>
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
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaUserClock className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No pending approvals.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
              <div className="col-span-4">Name</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Actions</div>
            </div>
            <div className="divide-y divide-gray-50">
              {users.map(u => (
                <div key={u._id} className="grid grid-cols-12 gap-2 px-6 py-3 user-row items-center">
                  <div className="col-span-4 text-sm font-medium text-gray-800">{u.name}</div>
                  <div className="col-span-4 text-sm text-gray-600">{u.email}</div>
                  <div className="col-span-2 text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      u.role === 'admin' ? 'bg-red-50 text-red-600' :
                      u.role === 'doctor' ? 'bg-blue-50 text-blue-600' :
                      u.role === 'receptionist' ? 'bg-amber-50 text-amber-600' :
                      u.role === 'labTechnician' ? 'bg-violet-50 text-violet-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <button onClick={() => handleApprove(u._id)} className="text-green-500 hover:text-green-700" title="Approve">
                      <FaCheckCircle size={18} />
                    </button>
                    <button onClick={() => handleReject(u._id)} className="text-red-500 hover:text-red-700" title="Reject">
                      <FaTimesCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}