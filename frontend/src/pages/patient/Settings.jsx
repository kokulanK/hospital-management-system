// frontend/src/pages/patient/Settings.jsx
import { useState } from 'react';
import DashboardLayout from './DashboardLayout';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  FaGlobe, FaCheckCircle, FaInfoCircle, FaChevronDown, FaChevronUp, FaHistory
} from 'react-icons/fa';

export default function Settings() {
  const { t, language, changeLanguage } = useLanguage();
  const [showGuide, setShowGuide] = useState(false);
  const [saved, setSaved] = useState(false);

  // Simulate save feedback for language change
  const handleLanguageChange = (newLang) => {
    changeLanguage(newLang);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

        .settings-card {
          background: white;
          border-radius: 16px;
          border: 1px solid #f0f2f8;
          box-shadow: 0 1px 8px rgba(0,0,0,0.04);
          overflow: hidden;
        }

        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          transition: background 0.15s;
        }
        .settings-row:hover { background: #fafafa; }
        .settings-row + .settings-row { border-top: 1px solid #f3f4f6; }

        .lang-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.15s;
          border: 1.5px solid #e5e7eb;
          background: white;
        }
        .lang-option.active {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        .lang-option:hover:not(.active) {
          background: #f9fafb;
        }

        .fade-in { animation: fadeUp 0.4s ease forwards; opacity: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }

        .toast {
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div className="settings-root max-w-3xl mx-auto space-y-6 pb-10 px-4 sm:px-0">

        {/* Hero Section */}
        <div className="hero-settings rounded-2xl p-6 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:260,height:260,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-50,right:-40,borderRadius:'50%'}} />
            <div style={{position:'absolute',width:150,height:150,background:'radial-gradient(circle,rgba(167,139,250,0.12) 0%,transparent 70%)',bottom:-30,left:50,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">{t.settings?.preferences || 'PREFERENCES'}</p>
            <h1 className="display-font text-2xl sm:text-3xl font-semibold mb-2">{t.settings?.title || 'Settings'}</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">{t.settings?.subtitle || 'Customise your experience'}</p>
          </div>
        </div>

        {/* Stats & User Guide Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stats Card */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-in">
            <div className="flex items-center gap-2 mb-3">
              <FaHistory className="text-blue-500" />
              <h3 className="display-font font-semibold text-gray-800">{t.settings?.summaryTitle || 'Settings Summary'}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">{t.settings?.activeLanguage || 'Active Language'}</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {language === 'en' && (t.settings?.english || 'English')}
                  {language === 'si' && (t.settings?.sinhala || 'Sinhala')}
                  {language === 'ta' && (t.settings?.tamil || 'Tamil')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">{t.settings?.version || 'App Version'}</p>
                <p className="text-lg font-semibold text-gray-800">v2.0.0</p>
              </div>
            </div>
          </div>

          {/* User Guide Toggle Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer fade-in" onClick={() => setShowGuide(!showGuide)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-violet-500" />
                <h3 className="display-font font-semibold text-gray-800">{t.settings?.userGuide || 'User Guide'}</h3>
              </div>
              {showGuide ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {showGuide && (
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p>🌐 <strong>{t.settings?.step1Title || 'Step 1:'}</strong> {t.settings?.step1Desc || 'Select your preferred language from the options below.'}</p>
                <p>⚡ <strong>{t.settings?.step2Title || 'Step 2:'}</strong> {t.settings?.step2Desc || 'Changes take effect immediately – no save button needed.'}</p>
                <p className="text-xs text-gray-400 mt-2">💡 {t.settings?.tip || 'More settings like notifications and theme will be added soon.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Language Selection Card */}
        <div className="settings-card fade-in">
          <div className="px-6 py-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <FaGlobe className="text-blue-600 text-base" />
              </div>
              <div>
                <h2 className="display-font text-lg font-semibold text-gray-800">{t.settings?.language || 'Language'}</h2>
                <p className="text-gray-400 text-xs mt-0.5">{t.settings?.languageDesc || 'Choose your preferred language'}</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <div
              className={`lang-option ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{t.settings?.english || 'English'}</p>
                <p className="text-xs text-gray-400">English (US)</p>
              </div>
              {language === 'en' && <FaCheckCircle className="text-blue-500" />}
            </div>
            <div
              className={`lang-option ${language === 'si' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('si')}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{t.settings?.sinhala || 'සිංහල'}</p>
                <p className="text-xs text-gray-400">Sinhala</p>
              </div>
              {language === 'si' && <FaCheckCircle className="text-blue-500" />}
            </div>
            <div
              className={`lang-option ${language === 'ta' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('ta')}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{t.settings?.tamil || 'தமிழ்'}</p>
                <p className="text-xs text-gray-400">Tamil</p>
              </div>
              {language === 'ta' && <FaCheckCircle className="text-blue-500" />}
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center fade-in">
          <p className="text-sm text-gray-500">
            🔧 {t.settings?.moreSettingsSoon || 'More settings (notifications, privacy, theme) will be available in a future update.'}
          </p>
        </div>

        {/* Success Toast for Language Change */}
        {saved && (
          <div className="toast fixed bottom-6 right-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-lg z-50">
            <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-medium">{t.settings?.languageChanged || 'Language updated'}</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}