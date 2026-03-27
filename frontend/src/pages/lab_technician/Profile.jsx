import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { FaUserEdit, FaLock, FaEnvelope, FaUser, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function LabTechnicianProfile() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
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
      setMessage("Profile updated successfully");
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'L';

  const roleDisplay = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Lab Technician';

  return (
    <div className="profile-root max-w-3xl mx-auto space-y-6 pb-10">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .profile-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }

        .hero-profile { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%); }
        .avatar-ring { background: linear-gradient(135deg, #60a5fa, #a78bfa); padding: 3px; border-radius: 9999px; }
        .avatar-inner { background: linear-gradient(135deg, #1d4ed8, #7c3aed); border-radius: 9999px; width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; }

        .form-input { width: 100%; padding: 11px 16px; border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 0.9rem; color: #374151; background: white; transition: border-color 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; }
        .form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .form-input:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; border-color: #e5e7eb; }

        .input-wrapper { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9ca3af; font-size: 0.85rem; pointer-events: none; }
        .form-input.with-icon { padding-left: 40px; }

        .btn-primary { background: linear-gradient(135deg, #1d4ed8, #3b82f6); color: white; box-shadow: 0 4px 14px rgba(59,130,246,0.35); transition: opacity 0.2s, transform 0.2s; border: none; cursor: pointer; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-weight: 500; }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .section-divider { border: none; border-top: 1.5px solid #f3f4f6; margin: 4px 0; }
      `}</style>

      {/* Hero */}
      <div className="hero-profile rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
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
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{roleDisplay} Account</p>
            <h1 className="display-font text-2xl md:text-3xl font-semibold">{user?.name || 'Lab Technician'}</h1>
            <p className="text-blue-200 text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Toast Messages */}
      {message && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
          <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
          <button onClick={() => setMessage('')} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
          <FaTimesCircle className="text-red-400 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaUserEdit className="text-blue-600 text-base" />
            </div>
            <div>
              <h2 className="display-font text-lg font-semibold text-gray-800">Personal Information</h2>
              <p className="text-gray-400 text-xs mt-0.5">Update your name and account details</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="input-wrapper">
                <FaUser className="input-icon" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input with-icon" placeholder="Your full name" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input type="email" value={user?.email || ""} disabled className="form-input with-icon" />
              </div>
              <p className="text-xs text-gray-400 mt-1.5 ml-1">Email address cannot be changed.</p>
            </div>

            <hr className="section-divider" />

            {/* Password Section */}
            <div className="flex items-center gap-2 pt-1">
              <FaLock className="text-gray-400 text-sm" />
              <p className="text-sm font-semibold text-gray-600">Change Password</p>
              <span className="text-xs text-gray-400 font-normal">(leave blank to keep current)</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="form-input with-icon" placeholder="Enter current password" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="form-input with-icon" placeholder="Enter new password" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input with-icon" placeholder="Re-enter new password" />
              </div>
              {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5 ml-1 flex items-center gap-1"><FaTimesCircle className="text-[10px]" /> Passwords do not match</p>
              )}
              {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <p className="text-xs text-emerald-500 mt-1.5 ml-1 flex items-center gap-1"><FaCheckCircle className="text-[10px]" /> Passwords match</p>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 flex gap-3 flex-wrap">
            <button type="submit" disabled={submitting} className="btn-primary px-6 py-3 text-sm">
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}