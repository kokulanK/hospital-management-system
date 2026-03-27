import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaComment, FaStar, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data } = await api.get('/admin/feedback');
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await api.delete(`/admin/feedback/${id}`);
      setMessage('success:Feedback deleted');
      fetchFeedbacks();
    } catch (err) {
      setMessage('error:Delete failed');
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <DashboardLayout activePage="feedback">
      <style>{`
        .hero-admin-fb {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .fb-card { transition: transform 0.2s, box-shadow 0.2s; }
        .fb-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-admin-fb rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">All Feedback</h1>
          <p className="text-blue-100 text-sm mt-2">Manage patient feedback.</p>
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
        ) : feedbacks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaComment className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No feedback found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map(fb => (
              <div key={fb._id} className="fb-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="text-amber-600 font-bold text-sm">{fb.patient?.name?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{fb.patient?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(fb.appointment?.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(fb._id)} className="text-red-400 hover:text-red-600">
                    <FaTrash />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {[1,2,3,4,5].map(n => (
                    <FaStar key={n} className={`text-sm ${n <= fb.rating ? 'text-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {ratingLabels[fb.rating]}
                  </span>
                </div>
                {fb.comment && (
                  <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                    "{fb.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}