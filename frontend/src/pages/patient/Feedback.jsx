import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { FaStar, FaCheckCircle, FaTimesCircle, FaComment, FaEdit, FaHistory } from 'react-icons/fa';

export default function Feedback() {
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state – fresh start
  const [selectedAppointment, setSelectedAppointment] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(null);
  const [comment, setComment] = useState('');
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appRes, fbRes] = await Promise.all([
        api.get('/appointments/completed-without-feedback'),
        api.get('/feedback/patient')
      ]);
      setAppointments(appRes.data);
      setFeedbacks(fbRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setMessage('error:' + (t.feedback?.loadError || 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedbackId(feedback._id);
    setEditingAppointmentId(feedback.appointment._id);
    setRating(feedback.rating);
    setComment(feedback.comment || '');
    setSelectedAppointment(feedback.appointment._id);
  };

  const handleCancelEdit = () => {
    setEditingFeedbackId(null);
    setEditingAppointmentId(null);
    setSelectedAppointment('');
    setRating(5);
    setComment('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment && !editingFeedbackId) {
      setMessage('error:' + (t.feedback?.errorSelect || 'Please select an appointment'));
      return;
    }
    setSubmitting(true);
    try {
      if (editingFeedbackId) {
        await api.put(`/feedback/${editingFeedbackId}`, { rating, comment });
        setMessage('success:' + (t.feedback?.successUpdate || 'Feedback updated successfully'));
      } else {
        await api.post('/feedback', {
          appointmentId: selectedAppointment,
          rating,
          comment
        });
        setMessage('success:' + (t.feedback?.successSubmit || 'Feedback submitted successfully'));
      }
      handleCancelEdit();
      fetchData();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || t.feedback?.errorSubmit || 'Failed to submit feedback'));
    } finally {
      setSubmitting(false);
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  const selectedAppointmentObj = appointments.find(a => a._id === editingAppointmentId) ||
                                 feedbacks.find(f => f.appointment?._id === editingAppointmentId)?.appointment;

  const totalFeedbacks = feedbacks.length;
  const avgRating = totalFeedbacks > 0
    ? (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / totalFeedbacks).toFixed(1)
    : 0;

  return (
    <DashboardLayout activePage="feedback">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .feedback-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }
        .hero-feedback {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .fade-in { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .star-btn {
          transition: transform 0.1s ease;
        }
        .star-btn:hover {
          transform: scale(1.1);
        }
      `}</style>

      <div className="feedback-root max-w-4xl mx-auto space-y-6 pb-10 px-4 sm:px-0">

        {/* Hero Section */}
        <div className="hero-feedback rounded-2xl p-6 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:280,height:280,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-60,right:-40,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:160,height:160,background:'radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)',bottom:-30,left:60,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{t.feedback?.heroBadge || 'YOUR VOICE MATTERS'}</p>
            <h1 className="display-font text-2xl sm:text-3xl font-semibold mb-2">{t.feedback?.title || 'Patient Feedback'}</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">{t.feedback?.subtitle || 'Share your experience to help us improve'}</p>
          </div>
        </div>

        {/* Stats Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-in">
            <div className="flex items-center gap-2 mb-3">
              <FaHistory className="text-blue-500" />
              <h3 className="display-font font-semibold text-gray-800">Feedback Summary</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Total Feedback</p>
                <p className="text-2xl font-bold text-gray-800">{totalFeedbacks}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Average Rating</p>
                <p className="text-2xl font-bold text-amber-500">{avgRating} ★</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-in">
            <div className="flex items-center gap-2">
              <FaComment className="text-violet-500" />
              <h3 className="display-font font-semibold text-gray-800">How it works</h3>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              📋 Select a completed appointment → ⭐ Rate your experience → 💬 Add optional comment → ✅ Submit
            </p>
            <p className="text-xs text-gray-400 mt-2">💡 You can edit your feedback anytime.</p>
          </div>
        </div>

        {/* Toast Message */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            msgType === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-600'
          } fade-in`}>
            {msgType === 'success'
              ? <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
              : <FaTimesCircle className="text-red-400 flex-shrink-0" />}
            <p className="text-sm font-medium">{msgText}</p>
            <button onClick={() => setMessage('')} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>
        )}

        {/* Feedback Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 fade-in">
          <h2 className="display-font text-lg font-semibold text-gray-800 mb-4">
            {editingFeedbackId ? (t.feedback?.editFeedback || 'Edit Feedback') : (t.feedback?.giveNew || 'Give New Feedback')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Appointment Selection */}
            {!editingFeedbackId ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.feedback?.selectAppointment || 'Select Appointment'}
                </label>
                <select
                  value={selectedAppointment}
                  onChange={(e) => setSelectedAppointment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">{t.feedback?.chooseAppointment || 'Choose an appointment'}</option>
                  {appointments.map(app => (
                    <option key={app._id} value={app._id}>
                      Dr. {app.doctor?.name} – {new Date(app.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {appointments.length === 0 && !loading && (
                  <p className="text-xs text-amber-600 mt-1">{t.feedback?.noEligibleAppointments || 'No completed appointments available for feedback'}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-sm text-gray-600">
                  {t.feedback?.editingFor || 'Editing feedback for'} <strong>Dr. {selectedAppointmentObj?.doctor?.name}</strong> {t.feedback?.on || 'on'}{' '}
                  {selectedAppointmentObj && new Date(selectedAppointmentObj.date).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Rating Stars – fully interactive */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.feedback?.rating || 'Rating'}
              </label>
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="star-btn p-2 rounded-lg transition focus:outline-none"
                  >
                    <FaStar
                      className={`text-xl ${
                        (hoverRating !== null ? hoverRating >= n : rating >= n)
                          ? 'text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-500">{rating}/5</span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.feedback?.commentOptional || 'Comment (optional)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t.feedback?.shareExperience || 'Share your experience...'}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || (!editingFeedbackId && !selectedAppointment)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50 transition hover:shadow-md"
              >
                {submitting
                  ? (editingFeedbackId ? (t.feedback?.updating || 'Updating...') : (t.feedback?.submitting || 'Submitting...'))
                  : (editingFeedbackId ? (t.feedback?.updateFeedback || 'Update Feedback') : (t.feedback?.submit || 'Submit Feedback'))}
              </button>
              {editingFeedbackId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
                >
                  {t.common?.cancel || 'Cancel'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Previous Feedback Section */}
        <div>
          <h2 className="display-font text-lg font-semibold text-gray-800 mb-4">
            {t.feedback?.myPreviousFeedback || 'My Previous Feedback'} <span className="text-gray-400">({feedbacks.length})</span>
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />)}
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <FaComment className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{t.feedback?.noFeedback || 'No feedback given yet.'}</p>
              <p className="text-xs text-gray-400 mt-1">{t.feedback?.feedbackAfterAppointment || 'Feedback appears here after you complete an appointment.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((fb, idx) => (
                <div key={fb._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Dr. {fb.appointment?.doctor?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(fb.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <FaStar
                            key={n}
                            className={`text-sm ${n <= fb.rating ? 'text-amber-400' : 'text-gray-200'}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => handleEdit(fb)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title={t.feedback?.editFeedback || 'Edit feedback'}
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                  {fb.comment && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-sm text-gray-600 italic">"{fb.comment}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}