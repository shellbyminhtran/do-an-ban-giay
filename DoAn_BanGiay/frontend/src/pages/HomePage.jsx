// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import HeroBanner from '../components/HeroBanner';

export default function HomePage({ onOpenChat, onProductClick }) {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) setProducts(data.data);
      })
      .catch(err => {
        console.warn("Lỗi kết nối Backend, dùng dữ liệu mẫu.");
        setProducts([
          { id: 1, name: "Nike Pegasus Premium", price: 3829000, category: "Chạy bộ", cushion_level: "Cao", shoe_form: "Standard", image_url: "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/d0482717-a4de-4cde-9eda-7c815765bbd4/NIKE+PEGASUS+PREMIUM.png" },
          { id: 2, name: "Nike Invincible 3", price: 5279000, category: "Thể thao", cushion_level: "Cao", shoe_form: "Standard", image_url: "https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/3379dc97-3fb0-45b0-8c70-623751108b62/NIKE+ZOOMX+INVINCIBLE+RN+3+FP.png" }
        ]);
      });
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleToggleWishlist = (e, productId) => {
    e.stopPropagation(); 
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  return (
    <>
      <section className="max-w-7xl mx-auto p-6 mt-10 mb-10">
        <HeroBanner onOpenChat={onOpenChat} />
      </section>

      <main id="products-section" className="max-w-7xl mx-auto p-6 pb-20">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Sản phẩm nổi bật</h2>
        {products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Đang tải sản phẩm...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isLiked = wishlist.includes(product.id);
              return (
              <div key={product.id} className="group bg-white rounded-3xl border border-gray-100 p-4 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div onClick={() => onProductClick(product)} className="bg-[#f5f5f5] aspect-square rounded-2xl mb-5 relative flex items-center justify-center overflow-hidden cursor-pointer shrink-0">
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 mix-blend-multiply" />
                  
                  {product.sale_price && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2.5 py-1.5 rounded uppercase tracking-widest z-10 shadow-sm">Sale</div>
                  )}

                  <button 
                    onClick={(e) => handleToggleWishlist(e, product.id)}
                    className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 z-10"
                    title={isLiked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                  >
                    <Heart size={18} className={`transition-colors duration-300 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                  </button>
                </div>
                
                <div className="px-2 flex flex-col flex-1">
                  {/* Category & Tags */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.category || 'Giày thể thao'}</span>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{product.shoe_form}</span>
                  </div>

                  {/* ĐÃ SỬA: Hiện đầy đủ tên, bỏ truncate, chỉnh size chữ và khoảng cách dòng */}
                  <h3 onClick={() => onProductClick(product)} className="font-black text-[15px] leading-snug mb-4 cursor-pointer hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Đẩy khối giá và nút mua xuống đáy card để các card luôn bằng nhau */}
                  <div className="mt-auto">
                    {/* Đường kẻ mờ phân cách */}
                    <div className="w-full h-px bg-gray-100 mb-4"></div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.sale_price ? (
                          <>
                            <span className="text-red-600 font-black text-lg">{formatPrice(product.sale_price)}</span>
                            <span className="text-gray-400 line-through text-xs font-medium">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="font-black text-lg text-black">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors shadow-md active:scale-95 group/btn"
                        title="Thêm vào giỏ"
                      >
                        <ShoppingCart size={18} className="group-hover/btn:-rotate-12 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </main>
    </>
  );
}