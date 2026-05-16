import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import api from '../../api/axios';
import { FaClipboardList, FaCheckCircle, FaTimesCircle, FaClock, FaLightbulb, FaSpinner } from 'react-icons/fa';
import { generateGroqResponse } from '../../utils/groqApi';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // AI Guide State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGuide, setAiGuide] = useState('');
  const [aiTaskTitle, setAiTaskTitle] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/cleaning-tasks/my');
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.put(`/cleaning-tasks/${id}/complete`);
      setMessage('success:Task marked as completed');
      fetchTasks();
    } catch (err) {
      setMessage('error:' + (err.response?.data?.message || 'Failed to complete'));
    }
  };

  const handleGetAIGuide = async (task) => {
    setAiTaskTitle(`${task.area} - ${task.description || 'General Cleaning'}`);
    setShowAiModal(true);
    setAiLoading(true);
    setAiGuide('');
    
    try {
      const systemPrompt = "You are a strict hospital sanitation expert. Provide a very brief, concise, 3-step guide and list the required PPE (Personal Protective Equipment) for the following cleaning task. Use simple language. Format with clear headings and bullet points.";
      const userPrompt = `Task Area: ${task.area}\nTask Description: ${task.description || 'General Cleaning'}`;
      
      const response = await generateGroqResponse(systemPrompt, userPrompt);
      setAiGuide(response);
    } catch (error) {
      setAiGuide("Sorry, I couldn't fetch the AI guide at the moment. Please ensure your API key is correct and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const msgType = message.startsWith('success:') ? 'success' : 'error';
  const msgText = message.replace(/^(success:|error:)/, '');

  const groupedByDate = tasks.reduce((acc, task) => {
    const date = new Date(task.date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  return (
    <DashboardLayout activePage="tasks">
      <style>{`
        .hero-tasks {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%);
        }
        .task-card { transition: transform 0.2s, box-shadow 0.2s; }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Hero */}
        <div className="hero-tasks rounded-2xl p-7 md:p-9 text-white">
          <h1 className="display-font text-3xl font-semibold">My Cleaning Tasks</h1>
          <p className="text-blue-100 text-sm mt-2">View and update your assignments.</p>
        </div>

        {/* Toast */}
        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            msgType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {msgType === 'success' ? <FaCheckCircle className="text-emerald-500" /> : <FaTimesCircle className="text-red-400" />}
            <p className="text-sm font-medium">{msgText}</p>
            <button onClick={() => setMessage('')} className="ml-auto text-gray-400 hover:text-gray-600">&times;</button>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-3">{/* skeleton */}</div>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <FaClipboardList className="text-gray-200 text-4xl mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No tasks assigned.</p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([dateStr, tasks]) => (
            <div key={dateStr} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                <p className="text-sm font-semibold text-blue-700">{new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {tasks.map(task => (
                  <div key={task._id} className="task-card flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                        <FaClipboardList className="text-gray-500 text-sm" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{task.area}</p>
                        <p className="text-xs text-gray-400">{task.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        task.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {task.status}
                      </span>
                      
                      <button
                        onClick={() => handleGetAIGuide(task)}
                        className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-lg text-xs font-medium hover:bg-purple-100 transition flex items-center gap-1"
                        title="Get AI Cleaning Guide"
                      >
                        <FaLightbulb /> AI Guide
                      </button>

                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleComplete(task._id)}
                          className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-emerald-600 transition"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Guide Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FaLightbulb className="text-purple-200 text-xl" />
                <h3 className="font-semibold text-lg">AI Cleaning Guide</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-white/80 hover:text-white">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm font-medium text-gray-500 mb-4">Task: <span className="text-gray-800">{aiTaskTitle}</span></p>
              
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <FaSpinner className="animate-spin text-3xl text-purple-500" />
                  <p className="text-sm text-gray-500">Generating expert protocol...</p>
                </div>
              ) : (
                <div className="prose prose-sm prose-purple max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {aiGuide}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}