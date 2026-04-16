// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// ĐÃ THÊM: Import NotificationModal
import NotificationModal from '../components/NotificationModal';

export default function UserProfile({ onBack }) {
  const { user } = useAuth();
  
  const profileKey = `nike_profile_${user?.email}`;

  const [formData, setFormData] = useState({
    name: user?.full_name || user?.email?.split('@')[0] || 'Khách hàng',
    email: user?.email || '',
    phone: '',
    address: '',
    height: user?.height || '',
    weight: user?.weight || ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  // Quản lý trạng thái Modal thông báo
  const [modal, setModal] = useState({ open: false, type: 'success', message: '' });

  useEffect(() => {
    const savedProfile = localStorage.getItem(profileKey);
    if (savedProfile) {
      setFormData(JSON.parse(savedProfile));
    }
  }, [profileKey]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem(profileKey, JSON.stringify(formData));
        // Bắn sự kiện để Chatbot cập nhật chỉ số ngay lập tức
        window.dispatchEvent(new Event('profileUpdated'));
        // Hiện Modal thay vì Alert
        setModal({ open: true, type: 'success', message: 'Cập nhật thông tin hồ sơ thành công!' });
      } else {
        setModal({ open: true, type: 'error', message: 'Lỗi: ' + data.error });
      }
    } catch (error) {
      setModal({ open: true, type: 'error', message: 'Lỗi kết nối máy chủ!' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 mt-4 mb-20 animate-modal-enter">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black transition font-medium mb-8">
        <ArrowLeft size={20} /> Quay lại trang chủ
      </button>

      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
        {/* Banner Cover */}
        <div className="h-32 bg-black relative">
          <div className="absolute -bottom-10 left-8 w-24 h-24 bg-white rounded-full p-1.5 flex items-center justify-center shadow-md">
            <div className="w-full h-full bg-gray-100 text-black rounded-full flex items-center justify-center text-3xl font-black">
              {formData.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSave} className="p-8 pt-16">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Hồ sơ cá nhân</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Họ và tên</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 p-3.5 pl-12 rounded-xl border border-gray-200 focus:border-black outline-none transition font-medium text-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email (Không thể đổi)</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={formData.email} disabled className="w-full bg-gray-100 text-gray-500 cursor-not-allowed p-3.5 pl-12 rounded-xl border border-transparent outline-none font-medium text-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số điện thoại</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Thêm số điện thoại..." className="w-full bg-gray-50 p-3.5 pl-12 rounded-xl border border-gray-200 focus:border-black outline-none transition font-medium text-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Địa chỉ giao hàng</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Thêm địa chỉ..." className="w-full bg-gray-50 p-3.5 pl-12 rounded-xl border border-gray-200 focus:border-black outline-none transition font-medium text-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chiều cao (cm)</label>
              <div className="relative">
                <input type="number" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} placeholder="VD: 175" className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 focus:border-black outline-none transition font-medium text-sm" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cân nặng (kg)</label>
              <div className="relative">
                <input type="number" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="VD: 70" className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 focus:border-black outline-none transition font-medium text-sm" />
              </div>
            </div> 
          </div>

          <div className="flex justify-end border-t border-gray-100 pt-6">
            <button type="submit" disabled={isSaving} className="bg-black text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition flex items-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95 shadow-md">
              <Save size={16} /> {isSaving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
            </button>
          </div>
        </form>
      </div>

      {/* ĐÃ THÊM: Thẻ Modal để hiển thị thông báo */}
      <NotificationModal 
        isOpen={modal.open}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />
    </div> 
  );
}