import { useState, useRef, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import {
  FaMicroscope, FaUpload, FaTimes, FaSearch,
  FaUserPlus, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';

export default function AIScanner() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const searchPatients = async (query) => {
    if (!query) {
      setPatients([]);
      return;
    }
    try {
      const { data } = await api.get(`/users/patients?search=${query}`);
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      searchPatients(searchQuery);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleFile = (file) => {
    if (image) URL.revokeObjectURL(image);
    setImageFile(file);
    setImage(URL.createObjectURL(file));
    setResult(null);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/users/patients', newPatient);
      setSelectedPatient(data);
      setShowCreateModal(false);
      setNewPatient({ name: '', email: '', password: '' });
      setMessage('success:Patient created successfully');
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Creation failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !selectedPatient) {
      setMessage('error:Please select a patient and upload an image');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    // No dummy analysisResult – backend will generate real AI prediction
    formData.append('patientId', selectedPatient._id);
    try {
      const { data } = await api.post('/skin-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data.analysisResult);
      setMessage('success:Scan uploaded successfully');
    } catch (error) {
      console.error('Upload failed', error);
      setMessage('error:Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    setImageFile(null);
    setResult(null);
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  return (
    <DashboardLayout activePage="aiscanner">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .scanner-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }
        .hero-scanner {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .drop-zone {
          transition: all 0.2s ease;
          border: 2.5px dashed #d1d5db;
        }
        .drop-zone.active {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .drop-zone:hover {
          border-color: #93c5fd;
          background: #f8faff;
        }
        .action-btn {
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.9rem;
          border-radius: 12px;
          padding: 11px 20px;
          cursor: pointer;
          border: none;
        }
        .btn-primary {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: white;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
        .btn-violet {
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
          color: white;
          box-shadow: 0 4px 14px rgba(139,92,246,0.3);
        }
        .btn-violet:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-secondary {
          background: white;
          color: #6b7280;
          border: 1.5px solid #e5e7eb !important;
        }
        .btn-secondary:hover { background: #f9fafb; }
        .btn-green {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          box-shadow: 0 4px 14px rgba(16,185,129,0.3);
        }
        .btn-green:hover { opacity: 0.9; transform: translateY(-1px); }
        .patient-card {
          transition: all 0.2s;
          cursor: pointer;
        }
        .patient-card:hover {
          background: #f3f4f6;
        }
        .patient-card.selected {
          background: #dbeafe;
          border-color: #3b82f6;
        }
        .modal-animation { animation: slideUp 0.25s ease; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="scanner-root max-w-4xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-scanner rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">AI Powered</p>
            <h1 className="display-font text-3xl font-semibold mb-2">Skin Scanner for Patients</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Upload a photo for a patient. Select an existing patient or create a new one.
            </p>
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

        {/* Patient Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="display-font text-lg font-semibold text-gray-800 mb-4">Select Patient</h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition"
            >
              <FaUserPlus /> New Patient
            </button>
          </div>

          {patients.length > 0 && (
            <div className="mt-4 grid gap-2">
              {patients.map(p => (
                <div
                  key={p._id}
                  onClick={() => setSelectedPatient(p)}
                  className={`patient-card p-3 rounded-xl border ${
                    selectedPatient?._id === p._id ? 'selected border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.email}</p>
                </div>
              ))}
            </div>
          )}

          {selectedPatient && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-blue-800">{selectedPatient.name}</p>
                <p className="text-xs text-blue-600">{selectedPatient.email}</p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        {/* Scanner Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <FaMicroscope className="text-violet-600 text-base" />
            </div>
            <div>
              <h2 className="display-font text-lg font-semibold text-gray-800">Scan Patient's Skin</h2>
              <p className="text-gray-400 text-xs">Upload an image</p>
            </div>
          </div>

          {image ? (
            <div className="p-6 flex flex-col items-center gap-5">
              <div className="relative w-full max-w-lg">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full max-h-72 object-contain rounded-2xl border border-gray-100 shadow-sm"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-red-500"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
              <div className="flex gap-3 w-full max-w-lg">
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !selectedPatient}
                  className="action-btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? 'Analyzing...' : 'Analyze & Save'}
                </button>
                <button onClick={handleRemove} className="action-btn btn-secondary flex items-center justify-center gap-2 px-5">
                  <FaTimes className="text-sm" /> Remove
                </button>
              </div>
              {!selectedPatient && (
                <p className="text-xs text-red-500">Please select a patient first.</p>
              )}
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center gap-4">
              <div
                className={`drop-zone w-full max-w-lg rounded-2xl flex flex-col items-center justify-center py-12 px-6 cursor-pointer ${dragActive ? 'active' : ''}`}
                onClick={() => fileInputRef.current.click()}
                onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                onDrop={handleDrop}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <FaUpload className={`text-2xl ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <p className="text-gray-600 font-medium text-sm mb-1">
                  {dragActive ? 'Drop your image here' : 'Drag & drop your image here'}
                </p>
                <p className="text-gray-400 text-xs">PNG, JPG, WEBP supported</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <div className="flex gap-3 w-full max-w-lg">
                <button onClick={() => fileInputRef.current.click()} className="action-btn btn-primary flex-1 flex items-center justify-center gap-2">
                  <FaUpload className="text-sm" /> Upload Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
            <FaCheckCircle className="text-emerald-500 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800 text-sm mb-1">Analysis Result</p>
              <p className="text-gray-600 text-sm leading-relaxed">{result}</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Patient Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="modal-animation bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="display-font text-xl font-semibold text-gray-800 mb-4">Create New Patient</h2>
            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newPatient.password}
                  onChange={(e) => setNewPatient({ ...newPatient, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Patient'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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