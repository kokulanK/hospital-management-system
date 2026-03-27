import { useState, useEffect } from 'react';
import DashboardLayout from "./DashboardLayout";
import api from '../../api/axios';
import { FaStar, FaCalendarAlt, FaComment, FaArrowRight } from 'react-icons/fa';

export default function DoctorFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data } = await api.get('/feedback/doctor');
      setFeedbacks(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  const ratingCounts = [5,4,3,2,1].map(n => ({
    star: n,
    count: feedbacks.filter(f => f.rating === n).length,
    pct: feedbacks.length ? Math.round(feedbacks.filter(f => f.rating === n).length / feedbacks.length * 100) : 0,
  }));

  const ratingLabels = ['','Poor','Fair','Good','Very Good','Excellent'];
  const selectedFb = feedbacks.find(f => f._id === selectedId);

  return (
    <DashboardLayout activePage="feedback">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .fb-doc-root { font-family:'DM Sans',sans-serif; }
        .display-font { font-family:'Fraunces',serif; }
        .hero-fb-doc { background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1d4ed8 100%); }
        .fb-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:36px; transition:border-color 0.2s,box-shadow 0.2s; }
        .fb-select:focus { outline:none;border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .fb-card { transition:transform 0.2s,box-shadow 0.2s; }
        .fb-card:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.08); }
        .bar-fill { transition:width 0.6s ease; }
        .fade-in{animation:fadeUp 0.4s ease forwards;opacity:0;}
        .fade-in:nth-child(1){animation-delay:0.05s}.fade-in:nth-child(2){animation-delay:0.12s}.fade-in:nth-child(3){animation-delay:0.19s}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      <div className="fb-doc-root max-w-4xl mx-auto space-y-6 pb-10">

        {/* Hero */}
        <div className="hero-fb-doc rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:260,height:260,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-50,right:-40,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Patient Reviews</p>
            <h1 className="display-font text-3xl font-semibold mb-2">Your Feedback</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">See what your patients are saying about their experience with you.</p>
            <div className="mt-5 flex gap-4 flex-wrap">
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm">
                <span className="text-blue-200 text-xs block">Total Reviews</span>
                <span className="font-semibold">{feedbacks.length}</span>
              </div>
              {avgRating && (
                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm flex items-center gap-2">
                  <FaStar className="text-amber-400" />
                  <div>
                    <span className="text-blue-200 text-xs block">Avg Rating</span>
                    <span className="font-semibold">{avgRating} / 5.0</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 skeleton rounded-2xl"/>)}</div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <FaComment className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No patient feedback yet.</p>
          </div>
        ) : (
          <>
            {/* Rating Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start gap-8 flex-wrap">
                {/* Big score */}
                <div className="text-center flex-shrink-0">
                  <p className="display-font text-6xl font-bold text-gray-800">{avgRating}</p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[1,2,3,4,5].map(n=><FaStar key={n} className={`text-lg ${n<=Math.round(avgRating)?'text-amber-400':'text-gray-200'}`}/>)}
                  </div>
                  <p className="text-xs text-gray-400">{feedbacks.length} review{feedbacks.length!==1?'s':''}</p>
                </div>
                {/* Bar breakdown */}
                <div className="flex-1 space-y-2 min-w-[200px]">
                  {ratingCounts.map(r=>(
                    <div key={r.star} className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5 w-20 flex-shrink-0">
                        {[1,2,3,4,5].map(n=><FaStar key={n} className={`text-[10px] ${n<=r.star?'text-amber-400':'text-gray-200'}`}/>)}
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="bar-fill h-full bg-amber-400 rounded-full" style={{width:`${r.pct}%`}}/>
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Appointment Selector */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-50">
                <h2 className="display-font text-lg font-semibold text-gray-800">Review by Appointment</h2>
                <p className="text-xs text-gray-400 mt-0.5">Select an appointment to see its specific feedback</p>
              </div>
              <div className="p-6">
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="fb-select w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white"
                >
                  <option value="">— Choose an appointment —</option>
                  {feedbacks.map(fb => (
                    <option key={fb._id} value={fb._id}>
                      {fb.patient?.name || 'Patient'} · {new Date(fb.appointment?.date || fb.appointment?.startTime).toLocaleDateString([], { weekday:'short',month:'short',day:'numeric' })} · {ratingLabels[fb.rating]}
                    </option>
                  ))}
                </select>

                {selectedFb && (
                  <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-5">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-amber-600 font-bold text-sm">{(selectedFb.patient?.name||'P')[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{selectedFb.patient?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <FaCalendarAlt />
                            {new Date(selectedFb.appointment?.date || selectedFb.appointment?.startTime).toLocaleDateString([], { weekday:'long',month:'long',day:'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n=><FaStar key={n} className={`text-base ${n<=selectedFb.rating?'text-amber-400':'text-gray-200'}`}/>)}
                        </div>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          {ratingLabels[selectedFb.rating]}
                        </span>
                      </div>
                    </div>
                    {selectedFb.comment && (
                      <p className="mt-4 text-sm text-gray-600 leading-relaxed bg-white rounded-xl px-4 py-3 border border-amber-100 italic">
                        "{selectedFb.comment}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* All Reviews */}
            <div>
              <h3 className="display-font text-lg font-semibold text-gray-800 mb-3">All Reviews</h3>
              <div className="space-y-3">
                {feedbacks.map(fb => (
                  <div key={fb._id} className="fb-card bg-white rounded-2xl border border-gray-100 shadow-sm p-5 fade-in">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-500 font-bold text-sm">{(fb.patient?.name||'P')[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{fb.patient?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <FaCalendarAlt />
                            {new Date(fb.appointment?.date || fb.appointment?.startTime).toLocaleDateString([], { month:'short',day:'numeric',year:'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(n=><FaStar key={n} className={`text-sm ${n<=fb.rating?'text-amber-400':'text-gray-200'}`}/>)}
                        </div>
                        <span className="text-xs font-medium text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">{ratingLabels[fb.rating]}</span>
                      </div>
                    </div>
                    {fb.comment && (
                      <p className="mt-3 text-sm text-gray-500 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 italic">
                        "{fb.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}