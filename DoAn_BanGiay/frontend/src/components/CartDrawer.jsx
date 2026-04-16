// src/components/CartDrawer.jsx
import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import NotificationModal from './NotificationModal';

export default function CartDrawer({ isOpen, onClose }) {
  const { cartItems, updateQuantity, removeItem, totalAmount, totalItems } = useCart();
  const { user } = useAuth();
  
  const [isCheckout, setIsCheckout] = useState(false);
  const [modal, setModal] = useState({ 
    open: false, 
    type: 'success', 
    message: '', 
    isConfirm: false,
    onConfirm: null 
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Hàm thực thi đặt hàng sau khi đã xác nhận
  const executeOrder = async () => {
    // Đóng modal xác nhận trước khi xử lý
    setModal(prev => ({ ...prev, open: false }));
    setIsCheckout(true);

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          total_price: totalAmount,
          items: cartItems
        })
      });

      const data = await response.json();

      if (data.success) {
        setModal({
          open: true,
          type: 'success',
          message: "🎉 Đặt hàng thành công! Đơn hàng của bạn đang được xử lý.",
          isConfirm: false
        });
        
        // Xóa giỏ hàng local storage (nếu cần) và tải lại trang để làm mới giỏ hàng
        setTimeout(() => {
          localStorage.removeItem(`nike_cart_${user.email}`);
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(data.error || "Lỗi không xác định");
      }
    } catch (error) {
      setModal({
        open: true,
        type: 'error',
        message: "❌ Đặt hàng thất bại: " + error.message,
        isConfirm: false
      });
    } finally {
      setIsCheckout(false);
    }
  };

  // Hàm xử lý khi bấm nút Thanh toán
  const handleCheckout = () => {
    // 1. Kiểm tra giỏ hàng trống
    if (cartItems.length === 0) {
      setModal({
        open: true,
        type: 'warning',
        message: "Giỏ hàng của bạn đang trống. Hãy chọn một vài đôi giày nhé!",
        isConfirm: false
      });
      return;
    }

    // 2. Kiểm tra đăng nhập
    if (!user) {
      setModal({ 
        open: true, 
        type: 'warning', 
        message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục thanh toán!", 
        isConfirm: false
      });
      return;
    }

    // 3. Mở modal xác nhận đặt hàng
    setModal({
      open: true,
      type: 'warning',
      message: "Bạn có chắc chắn muốn đặt hàng với tổng số tiền " + formatPrice(totalAmount) + " không?",
      isConfirm: true,
      onConfirm: executeOrder
    });
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-black uppercase tracking-tight text-black">Giỏ hàng ({totalItems})</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 gap-4">
              <ShoppingBag size={64} className="text-gray-200" strokeWidth={1} />
              <p className="font-medium">Giỏ hàng của bạn đang trống.</p>
              <button onClick={onClose} className="mt-2 text-black font-bold border-b-2 border-black pb-1 hover:text-gray-600 transition">
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cartItems.map(item => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl p-2 shrink-0 flex items-center justify-center border border-gray-100">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-contain mix-blend-darken" />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-bold text-sm leading-tight mb-1 text-black">{item.name}</h3>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Size: {item.size}</p>
                      <p className="font-black text-sm mt-1">{formatPrice(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm">
                        <button onClick={() => updateQuantity(item.id, item.size, -1)} className="p-1.5 hover:bg-gray-100 rounded-l-full transition"><Minus size={14} /></button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, 1)} className="p-1.5 hover:bg-gray-100 rounded-r-full transition"><Plus size={14} /></button>
                      </div>
                      <button onClick={() => removeItem(item.id, item.size)} className="text-gray-300 hover:text-red-500 transition p-1.5">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Tổng tạm tính</span>
              <span className="font-black text-2xl text-black">{formatPrice(totalAmount)}</span>
            </div>
            <p className="text-[10px] text-green-600 mb-6 text-center font-black uppercase tracking-widest">✨ Miễn phí vận chuyển cho đơn hàng này</p>
            <button 
              onClick={handleCheckout} 
              disabled={isCheckout} 
              className="w-full bg-black text-white py-4.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              {isCheckout ? 'Đang xử lý...' : 'Thanh toán ngay'}
            </button>
          </div>
        )}
      </div>

      {/* Modal thông báo xịn sò */}
      <NotificationModal 
        isOpen={modal.open}
        type={modal.type}
        message={modal.message}
        isConfirm={modal.isConfirm}
        onConfirm={modal.onConfirm}
        onClose={() => setModal(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}