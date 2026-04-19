import { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import {
  FaMicroscope, FaUpload, FaTimes, FaSearch,
  FaUserPlus, FaCheckCircle, FaTimesCircle, FaSpinner,
  FaExclamationTriangle, FaInfoCircle, FaExpand
} from 'react-icons/fa';

// ---------- Analysis helpers (same as user version) ----------
const processAnalysisData = (rawData) => {
  if (!rawData) return null;
  if (typeof rawData === 'string') {
    const confidenceMatch = rawData.match(/(\d+(?:\.\d+)?)%/);
    const hasRisk = /cancer|malignant|melanoma|high risk|urgent/i.test(rawData);
    return {
      type: 'legacy',
      summary: rawData,
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : null,
      riskLevel: hasRisk ? 'high' : 'low'
    };
  }
  if (typeof rawData === 'object') {
    if (rawData.status === 'rejected') {
      const reason = rawData.gatekeeper?.reason || 'Unknown';
      const detail = rawData.gatekeeper?.detail || '';
      let advice = 'Please retake the photo.';
      const rLower = reason.toLowerCase();
      if (rLower.includes('light') || rLower.includes('bright') || detail.toLowerCase().includes('bright'))
        advice = 'Too dark or bright. Move to better lighting and turn off camera flash.';
      else if (rLower.includes('blur'))
        advice = 'Blurry image. Hold the camera steady and wait for focus.';
      else if (rLower.includes('skin') || rLower.includes('coverage') || rLower.includes('closeup'))
        advice = 'Not enough skin recognized. Take a close‑up picture of the lesion on bare skin.';
      else if (rLower.includes('center'))
        advice = 'The lesion is too close to the edge of the image. Please retake the photo and keep the lesion exactly inside the target circle.';
      return { type: 'rejected', reason, detail, advice };
    }
    if (rawData.status === 'accepted' && rawData.classifier) {
      const confidence = parseFloat(rawData.classifier.confidence);
      const isDanger = rawData.classifier.label === 'Danger' || rawData.classifier.prediction === 'Danger';

      if (confidence < 65) {
        return {
          type: 'uncertain',
          confidence: confidence,
          message: 'Inconclusive Analysis',
          advice: 'The AI is not confident enough to make a definitive classification on this image. The malignant and benign probabilities are too closely split, meaning the model is uncertain. We highly recommend having this checked by a professional dermatologist.',
          dominantLabel: isDanger ? 'danger' : 'safe'
        };
      }
      return {
        type: isDanger ? 'danger' : 'safe',
        confidence: confidence,
        message: isDanger ? 'Potential cancer signs detected' : 'No signs of cancer detected',
        advice: isDanger ? 'Please consult a doctor or dermatologist immediately for a professional evaluation.' : 'Looks clear, but continue to monitor for any changes.'
      };
    }
  }
  return { type: 'unknown', summary: 'Analysis returned an unknown format.' };
};

const AnalysisResultView = ({ result }) => {
  if (!result) return null;
  return (
    <div className={`rounded-2xl p-5 md:p-6 border mt-4 ${
      result.type === 'rejected' ? 'bg-orange-50 border-orange-200' :
      result.type === 'safe' ? 'bg-green-50 border-green-200' :
      result.type === 'danger' ? 'bg-red-50 border-red-200' :
      result.type === 'uncertain' ? 'bg-yellow-50 border-yellow-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      {result.type === 'rejected' && (
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex justify-center items-center flex-shrink-0">
            <FaExclamationTriangle className="text-orange-600 text-xl" />
          </div>
          <div>
            <h3 className="font-bold text-orange-800 text-lg">Image Rejected: {result.reason}</h3>
            <p className="text-orange-700 mt-1">{result.advice}</p>
            <p className="text-orange-600/70 text-xs mt-2 font-mono bg-orange-100 inline-block p-1 rounded">{result.detail}</p>
          </div>
        </div>
      )}
      {result.type === 'uncertain' && (
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex justify-center items-center flex-shrink-0">
            <FaExclamationTriangle className="text-yellow-600 text-xl" />
          </div>
          <div className="flex-1 w-full">
            <h3 className="font-bold text-yellow-800 text-lg">{result.message}</h3>
            <p className="text-yellow-700 mt-1 font-medium">{result.advice}</p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-gray-800">Malignant (Danger)</span>
                  <span className="text-sm font-bold text-red-600">
                    {(result.dominantLabel === 'danger') ? result.confidence.toFixed(1) : (100 - result.confidence).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(result.dominantLabel === 'danger') ? result.confidence : (100 - result.confidence)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-gray-800">Benign (Safe)</span>
                  <span className="text-sm font-bold text-green-600">
                    {(result.dominantLabel === 'safe') ? result.confidence.toFixed(1) : (100 - result.confidence).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(result.dominantLabel === 'safe') ? result.confidence : (100 - result.confidence)}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-yellow-700 mt-3 font-medium opacity-80">
              The model is too uncertain to classify this image.
            </p>
          </div>
        </div>
      )}
      {result.type === 'safe' && (
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-12 h-12 bg-green-100 rounded-full flex justify-center items-center flex-shrink-0">
            <FaCheckCircle className="text-green-600 text-xl" />
          </div>
          <div className="flex-1 w-full">
            <h3 className="font-bold text-green-800 text-lg">{result.message}</h3>
            <p className="text-green-700 mt-1 font-medium">{result.advice}</p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-gray-800">Malignant (Danger)</span>
                  <span className="text-sm font-bold text-red-600">
                    {(100 - result.confidence).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${100 - result.confidence}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-gray-800">Benign (Safe)</span>
                  <span className="text-sm font-bold text-green-600">
                    {result.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {result.type === 'danger' && (
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-12 h-12 bg-red-100 rounded-full flex justify-center items-center flex-shrink-0">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <div className="flex-1 w-full">
            <h3 className="font-bold text-red-800 text-lg">{result.message}</h3>
            <p className="text-red-700 mt-1 font-medium">{result.advice}</p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-gray-800">Malignant (Danger)</span>
                  <span className="text-sm font-bold text-red-600">
                    {result.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-bold text-gray-800">Benign (Safe)</span>
                  <span className="text-sm font-bold text-green-600">
                    {(100 - result.confidence).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${100 - result.confidence}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {(result.type === 'legacy' || result.type === 'unknown') && (
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex justify-center items-center flex-shrink-0">
            <FaInfoCircle className="text-blue-600 text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-800 text-lg">Analysis Complete</h3>
            <p className="text-blue-700 mt-1">{result.summary || 'Details unavailable'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const analyzeContrast = (canvasContext, fullWidth, fullHeight) => {
  const w = fullWidth * 0.5;
  const h = fullHeight * 0.5;
  const x = fullWidth * 0.25;
  const y = fullHeight * 0.25;

  const imageData = canvasContext.getImageData(x, y, w, h).data;
  let sum = 0;
  for (let i = 0; i < imageData.length; i += 4) {
    sum += (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
  }
  const avg = sum / (w * h);
  let variance = 0;
  for (let i = 0; i < imageData.length; i += 4) {
    const p = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
    variance += Math.pow(p - avg, 2);
  }
  const stdDev = Math.sqrt(variance / (w * h));
  return stdDev > 8;
};

// ---------- Main Component ----------
export default function AIScanner() {
  const { t } = useLanguage();

  // Image states (similar to user version)
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [scanStatus, setScanStatus] = useState('searching');
  const [zoomedImage, setZoomedImage] = useState(null);

  // Patient states (receptionist specific)
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // ---------- Patient search ----------
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

  // ---------- Image handling ----------
  const compressImage = (file, maxSizeMB = 1) => {
    return new Promise((resolve) => {
      if (file.size <= maxSizeMB * 1024 * 1024) {
        resolve(file);
        return;
      }
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(compressedFile);
          }, 'image/jpeg', 0.8);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file) => {
    if (image) URL.revokeObjectURL(image);
    const compressedFile = await compressImage(file);
    setImageFile(compressedFile);
    setImage(URL.createObjectURL(compressedFile));
    setResult(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
    setIsCropping(true);
    setScanStatus('searching');
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
    if (image) {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = 64;
        cvs.height = 64;
        const ctx = cvs.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(
          img,
          croppedAreaPixels.x, croppedAreaPixels.y,
          croppedAreaPixels.width, croppedAreaPixels.height,
          0, 0, 64, 64
        );
        setScanStatus(analyzeContrast(ctx, 64, 64) ? 'found' : 'searching');
      };
    }
  }, [image]);

  const handleCropConfirm = async () => {
    try {
      const croppedResult = await getCroppedImg(image, croppedAreaPixels);
      setImageFile(croppedResult.file);
      setImage(croppedResult.url);
      setIsCropping(false);
    } catch (e) {
      console.error(e);
      setMessage('error:Error cropping image');
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    setImageFile(null);
    setResult(null);
    setIsCropping(false);
  };

  // ---------- Analysis & Submission ----------
  const handleAnalyze = async () => {
    if (!imageFile || !selectedPatient) {
      setMessage('error:Please select a patient and upload an image');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('patientId', selectedPatient._id);

    try {
      const { data } = await api.post('/skin-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const analysis = data.analysisResult;
      setResult(processAnalysisData(analysis));
      setMessage('success:Scan uploaded and analyzed successfully');
    } catch (error) {
      console.error('Upload failed', error);
      setMessage('error:Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Patient creation ----------
  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/users/patients', newPatient);
      setSelectedPatient(data);
      setShowCreateModal(false);
      setNewPatient({ name: '', email: '', password: '' });
      setMessage('success:Patient created and selected');
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Creation failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  // ---------- Render ----------
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
        .zoom-icon {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(0,0,0,0.6);
          border-radius: 50%;
          padding: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .zoom-icon:hover {
          background: rgba(0,0,0,0.8);
          transform: scale(1.05);
        }
        .loading-bar {
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6);
          background-size: 200% 100%;
          animation: loadingAnim 1.4s linear infinite;
          border-radius: 2px;
        }
        @keyframes loadingAnim {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="scanner-root max-w-4xl mx-auto space-y-6 pb-10 px-4 sm:px-0">
        {/* Hero */}
        <div className="hero-scanner rounded-2xl p-6 sm:p-9 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">
              AI POWERED • RECEPTIONIST MODE
            </p>
            <h1 className="display-font text-2xl sm:text-3xl font-semibold mb-2">
              Skin Scanner for Patients
            </h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Upload a photo, assign it to a patient, and receive an instant AI analysis.
            </p>
          </div>
        </div>

        {/* Toast message */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            msgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {msgType === 'success' ? <FaCheckCircle className="text-emerald-500" /> : <FaTimesCircle className="text-red-400" />}
            <p className="text-sm font-medium">{msgText}</p>
            <button onClick={() => setMessage('')} className="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
          </div>
        )}

        {/* Patient selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="display-font text-lg font-semibold text-gray-800 mb-4">Select Patient</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition text-sm font-medium"
            >
              <FaUserPlus /> New Patient
            </button>
          </div>

          {patients.length > 0 && (
            <div className="mt-4 grid gap-2 max-h-60 overflow-y-auto pr-1">
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

        {/* Scanner area */}
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

          {loading && <div className="loading-bar w-full" />}

          <div className="p-4 sm:p-6">
            {isCropping && image ? (
              <div className="flex flex-col items-center gap-5 fade-in">
                <div className="relative w-full max-w-lg h-80 sm:h-96 rounded-2xl overflow-hidden bg-black border border-gray-200">
                  <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    style={{
                      cropAreaStyle: {
                        border: scanStatus === 'found' ? '4px dashed rgba(34, 197, 94, 0.9)' : '4px dashed rgba(239, 68, 68, 0.9)',
                        transition: 'border-color 0.3s ease'
                      }
                    }}
                  />
                  <div className="absolute top-4 w-full text-center pointer-events-none z-10">
                    <p className={`text-white text-xs sm:text-sm font-medium inline-block px-4 py-1.5 rounded-full backdrop-blur-sm shadow-md transition-colors duration-300 ${
                      scanStatus === 'found' ? 'bg-green-500/90' : 'bg-red-500/90'
                    }`}>
                      {scanStatus === 'found' ? 'Lesion Centered Properly' : 'Drag to Center the Lesion'}
                    </p>
                  </div>
                </div>
                <div className="w-full max-w-lg flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-center font-medium text-gray-700">Pinch/Scroll to Zoom, Drag to Center</p>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-label="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                  <button onClick={handleCropConfirm} className="action-btn btn-primary flex-1 flex items-center justify-center gap-2">
                    <FaCheckCircle className="text-sm" /> Confirm & Continue
                  </button>
                  <button onClick={handleRemove} className="action-btn btn-secondary flex items-center justify-center gap-2 px-5">
                    Cancel
                  </button>
                </div>
              </div>
            ) : image ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-full max-w-lg">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full max-h-72 object-contain rounded-2xl border border-gray-100 shadow-sm cursor-pointer"
                    onClick={() => setZoomedImage(image)}
                  />
                  <button
                    onClick={() => setZoomedImage(image)}
                    className="zoom-icon"
                    title="Zoom image"
                  >
                    <FaExpand />
                  </button>
                  <button
                    onClick={handleRemove}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 transition-all"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || !selectedPatient}
                    className="action-btn btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSearch className="text-sm" />}
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
              <div className="flex flex-col items-center gap-4 w-full">
                <div
                  className={`drop-zone w-full max-w-lg rounded-2xl flex flex-col items-center justify-center py-10 sm:py-12 px-6 cursor-pointer ${
                    dragActive ? 'active' : ''
                  }`}
                  onClick={() => fileInputRef.current.click()}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDrop={handleDrop}
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                    dragActive ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <FaUpload className={`text-xl sm:text-2xl ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-gray-600 font-medium text-sm mb-1 text-center">
                    {dragActive ? 'Drop image here' : 'Drag & drop image here'}
                  </p>
                  <p className="text-gray-400 text-xs text-center">PNG, JPG up to 10MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                <div className="flex w-full max-w-lg">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="action-btn btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <FaUpload className="text-sm" /> Upload Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis result */}
        {result && <AnalysisResultView result={result} />}
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

      {/* Zoom modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage} alt="Zoomed" className="w-full h-full object-contain rounded-xl" />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}