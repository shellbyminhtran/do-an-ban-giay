import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';

export default function NotificationModal({ isOpen, type, message, onConfirm, onClose, isConfirm }) {
  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle className="text-green-500" size={48} />,
    error: <XCircle className="text-red-500" size={48} />,
    warning: <AlertTriangle className="text-orange-500" size={48} />,
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl flex flex-col items-center text-center animate-fade-in">
        <div className="mb-4">{icons[type] || icons.success}</div>
        
        <h3 className="text-xl font-bold text-black mb-2 uppercase tracking-tight">Thông báo</h3>
        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">{message}</p>

        <div className="flex gap-3 w-full">
          {isConfirm ? (
            <>
              <button onClick={onClose} className="flex-1 py-3.5 rounded-full bg-gray-100 text-gray-500 font-bold text-xs uppercase hover:bg-gray-200 transition">Hủy</button>
              <button onClick={onConfirm} className="flex-1 py-3.5 rounded-full bg-black text-white font-bold text-xs uppercase hover:bg-gray-800 shadow-lg transition">Xác nhận</button>
            </>
          ) : (
            <button onClick={onClose} className="w-full py-3.5 rounded-full bg-black text-white font-bold text-xs uppercase hover:bg-gray-800 shadow-lg transition">Đóng</button>
          )}
        </div>
      </div>
    </div>
  );
}