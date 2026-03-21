import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaBox, FaCheckCircle, FaTimesCircle, FaClock, FaCheck } from 'react-icons/fa';

export default function AdminSupplyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/supply-requests');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/supply-requests/${id}`, { status: newStatus });
      setMessage('success:Status updated');
      fetchRequests();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Update failed'));
    } finally {
      setUpdatingId(null);
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaClock /> Pending</span>;
      case 'approved': return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaCheckCircle /> Approved</span>;
      case 'delivered': return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaCheckCircle /> Delivered</span>;
      default: return null;
    }
  };

  return (
    <DashboardLayout activePage="supplies">
      <style>{`
        .hero-admin-supplies {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .request-card { transition: transform 0.2s, box-shadow 0.2s; }
        .request-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-admin-supplies rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">Supply Requests</h1>
          <p className="text-blue-100 text-sm mt-2">Manage cleaning staff supply requests.</p>
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

        {/* Requests List */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaBox className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No supply requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req._id} className="request-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <FaBox className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{req.itemName}</p>
                        <p className="text-xs text-gray-500">by {req.staff?.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Quantity: {req.quantity}</p>
                    {req.notes && <p className="text-xs text-gray-500 mt-1">Note: {req.notes}</p>}
                    <p className="text-xs text-gray-400 mt-2">
                      Requested: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(req.status)}
                    <div className="flex gap-2">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'approved')}
                          disabled={updatingId === req._id}
                          className="bg-blue-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-600 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {req.status === 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(req._id, 'delivered')}
                          disabled={updatingId === req._id}
                          className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-emerald-600 disabled:opacity-50"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}