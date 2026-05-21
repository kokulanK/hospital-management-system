import { useState, useEffect } from 'react';
import DashboardLayout from "./DashboardLayout";
import api from '../../api/axios';
import { FaUserInjured, FaProcedures, FaCheckCircle, FaSpinner } from 'react-icons/fa';

export default function DoctorAdmissions() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admittingId, setAdmittingId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/users/patients');
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmit = async (patientId) => {
    setAdmittingId(patientId);
    try {
      await api.post('/admissions/recommend', { patientId });
      alert('Admission recommended successfully. Receptionist will allocate a bed.');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to recommend admission.');
    } finally {
      setAdmittingId(null);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout activePage="admissions">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .admissions-root { font-family:'DM Sans',sans-serif; }
        .display-font { font-family:'Fraunces',serif; }
        .hero-admissions { background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%); }
        .patient-card { transition:all 0.2s; border: 1px solid #f1f5f9; }
        .patient-card:hover { transform:translateY(-2px); box-shadow:0 12px 24px -8px rgba(0,0,0,0.1); border-color: #cbd5e1; }
        .btn-admit { background:linear-gradient(135deg,#3b82f6,#2563eb); color:white; transition:all 0.2s; }
        .btn-admit:hover { box-shadow:0 4px 12px rgba(37,99,235,0.3); transform:translateY(-1px); }
        .btn-admit:disabled { opacity:0.6; cursor:not-allowed; transform:none; box-shadow:none; }
      `}</style>

      <div className="admissions-root max-w-5xl mx-auto space-y-6 pb-10">
        
        {/* Hero Section */}
        <div className="hero-admissions rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <FaProcedures className="text-9xl" />
          </div>
          <div className="relative z-10">
            <p className="text-blue-300 text-sm font-semibold tracking-widest uppercase mb-2">Ward Management</p>
            <h1 className="display-font text-4xl font-bold mb-3">Admit Patients</h1>
            <p className="text-gray-300 text-base max-w-lg leading-relaxed">
              Recommend patients for ward admission. The reception team will handle bed allocation and visitor access.
            </p>
          </div>
        </div>

        {/* Search & List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Patient Directory</h2>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[280px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-3xl text-blue-500" /></div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-2xl">
              <p className="text-gray-500">No patients found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatients.map(patient => (
                <div key={patient._id} className="patient-card bg-white rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                      <FaUserInjured className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{patient.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{patient.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAdmit(patient._id)}
                    disabled={admittingId === patient._id}
                    className="btn-admit px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
                  >
                    {admittingId === patient._id ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>Admit <FaCheckCircle className="opacity-70" /></>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
