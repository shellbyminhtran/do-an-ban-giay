// src/pages/ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Star, ShieldCheck, Truck, Info, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductDetail({ product, onBack, onOpenSizeChart }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('42');
  const sizes = ['39', '40', '41', '42', '43', '44', '45'];

  const allImages = Array.isArray(product.image_urls) && product.image_urls.length > 0 
    ? product.image_urls 
    : (product.image_url ? [product.image_url] : []);
  const [activeImage, setActiveImage] = useState(allImages[0]);

  // ==========================================
  // STATE & LOGIC: ĐÁNH GIÁ (REVIEWS)
  // ==========================================
  const [reviews, setReviews] = useState([]); 
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (product && product.id) {
      fetch(`http://localhost:5000/api/products/${product.id}/reviews`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setReviews(data.data);
          } else {
            setReviews([]);
          }
        })
        .catch(err => {
          console.error("Lỗi khi tải đánh giá:", err);
          setReviews([]);
        });
    }
  }, [product]);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / totalReviews).toFixed(1) 
    : 0;
  
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newReview.comment.trim() === '') return alert("Vui lòng nhập nội dung đánh giá!");
    
    const draftReview = {
      id: Date.now(), 
      customer_name: 'Bạn (Khách hàng)', 
      rating: newReview.rating,
      comment: newReview.comment,
      created_at: new Date().toISOString(),
      likes: 0
    };

    setReviews([draftReview, ...reviews]);
    setNewReview({ rating: 5, comment: '' }); 
    alert("Cảm ơn bạn đã đánh giá sản phẩm!");

    try {
      await fetch(`http://localhost:5000/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Bạn (Khách hàng)',
          rating: draftReview.rating,
          comment: draftReview.comment
        })
      });
    } catch (err) {
      console.warn("Lỗi server, nhưng đánh giá đã được hiển thị tạm thời trên máy bạn.");
    }
  };

  useEffect(() => {
    if (allImages.length > 0) setActiveImage(allImages[0]);
  }, [product]);

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="max-w-7xl mx-auto p-6 mt-4 mb-20 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-black transition font-medium mb-8 bg-white py-2 pr-4 rounded-full w-max">
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-20">
        
        {/* CỘT TRÁI: ẢNH */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#f5f5f5] rounded-[2.5rem] aspect-square flex items-center justify-center relative overflow-hidden shadow-inner border border-gray-100">
            <img src={activeImage} alt={product.name} key={activeImage} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 mix-blend-multiply animate-fade-in" />
            {product.sale_price && <div className="absolute top-6 left-6 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-lg uppercase tracking-widest shadow-lg">Đang Sale</div>}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(img)} className={`w-20 h-20 shrink-0 bg-[#f5f5f5] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === img ? 'border-black shadow-md scale-100 opacity-100' : 'border-transparent opacity-50 hover:opacity-100 hover:scale-95'}`}>
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CỘT PHẢI: CHI TIẾT */}
        <div className="flex flex-col">
          
          <div className="mb-4 flex items-center gap-2 text-orange-500">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={16} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} className={star <= Math.round(averageRating) ? "text-orange-500" : "text-gray-300"} />
              ))}
            </div>
            <span className="text-gray-500 text-xs font-bold ml-1">({totalReviews} đánh giá)</span>
            <span className="text-gray-300 text-xs">|</span>
            
            {/* ĐÃ SỬA: Lấy đúng số lượng thật từ Backend (nếu undefined thì hiện 0) */}
            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">
              Đã bán: <span className="text-black">{product.sold_quantity || 0}</span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight mb-4 leading-none">{product.name}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider">{product.category || 'Thể thao'}</span>
            <span className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider">Form {product.shoe_form}</span>
            <span className="bg-green-50 text-green-600 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider">Cushion {product.cushion_level}</span>
          </div>
          
          <div className="mb-8 flex items-end gap-4">
            {product.sale_price ? (
              <><span className="text-4xl font-black text-red-600">{formatPrice(product.sale_price)}</span><span className="text-xl text-gray-400 line-through font-medium mb-1">{formatPrice(product.price)}</span></>
            ) : <span className="text-4xl font-black text-black">{formatPrice(product.price)}</span>}
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
            <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold text-sm uppercase tracking-wider"><Info size={16} /> Thông tin sản phẩm</div>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold uppercase tracking-wider text-sm">Chọn Size (EU)</h3>
              <button onClick={onOpenSizeChart} className="text-gray-500 text-sm font-medium underline hover:text-black transition-colors">Bảng quy đổi size</button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {sizes.map((size) => (
                <button key={size} onClick={() => setSelectedSize(size)} className={`py-3 rounded-xl border font-bold text-sm transition-all duration-200 ${selectedSize === size ? 'border-black bg-black text-white shadow-lg scale-105' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => addToCart({ ...product, size: selectedSize })} className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 mb-8 active:scale-[0.98]">
            <ShoppingCart size={20} /> Thêm vào giỏ hàng
          </button>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-8">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><div className="bg-gray-100 p-2.5 rounded-full"><Truck size={20} className="text-black" /></div>Miễn phí giao hàng</div>
            <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><div className="bg-gray-100 p-2.5 rounded-full"><ShieldCheck size={20} className="text-black" /></div>Đổi trả trong 30 ngày</div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* KHU VỰC ĐÁNH GIÁ */}
      {/* ========================================== */}
      <div className="border-t border-gray-200 pt-16">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-10 text-center">Khách hàng Đánh giá</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="col-span-1 flex flex-col gap-8">
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 text-center">
              <h3 className="text-6xl font-black text-black mb-2">{averageRating}<span className="text-3xl text-gray-400">/5</span></h3>
              <div className="flex justify-center gap-1 text-orange-500 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={24} fill={star <= Math.round(averageRating) ? "currentColor" : "none"} className={star <= Math.round(averageRating) ? "text-orange-500" : "text-gray-300"} />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-500 mb-6">Dựa trên {totalReviews} lượt đánh giá</p>
              
              <div className="flex flex-col gap-2">
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => Number(r.rating) === star).length;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <div className="w-10 text-gray-500 font-bold">{star} sao</div>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="w-8 text-right text-gray-400 text-xs">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="font-black uppercase tracking-widest text-sm mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                <MessageSquare size={16} /> Viết đánh giá của bạn
              </h4>
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Chất lượng sản phẩm</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star} type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star size={28} fill={(hoverRating || newReview.rating) >= star ? "currentColor" : "none"} className={(hoverRating || newReview.rating) >= star ? "text-orange-500" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Chia sẻ trải nghiệm</p>
                  <textarea 
                    rows="3" required
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Sản phẩm này đi có êm không? Vừa vặn không?..."
                    className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200 focus:border-black outline-none text-sm font-medium resize-none transition-colors"
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-black text-white py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition shadow-md mt-2">
                  Gửi Đánh Giá
                </button>
              </form>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black text-lg">Mới nhất ({totalReviews})</h3>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-3xl border border-gray-100">
                <p className="text-gray-500 font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-black">{review.customer_name || review.name || 'Khách hàng'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex text-orange-500">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={12} fill={star <= Number(review.rating) ? "currentColor" : "none"} className={star <= Number(review.rating) ? "text-orange-500" : "text-gray-300"} />
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {new Date(review.created_at || review.date || Date.now()).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-widest">
                      <ShieldCheck size={12} /> Đã mua hàng
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">{review.comment}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <ThumbsUp size={14} /> Hữu ích ({review.likes || 0})
                    </button>
                    <button className="hover:text-black transition-colors">Báo cáo</button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

    </div>
  );
}