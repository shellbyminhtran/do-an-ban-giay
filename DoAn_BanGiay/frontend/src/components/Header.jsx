// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, X, Heart, ChevronRight, Settings } from 'lucide-react'; 
import nikeLogoImg from '../assets/Output.png';
import { useCart } from '../context/CartContext'; 
import { useAuth } from '../context/AuthContext'; 

export default function Header({ onOpenCart, onOpenAuth, onNavigate, onSearch }) {
  const { totalItems } = useCart();
  const { user, logout } = useAuth(); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navRef = useRef(null); 
  const dropdownRef = useRef(null);
  
  const [displayName, setDisplayName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // ĐÃ THÊM: State để lưu danh sách chiến dịch đang chạy
  const [activeCampaigns, setActiveCampaigns] = useState([]);

  // Xử lý Click ra ngoài để đóng menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
      if (navRef.current && !navRef.current.contains(event.target)) setIsNavOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tự động cập nhật Tên
  useEffect(() => {
    if (user) {
      const loadProfileName = () => {
        const savedProfile = localStorage.getItem(`nike_profile_${user.email}`);
        if (savedProfile) {
          setDisplayName(JSON.parse(savedProfile).name);
        } else {
          setDisplayName(user.email.split('@')[0]);
        }
      };
      loadProfileName();
      window.addEventListener('profileUpdated', loadProfileName);
      return () => window.removeEventListener('profileUpdated', loadProfileName);
    }
  }, [user]);

  // ĐÃ THÊM: Tự động kéo danh sách Chiến Dịch Khuyến Mãi từ Backend
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/campaigns');
        const data = await res.json();
        if (data.success) {
          // Chỉ lấy những chiến dịch Đang bật (active) và Chưa hết hạn
          const validCampaigns = data.data.filter(camp => {
            const isExpired = camp.end_date && new Date(camp.end_date) < new Date();
            return camp.status === 'active' && !isExpired;
          });
          setActiveCampaigns(validCampaigns);
        }
      } catch (err) {
        console.error("Lỗi tải danh sách khuyến mãi:", err);
      }
    };
    fetchCampaigns();
  }, []);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onNavigate) onNavigate('home');
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (searchTerm.trim() !== '') {
        if (onSearch) onSearch(searchTerm);
        else alert(`Tính năng lọc sản phẩm: Đang tìm kiếm "${searchTerm}"`); 
        if (onNavigate) onNavigate('home');
      }
    }
  };

  // ĐÃ THÊM: Hàm lột sạch mã HTML (từ Word Editor) để lấy chữ thuần túy
  const stripHtml = (html) => {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  // ĐÃ SỬA: Tạo danh sách menu động (Dynamic Categories)
  const dynamicCategories = [
    { name: 'Mới & Nổi bật', items: ['Hàng mới về', 'Bán chạy nhất', 'Bộ sưu tập Xuân Hè'] },
    { name: 'Dòng Giày Cổ Điển', items: ['Air Force 1', 'Air Jordan', 'Air Max', 'Dunk'] },
    { name: 'Thể Thao', items: ['Chạy bộ (Running)', 'Bóng rổ (Basketball)', 'Tập luyện (Training)'] },
    { 
      name: 'Khuyến Mãi %', 
      // Tự động map danh sách chiến dịch. Nếu trống thì để mặc định 1 dòng thông báo
      items: activeCampaigns.length > 0 
        ? activeCampaigns.map(camp => stripHtml(camp.title)) 
        : ['Chưa có chương trình mới'] 
    },
  ];

  return (
    <header className="border-b border-gray-200 py-3.5 sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="w-full px-4 sm:px-10 flex items-center justify-between gap-4">
        
        {/* ======================================= */}
        {/* CỘT 1: MENU DANH MỤC */}
        {/* ======================================= */}
        <div className="flex-1 flex items-center justify-start relative" ref={navRef}>
          <button 
            onClick={() => setIsNavOpen(!isNavOpen)} 
            className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-all shadow-sm hover:scale-105 active:scale-95 z-50"
          >
            <div className={`transition-transform duration-300 ${isNavOpen ? 'rotate-90' : 'rotate-0'}`}>
              {isNavOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
          </button>

          <div className={`absolute top-16 left-0 w-[450px] bg-white rounded-3xl shadow-[0_15px_60px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden transform transition-all duration-400 ease-out z-40 origin-top-left ${isNavOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
            <div className="p-8 grid grid-cols-2 gap-x-6 gap-y-8">
              {/* ĐÃ SỬA: Map qua biến dynamicCategories thay vì categories tĩnh */}
              {dynamicCategories.map((cat, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <h4 className="font-black text-sm uppercase tracking-wider border-b border-gray-100 pb-2 mb-1">{cat.name}</h4>
                  {cat.items.map((item, itemIdx) => (
                    <a href="#" key={itemIdx} className="text-sm font-semibold text-gray-700 hover:text-black transition flex items-center justify-between group">
                      <span className="truncate pr-2">{item}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-transform shrink-0" />
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================= */}
        {/* CỘT 2: LOGO TRUNG TÂM */}
        {/* ======================================= */}
        <div 
          onClick={handleLogoClick}
          className="flex-0 flex items-center justify-center select-none cursor-pointer gap-3 sm:gap-4 shrink-0 hover:opacity-80 transition"
          title="Về Trang Chủ"
        >
          <img src={nikeLogoImg} alt="Nike Logo" className="h-7 sm:h-9 object-contain" onError={(e) => { e.target.src = 'https://via.placeholder.com/50x50/000000/ffffff.png?text=Logo' }} />
          <span className="text-gray-300 font-black text-lg sm:text-xl">X</span>
          <span className="text-2xl sm:text-3xl tracking-widest text-black mt-1" style={{ fontFamily: "'Comic Jungle', sans-serif" }}>
            MINHTRAN
          </span>
        </div>

        {/* ======================================= */}
        {/* CỘT 3: ICONS */}
        {/* ======================================= */}
        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4">
          
          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2.5 hover:bg-gray-200 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-black">
            <Search 
              size={18} 
              className="text-gray-500 mr-2 cursor-pointer hover:text-black transition" 
              onClick={handleSearchSubmit} 
            />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="bg-transparent border-none outline-none text-sm w-40 focus:w-64 transition-all duration-300 placeholder-gray-400 font-medium" 
            />
          </div>

          {user && (
            <button onClick={() => onNavigate('wishlist')} className="bg-gray-100 text-black p-3 rounded-full hover:bg-gray-200 transition shadow-sm hover:scale-105 active:scale-95" title="Sản phẩm yêu thích">
              <Heart size={18} strokeWidth={2} />
            </button>
          )}

          {user ? (
            <div className="relative group" ref={dropdownRef}> 
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition shadow-sm font-bold text-lg hover:scale-105 active:scale-95">
                {displayName ? displayName.charAt(0).toUpperCase() : ''}
              </button>
              
              {!isDropdownOpen && (
                <div className="absolute top-14 right-1/2 translate-x-1/2 bg-black text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-50">
                  Hi, {displayName}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                </div>
              )}

              {isDropdownOpen && (
                <div className="absolute top-14 right-0 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 animate-modal-enter">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <p className="font-bold text-sm truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  <div className="p-2 flex flex-col gap-1 border-b border-gray-100">
                    <button onClick={() => { onNavigate('profile'); setIsDropdownOpen(false); }} className="text-left px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-xl transition flex items-center gap-2">👤 Thay đổi thông tin</button>
                    <button onClick={() => { onNavigate('orders'); setIsDropdownOpen(false); }} className="text-left px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-xl transition flex items-center gap-2">📦 Đơn hàng của tôi</button>
                    <button onClick={() => { onNavigate('wishlist'); setIsDropdownOpen(false); }} className="text-left px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-xl transition flex items-center gap-2 text-red-600">❤️ Yêu thích</button>
                  </div>

                  {/* NÚT QUẢN TRỊ */}
                  {(user.role === 'admin' || user.email === 'admin@gmail.com') && (
                    <div className="p-2 border-b border-gray-100 bg-blue-50/30">
                      <button onClick={() => { onNavigate('admin'); setIsDropdownOpen(false); }} className="w-full text-left px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 rounded-xl transition flex items-center gap-2">
                        <Settings size={16} /> Quản lý hệ thống
                      </button>
                    </div>
                  )}

                  <div className="p-2 bg-red-50/50">
                    <button onClick={() => { logout(); setIsDropdownOpen(false); onNavigate('home'); }} className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2">🚪 Đăng xuất</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth} className="bg-gray-100 text-black p-3 rounded-full hover:bg-gray-200 transition shadow-sm hover:scale-105 active:scale-95" title="Đăng nhập / Đăng ký">
              <User size={18} strokeWidth={2.5} />
            </button>
          )}

          <button onClick={onOpenCart} className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition shadow-sm flex items-center justify-center relative hover:scale-105 active:scale-95" title="Giỏ hàng">
            <ShoppingCart size={18} strokeWidth={2.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
}