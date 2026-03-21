// frontend/src/pages/patient/Settings.jsx
import { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import {
  FaBell, FaShieldAlt, FaPalette, FaGlobe, FaMoon, FaSun,
  FaToggleOn, FaToggleOff, FaCheckCircle, FaMobile, FaEnvelope,
  FaLock, FaEye, FaDownload, FaSignOutAlt
} from 'react-icons/fa';

const Toggle = ({ enabled, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-blue-500' : 'bg-gray-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export default function Settings() {
  const [saved, setSaved] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailReminders: true,
    emailPromotions: false,
    smsAppointments: true,
    smsReminders: false,
    pushAll: true,
    pushReminders: true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareDataResearch: false,
    twoFactor: false,
    loginAlerts: true,
  });

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Colombo',
    fontSize: 'medium',
  });

  const toggleNotif = (key) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  const togglePrivacy = (key) =>
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout activePage="settings">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .settings-root { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Fraunces', serif; }

        .hero-settings {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }

        .settings-card { background: white; border-radius: 16px; border: 1.5px solid #f3f4f6; box-shadow: 0 1px 8px rgba(0,0,0,0.04); overflow: hidden; }

        .settings-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 24px;
          transition: background 0.15s;
        }
        .settings-row:hover { background: #fafafa; }
        .settings-row + .settings-row { border-top: 1px solid #f3f4f6; }

        .section-header {
          padding: 18px 24px 14px;
          border-bottom: 1px solid #f3f4f6;
          display: flex; align-items: center; gap: 12px;
        }
        .section-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .theme-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 16px; border-radius: 10px; border: 1.5px solid #e5e7eb;
          font-size: 0.85rem; font-weight: 500; cursor: pointer;
          transition: all 0.15s; background: white; color: #6b7280;
          font-family: 'DM Sans', sans-serif;
        }
        .theme-btn.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
        .theme-btn:hover:not(.active) { background: #f9fafb; }

        .select-field {
          padding: 8px 12px; border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 0.85rem; color: #374151; background: white;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: border-color 0.2s;
        }
        .select-field:focus { outline: none; border-color: #3b82f6; }

        .save-btn {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          color: white; border: none; border-radius: 12px;
          padding: 11px 28px; font-size: 0.9rem; font-weight: 500;
          cursor: pointer; box-shadow: 0 4px 14px rgba(59,130,246,0.35);
          transition: opacity 0.2s, transform 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .save-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .danger-btn {
          background: white; color: #ef4444;
          border: 1.5px solid #fecaca; border-radius: 12px;
          padding: 10px 20px; font-size: 0.85rem; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 8px;
        }
        .danger-btn:hover { background: #fef2f2; border-color: #ef4444; }

        .badge {
          font-size: 0.7rem; font-weight: 600; padding: 2px 8px;
          border-radius: 99px; letter-spacing: 0.02em;
        }
        .badge-blue { background: #dbeafe; color: #1d4ed8; }
        .badge-gray { background: #f3f4f6; color: #6b7280; }
        .badge-green { background: #dcfce7; color: #16a34a; }

        .fade-in { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .fade-in:nth-child(1) { animation-delay: 0.04s; }
        .fade-in:nth-child(2) { animation-delay: 0.10s; }
        .fade-in:nth-child(3) { animation-delay: 0.16s; }
        .fade-in:nth-child(4) { animation-delay: 0.22s; }
        .fade-in:nth-child(5) { animation-delay: 0.28s; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        .toast {
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="settings-root max-w-3xl mx-auto space-y-5 pb-10">

        {/* ── Hero ── */}
        <div className="hero-settings rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:260,height:260,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-50,right:-40,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:150,height:150,background:'radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)',bottom:-30,left:50,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Preferences</p>
            <h1 className="display-font text-3xl font-semibold mb-2">Settings</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">
              Manage your notifications, privacy, appearance, and account preferences.
            </p>
          </div>
        </div>

        {/* ── Save Toast ── */}
        {saved && (
          <div className="toast flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-medium">Settings saved successfully!</p>
          </div>
        )}

        {/* ══════════════════════════
            NOTIFICATIONS
        ══════════════════════════ */}
        <div className="settings-card fade-in">
          <div className="section-header">
            <div className="section-icon bg-blue-50">
              <FaBell className="text-blue-500 text-base" />
            </div>
            <div>
              <p className="display-font font-semibold text-gray-800">Notifications</p>
              <p className="text-xs text-gray-400 mt-0.5">Control how and when we reach you</p>
            </div>
          </div>

          {/* Email */}
          <div className="px-6 pt-4 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FaEnvelope className="text-gray-300" /> Email
            </p>
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Appointment confirmations</p>
              <p className="text-xs text-gray-400 mt-0.5">Receive email when appointments are booked</p>
            </div>
            <Toggle enabled={notifications.emailAppointments} onToggle={() => toggleNotif('emailAppointments')} />
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Appointment reminders</p>
              <p className="text-xs text-gray-400 mt-0.5">24-hour email reminder before your visit</p>
            </div>
            <Toggle enabled={notifications.emailReminders} onToggle={() => toggleNotif('emailReminders')} />
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Promotions & tips</p>
              <p className="text-xs text-gray-400 mt-0.5">Health tips, news and special offers</p>
            </div>
            <Toggle enabled={notifications.emailPromotions} onToggle={() => toggleNotif('emailPromotions')} />
          </div>

          {/* SMS */}
          <div className="px-6 pt-4 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FaMobile className="text-gray-300" /> SMS
            </p>
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Appointment confirmations</p>
              <p className="text-xs text-gray-400 mt-0.5">SMS when a booking is confirmed</p>
            </div>
            <Toggle enabled={notifications.smsAppointments} onToggle={() => toggleNotif('smsAppointments')} />
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Appointment reminders</p>
              <p className="text-xs text-gray-400 mt-0.5">Text reminder 2 hours before your visit</p>
            </div>
            <Toggle enabled={notifications.smsReminders} onToggle={() => toggleNotif('smsReminders')} />
          </div>

          {/* Push */}
          <div className="px-6 pt-4 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <FaBell className="text-gray-300" /> Push
            </p>
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">All push notifications</p>
              <p className="text-xs text-gray-400 mt-0.5">Master toggle for in-app notifications</p>
            </div>
            <Toggle enabled={notifications.pushAll} onToggle={() => toggleNotif('pushAll')} />
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Scan result alerts</p>
              <p className="text-xs text-gray-400 mt-0.5">Notified when your AI scan analysis is ready</p>
            </div>
            <Toggle enabled={notifications.pushReminders} onToggle={() => toggleNotif('pushReminders')} />
          </div>
        </div>

        {/* ══════════════════════════
            PRIVACY & SECURITY
        ══════════════════════════ */}
        <div className="settings-card fade-in">
          <div className="section-header">
            <div className="section-icon bg-violet-50">
              <FaShieldAlt className="text-violet-500 text-base" />
            </div>
            <div>
              <p className="display-font font-semibold text-gray-800">Privacy & Security</p>
              <p className="text-xs text-gray-400 mt-0.5">Manage your data and account security</p>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Public profile visibility</p>
              <p className="text-xs text-gray-400 mt-0.5">Allow doctors to view your profile details</p>
            </div>
            <Toggle enabled={privacy.profileVisible} onToggle={() => togglePrivacy('profileVisible')} />
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Share data for research
                <span className="badge badge-gray">Anonymous</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Help improve our AI models with anonymised data</p>
            </div>
            <Toggle enabled={privacy.shareDataResearch} onToggle={() => togglePrivacy('shareDataResearch')} />
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                Two-factor authentication
                <span className={`badge ${privacy.twoFactor ? 'badge-green' : 'badge-gray'}`}>{privacy.twoFactor ? 'ON' : 'OFF'}</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Extra layer of security for your login</p>
            </div>
            <Toggle enabled={privacy.twoFactor} onToggle={() => togglePrivacy('twoFactor')} />
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Login activity alerts</p>
              <p className="text-xs text-gray-400 mt-0.5">Get notified of new logins from unfamiliar devices</p>
            </div>
            <Toggle enabled={privacy.loginAlerts} onToggle={() => togglePrivacy('loginAlerts')} />
          </div>

          {/* Active sessions (dummy) */}
          <div className="px-6 py-4 border-t border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FaEye className="text-gray-300" /> Active Sessions
            </p>
            <div className="space-y-2">
              {[
                { device: 'Chrome on Windows', location: 'Colombo, LK', current: true },
                { device: 'Safari on iPhone', location: 'Colombo, LK', current: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      {s.device}
                      {s.current && <span className="badge badge-blue">Current</span>}
                    </p>
                    <p className="text-xs text-gray-400">{s.location}</p>
                  </div>
                  {!s.current && (
                    <button className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">Revoke</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════
            APPEARANCE
        ══════════════════════════ */}
        <div className="settings-card fade-in">
          <div className="section-header">
            <div className="section-icon bg-amber-50">
              <FaPalette className="text-amber-500 text-base" />
            </div>
            <div>
              <p className="display-font font-semibold text-gray-800">Appearance</p>
              <p className="text-xs text-gray-400 mt-0.5">Customize how the app looks and feels</p>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Theme</p>
              <p className="text-xs text-gray-400 mt-0.5">Choose your preferred colour scheme</p>
            </div>
            <div className="flex gap-2">
              <button
                className={`theme-btn ${appearance.theme === 'light' ? 'active' : ''}`}
                onClick={() => setAppearance(p => ({ ...p, theme: 'light' }))}
              >
                <FaSun className="text-sm" /> Light
              </button>
              <button
                className={`theme-btn ${appearance.theme === 'dark' ? 'active' : ''}`}
                onClick={() => setAppearance(p => ({ ...p, theme: 'dark' }))}
              >
                <FaMoon className="text-sm" /> Dark
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FaGlobe className="text-gray-400 text-xs" /> Language
              </p>
              <p className="text-xs text-gray-400 mt-0.5">App display language</p>
            </div>
            <select
              value={appearance.language}
              onChange={e => setAppearance(p => ({ ...p, language: e.target.value }))}
              className="select-field"
            >
              <option value="en">English</option>
              <option value="si">Sinhala</option>
              <option value="ta">Tamil</option>
              <option value="fr">French</option>
            </select>
          </div>

          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Timezone</p>
              <p className="text-xs text-gray-400 mt-0.5">Used for appointment scheduling</p>
            </div>
            <select
              value={appearance.timezone}
              onChange={e => setAppearance(p => ({ ...p, timezone: e.target.value }))}
              className="select-field"
            >
              <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (GMT+5:30)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
              <option value="America/New_York">America/New York (GMT-5)</option>
            </select>
          </div>

          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Font size</p>
              <p className="text-xs text-gray-400 mt-0.5">Adjust text size across the app</p>
            </div>
            <select
              value={appearance.fontSize}
              onChange={e => setAppearance(p => ({ ...p, fontSize: e.target.value }))}
              className="select-field"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        {/* ══════════════════════════
            ACCOUNT ACTIONS
        ══════════════════════════ */}
        <div className="settings-card fade-in">
          <div className="section-header">
            <div className="section-icon bg-gray-100">
              <FaLock className="text-gray-500 text-base" />
            </div>
            <div>
              <p className="display-font font-semibold text-gray-800">Account</p>
              <p className="text-xs text-gray-400 mt-0.5">Data and account management</p>
            </div>
          </div>

          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Download my data</p>
              <p className="text-xs text-gray-400 mt-0.5">Export all your appointments, scans, and feedback</p>
            </div>
            <button className="theme-btn flex items-center gap-2">
              <FaDownload className="text-xs" /> Export
            </button>
          </div>
          <div className="settings-row">
            <div>
              <p className="text-sm font-medium text-gray-700">Sign out everywhere</p>
              <p className="text-xs text-gray-400 mt-0.5">Log out of all active sessions and devices</p>
            </div>
            <button className="danger-btn">
              <FaSignOutAlt className="text-xs" /> Sign out all
            </button>
          </div>
        </div>

        {/* ── Save Button ── */}
        <div className="flex justify-end pt-1">
          <button onClick={handleSave} className="save-btn">
            Save Settings
          </button>
        </div>

      </div>
    </DashboardLayout>
  );
}