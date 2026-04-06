import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaFlask, FaFileAlt, FaDownload, FaUserMd, FaCalendarAlt, FaTimesCircle } from 'react-icons/fa';
import { getCorrectCloudinaryUrl, getPdfViewerUrl } from '../../utils/cloudinary';

export default function LabReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/lab-requests/patient');
      setReports(data);
    } catch (err) {
      console.error('Lab reports error:', err);
      let errorMsg = 'Failed to load lab reports. ';
      if (err.response?.status === 403) {
        errorMsg += 'Access denied. Please log in as a patient.';
      } else if (err.response?.status === 401) {
        errorMsg += 'Please log in again.';
      } else {
        errorMsg += 'Please try again later.';
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
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <div className="hero-lab-reports rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">My Lab Reports</h1>
          <p className="text-blue-100 text-sm mt-2">
            View and download your completed lab results.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
            <FaTimesCircle className="text-red-400 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-gray-400 hover:text-gray-600">
              &times;
            </button>
          </div>
        )}

        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaFlask className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No completed lab reports found.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((report) => (
              <div key={report._id} className="report-card bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FaFlask className="text-blue-500 text-sm" />
                        <span className="font-semibold text-gray-800">{report.testType}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                        <span className="flex items-center gap-1">
                          <FaUserMd className="text-gray-400" /> Dr. {report.doctor?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400" /> {new Date(report.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {report.resultText && (
                        <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="font-medium">Result:</p>
                          <p>{report.resultText}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {report.resultFile && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <FaFileAlt /> Attached File
                      </p>
                      {isImageUrl(report.resultFile) ? (
                        <div className="bg-gray-50 rounded-xl p-3">
                          <a href={getCorrectCloudinaryUrl(report.resultFile)} target="_blank" rel="noopener noreferrer">
                            <img
                              src={getCorrectCloudinaryUrl(report.resultFile)}
                              alt="Lab result"
                              className="max-w-full max-h-48 rounded-lg border shadow-sm object-contain mx-auto"
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
                        <FaDownload /> Download File
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