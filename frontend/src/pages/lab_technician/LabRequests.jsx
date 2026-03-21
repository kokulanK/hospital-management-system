import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaFlask, FaCheckCircle, FaTimesCircle, FaUpload, FaFileAlt } from 'react-icons/fa';

export default function LabRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [resultText, setResultText] = useState('');
  const [resultFile, setResultFile] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/lab-requests/lab');
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await api.put(`/lab-requests/${id}/accept`);
      setMessage('success:Request accepted');
      fetchRequests();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Accept failed'));
    }
  };

  const handleComplete = async (id) => {
    if (!resultText && !resultFile) {
      setMessage('error:Please provide result text or file');
      return;
    }
    setUploadingId(id);

    const formData = new FormData();
    if (resultFile) formData.append('resultFile', resultFile);
    if (resultText) formData.append('resultText', resultText);

    try {
      await api.put(`/lab-requests/${id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('success:Result uploaded');
      setResultText('');
      setResultFile(null);
      fetchRequests();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Upload failed'));
    } finally {
      setUploadingId(null);
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  return (
    <DashboardLayout activePage="requests">
      <style>{`
        .hero-requests {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .request-card { transition: transform 0.2s, box-shadow 0.2s; }
        .request-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-requests rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">Lab Requests</h1>
          <p className="text-blue-100 text-sm mt-2">Manage pending and accepted lab requests.</p>
        </div>

        {/* Toast */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            msgType === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {msgType === 'success' ? (
              <FaCheckCircle className="text-emerald-500" />
            ) : (
              <FaTimesCircle className="text-red-400" />
            )}
            <p className="text-sm font-medium">{msgText}</p>
            <button
              onClick={() => setMessage('')}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3"></div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaFlask className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No lab requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req._id} className="request-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{req.patient?.name}</p>
                    <p className="text-sm text-gray-600">Test: {req.testType}</p>
                    <p className="text-xs text-gray-400">Doctor: {req.doctor?.name}</p>
                    {req.description && (
                      <p className="text-xs text-gray-500 mt-1">{req.description}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.status === 'pending'
                      ? 'bg-amber-50 text-amber-600'
                      : req.status === 'accepted'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {req.status}
                  </span>
                </div>

                {req.status === 'pending' && (
                  <button
                    onClick={() => handleAccept(req._id)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition"
                  >
                    Accept Request
                  </button>
                )}

                {req.status === 'accepted' && (
                  <div className="mt-4 space-y-3">
                    <textarea
                      placeholder="Enter result text"
                      value={resultText}
                      onChange={(e) => setResultText(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                      rows="3"
                    />

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-xl text-sm">
                        <FaUpload /> Upload File
                        <input
                          type="file"
                          accept="image/*"   // ✅ Updated here
                          className="hidden"
                          onChange={(e) => setResultFile(e.target.files[0])}
                        />
                      </label>
                      {resultFile && (
                        <span className="text-xs text-gray-500">{resultFile.name}</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleComplete(req._id)}
                      disabled={uploadingId === req._id}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {uploadingId === req._id ? 'Uploading...' : 'Complete & Upload'}
                    </button>
                  </div>
                )}

                {req.status === 'completed' && (
                  <>
                    {req.resultFile && (
                      <div className="mt-4 text-sm text-gray-600">
                        <a
                          href={req.resultFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 flex items-center gap-1"
                        >
                          <FaFileAlt /> View Result File
                        </a>
                      </div>
                    )}

                    {req.resultText && (
                      <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p className="font-medium">Result:</p>
                        <p>{req.resultText}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}