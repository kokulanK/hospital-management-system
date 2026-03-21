import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaHome, FaClock, FaCalendarAlt, FaStar, FaUser, FaFlask, FaSignOutAlt
} from 'react-icons/fa';

export default function DashboardLayout({ children, activePage }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/dashboard/doctor', icon: FaHome, label: 'Home', key: 'home' },
    { to: '/dashboard/doctor/availability', icon: FaClock, label: 'Availability', key: 'availability' },
    { to: '/dashboard/doctor/appointments', icon: FaCalendarAlt, label: 'Appointments', key: 'appointments' },
    { to: '/dashboard/doctor/feedback', icon: FaStar, label: 'Feedback', key: 'feedback' },
    { to: '/dashboard/doctor/lab-requests', icon: FaFlask, label: 'Lab Requests', key: 'labrequests' }, // fixed
    { to: '/dashboard/doctor/profile', icon: FaUser, label: 'Profile', key: 'profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .doc-sidebar { font-family: 'DM Sans', sans-serif; }
        .doc-main { font-family: 'DM Sans', sans-serif; }
        .sidebar-link {
          display: flex; align-items: center; justify-content: center;
          width: 48px; height: 48px; border-radius: 14px;
          transition: all 0.18s ease; cursor: pointer;
          text-decoration: none; position: relative;
        }
        .sidebar-link.active {
          background: linear-gradient(135deg,#1d4ed8,#3b82f6);
          box-shadow: 0 4px 14px rgba(59,130,246,0.35);
          color: white !important;
        }
        .sidebar-link:not(.active) { color: #9ca3af; }
        .sidebar-link:not(.active):hover { background: #f3f4f6; color: #374151; }
        .sidebar-tooltip {
          position: absolute; left: 60px; top: 50%; transform: translateY(-50%);
          background: #0f172a; color: white; font-size: 0.75rem; font-weight: 500;
          padding: 5px 10px; border-radius: 8px; white-space: nowrap;
          opacity: 0; pointer-events: none; transition: opacity 0.15s;
          z-index: 999;
        }
        .sidebar-link:hover .sidebar-tooltip { opacity: 1; }
        .sidebar-tooltip::before {
          content: ''; position: absolute; right: 100%; top: 50%; transform: translateY(-50%);
          border: 5px solid transparent; border-right-color: #0f172a;
        }
        .logout-btn {
          display: flex; align-items: center; justify-content: center;
          width: 48px; height: 48px; border-radius: 14px;
          transition: all 0.18s ease; cursor: pointer; border: none;
          background: none; color: #9ca3af; position: relative;
        }
        .logout-btn:hover { background: #fee2e2; color: #ef4444; }
        .sidebar-dot {
          position: absolute; top: 10px; right: 10px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399; border: 2px solid white;
        }
      `}</style>

      {/* Sidebar */}
      <aside className="doc-sidebar fixed top-0 left-0 h-screen w-20 bg-white flex flex-col items-center justify-between py-5"
        style={{ borderRight: '1.5px solid #f0f2f8', boxShadow: '2px 0 20px rgba(0,0,0,0.04)' }}>

        {/* Logo */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59,130,246,0.3)', position: 'relative'
          }}>
            <span style={{ color: 'white', fontFamily: "'Fraunces',serif", fontWeight: 700, fontSize: '1rem' }}>M</span>
            <div className="sidebar-dot" />
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
          {links.map(({ to, icon: Icon, label, key }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-link ${activePage === key ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="sidebar-tooltip">{label}</span>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <FaSignOutAlt size={20} />
          <span className="sidebar-tooltip">Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <main className="doc-main flex-1 ml-20 p-8 min-h-screen" style={{ background: '#f8faff' }}>
        {children}
      </main>
    </div>
  );
}