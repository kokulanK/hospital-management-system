import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaFlask, FaPlus, FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle, FaDownload, FaEdit, FaTrash } from 'react-icons/fa';
import { getCorrectCloudinaryUrl, getPdfViewerUrl } from '../../utils/cloudinary';

export default function DoctorLabRequests() {
  const [requests, setRequests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    testType: '',
    description: ''
  });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ testType: '', description: '' });

  useEffect(() => {
    fetchRequests();
    fetchPatients();

    const interval = setInterval(() => {
      fetchRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/lab-requests/doctor');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/users/patients');
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await api.post('/lab-requests', formData);
      setMessage('success:Lab request created');
      setFormData({ patientId: '', testType: '', description: '' });
      setShowModal(false);
      fetchRequests();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Creation failed'));
    } finally {
      setSubmitting(false);
    }
  };

  // Edit handlers
  const handleEdit = (req) => {
    setEditingId(req._id);
    setEditData({ testType: req.testType, description: req.description || '' });
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/lab-requests/${id}`, editData);
      setMessage('success:Request updated');
      setEditingId(null);
      fetchRequests();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Update failed'));
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab request?')) return;
    try {
      await api.delete(`/lab-requests/${id}`);
      setMessage('success:Request deleted');
      fetchRequests();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Delete failed'));
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaClock /> Pending</span>;
      case 'accepted':
        return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaCheckCircle /> Accepted</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"><FaCheckCircle /> Completed</span>;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout activePage="labrequests">
      <style>{`
        .hero-labdoc {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .request-card { transition: transform 0.2s, box-shadow 0.2s; }
        .request-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .modal-animation { animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-labdoc rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Lab</p>
              <h1 className="display-font text-3xl font-semibold mb-2">Lab Requests</h1>
              <p className="text-blue-100 text-sm max-w-md leading-relaxed">
                Request lab tests for your patients and view results.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-xl font-medium flex items-center gap-2"
            >
              <FaPlus /> New Request
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

        {/* Requests List */}
        {loading ? (
          <div className="space-y-3"></div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaFlask className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No lab requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req._id} className="request-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {editingId === req._id ? (
                  // Edit mode
                  <div>
                    <input
                      type="text"
                      value={editData.testType}
                      onChange={(e) => setEditData({ ...editData, testType: e.target.value })}
                      className="border p-2 rounded w-full mb-2"
                      placeholder="Test Type"
                    />
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="border p-2 rounded w-full mb-2"
                      placeholder="Description"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(req._id)}
                        className="bg-blue-500 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-300 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">{req.patient?.name}</p>
                        <p className="text-sm text-gray-600 mt-1">Test: {req.testType}</p>
                        {req.description && <p className="text-xs text-gray-500 mt-1">{req.description}</p>}
                        {req.acceptedBy && (
                          <p className="text-xs text-gray-400 mt-2">
                            Accepted by: {req.acceptedBy.name} on {new Date(req.acceptedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(req.status)}

                        {/* Edit/Delete buttons (only for pending) */}
                        {req.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleEdit(req)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(req._id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}

                        {/* Completed result display */}
                        {req.status === 'completed' && req.resultFile && (
                          <div className="mt-3">
                            <a href={req.resultFile} target="_blank" rel="noopener noreferrer">
                              <img
                                src={req.resultFile}
                                alt="Lab result"
                                className="max-w-full max-h-48 rounded-lg border shadow-sm object-contain"
                              />
                            </a>
                            <a
                              href={req.resultFile}
                              download
                              className="text-gray-500 flex items-center gap-1 text-sm hover:underline mt-2"
                            >
                              <FaDownload /> Download
                            </a>
                          </div>
                        )}

                        {/* Result Text */}
                        {req.status === 'completed' && req.resultText && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="font-medium">Result:</p>
                            <p>{req.resultText}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="modal-animation bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="display-font text-xl font-semibold text-gray-800 mb-4">New Lab Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
                <select
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                >
                  <option value="">Select patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <input
                  type="text"
                  name="testType"
                  value={formData.testType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  placeholder="e.g., Blood Test, X-Ray"
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

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Request'}
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