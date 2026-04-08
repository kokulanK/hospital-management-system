import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  FaComment, FaTimes, FaPaperPlane, FaTrash, FaMicrophone, 
  FaVolumeUp, FaVolumeMute, FaInfoCircle, FaChevronDown, FaChevronUp,
  FaHistory, FaSpinner
} from 'react-icons/fa';

export default function Chatbot() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        if (transcript) {
          setFinalTranscript(prev => prev + ' ' + transcript);
          setInput(prev => prev + ' ' + transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          setIsListening(false);
        }
      };
    }
  }, []);

  // Text-to-speech
  const speak = (text, messageId) => {
    if (!synthRef.current) synthRef.current = window.speechSynthesis;
    if (speakingId === messageId) {
      if (synthRef.current.speaking) synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }
    if (synthRef.current.speaking) synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    synthRef.current.speak(utterance);
    setSpeakingId(messageId);
  };

  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setSpeakingId(null);
  };

  // Send message
  const sendMessageContent = async (content) => {
    if (!content.trim()) return;
    setInput('');
    setFinalTranscript('');
    setMessages(prev => [...prev, { role: 'user', content, timestamp: new Date() }]);
    setLoading(true);
    try {
      const { data } = await api.post('/chat', { message: content });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply, 
        id: Date.now(),
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error('Send message error', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: t.chatbot?.errorGeneric || 'Sorry, something went wrong. Please try again.',
        id: Date.now(),
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    await sendMessageContent(input.trim());
  };

  // Voice controls
  const startListening = () => {
    if (recognitionRef.current) {
      setFinalTranscript('');
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      alert(t.chatbot?.noSupport || 'Speech recognition not supported in this browser.');
    }
  };

  const stopListeningAndSend = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (finalTranscript.trim()) {
        await sendMessageContent(finalTranscript.trim());
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListeningAndSend();
    } else {
      startListening();
    }
  };

  // Clear chat
  const clearChat = async () => {
    if (!window.confirm(t.chatbot?.clearConfirm || 'Clear all conversation history?')) return;
    stopSpeaking();
    try {
      await api.delete('/chat');
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat', err);
      alert(t.chatbot?.clearFailed || 'Failed to clear chat.');
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/chat/history');
      // Ensure timestamps are parsed
      const withDates = data.map(msg => ({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
      }));
      setMessages(withDates);
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

  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Stats
  const messageCount = messages.length;
  const userMessages = messages.filter(m => m.role === 'user').length;
  const assistantMessages = messages.filter(m => m.role === 'assistant').length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,300&family=DM+Sans:wght@400;500;600&display=swap');
        .chatbot-font { font-family: 'DM Sans', sans-serif; }
        .chat-display-font { font-family: 'Fraunces', serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.3s ease forwards; }
      `}</style>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white p-4 rounded-full shadow-lg transition-all z-50 focus:outline-none"
      >
        {isOpen ? <FaTimes size={24} /> : <FaComment size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-font fixed bottom-24 right-6 w-[90vw] sm:w-96 h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden fade-up">
          {/* Header with gradient and stats */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="chat-display-font font-semibold text-lg">{t.chatbot?.hospitalAssistant || 'Health Assistant'}</h3>
                <p className="text-xs opacity-90">{t.chatbot?.assistantSubtitle || 'AI-powered medical assistant'}</p>
              </div>
              <button
                onClick={clearChat}
                className="text-white/80 hover:text-white transition p-1"
                title={t.chatbot?.clearHistory || 'Clear history'}
              >
                <FaTrash size={14} />
              </button>
            </div>

            {/* Stats row */}
            <div className="flex gap-4 mt-3 text-xs bg-white/10 rounded-xl p-2">
              <div className="flex items-center gap-1">
                <FaHistory size={10} />
                <span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaComment size={10} />
                <span>{userMessages} you · {assistantMessages} AI</span>
              </div>
            </div>

            {/* User Guide Toggle */}
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="mt-2 text-xs text-white/80 hover:text-white flex items-center gap-1 transition"
            >
              <FaInfoCircle size={10} />
              {showGuide ? 'Hide guide' : 'Show guide'}
              {showGuide ? <FaChevronUp size={8} /> : <FaChevronDown size={8} />}
            </button>
            {showGuide && (
              <div className="mt-2 text-xs bg-white/10 rounded-lg p-2 space-y-1">
                <p>💬 <strong>Ask me anything</strong> about appointments, symptoms, or hospital services.</p>
                <p>🎤 Click the microphone to speak – stop and send automatically.</p>
                <p>🔊 Click the speaker icon on my replies to hear them aloud.</p>
                <p>🗑️ Use the trash icon to clear the conversation.</p>
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-up`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}>
                  <div className="text-sm">{msg.content}</div>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-gray-400">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      <button
                        onClick={() => speak(msg.content, msg.id || idx)}
                        className="ml-2 text-gray-400 hover:text-gray-600 transition"
                        title={speakingId === (msg.id || idx) ? (t.chatbot?.stopSpeaking || 'Stop') : (t.chatbot?.listen || 'Listen')}
                      >
                        {speakingId === (msg.id || idx) ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
                      </button>
                    </div>
                  )}
                  {msg.role === 'user' && msg.timestamp && (
                    <div className="text-[10px] text-blue-200 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl px-4 py-2 shadow-sm flex items-center gap-2">
                  <FaSpinner className="animate-spin text-blue-500" size={14} />
                  <span className="text-sm">{t.chatbot?.typing || 'Typing...'}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="border-t border-gray-200 p-3 flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening 
                  ? (t.chatbot?.listeningPlaceholder || 'Listening... Click mic again to stop') 
                  : (t.chatbot?.placeholder || 'Type your question...')
              }
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              disabled={loading || isListening}
            />
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              className={`rounded-xl px-3 py-2 transition-all ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
              title={isListening ? (t.chatbot?.stopAndSend || 'Stop & send') : (t.chatbot?.startVoice || 'Start voice')}
            >
              <FaMicrophone size={16} />
            </button>
            <button
              type="submit"
              disabled={loading || (!input.trim() && !isListening)}
              className="bg-blue-500 text-white rounded-xl px-4 py-2 hover:bg-blue-600 disabled:opacity-50 transition-all"
            >
              <FaPaperPlane size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}