// src/components/ChatbotAI.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Target, X, Send, Bot, User, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ChatbotAI = ({ isOpen, onClose, onShoeClick }) => {
  const { user } = useAuth(); 
  
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Chào bạn! Mình là trợ lý AI. Mình đã sẵn sàng tư vấn dựa trên vóc dáng của bạn! 👟' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('75');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && chatRef.current && !chatRef.current.contains(event.target)) {
        onClose(); 
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const loadStats = () => {
      if (user && user.email) {
        const savedProfile = localStorage.getItem(`nike_profile_${user.email}`);
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          setHeight(profile.height || '175');
          setWeight(profile.weight || '75');
        }
      }
    };

    loadStats();
    window.addEventListener('profileUpdated', loadStats);
    return () => window.removeEventListener('profileUpdated', loadStats);
  }, [user, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userText, 
          // ĐÃ SỬA: Chặn lỗi NaN nếu input rỗng
          height: height ? parseInt(height) : 175, 
          weight: weight ? parseFloat(weight) : 75 
        })
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Lỗi mạng');
      
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: `⚠️ Lỗi Server: ${error.message} (Vui lòng kiểm tra Terminal Node.js)` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div
      ref={chatRef} 
      className={`fixed bottom-24 right-6 w-[360px] sm:w-[420px] bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden flex flex-col transition-all duration-400 transform origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} 
      style={{ height: '650px', maxHeight: '80vh' }}
    >
        <div className="bg-black text-white p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Bot size={22} className="text-white"/>
            </div>
            <div>
              <h3 className="font-black text-white text-base leading-tight uppercase tracking-wider">Nike AI Advisor</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-gray-300 uppercase tracking-widest font-medium">Trợ lý trực tuyến</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition text-gray-300 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="bg-[#f8f9fa] p-4 flex gap-4 text-sm shrink-0 border-b border-gray-100 shadow-sm relative z-10">
          <div className="flex-1 flex flex-col bg-white p-3 rounded-2xl border border-gray-100 shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-black transition-all">
            <label className="text-gray-400 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <Activity size={10} /> Chiều cao
            </label>
            <div className="flex items-end gap-1">
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} className="w-full border-none p-0 text-xl font-black focus:ring-0 outline-none text-black bg-transparent" placeholder="175" />
              <span className="text-gray-400 text-xs font-semibold pb-1">cm</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col bg-white p-3 rounded-2xl border border-gray-100 shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-black transition-all">
            <label className="text-gray-400 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest mb-1.5">
              <Target size={10} /> Cân nặng
            </label>
            <div className="flex items-end gap-1">
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full border-none p-0 text-xl font-black focus:ring-0 outline-none text-black bg-transparent" placeholder="70" />
              <span className="text-gray-400 text-xs font-semibold pb-1">kg</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto bg-gray-50 flex flex-col gap-6 text-sm scroll-smooth">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gray-200 text-black' : 'bg-black text-white'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={`max-w-[80%] p-4 text-[14px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-black text-white rounded-2xl rounded-tr-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'}`}>
                {msg.text.split('\n').map((line, i) => {
                  const formattedLine = line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      const shoeName = part.slice(2, -2);
                      return (
                        <strong 
                          key={j} 
                          onClick={() => onShoeClick && onShoeClick(shoeName)}
                          className="text-blue-600 underline cursor-pointer hover:text-blue-800 transition"
                        >
                          {shoeName}
                        </strong>
                      );
                    }
                    return part;
                  });
                  return <React.Fragment key={i}>{formattedLine}<br/></React.Fragment>;
                })}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot size={14} />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm px-4 py-5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0">
          <input 
            type="text" 
            value={inputMsg} onChange={e => setInputMsg(e.target.value)}
            placeholder="Nhập yêu cầu tư vấn..." 
            className="flex-1 bg-[#f5f5f5] text-sm rounded-full px-5 py-3.5 outline-none focus:ring-2 focus:ring-black/10 transition text-black font-medium"
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || !inputMsg.trim()} className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-800 transition shadow-md hover:scale-105 active:scale-95">
            <Send size={18} className="ml-1" />
          </button>
        </form>
    </div>
  );
};

export default ChatbotAI;