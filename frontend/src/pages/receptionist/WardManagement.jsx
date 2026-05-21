import { useState, useEffect } from 'react';
import DashboardLayout from "./DashboardLayout";
import api from '../../api/axios';
import { FaBed, FaHospitalAlt, FaClock, FaCheckCircle, FaPlus, FaSpinner, FaUserInjured } from 'react-icons/fa';

export default function WardManagement() {
  const [activeTab, setActiveTab] = useState('admissions');
  
  // Data state
  const [admissions, setAdmissions] = useState([]);
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [visitingHours, setVisitingHours] = useState({ start: '14:00', end: '16:00' });
  const [loading, setLoading] = useState(false);

  // Forms state
  const [allocatingAdmission, setAllocatingAdmission] = useState(null);
  const [selectedWardForAlloc, setSelectedWardForAlloc] = useState('');
  const [selectedBedForAlloc, setSelectedBedForAlloc] = useState('');

  const [newWard, setNewWard] = useState({ name: '', type: 'General', capacity: 10, description: '' });
  const [newBed, setNewBed] = useState({ ward: '', bedNumber: '' });

  useEffect(() => {
    fetchWards();
    fetchVisitingHours();
    if (activeTab === 'admissions') fetchPendingAdmissions();
  }, [activeTab]);

  const fetchPendingAdmissions = async () => {
    try {
      const { data } = await api.get('/admissions/pending');
      setAdmissions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWards = async () => {
    try {
      const { data } = await api.get('/ward/wards');
      setWards(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBeds = async (wardId) => {
    try {
      const { data } = await api.get(`/ward/beds/${wardId}`);
      setBeds(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVisitingHours = async () => {
    try {
      const { data } = await api.get('/ward/settings/visiting-hours');
      if (data && data.value) {
        setVisitingHours(data.value);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Actions
  const handleAllocateBed = async () => {
    if (!selectedWardForAlloc || !selectedBedForAlloc) return alert('Select ward and bed');
    try {
      await api.put(`/admissions/${allocatingAdmission._id}/allocate`, {
        wardId: selectedWardForAlloc,
        bedId: selectedBedForAlloc
      });
      alert('Bed allocated successfully!');
      setAllocatingAdmission(null);
      fetchPendingAdmissions();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to allocate bed');
    }
  };

  const handleCreateWard = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ward/wards', newWard);
      alert('Ward created');
      setNewWard({ name: '', type: 'General', capacity: 10, description: '' });
      fetchWards();
    } catch (error) {
      alert('Failed to create ward');
    }
  };

  const handleCreateBed = async (e) => {
    e.preventDefault();
    if (!newBed.ward || !newBed.bedNumber) return;
    try {
      await api.post('/ward/beds', newBed);
      alert('Bed created');
      setNewBed({ ...newBed, bedNumber: '' });
      fetchBeds(newBed.ward); // refresh beds if viewing that ward
    } catch (error) {
      alert('Failed to create bed');
    }
  };

  const handleUpdateHours = async (e) => {
    e.preventDefault();
    try {
      await api.put('/ward/settings/visiting-hours', visitingHours);
      alert('Visiting hours updated');
    } catch (error) {
      alert('Failed to update hours');
    }
  };

  return (
    <DashboardLayout activePage="ward-management">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .ward-root { font-family:'DM Sans',sans-serif; }
        .display-font { font-family:'Fraunces',serif; }
        .hero-ward { background:linear-gradient(135deg,#0284c7 0%,#0369a1 100%); }
        .tab-btn { padding:10px 20px; border-radius:12px; font-weight:600; font-size:0.9rem; transition:all 0.2s; color:#64748b; }
        .tab-btn.active { background:#0ea5e9; color:white; box-shadow:0 4px 12px rgba(14,165,233,0.3); }
        .tab-btn:hover:not(.active) { background:#f1f5f9; color:#334155; }
        .input-st { width:100%; padding:10px 16px; border-radius:10px; border:1px solid #e2e8f0; font-size:0.9rem; focus:outline-none; transition:all 0.2s; }
        .input-st:focus { border-color:#0ea5e9; box-shadow:0 0 0 3px rgba(14,165,233,0.1); outline:none; }
        .btn-primary { background:#0ea5e9; color:white; padding:10px 20px; border-radius:10px; font-weight:600; font-size:0.9rem; transition:all 0.2s; }
        .btn-primary:hover { background:#0284c7; }
        .card-st { background:white; border-radius:16px; border:1px solid #f1f5f9; padding:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); }
      `}</style>

      <div className="ward-root max-w-6xl mx-auto space-y-6 pb-10">
        
        {/* Hero Section */}
        <div className="hero-ward rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <FaHospitalAlt className="text-9xl" />
          </div>
          <div className="relative z-10">
            <h1 className="display-font text-4xl font-bold mb-3">Ward & Admissions Management</h1>
            <p className="text-sky-100 text-base max-w-lg leading-relaxed">
              Manage hospital wards, allocate beds to pending admissions, and configure global visiting hours.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex">
          <button className={`tab-btn flex items-center gap-2 ${activeTab === 'admissions' ? 'active' : ''}`} onClick={() => setActiveTab('admissions')}>
            <FaUserInjured /> Pending Admissions
          </button>
          <button className={`tab-btn flex items-center gap-2 ${activeTab === 'wards' ? 'active' : ''}`} onClick={() => setActiveTab('wards')}>
            <FaBed /> Manage Wards
          </button>
          <button className={`tab-btn flex items-center gap-2 ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <FaClock /> Visiting Hours
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'admissions' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Pending Bed Allocations</h2>
              {admissions.length === 0 ? (
                <div className="card-st text-center py-10 text-gray-500">No pending admissions found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {admissions.map(adm => (
                    <div key={adm._id} className="card-st flex flex-col gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{adm.patient?.name}</h3>
                        <p className="text-sm text-gray-500">Recommended by Dr. {adm.doctor?.name}</p>
                      </div>
                      
                      {allocatingAdmission?._id === adm._id ? (
                        <div className="bg-sky-50 p-4 rounded-xl space-y-3 border border-sky-100">
                          <div>
                            <label className="text-xs font-semibold text-sky-800 mb-1 block">Select Ward</label>
                            <select 
                              className="input-st"
                              value={selectedWardForAlloc}
                              onChange={(e) => {
                                setSelectedWardForAlloc(e.target.value);
                                fetchBeds(e.target.value);
                              }}
                            >
                              <option value="">-- Choose Ward --</option>
                              {wards.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-sky-800 mb-1 block">Select Bed</label>
                            <select 
                              className="input-st"
                              value={selectedBedForAlloc}
                              onChange={(e) => setSelectedBedForAlloc(e.target.value)}
                              disabled={!selectedWardForAlloc}
                            >
                              <option value="">-- Choose Bed --</option>
                              {beds.filter(b => !b.isOccupied).map(b => (
                                <option key={b._id} value={b._id}>{b.bedNumber}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button onClick={handleAllocateBed} className="btn-primary flex-1">Confirm Allocation</button>
                            <button onClick={() => setAllocatingAdmission(null)} className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-semibold text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setAllocatingAdmission(adm);
                            setSelectedWardForAlloc('');
                            setSelectedBedForAlloc('');
                            setBeds([]);
                          }} 
                          className="bg-sky-50 text-sky-600 hover:bg-sky-100 py-2.5 rounded-xl font-semibold text-sm transition text-center w-full"
                        >
                          Allocate Bed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Ward */}
              <div className="card-st">
                <h3 className="text-lg font-bold mb-4">Add New Ward</h3>
                <form onSubmit={handleCreateWard} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Ward Name</label>
                    <input type="text" required value={newWard.name} onChange={e=>setNewWard({...newWard, name: e.target.value})} className="input-st" placeholder="e.g., General Ward A" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                      <input type="text" required value={newWard.type} onChange={e=>setNewWard({...newWard, type: e.target.value})} className="input-st" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">Capacity</label>
                      <input type="number" required value={newWard.capacity} onChange={e=>setNewWard({...newWard, capacity: e.target.value})} className="input-st" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"><FaPlus/> Create Ward</button>
                </form>
              </div>

              {/* Add Bed */}
              <div className="card-st">
                <h3 className="text-lg font-bold mb-4">Add Bed to Ward</h3>
                <form onSubmit={handleCreateBed} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Select Ward</label>
                    <select required value={newBed.ward} onChange={e=>setNewBed({...newBed, ward: e.target.value})} className="input-st">
                      <option value="">-- Choose Ward --</option>
                      {wards.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Bed Number</label>
                    <input type="text" required value={newBed.bedNumber} onChange={e=>setNewBed({...newBed, bedNumber: e.target.value})} className="input-st" placeholder="e.g., A-101" />
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2"><FaPlus/> Add Bed</button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card-st max-w-md">
              <h3 className="text-lg font-bold mb-4">Global Visiting Hours</h3>
              <form onSubmit={handleUpdateHours} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Start Time</label>
                    <input type="time" required value={visitingHours.start} onChange={e=>setVisitingHours({...visitingHours, start: e.target.value})} className="input-st" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">End Time</label>
                    <input type="time" required value={visitingHours.end} onChange={e=>setVisitingHours({...visitingHours, end: e.target.value})} className="input-st" />
                  </div>
                </div>
                <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 flex items-start gap-3">
                  <FaClock className="text-sky-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-sky-800">These hours apply to all hospital wards. Visitor QR codes will only grant access during this time window.</p>
                </div>
                <button type="submit" className="btn-primary w-full">Save Visiting Hours</button>
              </form>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
