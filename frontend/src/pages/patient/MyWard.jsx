import { useState, useEffect } from 'react';
import DashboardLayout from "./DashboardLayout";
import api from '../../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import { FaHospitalUser, FaUserFriends, FaPlus, FaClock, FaTicketAlt, FaSpinner } from 'react-icons/fa';

export default function MyWard() {
  const [admission, setAdmission] = useState(null);
  const [passes, setPasses] = useState([]);
  const [visitingHours, setVisitingHours] = useState({ start: '14:00', end: '16:00' });
  const [loading, setLoading] = useState(true);

  const [newVisitor, setNewVisitor] = useState({ visitorName: '', visitorPhone: '' });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await api.get('/users/profile');
      const patientId = userRes.data._id;

      const admRes = await api.get(`/admissions/patient/${patientId}`);
      setAdmission(admRes.data);

      if (admRes.data) {
        const passesRes = await api.get('/visitors');
        setPasses(passesRes.data);
      }

      const hoursRes = await api.get('/ward/settings/visiting-hours');
      if (hoursRes.data?.value) {
        setVisitingHours(hoursRes.data.value);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePass = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.post('/visitors/generate', newVisitor);
      setNewVisitor({ visitorName: '', visitorPhone: '' });
      const passesRes = await api.get('/visitors');
      setPasses(passesRes.data);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to generate visitor pass');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activePage="my-ward">
        <div className="flex items-center justify-center h-64"><FaSpinner className="animate-spin text-4xl text-emerald-500" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="my-ward">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .ward-root { font-family:'DM Sans',sans-serif; }
        .display-font { font-family:'Fraunces',serif; }
        .hero-ward { background:linear-gradient(135deg,#047857 0%,#0f766e 100%); }
        .card-st { background:white; border-radius:16px; border:1px solid #e5e7eb; padding:24px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); }
        .input-st { width:100%; padding:10px 16px; border-radius:10px; border:1px solid #e2e8f0; font-size:0.9rem; focus:outline-none; transition:all 0.2s; }
        .input-st:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.1); outline:none; }
        .btn-primary { background:#10b981; color:white; padding:10px 20px; border-radius:10px; font-weight:600; font-size:0.9rem; transition:all 0.2s; }
        .btn-primary:hover:not(:disabled) { background:#059669; }
        .btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>

      <div className="ward-root max-w-5xl mx-auto space-y-6 pb-10">
        
        {/* Hero */}
        <div className="hero-ward rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <FaHospitalUser className="text-9xl" />
          </div>
          <div className="relative z-10">
            <h1 className="display-font text-4xl font-bold mb-3">My Ward & Visitors</h1>
            <p className="text-emerald-100 text-base max-w-lg leading-relaxed">
              View your ward details and generate visitor passes for your loved ones.
            </p>
          </div>
        </div>

        {!admission ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <FaHospitalUser className="text-gray-200 text-6xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800">No Active Admission</h2>
            <p className="text-gray-500 mt-2">You are not currently admitted to any ward.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Admission Details */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card-st bg-emerald-50/50 border-emerald-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaHospitalUser className="text-emerald-600"/> Admission Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="text-gray-500">Ward</span>
                    <span className="font-semibold text-gray-900">{admission.ward?.name || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="text-gray-500">Bed Number</span>
                    <span className="font-semibold text-gray-900">{admission.bed?.bedNumber || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-100 pb-2">
                    <span className="text-gray-500">Assigned Doctor</span>
                    <span className="font-semibold text-gray-900">Dr. {admission.doctor?.name}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-gray-500">Visiting Hours</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {visitingHours.start} - {visitingHours.end}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add Visitor Form */}
              <div className="card-st">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUserFriends className="text-emerald-600"/> Add Visitor
                </h3>
                {passes.length >= 3 ? (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-sm font-medium border border-yellow-200">
                    Maximum of 3 active visitor passes reached.
                  </div>
                ) : (
                  <form onSubmit={handleGeneratePass} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-wider">Visitor Name</label>
                      <input type="text" required value={newVisitor.visitorName} onChange={e=>setNewVisitor({...newVisitor, visitorName: e.target.value})} className="input-st" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-wider">Phone Number</label>
                      <input type="tel" required value={newVisitor.visitorPhone} onChange={e=>setNewVisitor({...newVisitor, visitorPhone: e.target.value})} className="input-st" placeholder="+1 234 567 8900" />
                    </div>
                    <button type="submit" disabled={generating} className="btn-primary w-full flex justify-center items-center gap-2">
                      {generating ? <FaSpinner className="animate-spin" /> : <><FaPlus /> Generate Pass</>}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Passes List */}
            <div className="lg:col-span-2">
              <div className="card-st h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <FaTicketAlt className="text-emerald-600"/> Visitor Passes
                </h3>
                <p className="text-sm text-gray-500 mb-6">Scan these QR codes at the gate during visiting hours.</p>

                {passes.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <FaTicketAlt className="text-gray-300 text-4xl mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No visitor passes generated yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {passes.map(pass => (
                      <div key={pass._id} className="bg-white border-2 border-emerald-50 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-400"></div>
                        <h4 className="font-bold text-gray-900 mt-2 text-lg">{pass.visitorName}</h4>
                        <p className="text-xs text-gray-500 mb-4">{pass.visitorPhone}</p>
                        
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-4 inline-block">
                          <QRCodeSVG value={pass.qrCodeId} size={130} />
                        </div>
                        
                        <div className="flex items-center justify-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 w-full py-2 rounded-lg">
                          <FaClock /> Valid {visitingHours.start} - {visitingHours.end}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
