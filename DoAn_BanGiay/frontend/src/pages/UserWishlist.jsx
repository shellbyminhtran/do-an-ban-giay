// src/pages/UserWishlist.jsx
import React from 'react';
import { Heart, ArrowLeft } from 'lucide-react';

export default function UserWishlist({ onBack }) {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-4 mb-20 animate-modal-enter">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black transition font-medium mb-8">
        <ArrowLeft size={20} /> Quay lại trang chủ
      </button>

      <h2 className="text-3xl font-black uppercase tracking-tight mb-8">Sản phẩm yêu thích</h2>

      <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Heart size={48} className="text-red-300" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold mb-2">Danh sách đang trống</h3>
        <p className="text-gray-500 max-w-sm mb-8">Bạn chưa lưu sản phẩm nào vào danh sách yêu thích. Hãy thả tim những đôi giày bạn thích để lưu lại nhé!</p>
        <button onClick={onBack} className="bg-black text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition hover:scale-105 shadow-md">
          KHÁM PHÁ NGAY
        </button>
      </div>
    </div>
  );
}