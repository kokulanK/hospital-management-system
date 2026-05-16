import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaTrash } from 'react-icons/fa';
import { generateGroqResponse } from '../utils/groqApi';
import api from '../api/axios';

export default function AICleaningAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Sanitation Assistant. How can I help you with cleaning protocols or hospital guidelines today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/staff-chat');
      if (data && data.length > 0) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your chat history?')) return;
    try {
      await api.delete('/staff-chat');
      setMessages([
        { role: 'assistant', content: 'Hello! I am your AI Sanitation Assistant. How can I help you with cleaning protocols or hospital guidelines today?' }
      ]);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  };

  const saveMessageToDB = async (role, content) => {
    try {
      await api.post('/staff-chat', { role, content });
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    // Save user message to DB asynchronously
    saveMessageToDB('user', userText);

    try {
      const systemPrompt = "You are an AI Hospital Sanitation Assistant. Answer questions strictly related to hospital cleaning protocols, hygiene, PPE usage, and hazardous waste disposal. Keep answers brief, practical, and easy to read. If a question is unrelated to cleaning or hospital protocols, politely decline to answer.";
      
      const response = await generateGroqResponse(systemPrompt, userText);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      // Save assistant message to DB
      saveMessageToDB('assistant', response);
    } catch (error) {
      const errorMsg = "Sorry, I'm having trouble connecting to my knowledge base right now.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      saveMessageToDB('assistant', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
        title="AI Assistant"
      >
        <FaRobot className="text-2xl" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: '80vh' }}>
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FaRobot className="text-xl text-purple-200" />
            <h3 className="font-semibold">AI Protocol Assistant</h3>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={clearHistory} className="text-white/80 hover:text-red-300 transition" title="Clear History">
              <FaTrash className="text-sm" />
            </button>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <FaSpinner className="animate-spin text-purple-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white rounded-b-2xl flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about protocols..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </form>
      </div>
    </>
  );
}
