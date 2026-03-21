import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaStar, FaCheckCircle, FaTimesCircle, FaComment, FaEdit } from 'react-icons/fa';

export default function Feedback() {
  const [appointments, setAppointments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedbackId(feedback._id);
    setEditingAppointmentId(feedback.appointment._id);
    setRating(feedback.rating);
    setComment(feedback.comment || '');
    setSelectedAppointment(feedback.appointment._id); // for display consistency
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
      setMessage('error:Please select an appointment');
      return;
    }
    setSubmitting(true);
    try {
      if (editingFeedbackId) {
        await api.put(`/feedback/${editingFeedbackId}`, { rating, comment });
        setMessage('success:Feedback updated successfully');
      } else {
        await api.post('/feedback', {
          appointmentId: selectedAppointment,
          rating,
          comment
        });
        setMessage('success:Feedback submitted successfully');
      }
      // Reset form and refresh data
      handleCancelEdit();
      fetchData();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Submission failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  // Find the selected appointment (for editing display)
  const selectedAppointmentObj = appointments.find(a => a._id === editingAppointmentId) ||
                                 feedbacks.find(f => f.appointment?._id === editingAppointmentId)?.appointment;

  return (
    <DashboardLayout activePage="feedback">
      <style>{`
        .hero-feedback {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-feedback rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">Patient Feedback</h1>
          <p className="text-blue-100 text-sm mt-2">
            Share your experience and review your previous feedback.
          </p>
        </div>

        {/* Toast Message */}
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

        {/* Feedback Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="display-font text-lg font-semibold text-gray-800 mb-4">
            {editingFeedbackId ? 'Edit Feedback' : 'Give New Feedback'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Appointment Selection */}
            {!editingFeedbackId ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Appointment
                </label>
                <select
                  value={selectedAppointment}
                  onChange={(e) => setSelectedAppointment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  required
                >
                  <option value="">Choose an appointment</option>
                  {appointments.map(app => (
                    <option key={app._id} value={app._id}>
                      Dr. {app.doctor?.name} – {new Date(app.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-sm text-gray-600">
                  Editing feedback for <strong>Dr. {selectedAppointmentObj?.doctor?.name}</strong> on{' '}
                  {selectedAppointmentObj && new Date(selectedAppointmentObj.date).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2 items-center">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-2 rounded-lg transition focus:outline-none"
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
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                placeholder="Share your experience..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {submitting
                  ? (editingFeedbackId ? 'Updating...' : 'Submitting...')
                  : (editingFeedbackId ? 'Update Feedback' : 'Submit Feedback')}
              </button>
              {editingFeedbackId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Previous Feedback Section */}
        <div>
          <h2 className="display-font text-lg font-semibold text-gray-800 mb-4">
            My Previous Feedback
          </h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading feedback...</p>
          ) : feedbacks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <FaComment className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-400 text-sm">You haven't given any feedback yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map(fb => (
                <div key={fb._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Dr. {fb.appointment?.doctor?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(fb.createdAt).toLocaleDateString()}
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
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit feedback"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                  {fb.comment && (
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl italic">
                      "{fb.comment}"
                    </p>
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