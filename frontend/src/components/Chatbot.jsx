import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uniqueCode, setUniqueCode] = useState('');
  const [codeEntered, setCodeEntered] = useState(false);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  // Get user from localStorage
  // Note: In a real app, use AuthContext. Here we read from localStorage on render/location change
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  const getBotTitle = () => {
    switch (user?.role) {
      case 'admin': return 'Admin Assistant';
      case 'volunteer': return 'Volunteer Bot';
      case 'user': return 'Event Guide';
      default: return 'AI Assistant';
    }
  };

  const getInitialGreeting = () => {
    switch (user?.role) {
      case 'admin': return '👋 Hello Admin! I can help you with event details and volunteer management.';
      case 'volunteer': return '👋 Hi! I am your Volunteer Assistant. Ask me about your duties!';
      case 'user': return '👋 Hi there! Looking for an event? Ask me!';
      default: return '🔐 Please enter your unique code to get started.';
    }
  };

  useEffect(() => {
    // Reset messages when role changes or on mount
    setMessages([
      { role: 'assistant', content: getInitialGreeting() }
    ]);
  }, [user?.role]); // Re-run if user role changes (though typically requires page reload in this simple setup)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const payload = { message: input };
      const config = {};
      if (user && token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      if (!user && location.pathname === '/' && uniqueCode) {
        payload.uniqueCode = uniqueCode;
      }
      const res = await axios.post('http://localhost:5000/api/ai/chat', payload, config);

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error: Could not connect to AI. Please try again later.' }]);
    }
    setLoading(false);
  };

  // Render for guests on Home page or for logged-in users everywhere
  const isGuestOnHome = !user && location.pathname === '/';
  if (!isGuestOnHome && (!user || !token)) {
    return null;
  }

  console.log('Chatbot: Rendering for role:', (user && user.role) ? user.role : 'guest');

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {!isOpen && (
           <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="bg-[#075e54] text-white p-4 rounded-full shadow-lg hover:bg-[#064c44] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </motion.button>
        )}

        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-[#efe7dd] rounded-lg shadow-2xl w-80 sm:w-96 mb-4 overflow-hidden border border-gray-300 flex flex-col"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="bg-[#075e54] p-4 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#075e54] font-bold">
                  AI
                </div>
                <div>
                  <h3 className="font-bold text-sm">{getBotTitle()}</h3>
                  <span className="text-xs text-green-100">● Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 text-xl">✕</button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
              {isGuestOnHome && !codeEntered && (
                <div className="mb-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm text-sm text-gray-800">
                    Enter your unique code to access your assignments and event details.
                  </div>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg text-sm shadow-sm relative ${
                      msg.role === 'user' 
                        ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                    <span className="block text-[10px] text-gray-500 text-right mt-1">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm text-gray-500 italic">
                     Typing...
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="p-3 bg-white flex gap-2 border-t">
                {isGuestOnHome && !codeEntered && (
                  <>
                    <input
                      type="text"
                      value={uniqueCode}
                      onChange={(e) => setUniqueCode(e.target.value)}
                      placeholder="Enter your unique code"
                      className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#075e54]"
                    />
                    <button
                      onClick={() => {
                        if (uniqueCode.trim()) {
                          setCodeEntered(true);
                          setMessages(prev => [...prev, { role: 'assistant', content: '✅ Code received. You can ask your questions now.' }]);
                        }
                      }}
                      className="bg-[#075e54] text-white p-2 rounded-md hover:bg-[#064c44]"
                    >
                      Submit
                    </button>
                  </>
                )}
                {(!isGuestOnHome || codeEntered) && (
                  <>
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#075e54]"
                    />
                    <button 
                        onClick={sendMessage}
                        disabled={loading}
                        className="bg-[#075e54] text-white p-2 rounded-md hover:bg-[#064c44] disabled:opacity-50"
                    >
                        ➤
                    </button>
                  </>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
