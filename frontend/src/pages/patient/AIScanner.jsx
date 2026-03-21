import { useState, useRef, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaMicroscope, FaUpload, FaCamera, FaTimes, FaTrash, FaSearch, FaCheckCircle } from 'react-icons/fa';

export default function AIScanner() {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pastImages, setPastImages] = useState([]);
  const [selectedPastImage, setSelectedPastImage] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPastImages();
  }, []);

  const fetchPastImages = async () => {
    try {
      const { data } = await api.get('/skin-images');
      setPastImages(data);
    } catch (error) {
      console.error('Failed to fetch images', error);
    }
  };

  useEffect(() => {
    if (usingCamera) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(() => setUsingCamera(false));
    } else {
      stopCamera();
    }
  }, [usingCamera]);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setUsingCamera(false);
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.png', { type: 'image/png' });
      setImageFile(file);
      setImage(URL.createObjectURL(file));
      setResult(null);
    }, 'image/png');
    stopCamera();
  };

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

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('analysisResult', 'Analysis complete: No significant issues detected (demo).');
    try {
      const { data } = await api.post('/skin-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data.analysisResult);
      fetchPastImages();
    } catch (error) {
      console.error('Upload failed', error);
      setResult('Upload failed. Please try again.');
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

  const handleCancelCamera = () => stopCamera();
  const handleViewPastImage = (img) => setSelectedPastImage(img);

  const handleDeletePastImage = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/skin-images/${id}`);
      fetchPastImages();
      if (selectedPastImage && selectedPastImage._id === id) setSelectedPastImage(null);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

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

        .btn-danger {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          box-shadow: 0 4px 12px rgba(239,68,68,0.25);
        }
        .btn-danger:hover { opacity: 0.9; }

        .scan-card {
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }
        .scan-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.1); }

        .modal-overlay { animation: fadeIn 0.2s ease; }
        .modal-box { animation: slideUp 0.25s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .result-card {
          background: linear-gradient(135deg, #eff6ff, #f0fdf4);
          border: 1.5px solid #bfdbfe;
        }

        .pulse-ring {
          animation: pulseRing 2s infinite;
        }
        @keyframes pulseRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.3); }
          50% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
        }

        .fade-in { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .fade-in:nth-child(1) { animation-delay: 0.04s; }
        .fade-in:nth-child(2) { animation-delay: 0.10s; }
        .fade-in:nth-child(3) { animation-delay: 0.16s; }
        .fade-in:nth-child(4) { animation-delay: 0.22s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

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

      <div className="scanner-root max-w-4xl mx-auto space-y-6 pb-10">

        {/* ── Hero ── */}
        <div className="hero-scanner rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:280,height:280,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-60,right:-40,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:160,height:160,background:'radial-gradient(circle,rgba(167,139,250,0.13) 0%,transparent 70%)',bottom:-30,left:50,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">AI Powered</p>
            <h1 className="display-font text-3xl font-semibold mb-2">Skin Scanner</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Upload or capture a photo of your skin for a preliminary AI analysis. Demo only — not real medical advice.
            </p>
            <div className="mt-5 flex gap-4 flex-wrap">
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm">
                <span className="text-blue-200 text-xs block">Total Scans</span>
                <span className="font-semibold">{pastImages.length} scan{pastImages.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm">
                <span className="text-blue-200 text-xs block">Status</span>
                <span className="font-semibold">{loading ? '🔄 Analyzing...' : '✅ Ready'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Scanner Area ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <FaMicroscope className="text-violet-600 text-base" />
            </div>
            <div>
              <h2 className="display-font text-lg font-semibold text-gray-800">Scan Your Skin</h2>
              <p className="text-gray-400 text-xs">Upload an image or use your camera</p>
            </div>
          </div>

          {loading && <div className="loading-bar w-full" />}

          <div className="p-6">
            {/* ── Image Preview State ── */}
            {image ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-full max-w-lg">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full max-h-72 object-contain rounded-2xl border border-gray-100 shadow-sm"
                  />
                  <button
                    onClick={handleRemove}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-red-500 hover:shadow-lg transition-all"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>
                <div className="flex gap-3 w-full max-w-lg">
                  <button onClick={handleAnalyze} disabled={loading} className="action-btn btn-primary flex-1 flex items-center justify-center gap-2">
                    <FaSearch className="text-sm" />
                    {loading ? 'Analyzing...' : 'Analyze Image'}
                  </button>
                  <button onClick={handleRemove} className="action-btn btn-secondary flex items-center justify-center gap-2 px-5">
                    <FaTimes className="text-sm" /> Remove
                  </button>
                </div>
              </div>

            /* ── Camera State ── */
            ) : usingCamera ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <video ref={videoRef} className="w-full object-cover -scale-x-100" />
                  <div className="absolute inset-0 border-2 border-blue-400/40 rounded-2xl pointer-events-none" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                    Live Camera
                  </div>
                </div>
                <div className="flex gap-3 w-full max-w-lg">
                  <button onClick={handleCapture} className="action-btn btn-green flex-1 flex items-center justify-center gap-2">
                    <FaCamera className="text-sm" /> Capture Photo
                  </button>
                  <button onClick={handleCancelCamera} className="action-btn btn-secondary flex items-center justify-center gap-2 px-5">
                    <FaTimes className="text-sm" /> Cancel
                  </button>
                </div>
              </div>

            /* ── Empty / Upload State ── */
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                {/* Drop Zone */}
                <div
                  className={`drop-zone w-full max-w-lg rounded-2xl flex flex-col items-center justify-center py-12 px-6 cursor-pointer ${dragActive ? 'active' : ''}`}
                  onClick={() => fileInputRef.current.click()}
                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                  onDrop={handleDrop}
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${dragActive ? 'bg-blue-100 pulse-ring' : 'bg-gray-100'}`}>
                    <FaUpload className={`text-2xl ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-gray-600 font-medium text-sm mb-1">
                    {dragActive ? 'Drop your image here' : 'Drag & drop your image here'}
                  </p>
                  <p className="text-gray-400 text-xs">PNG, JPG, WEBP supported</p>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

                {/* Buttons */}
                <div className="flex gap-3 w-full max-w-lg">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="action-btn btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <FaUpload className="text-sm" /> Upload Image
                  </button>
                  <button
                    onClick={() => setUsingCamera(true)}
                    className="action-btn btn-violet flex-1 flex items-center justify-center gap-2"
                  >
                    <FaCamera className="text-sm" /> Take Photo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Analysis Result ── */}
        {result && (
          <div className="result-card rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FaCheckCircle className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm mb-1">Analysis Result</p>
              <p className="text-gray-600 text-sm leading-relaxed">{result}</p>
            </div>
          </div>
        )}

        {/* ── Past Scans ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="display-font text-lg font-semibold text-gray-800">
              Past Scans <span className="text-gray-400">({pastImages.length})</span>
            </h3>
          </div>

          {pastImages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <FaMicroscope className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No past scans yet. Upload your first image above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pastImages.map((img) => (
                <div
                  key={img._id}
                  className="scan-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-in"
                  onClick={() => handleViewPastImage(img)}
                >
                  <div className="relative">
                    <img
                      src={img.imageUrl}   // ✅ Direct Cloudinary URL
                      alt="Past scan"
                      className="w-full h-28 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500">
                      {new Date(img.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-blue-500 font-medium mt-0.5 truncate">
                      {img.analysisResult ? 'Analyzed ✓' : 'View scan'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Past Image Modal ── */}
      {selectedPastImage && (
        <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <FaMicroscope className="text-violet-600 text-base" />
                </div>
                <div>
                  <h3 className="display-font text-lg font-semibold text-gray-800">Scan Details</h3>
                  <p className="text-xs text-gray-400">{new Date(selectedPastImage.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPastImage(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Image */}
            <div className="bg-gray-50 px-6 py-4">
              <img
                src={selectedPastImage.imageUrl}   // ✅ Direct Cloudinary URL
                alt="Selected scan"
                className="w-full max-h-80 object-contain rounded-xl"
              />
            </div>

            {/* Result */}
            <div className="px-6 py-4">
              {selectedPastImage.analysisResult ? (
                <div className="result-card rounded-xl p-4 flex items-start gap-3">
                  <FaCheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Analysis Result</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedPastImage.analysisResult}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No analysis saved for this scan.</p>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => handleDeletePastImage(selectedPastImage._id)}
                className="action-btn btn-danger flex items-center gap-2"
              >
                <FaTrash className="text-sm" /> Delete
              </button>
              <button
                onClick={() => setSelectedPastImage(null)}
                className="action-btn btn-secondary flex-1 text-center"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}