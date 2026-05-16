// frontend/src/pages/labtechnician/DashboardLayout.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaHome, FaFlask, FaUser, FaSignOutAlt } from 'react-icons/fa';
import AILabAssistant from '../../components/AILabAssistant';

export default function DashboardLayout({ children, activePage }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/dashboard/labtechnician', icon: FaHome, label: 'Home', key: 'home' },
    { to: '/dashboard/labtechnician/requests', icon: FaFlask, label: 'Lab Requests', key: 'requests' },
    { to: '/dashboard/labtechnician/profile', icon: FaUser, label: 'Profile', key: 'profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .lab-sidebar { font-family: 'DM Sans', sans-serif; }
        .lab-main { font-family: 'DM Sans', sans-serif; }
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
          position: absolute; top: 0px; right: 0px;
          width: 8px; height: 8px; border-radius: 50%;
          background: #34d399; border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className="lab-sidebar fixed top-0 left-0 h-screen w-20 bg-white flex flex-col items-center justify-between py-5"
        style={{ borderRight: '1.5px solid #f0f2f8', boxShadow: '2px 0 20px rgba(0,0,0,0.04)' }}
      >
        {/* Logo - clickable to Instagram */}
        <div style={{ marginBottom: '8px', position: 'relative' }}>
          <a
            href="https://www.instagram.com/kosa_tech_pvt_ltd"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <img
              src="/logo/KOSA%20Tech.svg"
              alt="KOSA Tech Logo"
              style={{
                width: '46px',
                height: '46px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))',
                transition: 'transform 0.2s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          </a>
          <div className="sidebar-dot" />
        </div>

        {/* Nav links */}
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

        {/* Logout */}
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <FaSignOutAlt size={20} />
          <span className="sidebar-tooltip">Logout</span>
        </button>
      </aside>

      {/* Main */}
      <main className="lab-main flex-1 ml-20 p-8 min-h-screen" style={{ background: '#f8faff' }}>
        {children}
      </main>

      {/* AI Assistant Chatbot */}
      <AILabAssistant />
    </div>
  );
}