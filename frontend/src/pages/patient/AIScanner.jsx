import { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FaMicroscope, FaUpload, FaCamera, FaTimes, FaTrash, FaSearch, 
  FaCheckCircle, FaSyncAlt, FaExclamationTriangle, FaChartLine, 
  FaSpinner, FaImage, FaInfoCircle, FaChevronDown, FaChevronUp,
  FaCalendarAlt, FaHistory, FaExpand, FaArrowLeft, FaArrowRight
} from 'react-icons/fa';

export default function AIScanner() {
  const { t } = useLanguage();
  // State management
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pastImages, setPastImages] = useState([]);
  const [selectedPastImage, setSelectedPastImage] = useState(null);
  const [pastImagesLoading, setPastImagesLoading] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [confidence, setConfidence] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [showUserGuide, setShowUserGuide] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null); // for micro zoom

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchPastImages();
    return () => {
      if (image) URL.revokeObjectURL(image);
      stopCamera();
    };
  }, []);

  const fetchPastImages = async () => {
    try {
      setPastImagesLoading(true);
      const { data } = await api.get('/skin-images');
      setPastImages(data);
    } catch (error) {
      console.error('Failed to fetch images', error);
    } finally {
      setPastImagesLoading(false);
    }
  };

  // Statistics – only one source now
  const getStats = () => {
    const total = pastImages.length;
    const analyzed = pastImages.filter(img => img.analysisResult).length;
    const highRiskCount = pastImages.filter(img => {
      if (!img.analysisResult) return false;
      return /cancer|malignant|melanoma|high risk|urgent/i.test(img.analysisResult);
    }).length;
    const lastScanDate = pastImages.length > 0 ? new Date(pastImages[0].createdAt) : null;
    const avgConfidence = (() => {
      const confidences = pastImages.map(img => {
        const match = img.analysisResult?.match(/(\d+(?:\.\d+)?)%/);
        return match ? parseFloat(match[1]) : null;
      }).filter(c => c !== null);
      if (confidences.length === 0) return null;
      return (confidences.reduce((a,b) => a + b, 0) / confidences.length).toFixed(1);
    })();
    return { total, analyzed, highRiskCount, lastScanDate, avgConfidence };
  };

  const stats = getStats();

  // Camera handling with explicit front/rear selection
  const startCamera = useCallback(async (mode) => {
    setCameraError(null);
    try {
      const constraints = {
        video: { facingMode: { exact: mode } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      // Fallback to any camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
      } catch (fallbackErr) {
        setCameraError(t.scanner?.cameraPermissionError || 'Unable to access camera. Please check permissions.');
        setUsingCamera(false);
      }
    }
  }, [t]);

  // When camera is activated, start with the current facingMode
  useEffect(() => {
    if (usingCamera) {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
  }, [usingCamera, facingMode, startCamera]);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const selectFrontCamera = () => {
    setFacingMode('user');
    if (usingCamera) {
      stopCamera();
      setTimeout(() => startCamera('user'), 100);
    }
  };

  const selectRearCamera = () => {
    setFacingMode('environment');
    if (usingCamera) {
      stopCamera();
      setTimeout(() => startCamera('environment'), 100);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const file = new File([blob], 'capture.png', { type: 'image/png' });
      handleFile(file);
    }, 'image/png');
    stopCamera();
    setUsingCamera(false);
  };

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
    setConfidence(null);
    setImageAnalysis(null);
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

  const parseAnalysisResult = (analysisText) => {
    const confidenceMatch = analysisText.match(/(\d+(?:\.\d+)?)%/);
    const hasRisk = /cancer|malignant|melanoma|high risk|urgent/i.test(analysisText);
    const hasLowRisk = /benign|low risk|harmless|normal/i.test(analysisText);
    let riskLevel = 'unknown';
    if (hasRisk && !hasLowRisk) riskLevel = 'high';
    else if (hasLowRisk) riskLevel = 'low';
    
    return {
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : null,
      riskLevel,
      summary: analysisText
    };
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const { data } = await api.post('/skin-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const analysis = data.analysisResult;
      setResult(analysis);
      const parsed = parseAnalysisResult(analysis);
      setConfidence(parsed.confidence);
      setImageAnalysis(parsed);
      await fetchPastImages();
    } catch (error) {
      console.error('Upload failed', error);
      setResult(t.scanner?.uploadError || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null);
    setImageFile(null);
    setResult(null);
    setConfidence(null);
    setImageAnalysis(null);
  };

  const handleCancelCamera = () => {
    stopCamera();
    setUsingCamera(false);
    setCameraError(null);
  };

  const handleViewPastImage = (img) => {
    setSelectedPastImage(img);
    if (img.analysisResult) {
      const parsed = parseAnalysisResult(img.analysisResult);
      setImageAnalysis(parsed);
      setConfidence(parsed.confidence);
    } else {
      setImageAnalysis(null);
      setConfidence(null);
    }
  };

  const handleDeletePastImage = async (id) => {
    if (!window.confirm(t.scanner?.deleteConfirm || 'Are you sure you want to delete this scan?')) return;
    try {
      await api.delete(`/skin-images/${id}`);
      await fetchPastImages();
      if (selectedPastImage && selectedPastImage._id === id) setSelectedPastImage(null);
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const getRiskBadge = (riskLevel) => {
    if (riskLevel === 'high') {
      return <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">⚠️ High Risk</span>;
    } else if (riskLevel === 'low') {
      return <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">✅ Low Risk</span>;
    }
    return null;
  };

  // Micro zoom: open image in modal
  const openZoom = (imgUrl) => {
    setZoomedImage(imgUrl);
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

        @media (max-width: 640px) {
          .action-btn { padding: 10px 16px; font-size: 0.85rem; }
          .hero-scanner { padding: 1.5rem; }
        }
      `}</style>

      <div className="scanner-root max-w-4xl mx-auto space-y-6 pb-10 px-4 sm:px-0">
        {/* Hero Section – simplified, no duplicate stats */}
        <div className="hero-scanner rounded-2xl p-6 sm:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:280,height:280,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-60,right:-40,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:160,height:160,background:'radial-gradient(circle,rgba(167,139,250,0.13) 0%,transparent 70%)',bottom:-30,left:50,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{t.scanner?.aiPowered || 'AI SKIN ANALYSIS'}</p>
            <h1 className="display-font text-2xl sm:text-3xl font-semibold mb-2">{t.scanner?.title || 'Skin Scanner'}</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">{t.scanner?.subtitle || 'Upload or capture a photo for instant AI analysis'}</p>
          </div>
        </div>

        {/* Single Stats & User Guide Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stats Card - consolidated */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <FaHistory className="text-blue-500" />
              <h3 className="display-font font-semibold text-gray-800">Scan History Summary</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400">Total Scans</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Analyzed</p>
                <p className="text-2xl font-bold text-green-600">{stats.analyzed}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Avg. Confidence</p>
                <p className="text-2xl font-bold text-blue-600">{stats.avgConfidence ? `${stats.avgConfidence}%` : '—'}</p>
              </div>
            </div>
            {stats.lastScanDate && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 border-t pt-3">
                <FaCalendarAlt /> Last scan: {stats.lastScanDate.toLocaleDateString()} at {stats.lastScanDate.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* User Guide Toggle Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer" onClick={() => setShowUserGuide(!showUserGuide)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-violet-500" />
                <h3 className="display-font font-semibold text-gray-800">User Guide</h3>
              </div>
              {showUserGuide ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {showUserGuide && (
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p>📸 <strong>Step 1:</strong> Upload an image or take a photo using your camera.</p>
                <p>🤖 <strong>Step 2:</strong> Click "Analyze Image" – AI will examine the skin condition.</p>
                <p>📊 <strong>Step 3:</strong> View the result with confidence score and risk assessment.</p>
                <p>📁 <strong>Step 4:</strong> All scans are saved in "Past Scans" for future reference.</p>
                <p className="text-xs text-gray-400 mt-2">💡 Tip: Use good lighting and focus on the area of concern.</p>
              </div>
            )}
          </div>
        </div>

        {/* Scanner Area */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-5 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <FaMicroscope className="text-violet-600 text-base" />
            </div>
            <div>
              <h2 className="display-font text-lg font-semibold text-gray-800">{t.scanner?.scanYourSkin || 'Scan Your Skin'}</h2>
              <p className="text-gray-400 text-xs">{t.scanner?.uploadOrCamera || 'Upload or take a photo'}</p>
            </div>
          </div>

          {loading && <div className="loading-bar w-full" />}

          <div className="p-4 sm:p-6">
            {image ? (
              <div className="flex flex-col items-center gap-5">
                <div className="relative w-full max-w-lg">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-full max-h-72 object-contain rounded-2xl border border-gray-100 shadow-sm cursor-pointer" 
                    onClick={() => openZoom(image)}
                  />
                  <button 
                    onClick={() => openZoom(image)} 
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
                  <button onClick={handleAnalyze} disabled={loading} className="action-btn btn-primary flex-1 flex items-center justify-center gap-2">
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSearch className="text-sm" />}
                    {loading ? (t.scanner?.analyzing || 'Analyzing...') : (t.scanner?.analyzeImage || 'Analyze Image')}
                  </button>
                  <button onClick={handleRemove} className="action-btn btn-secondary flex items-center justify-center gap-2 px-5">
                    <FaTimes className="text-sm" /> {t.scanner?.remove || 'Remove'}
                  </button>
                </div>
              </div>
            ) : usingCamera ? (
              <div className="flex flex-col items-center gap-5">
                {cameraError ? (
                  <div className="text-center p-6 bg-red-50 rounded-2xl">
                    <FaExclamationTriangle className="text-red-500 text-3xl mx-auto mb-2" />
                    <p className="text-red-600 text-sm">{cameraError}</p>
                    <button onClick={() => setUsingCamera(false)} className="mt-3 action-btn btn-secondary">Go Back</button>
                  </div>
                ) : (
                  <>
                    <div className="relative w-full max-w-lg rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-black">
                      <video ref={videoRef} className="w-full object-cover" style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }} />
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                        {t.scanner?.liveCamera || 'Live Camera'}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full max-w-lg justify-center">
                      <button onClick={handleCapture} className="action-btn btn-green flex-1 flex items-center justify-center gap-2">
                        <FaCamera className="text-sm" /> {t.scanner?.capturePhoto || 'Capture'}
                      </button>
                      {/* Front and Rear camera buttons */}
                      <button onClick={selectFrontCamera} className="action-btn btn-secondary flex items-center justify-center gap-2">
                        <FaCamera className="text-sm" /> Front
                      </button>
                      <button onClick={selectRearCamera} className="action-btn btn-secondary flex items-center justify-center gap-2">
                        <FaCamera className="text-sm" /> Rear
                      </button>
                      <button onClick={handleCancelCamera} className="action-btn btn-secondary flex items-center justify-center gap-2">
                        <FaTimes className="text-sm" /> {t.common?.cancel || 'Cancel'}
                      </button>
                    </div>
                  </>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 w-full">
                <div
                  className={`drop-zone w-full max-w-lg rounded-2xl flex flex-col items-center justify-center py-10 sm:py-12 px-6 cursor-pointer ${dragActive ? 'active' : ''}`}
                  onClick={() => fileInputRef.current.click()}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDrop={handleDrop}
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${dragActive ? 'bg-blue-100 pulse-ring' : 'bg-gray-100'}`}>
                    <FaUpload className={`text-xl sm:text-2xl ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-gray-600 font-medium text-sm mb-1 text-center">
                    {dragActive ? (t.scanner?.dropActive || 'Drop image here') : (t.scanner?.dragDrop || 'Drag & drop image here')}
                  </p>
                  <p className="text-gray-400 text-xs text-center">{t.scanner?.supportedFormats || 'PNG, JPG up to 10MB'}</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                  <button onClick={() => fileInputRef.current.click()} className="action-btn btn-primary flex-1 flex items-center justify-center gap-2">
                    <FaUpload className="text-sm" /> {t.scanner?.uploadImage || 'Upload Image'}
                  </button>
                  <button onClick={() => setUsingCamera(true)} className="action-btn btn-violet flex-1 flex items-center justify-center gap-2">
                    <FaCamera className="text-sm" /> {t.scanner?.takePhoto || 'Take Photo'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Result with Confidence & Risk */}
        {result && (
          <div className="result-card rounded-2xl p-5 flex flex-col sm:flex-row items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FaCheckCircle className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <p className="font-semibold text-gray-800 text-sm">{t.scanner?.analysisResult || 'Analysis Result'}</p>
                {imageAnalysis?.riskLevel && getRiskBadge(imageAnalysis.riskLevel)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{result}</p>
              {confidence && (
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <FaChartLine className="text-blue-500" />
                  <span className="text-gray-500">Confidence:</span>
                  <div className="flex-1 max-w-[150px] bg-gray-200 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${confidence}%` }} />
                  </div>
                  <span className="font-medium text-gray-700">{confidence}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Past Scans Section */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="display-font text-lg font-semibold text-gray-800">
              {t.scanner?.pastScans || 'Past Scans'} <span className="text-gray-400">({stats.total})</span>
            </h3>
            <button onClick={fetchPastImages} className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1">
              <FaSyncAlt className={`text-xs ${pastImagesLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {pastImagesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl animate-pulse h-36" />
              ))}
            </div>
          ) : pastImages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <FaImage className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{t.scanner?.noPastScans || 'No past scans yet. Upload your first image!'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pastImages.map((img) => (
                <div key={img._id} className="scan-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-in" onClick={() => handleViewPastImage(img)}>
                  <div className="relative">
                    <img src={img.imageUrl} alt="Past scan" className="w-full h-28 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); openZoom(img.imageUrl); }} 
                      className="zoom-icon"
                      style={{ bottom: '8px', right: '8px', padding: '6px' }}
                      title="Zoom"
                    >
                      <FaExpand className="text-xs" />
                    </button>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs text-gray-500">
                      {new Date(img.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-blue-500 font-medium mt-0.5 truncate">
                      {img.analysisResult ? (t.scanner?.analyzed || 'Analyzed') : (t.scanner?.viewScan || 'View Scan')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoom Modal for Micro Zoom */}
      {zoomedImage && (
        <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setZoomedImage(null)}>
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

      {/* Past Image Modal (for details, not just zoom) */}
      {selectedPastImage && (
        <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <FaMicroscope className="text-violet-600 text-base" />
                </div>
                <div>
                  <h3 className="display-font text-lg font-semibold text-gray-800">{t.scanner?.scanDetails || 'Scan Details'}</h3>
                  <p className="text-xs text-gray-400">{new Date(selectedPastImage.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPastImage(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="bg-gray-50 px-4 sm:px-6 py-4 relative">
              <img 
                src={selectedPastImage.imageUrl} 
                alt="Selected scan" 
                className="w-full max-h-80 object-contain rounded-xl cursor-pointer" 
                onClick={() => openZoom(selectedPastImage.imageUrl)}
              />
              <button 
                onClick={() => openZoom(selectedPastImage.imageUrl)} 
                className="zoom-icon"
                style={{ bottom: '20px', right: '20px' }}
              >
                <FaExpand />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4">
              {selectedPastImage.analysisResult ? (
                <div className="result-card rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <FaCheckCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t.scanner?.analysisResult || 'Analysis Result'}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedPastImage.analysisResult}</p>
                    </div>
                  </div>
                  {confidence && (
                    <div className="flex items-center gap-2 text-xs ml-6">
                      <FaChartLine className="text-blue-500" />
                      <span className="text-gray-500">Confidence:</span>
                      <div className="flex-1 max-w-[150px] bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${confidence}%` }} />
                      </div>
                      <span className="font-medium text-gray-700">{confidence}%</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">{t.scanner?.noAnalysisSaved || 'No analysis available for this scan.'}</p>
              )}
            </div>

            <div className="px-4 sm:px-6 pb-6 flex flex-col sm:flex-row gap-3">
              <button onClick={() => handleDeletePastImage(selectedPastImage._id)} className="action-btn btn-danger flex items-center justify-center gap-2">
                <FaTrash className="text-sm" /> {t.scanner?.delete || 'Delete'}
              </button>
              <button onClick={() => setSelectedPastImage(null)} className="action-btn btn-secondary flex-1 text-center">
                {t.common?.close || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}