// frontend/src/pages/patient/DashboardLayout.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FaHome, FaUser, FaCalendarAlt, FaComment, FaMicroscope, FaCog, FaSignOutAlt, FaFileAlt 
} from 'react-icons/fa';
import Chatbot from './Chatbot';

export default function DashboardLayout({ children, activePage }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const role = user?.role;

  // Helper to get translation from multiple possible paths
  const getLabel = (key, fallback) => {
    // Try common paths
    if (t.dashboard?.[key]) return t.dashboard[key];
    if (t.nav?.[key]) return t.nav[key];
    if (t.common?.[key]) return t.common[key];
    // Fallback to English
    return fallback;
  };

  const linksMap = {
    patient: [
      { to: '/dashboard/patient',              icon: FaHome,       label: getLabel('home', 'Home'),         key: 'home' },
      { to: '/dashboard/patient/appointments', icon: FaCalendarAlt,label: getLabel('appointments', 'Appointments'), key: 'appointments' },
      { to: '/dashboard/patient/feedback',     icon: FaComment,    label: getLabel('feedback', 'Feedback'),     key: 'feedback' },
      { to: '/dashboard/patient/ai-scanner',   icon: FaMicroscope, label: getLabel('aiScanner', 'AI Scanner'),   key: 'aiscanner' },
      { to: '/dashboard/patient/lab-reports',  icon: FaFileAlt,    label: getLabel('labReports', 'Lab Reports'),  key: 'labreports' },
      { to: '/dashboard/patient/profile',      icon: FaUser,       label: getLabel('profile', 'Profile'),      key: 'profile' },
      { to: '/dashboard/patient/settings',     icon: FaCog,        label: getLabel('settings', 'Settings'),     key: 'settings' },
    ],
  };

  const links = linksMap[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8faff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');

        .sidebar {
          font-family: 'DM Sans', sans-serif;
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          transition: all 0.18s ease;
          cursor: pointer;
          text-decoration: none;
          position: relative;
        }

        .sidebar-link.active {
          background: linear-gradient(135deg, #1d4ed8, #3b82f6);
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
          color: white !important;
        }

        .sidebar-link:not(.active) {
          color: #9ca3af;
        }

        .sidebar-link:not(.active):hover {
          background: #f3f4f6;
          color: #374151;
        }

        .sidebar-tooltip {
          position: absolute;
          left: 60px;
          top: 50%;
          transform: translateY(-50%);
          background: #0f172a;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s;
          z-index: 999;
        }

        .sidebar-link:hover .sidebar-tooltip {
          opacity: 1;
        }

        .sidebar-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: #0f172a;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          transition: all 0.18s ease;
          cursor: pointer;
          border: none;
          background: none;
          color: #9ca3af;
          position: relative;
        }

        .logout-btn:hover {
          background: #fee2e2;
          color: #ef4444;
        }

        .sidebar-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #34d399;
          border: 2px solid white;
        }

        .dash-main {
          font-family: 'DM Sans', sans-serif;
        }
      `}</style>

      <aside
        className="sidebar fixed top-0 left-0 h-screen w-20 flex flex-col items-center justify-between py-5"
        style={{
          background: 'white',
          borderRight: '1.5px solid #f0f2f8',
          boxShadow: '2px 0 20px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              width: 42, height: 42,
              borderRadius: 13,
              background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
              position: 'relative',
            }}
          >
            <span style={{ color: 'white', fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: '1rem' }}>
              M
            </span>
            <div className="sidebar-dot" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
          {links.map(({ to, icon: Icon, label, key }) => (
            <a
              key={to}
              href={to}
              className={`sidebar-link ${activePage === key ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="sidebar-tooltip">{label}</span>
            </a>
          ))}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <FaSignOutAlt size={20} />
          <span className="sidebar-tooltip">{t.common?.logout || 'Logout'}</span>
        </button>
      </aside>

      <main className="dash-main flex-1 ml-20 p-8 min-h-screen" style={{ background: '#f8faff' }}>
        {children}
        {role === 'patient' && <Chatbot />}
      </main>
    </div>
  );
}