// frontend/src/pages/patient/Profile.jsx
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from './DashboardLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FaUserEdit, FaTrash, FaLock, FaEnvelope, FaUser, FaCheckCircle, FaTimesCircle,
  FaHistory, FaInfoCircle, FaChevronDown, FaChevronUp, FaCalendarAlt
} from "react-icons/fa";

export default function Profile() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError(t.profile?.passwordsDoNotMatch || "Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.put("/users/profile", {
        name: formData.name,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      localStorage.setItem("user", JSON.stringify(data));
      setMessage(t.profile?.updateSuccess || "Profile updated successfully");
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || t.profile?.updateFailed || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete("/users/profile");
      logout();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || t.profile?.deleteFailed || "Account deletion failed");
      setShowDeleteModal(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'P';

  // Member since (mock – you can replace with real data from user.createdAt if available)
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })
    : 'January 2025';

  return (
    <DashboardLayout activePage="profile">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .profile-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }

        .hero-profile {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }

        .avatar-ring {
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          padding: 3px;
          border-radius: 9999px;
        }
        .avatar-inner {
          background: linear-gradient(135deg, #1d4ed8, #7c3aed);
          border-radius: 9999px;
          width: 72px; height: 72px;
          display: flex; align-items: center; justify-content: center;
        }

        .form-input {
          width: 100%;
          padding: 11px 16px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.9rem;
          color: #374151;
          background: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .form-input:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
          border-color: #e5e7eb;
        }

        .input-wrapper { position: relative; }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 0.85rem;
          pointer-events: none;
        }
        .form-input.with-icon { padding-left: 40px; }

        .btn-primary {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: white;
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
          transition: opacity 0.2s, transform 0.2s;
          border: none; cursor: pointer;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-danger-outline {
          background: white;
          color: #ef4444;
          border: 1.5px solid #fecaca;
          transition: all 0.2s;
          cursor: pointer;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }
        .btn-danger-outline:hover { background: #fef2f2; border-color: #ef4444; }

        .btn-danger-solid {
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(239,68,68,0.3);
          transition: opacity 0.2s;
          cursor: pointer;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }
        .btn-danger-solid:hover { opacity: 0.9; }

        .btn-secondary {
          background: white;
          color: #6b7280;
          border: 1.5px solid #e5e7eb;
          transition: background 0.15s;
          cursor: pointer;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
        }
        .btn-secondary:hover { background: #f9fafb; }

        .modal-overlay { animation: fadeIn 0.2s ease; }
        .modal-box { animation: slideUp 0.25s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .section-divider {
          border: none;
          border-top: 1.5px solid #f3f4f6;
          margin: 4px 0;
        }
        .fade-in { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="profile-root max-w-3xl mx-auto space-y-6 pb-10 px-4 sm:px-0">

        {/* Hero Section */}
        <div className="hero-profile rounded-2xl p-6 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:260,height:260,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-50,right:-40,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:150,height:150,background:'radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)',bottom:-30,left:50,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10 flex items-center gap-5">
            <div className="avatar-ring flex-shrink-0">
              <div className="avatar-inner">
                <span className="text-white font-bold text-2xl">{initials}</span>
              </div>
            </div>
            <div>
              <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{t.profile?.myAccount || 'MY ACCOUNT'}</p>
              <h1 className="display-font text-2xl md:text-3xl font-semibold">{user?.name || 'Patient'}</h1>
              <p className="text-blue-200 text-sm mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats & User Guide Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stats Card */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-in">
            <div className="flex items-center gap-2 mb-3">
              <FaHistory className="text-blue-500" />
              <h3 className="display-font font-semibold text-gray-800">{t.profile?.accountSummary || 'Account Summary'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">{t.profile?.memberSince || 'Member since'}</p>
                <p className="text-lg font-semibold text-gray-800 flex items-center gap-1">
                  <FaCalendarAlt className="text-blue-400 text-sm" /> {memberSince}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">{t.profile?.accountType || 'Account type'}</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">{user?.role || 'Patient'}</p>
              </div>
            </div>
          </div>

          {/* User Guide Toggle Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer fade-in" onClick={() => setShowGuide(!showGuide)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-violet-500" />
                <h3 className="display-font font-semibold text-gray-800">{t.profile?.userGuide || 'User Guide'}</h3>
              </div>
              {showGuide ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {showGuide && (
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p>✏️ <strong>{t.profile?.step1Title || 'Step 1:'}</strong> {t.profile?.step1Desc || 'Update your name – it will appear on all communications.'}</p>
                <p>🔒 <strong>{t.profile?.step2Title || 'Step 2:'}</strong> {t.profile?.step2Desc || 'Change your password by filling current + new password fields.'}</p>
                <p>⚠️ <strong>{t.profile?.step3Title || 'Step 3:'}</strong> {t.profile?.step3Desc || 'Delete account only if you wish to permanently remove all data.'}</p>
                <p className="text-xs text-gray-400 mt-2">💡 {t.profile?.tip || 'Email address cannot be changed – contact support if needed.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Toast Messages */}
        {message && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 fade-in">
            <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
            <button onClick={() => setMessage('')} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 fade-in">
            <FaTimesCircle className="text-red-400 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-in">
          <div className="px-6 py-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <FaUserEdit className="text-blue-600 text-base" />
              </div>
              <div>
                <h2 className="display-font text-lg font-semibold text-gray-800">{t.profile?.personalInfo || 'Personal Information'}</h2>
                <p className="text-gray-400 text-xs mt-0.5">{t.profile?.updateName || 'Update your name and password'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile?.fullName || 'Full Name'}</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input with-icon"
                    placeholder={t.profile?.fullName || 'Full Name'}
                    required
                  />
                </div>
              </div>

              {/* Email (disabled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile?.emailAddress || 'Email Address'}</label>
                <div className="input-wrapper">
                  <FaEnvelope className="input-icon" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="form-input with-icon"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 ml-1">{t.profile?.emailCannotChange || 'Email cannot be changed'}</p>
              </div>

              <hr className="section-divider" />

              {/* Password Section Header */}
              <div className="flex items-center gap-2 pt-1">
                <FaLock className="text-gray-400 text-sm" />
                <p className="text-sm font-semibold text-gray-600">{t.profile?.changePassword || 'Change Password'}</p>
                <span className="text-xs text-gray-400 font-normal">{t.profile?.leaveBlank || '(leave blank to keep current)'}</span>
              </div>

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile?.currentPassword || 'Current Password'}</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="form-input with-icon"
                    placeholder={t.profile?.currentPassword || 'Current Password'}
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile?.newPassword || 'New Password'}</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="form-input with-icon"
                    placeholder={t.profile?.newPassword || 'New Password'}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.profile?.confirmPassword || 'Confirm New Password'}</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input with-icon"
                    placeholder={t.profile?.confirmPassword || 'Confirm New Password'}
                  />
                </div>
                {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1">
                    <FaTimesCircle className="text-[10px]" /> {t.profile?.passwordsDoNotMatch || 'Passwords do not match'}
                  </p>
                )}
                {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <p className="text-xs text-emerald-500 mt-1.5 ml-1 flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" /> {t.profile?.passwordsMatch || 'Passwords match'}
                  </p>
                )}
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 pb-6 pt-2 flex gap-3 flex-wrap">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary px-6 py-3 text-sm"
              >
                {submitting ? (t.profile?.saving || 'Saving...') : (t.profile?.saveChanges || 'Save Changes')}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger-outline px-5 py-3 text-sm flex items-center gap-2"
              >
                <FaTrash className="text-xs" /> {t.profile?.deleteAccount || 'Delete Account'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="modal-box bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
              <FaTrash className="text-red-500 text-2xl" />
            </div>
            <h3 className="display-font text-xl font-semibold text-gray-800 text-center mb-2">{t.profile?.deleteConfirmTitle || 'Delete Account?'}</h3>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
              {t.profile?.deleteWarning || 'This will permanently delete your account and all data. This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary flex-1 py-2.5 text-sm"
              >
                {t.common?.cancel || 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger-solid flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              >
                <FaTrash className="text-xs" /> {t.common?.yes || 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}