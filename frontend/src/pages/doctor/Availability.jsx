import { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import api from "../../api/axios";
import { FaTrash, FaClock, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";

export default function Availability() {
  const [availabilities, setAvailabilities] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchAvailabilities(); }, []);

  const fetchAvailabilities = async () => {
    try {
      const { data } = await api.get("/availability");
      setAvailabilities(data);
    } catch (err) { console.error(err); }
  };

  const handleTimeBlur = (time, setter) => {
    if (!time) return;
    const [hours, minutes] = time.split(":").map(Number);
    const roundedMinutes = minutes < 15 ? 0 : minutes < 45 ? 30 : 0;
    const newHours = minutes >= 45 ? (hours + 1) % 24 : hours;
    setter(`${String(newHours).padStart(2,"0")}:${String(roundedMinutes).padStart(2,"0")}`);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (!startDate || !startTime || !endTime) { setError("All fields are required"); return; }
    const selectedDate = new Date(startDate); selectedDate.setHours(0,0,0,0);
    const todayOnly = new Date(); todayOnly.setHours(0,0,0,0);
    if (selectedDate < todayOnly) { setError("Start date cannot be in the past"); return; }
    const sm = parseInt(startTime.split(":")[1]), em = parseInt(endTime.split(":")[1]);
    if ((sm !== 0 && sm !== 30) || (em !== 0 && em !== 30)) { setError("Time must be in 30-minute increments (00 or 30 only)"); return; }
    const start = new Date(`${startDate}T${startTime}:00`);
    const end = new Date(`${startDate}T${endTime}:00`);
    if (end <= start) { setError("End time must be after start time"); return; }
    setSubmitting(true);
    try {
      await api.post("/availability", { startTime: start, endTime: end });
      setMessage("Availability added successfully");
      fetchAvailabilities();
      setStartDate(""); setStartTime(""); setEndTime("");
    } catch (err) { setError(err.response?.data?.message || "Failed to add"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this availability?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/availability/${id}`);
      fetchAvailabilities();
    } catch { alert("Delete failed"); }
    finally { setDeletingId(null); }
  };

  const today = new Date().toISOString().split("T")[0];

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  // Group by date
  const grouped = availabilities.reduce((acc, av) => {
    const d = new Date(av.startTime).toDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(av);
    return acc;
  }, {});

  return (
    <DashboardLayout activePage="availability">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .avail-root { font-family:'DM Sans',sans-serif; }
        .display-font { font-family:'Fraunces',serif; }
        .hero-avail { background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#1d4ed8 100%); }
        .form-input { width:100%; padding:11px 16px; border:1.5px solid #e5e7eb; border-radius:12px; font-size:0.9rem; color:#374151; background:white; transition:border-color 0.2s,box-shadow 0.2s; font-family:'DM Sans',sans-serif; }
        .form-input:focus { outline:none; border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .btn-primary { background:linear-gradient(135deg,#1d4ed8,#3b82f6); color:white; border:none; border-radius:12px; padding:11px 20px; font-size:0.9rem; font-weight:500; cursor:pointer; box-shadow:0 4px 14px rgba(59,130,246,0.35); transition:opacity 0.2s,transform 0.2s; font-family:'DM Sans',sans-serif; display:flex;align-items:center;gap:8px; }
        .btn-primary:hover:not(:disabled) { opacity:0.9;transform:translateY(-1px); }
        .btn-primary:disabled { opacity:0.6;cursor:not-allowed; }
        .delete-btn { width:34px;height:34px;border-radius:10px;border:none;background:#fef2f2;color:#ef4444;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s;flex-shrink:0; }
        .delete-btn:hover { background:#fee2e2; }
        .avail-row { transition:background 0.15s; }
        .avail-row:hover { background:#f8faff; }
        .fade-in { animation:fadeUp 0.4s ease forwards;opacity:0; }
        .fade-in:nth-child(1){animation-delay:0.05s} .fade-in:nth-child(2){animation-delay:0.12s} .fade-in:nth-child(3){animation-delay:0.19s}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="avail-root max-w-4xl mx-auto space-y-6 pb-10">

        {/* Hero */}
        <div className="hero-avail rounded-2xl p-7 md:p-9 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div style={{position:'absolute',width:260,height:260,background:'radial-gradient(circle,rgba(96,165,250,0.15) 0%,transparent 70%)',top:-50,right:-40,borderRadius:'50%'}} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1">Schedule</p>
            <h1 className="display-font text-3xl font-semibold mb-2">Manage Availability</h1>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">Set your open time slots so patients can book appointments with you.</p>
            <div className="mt-5 flex gap-4 flex-wrap">
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm">
                <span className="text-blue-200 text-xs block">Total Slots</span>
                <span className="font-semibold">{availabilities.length} slot{availabilities.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm">
                <span className="text-blue-200 text-xs block">Days Set</span>
                <span className="font-semibold">{Object.keys(grouped).length} day{Object.keys(grouped).length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toasts */}
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

        {/* Add Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaPlus className="text-blue-600 text-sm" />
            </div>
            <div>
              <h2 className="display-font text-lg font-semibold text-gray-800">Add New Slot</h2>
              <p className="text-xs text-gray-400 mt-0.5">Times must be on the hour or half-hour</p>
            </div>
          </div>
          <form onSubmit={handleAdd} className="p-6">
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <FaCalendarAlt className="text-gray-400 text-xs" /> Date
                </label>
                <input type="date" min={today} value={startDate}
                  onChange={e => setStartDate(e.target.value)} required className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <FaClock className="text-gray-400 text-xs" /> Start Time
                </label>
                <input type="time" step="1800" value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  onBlur={() => handleTimeBlur(startTime, setStartTime)}
                  required className="form-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <FaClock className="text-gray-400 text-xs" /> End Time
                </label>
                <input type="time" step="1800" value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  onBlur={() => handleTimeBlur(endTime, setEndTime)}
                  required className="form-input" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary">
              <FaPlus className="text-xs" />
              {submitting ? 'Adding...' : 'Add Availability'}
            </button>
          </form>
        </div>

        {/* Availability List */}
        <div>
          <h3 className="display-font text-lg font-semibold text-gray-800 mb-3">
            Your Schedule <span className="text-gray-400">({availabilities.length})</span>
          </h3>

          {availabilities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <FaClock className="text-gray-200 text-4xl mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No availability set yet. Add your first slot above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([dateStr, slots]) => {
                const d = formatDateTime(slots[0].startTime);
                return (
                  <div key={dateStr} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden fade-in">
                    <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-400 text-xs" />
                      <p className="text-sm font-semibold text-blue-700">{d.date}</p>
                      <span className="ml-auto text-xs text-blue-400">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {slots.map(av => {
                        const s = formatDateTime(av.startTime);
                        const e = formatDateTime(av.endTime);
                        return (
                          <div key={av._id} className="avail-row flex items-center justify-between px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <FaClock className="text-emerald-500 text-sm" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{s.time} — {e.time}</p>
                                <p className="text-xs text-gray-400">
                                  {Math.round((new Date(av.endTime) - new Date(av.startTime)) / 60000)} min window
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDelete(av._id)}
                              disabled={deletingId === av._id}
                              className="delete-btn"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}