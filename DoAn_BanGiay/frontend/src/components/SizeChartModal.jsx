// src/components/SizeChartModal.jsx
import React from 'react';
import { X } from 'lucide-react';
// Import file ảnh bảng size EU
import sizeChartImg from '../assets/Size_eu_nike.png';

export default function SizeChartModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    // Lớp màn tối phía dưới
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 transition-opacity duration-500 opacity-100 select-none">
      
      {/* 1. --- ĐÃ FIX: Sử dụng class hoạt họa animate-modal-enter để bảng nẩy khi hiện --- */}
      <div className="relative w-[1000px] h-[600px] rounded-3xl overflow-hidden modal-neumorphic animate-modal-enter flex flex-col justify-center items-center">
        
        {/* Nút X đóng Modal */}
        <button onClick={onClose} className="absolute top-5 right-5 z-50 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition">
          <X size={20} />
        </button>

        {/* 2. Ảnh bảng size Eustore.png nạp vào, tràn form to */}
        <div className="relative w-full h-full p-10 flex items-center justify-center">
          <img 
            src={sizeChartImg} 
            alt="Nike Size EU Chart" 
            className="w-full h-full object-contain drop-shadow-xl rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}