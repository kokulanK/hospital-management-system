import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { FaComment, FaTimes, FaPaperPlane, FaTrash, FaMicrophone, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null); // track which message is being spoken
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize speech recognition (English only)
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        setTimeout(() => {
          if (transcript.trim()) sendMessageFromVoice(transcript);
        }, 300);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Text-to-speech (toggle)
  const speak = (text, messageId) => {
    if (!synthRef.current) synthRef.current = window.speechSynthesis;
    // If the same message is already speaking, stop it
    if (speakingId === messageId) {
      if (synthRef.current.speaking) synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }
    // Stop any ongoing speech before starting new one
    if (synthRef.current.speaking) synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    synthRef.current.speak(utterance);
    setSpeakingId(messageId);
  };

  // Stop all speech (used when clearing chat or unmounting)
  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setSpeakingId(null);
  };

  // Send message from voice input
  const sendMessageFromVoice = async (text) => {
    if (!text.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: text });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, id: Date.now() }]);
    } catch (err) {
      console.error('Send message error', err);
      const errorMsg = 'Sorry, I could not process your request. Please try again later.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, id: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  // Send message from text input
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, id: Date.now() }]);
    } catch (err) {
      console.error('Send message error', err);
      const errorMsg = 'Sorry, I could not process your request. Please try again later.';
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg, id: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!window.confirm('Are you sure you want to clear all chat history?')) return;
    stopSpeaking();
    try {
      await api.delete('/chat');
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat', err);
      alert('Could not clear chat history.');
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/chat/history');
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  };

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      alert('Your browser does not support speech recognition.');
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all z-50"
      >
        {isOpen ? <FaTimes size={24} /> : <FaComment size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Hospital Assistant</h3>
              <p className="text-xs opacity-80">Ask me about appointments, feedback, or skin scans.</p>
            </div>
            <button
              onClick={clearChat}
              className="text-white/80 hover:text-white transition"
              title="Clear chat history"
            >
              <FaTrash size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {msg.content}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => speak(msg.content, msg.id || idx)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      title={speakingId === (msg.id || idx) ? "Stop" : "Listen"}
                    >
                      {speakingId === (msg.id || idx) ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input with microphone */}
          <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Type your message..."}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || isListening}
            />
            <button
              type="button"
              onClick={startListening}
              disabled={loading}
              className={`text-white rounded-xl px-3 py-2 transition ${isListening ? 'bg-red-500' : 'bg-green-500 hover:bg-green-600'}`}
              title="Voice input"
            >
              <FaMicrophone />
            </button>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-500 text-white rounded-xl px-4 py-2 hover:bg-blue-600 disabled:opacity-50 transition"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
}