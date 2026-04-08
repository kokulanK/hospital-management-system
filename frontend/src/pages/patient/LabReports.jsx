import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaFlask, FaFileAlt, FaDownload, FaUserMd, FaCalendarAlt, FaTimesCircle, FaHistory, FaInfoCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { getCorrectCloudinaryUrl, getPdfViewerUrl } from '../../utils/cloudinary';

export default function LabReports() {
  const { t } = useLanguage();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/lab-requests/patient');
      setReports(data);
    } catch (err) {
      console.error('Lab reports error:', err);
      let errorMsg = (t.labReports?.loadError || 'Failed to load lab reports') + ' ';
      if (err.response?.status === 403) {
        errorMsg += (t.labReports?.accessDenied || 'Access denied. Please log in as a patient.');
      } else if (err.response?.status === 401) {
        errorMsg += (t.labReports?.loginAgain || 'Please log in again.');
      } else {
        errorMsg += (t.labReports?.tryAgain || 'Please try again later.');
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isImageUrl = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  // Stats
  const totalReports = reports.length;
  const uniqueTests = [...new Set(reports.map(r => r.testType))].length;
  const lastReportDate = reports.length > 0 ? new Date(reports[0].completedAt) : null;

  if (loading) {
    return (
      <DashboardLayout activePage="labreports">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="labreports">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .lab-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }
        .hero-lab-reports {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .report-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .report-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        }
        .fade-in { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="lab-root max-w-4xl mx-auto space-y-6 pb-10 px-4 sm:px-0">

        {/* Hero Section */}
        <div className="hero-lab-reports rounded-2xl p-6 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:280,height:280,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-60,right:-40,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:160,height:160,background:'radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)',bottom:-30,left:60,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{t.labReports?.heroBadge || 'LAB RESULTS'}</p>
            <h1 className="display-font text-2xl sm:text-3xl font-semibold mb-2">{t.labReports?.title || 'My Lab Reports'}</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">{t.labReports?.subtitle || 'View and download your completed lab results'}</p>
          </div>
        </div>

        {/* Stats & User Guide Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stats Card */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-in">
            <div className="flex items-center gap-2 mb-3">
              <FaHistory className="text-blue-500" />
              <h3 className="display-font font-semibold text-gray-800">{t.labReports?.summaryTitle || 'Lab Reports Summary'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">{t.labReports?.totalReports || 'Total Reports'}</p>
                <p className="text-2xl font-bold text-gray-800">{totalReports}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">{t.labReports?.uniqueTests || 'Unique Tests'}</p>
                <p className="text-2xl font-bold text-blue-600">{uniqueTests}</p>
              </div>
            </div>
            {lastReportDate && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 border-t pt-3">
                <FaCalendarAlt /> {t.labReports?.lastReport || 'Last report'}: {lastReportDate.toLocaleDateString()}
              </div>
            )}
          </div>

          {/* User Guide Toggle Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer fade-in" onClick={() => setShowGuide(!showGuide)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-violet-500" />
                <h3 className="display-font font-semibold text-gray-800">{t.labReports?.userGuide || 'User Guide'}</h3>
              </div>
              {showGuide ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {showGuide && (
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p>📋 <strong>{t.labReports?.step1Title || 'Step 1:'}</strong> {t.labReports?.step1Desc || 'Lab reports appear here once completed by the lab.'}</p>
                <p>🔍 <strong>{t.labReports?.step2Title || 'Step 2:'}</strong> {t.labReports?.step2Desc || 'Click on an image or PDF to view full report.'}</p>
                <p>💾 <strong>{t.labReports?.step3Title || 'Step 3:'}</strong> {t.labReports?.step3Desc || 'Use the download button to save a copy.'}</p>
                <p className="text-xs text-gray-400 mt-2">💡 {t.labReports?.tip || 'Reports are added automatically – no action needed.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Toast */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 fade-in">
            <FaTimesCircle className="text-red-400 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center fade-in">
            <FaFlask className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{t.labReports?.noReports || 'No lab reports found.'}</p>
            <p className="text-xs text-gray-400 mt-1">{t.labReports?.noReportsHint || 'Completed reports will appear here automatically.'}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((report, idx) => (
              <div key={report._id} className="report-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaFlask className="text-blue-500 text-sm" />
                        <span className="font-semibold text-gray-800">{report.testType}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <FaUserMd className="text-gray-400" /> Dr. {report.doctor?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400" /> {new Date(report.completedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      {report.resultText && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="font-medium">{t.labReports?.result || 'Result:'}</p>
                          <p>{report.resultText}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {report.resultFile && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <FaFileAlt /> {t.labReports?.attachedFile || 'Attached File'}
                      </p>
                      {isImageUrl(report.resultFile) ? (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <a href={getCorrectCloudinaryUrl(report.resultFile)} target="_blank" rel="noopener noreferrer">
                            <img
                              src={getCorrectCloudinaryUrl(report.resultFile)}
                              alt="Lab result"
                              className="max-w-full max-h-48 rounded-lg border shadow-sm object-contain mx-auto cursor-pointer hover:opacity-90 transition"
                            />
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                          <FaFileAlt className="text-red-500 text-2xl" />
                          <a
                            href={getPdfViewerUrl(getCorrectCloudinaryUrl(report.resultFile))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm truncate"
                          >
                            {report.resultFile.split('/').pop()}
                          </a>
                        </div>
                      )}
                      <a
                        href={getCorrectCloudinaryUrl(report.resultFile)}
                        download
                        className="mt-2 inline-flex items-center gap-1 text-blue-500 text-sm hover:underline"
                      >
                        <FaDownload /> {t.labReports?.downloadFile || 'Download File'}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}