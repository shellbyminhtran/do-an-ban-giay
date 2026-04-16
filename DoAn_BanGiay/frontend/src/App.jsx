// src/App.jsx
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

import UserProfile from './pages/UserProfile';
import UserOrders from './pages/UserOrders';
import UserWishlist from './pages/UserWishlist';
import LoadingScreen from './components/LoadingScreen';
import Header from './components/Header';
import ChatbotAI from './components/ChatbotAI';
import HomePage from './pages/HomePage';
import ProductDetail from './pages/ProductDetail';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import SizeChartModal from './components/SizeChartModal';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'profile', 'productDetail'
  
  // Hàm xử lý khi click vào tên giày trong Chatbot
  const handleShoeClickFromChat = async (shoeName) => {
    try {
      // 1. Lấy toàn bộ danh sách giày từ Database
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      
      // 2. Tìm đôi giày có tên khớp với chữ khách vừa bấm trong Chat
      const foundProduct = data.data.find(p => p.name.toLowerCase().includes(shoeName.toLowerCase()));
      
      if (foundProduct) {
        // Nếu tìm thấy: Chuyển sang màn hình chi tiết và đóng khung Chat
        setSelectedProduct(foundProduct);
        setIsChatOpen(false); 
      } else {
        alert('Rất tiếc, sản phẩm này hiện không có sẵn trong hệ thống!');
      }
    } catch (error) {
      console.error("Lỗi khi tìm sản phẩm:", error);
    }
  };

  const renderContent = () => {
    // Ưu tiên 1: Đang xem chi tiết giày
    if (selectedProduct) {
      return <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onOpenSizeChart={() => setIsSizeChartOpen(true)} />;
    }
    // Ưu tiên 2: Các trang phụ trợ
    if (currentPage === 'profile') {
      return <UserProfile onBack={() => setCurrentPage('home')} />;
    }
    if (currentPage === 'orders') {
      return <UserOrders onBack={() => setCurrentPage('home')} />;
    }
    if (currentPage === 'wishlist') {
      return <UserWishlist onBack={() => setCurrentPage('home')} />;
    }
    // Mặc định: Trang chủ
    return <HomePage onOpenChat={() => setIsChatOpen(true)} onProductClick={(product) => setSelectedProduct(product)} />;
  };

  return (
    <>
      {showLoading && <LoadingScreen onComplete={() => setShowLoading(false)} />}

      {/* LOGIC ĐIỀU HƯỚNG TỐI CAO: NẾU LÀ TRANG ADMIN THÌ CHỈ RENDER ADMIN */}
      {currentPage === 'admin' ? (
        <AdminDashboard onNavigate={(page) => setCurrentPage(page)} />
      ) : (
        /* NẾU KHÔNG PHẢI ADMIN THÌ RENDER WEB BÁN HÀNG BÌNH THƯỜNG */
        <div className={`min-h-screen bg-white text-black font-sans transition-opacity duration-1000 ${showLoading ? 'opacity-0' : 'opacity-100'}`}>
          <Header 
            onOpenCart={() => setIsCartOpen(true)} 
            onOpenAuth={() => setIsAuthOpen(true)} 
            onNavigate={(page) => {
              setCurrentPage(page);
              setSelectedProduct(null);
            }}
          />

          {renderContent()}

          <ChatbotAI 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} onShoeClick={handleShoeClickFromChat} />
          <CartDrawer 
            isOpen={isCartOpen} 
            onClose={() => setIsCartOpen(false)} />
          <AuthModal 
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)} />
          <SizeChartModal 
            isOpen={isSizeChartOpen} 
            onClose={() => setIsSizeChartOpen(false)} />

          <div className="fixed bottom-6 right-6 z-30">
            <button onClick={() => setIsChatOpen(!isChatOpen)} 
              className={`bg-black text-white p-4 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 flex items-center justify-center ${isChatOpen ? 'rotate-90 opacity-0 pointer-events-none' : 'rotate-0 opacity-100'}`}>
              <MessageCircle size={28} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}