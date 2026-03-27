import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import {
  FaFlask, FaCheckCircle, FaTimesCircle, FaUpload, FaFileAlt,
  FaDownload, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner, FaFilePdf
} from 'react-icons/fa';
import { getCorrectCloudinaryUrl, getPdfViewerUrl } from '../../utils/cloudinary';

export default function LabRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [uploadingId, setUploadingId] = useState(null);
  const [resultText, setResultText] = useState('');
  const [resultFile, setResultFile] = useState(null);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editResultText, setEditResultText] = useState('');
  const [editResultFile, setEditResultFile] = useState(null);
  const [editTestType, setEditTestType] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/lab-requests/lab');
      setRequests(data);
    } catch (err) {
      console.error(err);
      setMessage('error:Failed to fetch requests');
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
      const { data } = await api.put(`/lab-requests/${id}/complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update the specific request in state with the server response
      setRequests(prev => prev.map(req => req._id === id ? data : req));
      setMessage('success:Result uploaded');
      setResultText('');
      setResultFile(null);
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Upload failed'));
    } finally {
      setUploadingId(null);
    }
  };

  const startEdit = (req) => {
    setEditingId(req._id);
    setEditResultText(req.resultText || '');
    setEditTestType(req.testType || '');
    setEditDescription(req.description || '');
    setEditResultFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditResultText('');
    setEditTestType('');
    setEditDescription('');
    setEditResultFile(null);
  };

  const handleEditSave = async (id) => {
    const formData = new FormData();
    if (editResultText) formData.append('resultText', editResultText);
    if (editTestType) formData.append('testType', editTestType);
    if (editDescription !== undefined) formData.append('description', editDescription);
    if (editResultFile) formData.append('resultFile', editResultFile);

    try {
      const { data } = await api.put(`/lab-requests/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setRequests(prev => prev.map(req => req._id === id ? data : req));
      setMessage('success:Request updated successfully');
      cancelEdit();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Update failed'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab request? This action cannot be undone.')) return;
    try {
      await api.delete(`/lab-requests/${id}`);
      setRequests(prev => prev.filter(req => req._id !== id));
      setMessage('success:Request deleted successfully');
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Delete failed'));
    }
  };

  const isImageUrl = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
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
        <div className="hero-requests rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">Lab Requests</h1>
          <p className="text-blue-100 text-sm mt-2">Manage pending, accepted, and completed lab requests.</p>
        </div>

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
            <button onClick={() => setMessage('')} className="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-blue-500 text-3xl" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaFlask className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No lab requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req._id} className="request-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                {editingId === req._id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Test Type</label>
                      <input
                        type="text"
                        value={editTestType}
                        onChange={(e) => setEditTestType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                        rows="2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Result Text</label>
                      <textarea
                        value={editResultText}
                        onChange={(e) => setEditResultText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Result File (optional)</label>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-4 py-2 rounded-xl text-sm">
                          <FaUpload /> Choose File
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="hidden"
                            onChange={(e) => setEditResultFile(e.target.files[0])}
                          />
                        </label>
                        {editResultFile && <span className="text-xs text-gray-500">{editResultFile.name}</span>}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleEditSave(req._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition flex items-center gap-2"
                      >
                        <FaSave /> Save Changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-300 transition flex items-center gap-2"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <p className="font-semibold text-gray-800">{req.patient?.name}</p>
                        <p className="text-sm text-gray-600">Test: {req.testType}</p>
                        <p className="text-xs text-gray-400">Doctor: {req.doctor?.name}</p>
                        {req.description && (
                          <p className="text-xs text-gray-500 mt-1">{req.description}</p>
                        )}
                        {req.acceptedBy && (
                          <p className="text-xs text-gray-400 mt-2">
                            Accepted by: {req.acceptedBy.name} on {new Date(req.acceptedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
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
                    </div>

                    {/* Pending */}
                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleAccept(req._id)}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition"
                      >
                        Accept Request
                      </button>
                    )}

                    {/* Accepted */}
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
                              accept="image/*,application/pdf"
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
                          className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2"
                        >
                          {uploadingId === req._id ? (
                            <>
                              <FaSpinner className="animate-spin" /> Uploading...
                            </>
                          ) : (
                            'Complete & Upload'
                          )}
                        </button>
                      </div>
                    )}

                    {/* Completed – show result file/text and edit/delete buttons */}
                    {req.status === 'completed' && (
                      <div className="mt-4 space-y-3">
                        {req.resultFile && (
                          <div className="border rounded-xl p-3 bg-gray-50">
                            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                              <FaFileAlt /> Result File
                            </p>
                            {/* Show preview based on file type */}
                            {isImageUrl(req.resultFile) ? (
                              <a href={getCorrectCloudinaryUrl(req.resultFile)} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={getCorrectCloudinaryUrl(req.resultFile)}
                                  alt="Lab result"
                                  className="max-w-full max-h-48 rounded-lg border shadow-sm object-contain mb-2"
                                />
                              </a>
                            ) : (
                              <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
                                <FaFilePdf className="text-red-500 text-2xl" />
                                <a
                                  href={getPdfViewerUrl(getCorrectCloudinaryUrl(req.resultFile))}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline text-sm truncate"
                                >
                                  {req.resultFile.split('/').pop()}
                                </a>
                              </div>
                            )}
                            <a
                              href={getCorrectCloudinaryUrl(req.resultFile)}
                              download
                              className="text-blue-500 flex items-center gap-1 text-sm hover:underline"
                            >
                              <FaDownload /> Download File
                            </a>
                          </div>
                        )}
                        {req.resultText && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="font-medium">Result Text:</p>
                            <p>{req.resultText}</p>
                          </div>
                        )}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => startEdit(req)}
                            className="flex items-center gap-2 text-blue-500 bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-100 transition"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(req._id)}
                            className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
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