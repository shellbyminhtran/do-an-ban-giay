// src/components/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

import Login1Img from '../assets/Login1.jpg';
import Login2Img from '../assets/Login2.jpg';

export default function AuthModal({ isOpen, onClose }) {
  const [isSignIn, setIsSignIn] = useState(true);
  
  // RÚT CẢ HÀM LOGIN VÀ REGISTER TỪ CONTEXT MỚI RA
  const { login, register } = useAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [typedText, setTypedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [authMessage, setAuthMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const fullText = isSignIn 
    ? "Đã có tài khoản? Đăng nhập ngay để tiếp tục hành trình bảo vệ sức khỏe cùng AI Nike." 
    : "Hành trình chọn giày chuẩn AI bắt đầu ngay tại đây. Nhập thông tin của bạn và cùng khám phá.";

  const toggleForm = () => {
    setIsAnimating(true);
    setTypedText(""); 
    setIsTypingDone(false);
    // Reset form và thông báo khi chuyển tab
    setFormData({ name: '', email: '', password: '' });
    setAuthMessage({ type: '', text: '' });
    
    setTimeout(() => setIsAnimating(false), 1200);
    setIsSignIn(!isSignIn);
  };

  useEffect(() => {
    if (!isOpen) return;

    setTypedText(""); 
    setIsTypingDone(false); 
    setAuthMessage({ type: '', text: '' }); // Reset lỗi khi mở modal
    let currentLength = 0;
    let typingInterval;

    const delayTimer = setTimeout(() => {
      typingInterval = setInterval(() => {
        currentLength++;
        setTypedText(fullText.slice(0, currentLength));

        if (currentLength >= fullText.length) {
          clearInterval(typingInterval);
          setIsTypingDone(true); 
        }
      }, 15); 
    }, 600);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(typingInterval);
    };
  }, [isSignIn, isOpen, fullText]);

  // --- ĐÃ SỬA: Gọi API thông qua AuthContext để đồng bộ dữ liệu ---
  const handleAuthSubmit = async () => {
    setAuthMessage({ type: '', text: '' });
    setIsLoading(true);

    let result;

    if (isSignIn) {
      // ĐĂNG NHẬP
      result = await login(formData.email, formData.password);
    } else {
      // ĐĂNG KÝ
      if (!formData.name.trim()) {
        setAuthMessage({ type: 'error', text: 'Vui lòng nhập họ và tên' });
        setIsLoading(false);
        return;
      }
      result = await register(formData.name, formData.email, formData.password);
    }

    setIsLoading(false);

    if (result.success) {
      // Thành công (Màu xanh)
      setAuthMessage({ 
        type: 'success', 
        text: isSignIn ? '✅ Đăng nhập thành công!' : '✅ Đăng ký thành công! Đang tự đăng nhập...' 
      });
      
      // Thành công là tự động đóng Modal (vì AuthContext đã lo việc hiển thị Avatar rồi)
      setTimeout(() => onClose(), 1200);
    } else {
      // Thất bại (Màu đỏ, ví dụ: Sai pass, Trùng email)
      setAuthMessage({ type: 'error', text: result.error });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-500 opacity-100 select-none">
      
      <div className="relative w-[1000px] h-[600px] rounded-3xl overflow-hidden modal-neumorphic animate-modal-enter">
        
        <button onClick={onClose} className="absolute top-5 right-5 z-50 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition">
          <X size={20} />
        </button>

        {/* ========================================== */}
        {/* A. FORM ĐĂNG KÝ */}
        {/* ========================================== */}
        <div className={`absolute top-0 h-full w-[600px] flex flex-col items-center justify-center p-20 text-center transition-all duration-1000 ${isSignIn ? 'left-[-600px]' : 'left-0'}`}>
          <h2 className="text-4xl font-black uppercase tracking-widest text-black mb-4" style={{ fontFamily: "'Comic Jungle', sans-serif" }}>SIGN UP</h2>
          <div className="flex gap-4 mb-8">
            <button className="neumorphic-outset w-10 h-10 flex items-center justify-center rounded-full text-black hover:scale-105 active:scale-95 active:shadow-inset">f</button>
            <button className="neumorphic-outset w-10 h-10 flex items-center justify-center rounded-full text-black hover:scale-105 active:scale-95 active:shadow-inset">g</button>
            <button className="neumorphic-outset w-10 h-10 flex items-center justify-center rounded-full text-black hover:scale-105 active:scale-95 active:shadow-inset">l</button>
          </div>
          <span className="text-sm text-gray-500 mb-4">hoặc dùng email của bạn để đăng ký</span>
          
          <div className="w-full flex flex-col gap-4 p-2">
            <div className="relative">
              <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Họ và Tên" className="w-full bg-[#ecf0f3] p-4.5 pl-14 pr-6 rounded-xl border-none outline-none shadow-inset text-sm font-medium" />
            </div>
            <div className="relative">
              <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email" className="w-full bg-[#ecf0f3] p-4.5 pl-14 pr-6 rounded-xl border-none outline-none shadow-inset text-sm font-medium" />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Mật khẩu" className="w-full bg-[#ecf0f3] p-4.5 pl-14 pr-6 rounded-xl border-none outline-none shadow-inset text-sm font-medium" />
            </div>
          </div>

          <div className="h-6 mt-2">
            {!isSignIn && authMessage.text && (
              <p className={`text-sm font-medium ${authMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                {authMessage.text}
              </p>
            )}
          </div>

          <button onClick={handleAuthSubmit} disabled={isLoading} className="mt-4 text-white px-12 py-3.5 rounded-3xl font-bold uppercase tracking-widest text-xs transition neumorphic-black hover:scale-105 active:scale-95 disabled:opacity-50">
            {isLoading ? "ĐANG XỬ LÝ..." : "ĐĂNG KÝ NGAY"}
          </button>
        </div>

        {/* ========================================== */}
        {/* B. FORM ĐĂNG NHẬP */}
        {/* ========================================== */}
        <div className={`absolute top-0 h-full w-[600px] flex flex-col items-center justify-center p-20 text-center transition-all duration-1000 ${isSignIn ? 'left-[400px]' : 'left-[1000px]'}`}>
          <h2 className="text-4xl font-black uppercase tracking-widest text-black mb-4" style={{ fontFamily: "'Comic Jungle', sans-serif" }}>LOGIN</h2>
          <div className="flex gap-4 mb-8">
            <button className="neumorphic-outset w-10 h-10 flex items-center justify-center rounded-full text-black hover:scale-105 active:scale-95 active:shadow-inset">f</button>
            <button className="neumorphic-outset w-10 h-10 flex items-center justify-center rounded-full text-black hover:scale-105 active:scale-95 active:shadow-inset">g</button>
            <button className="neumorphic-outset w-10 h-10 flex items-center justify-center rounded-full text-black hover:scale-105 active:scale-95 active:shadow-inset">l</button>
          </div>
          <span className="text-sm text-gray-500 mb-4">hoặc dùng tài khoản của bạn</span>
          
          <div className="w-full flex flex-col gap-4 p-2 mb-2">
            <div className="relative">
              <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="Email" className="w-full bg-[#ecf0f3] p-4.5 pl-14 pr-6 rounded-xl border-none outline-none shadow-inset text-sm font-medium" />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Mật khẩu" className="w-full bg-[#ecf0f3] p-4.5 pl-14 pr-6 rounded-xl border-none outline-none shadow-inset text-sm font-medium" />
            </div>
          </div>
          
          <a href="#" className="text-sm text-black font-medium border-b border-black pb-0.5 mb-4 hover:text-gray-600 transition">Quên mật khẩu?</a>
          
          <div className="h-6 mb-2">
            {isSignIn && authMessage.text && (
              <p className={`text-sm font-medium ${authMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                {authMessage.text}
              </p>
            )}
          </div>

          <button onClick={handleAuthSubmit} disabled={isLoading} className="text-white px-12 py-3.5 rounded-3xl font-bold uppercase tracking-widest text-xs transition neumorphic-black hover:scale-105 active:scale-95 disabled:opacity-50">
            {isLoading ? "ĐANG KIỂM TRA..." : "ĐĂNG NHẬP"}
          </button>
        </div>

        {/* ========================================== */}
        {/* C. TẤM NỀN TRƯỢT (Giữ nguyên) */}
        {/* ========================================== */}
        <div className={`absolute top-0 left-0 h-full w-[400px] z-40 transition-transform duration-1000 flex flex-col justify-between gap-6 overflow-hidden relative modal-neumorphic switch-container ${isSignIn ? 'translate-x-0' : 'translate-x-[600px]'} ${isAnimating ? 'is-gx' : ''}`}>
          
          <div className="absolute inset-0 w-full h-full">
            <img src={Login1Img} alt="Sign In Nike" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isSignIn ? 'opacity-100' : 'opacity-0'}`} />
            <img src={Login2Img} alt="Sign Up Nike" className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${isSignIn ? 'opacity-0' : 'opacity-100'}`} />
            <div className="absolute inset-0 bg-black/50 z-10"></div>
          </div>

          <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-12 text-center text-white">
            
            <div className={`absolute flex flex-col items-center gap-4 transition-all duration-1000 ${isSignIn ? 'translate-x-[80px] opacity-0 pointer-events-none' : 'translate-x-0 opacity-100 pointer-events-auto'}`}>
              <h3 className="text-3xl font-black uppercase tracking-widest leading-tight">CHÀO BẠN MỚI!</h3>
              
              <div className="px-6 mb-6 min-h-[60px] flex items-center justify-center">
                <p className="text-sm font-light leading-relaxed">
                  {!isSignIn && typedText}
                  {!isSignIn && !isTypingDone && <span className="animate-pulse border-r-2 border-white ml-1">&nbsp;</span>}
                </p>
              </div>

              <button onClick={toggleForm} className="bg-transparent text-white border-2 border-white px-10 py-3 rounded-3xl font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition hover:scale-105 active:scale-95">ĐĂNG NHẬP</button>
            </div>

            <div className={`absolute flex flex-col items-center gap-4 transition-all duration-1000 ${isSignIn ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-[-80px] opacity-0 pointer-events-none'}`}>
              <h3 className="text-3xl font-black uppercase tracking-widest leading-tight">XIN CHÀO TRỞ LẠI!</h3>
              
              <div className="px-6 mb-6 min-h-[60px] flex items-center justify-center">
                <p className="text-sm font-light leading-relaxed">
                  {isSignIn && typedText}
                  {isSignIn && !isTypingDone && <span className="animate-pulse border-r-2 border-white ml-1">&nbsp;</span>}
                </p>
              </div>

              <button onClick={toggleForm} className="bg-transparent text-white border-2 border-white px-10 py-3 rounded-3xl font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition hover:scale-105 active:scale-95">ĐĂNG KÝ</button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}