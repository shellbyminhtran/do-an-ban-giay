// src/components/HeroBanner.jsx
import React, { useState, useEffect } from 'react';
import { ArrowRight, PlayCircle } from 'lucide-react';

export default function HeroBanner({ onOpenChat }) {
  const [campaign, setCampaign] = useState(null);
  const [mergedMedia, setMergedMedia] = useState([]); // ĐÃ SỬA: State mới chứa cả ảnh Khuyến mãi + Mặc định
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi song song 2 API cùng lúc để tiết kiệm thời gian tải trang
        const [resCamp, resDef] = await Promise.all([
          fetch('http://localhost:5000/api/campaigns').catch(() => ({ json: () => ({ success: false }) })),
          fetch('http://localhost:5000/api/banner-defaults').catch(() => ({ json: () => ({ success: false }) }))
        ]);

        const dataCamp = await resCamp.json();
        const dataDef = await resDef.json();
        
        let activeCamp = null;
        if (dataCamp.success && dataCamp.data && dataCamp.data.length > 0) {
          activeCamp = dataCamp.data.find(camp => {
            const isExpired = camp.end_date && new Date(camp.end_date) < new Date();
            return camp.status === 'active' && !isExpired;
          });
        }

        let defaultItems = [];
        if (dataDef.success && dataDef.data) {
          defaultItems = dataDef.data;
        }

        // ĐÃ SỬA: NẾU CÓ KHUYẾN MÃI -> NỐI 2 MẢNG ẢNH LẠI VỚI NHAU
        if (activeCamp) {
          setCampaign(activeCamp);
          setMergedMedia([...(activeCamp.media_items || []), ...defaultItems]);
        } else {
          setCampaign(null);
          setMergedMedia(defaultItems);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu banner:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // Logic Tự động lướt (Auto-slide)
  useEffect(() => {
    if (mergedMedia.length <= 1) return;
    
    const timer = setInterval(() => {
      setActiveMediaIndex((prev) => (prev + 1) % mergedMedia.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [mergedMedia]); // Phụ thuộc vào mảng đã gộp

  if (loading) return <div className="h-[400px] w-full bg-gray-50 animate-pulse rounded-3xl"></div>;

  // Nếu cả 2 đều trống (Chưa tạo folder Banner và ko có khuyến mãi) -> Hiện giao diện AI mặc định
  if (mergedMedia.length === 0) {
    return (
      <div className="bg-gray-100 p-8 sm:p-10 rounded-3xl grid grid-cols-1 md:grid-cols-2 items-center gap-10">
        <div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase italic leading-[0.95] tracking-tighter mb-6">Trợ lý AI <br/> Chọn giày chuẩn.</h2>
          <p className="text-gray-600 mb-8 max-w-md">Công nghệ tương lai phân tích chỉ số BMI để tìm ra đôi giày bảo vệ xương khớp hoàn hảo cho riêng bạn.</p>
          <button onClick={onOpenChat} className="bg-black text-white px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition flex items-center gap-2 group shadow-lg active:scale-95">
            Bắt đầu chat ngay <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="relative aspect-square mix-blend-darken">
          <img src="https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto/3379dc97-3fb0-45b0-8c70-623751108b62/NIKE+ZOOMX+INVINCIBLE+RN+3+FP.png" alt="Hero shoe" className="w-full h-full object-contain scale-110" />
        </div>
      </div>
    );
  }

  const currentMedia = mergedMedia[activeMediaIndex];
  const isCampaignMode = !!campaign;

  return (
    <div className="bg-gray-100 rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 sm:p-10 shadow-sm border border-gray-200">
      
      {/* CỘT TRÁI: TIÊU ĐỀ & THUMBNAILS */}
      <div className="flex flex-col gap-8 h-full justify-center">
        
        {isCampaignMode ? (
          <div className="prose max-w-none break-words" dangerouslySetInnerHTML={{ __html: campaign.title }} />
        ) : (
          <div>
            <h2 className="text-4xl sm:text-5xl font-black uppercase italic leading-[0.95] tracking-tighter text-black">
              KHÁM PHÁ <br/> BỘ SƯU TẬP MỚI
            </h2>
            <p className="text-gray-500 font-medium mt-4">Những mẫu giày thịnh hành nhất hiện nay.</p>
          </div>
        )}
        
        {/* Danh sách Hình nhỏ (Thumbnails) tự động lướt */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Khám phá nội dung</p>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide">
            {mergedMedia.map((media, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveMediaIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden cursor-pointer shrink-0 snap-start transition-all duration-300 ${
                  idx === activeMediaIndex 
                    ? 'border-4 border-black scale-105 shadow-md opacity-100' 
                    : 'border-2 border-transparent opacity-50 hover:opacity-80'
                }`}
              >
                {media.type === 'video' ? (
                  <>
                    <video src={media.url} className="w-full h-full object-cover pointer-events-none" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle size={20} className="text-white opacity-90" />
                    </div>
                  </>
                ) : (
                  <img src={media.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Nút Call-to-action */}
        <button 
          onClick={() => {
            if (isCampaignMode) {
              window.scrollTo({ top: document.getElementById('products-section')?.offsetTop - 100, behavior: 'smooth' });
            } else {
              onOpenChat(); // Nếu ko có chiến dịch thì gọi Chat AI
            }
          }} 
          className="bg-black text-white w-max px-8 py-4 rounded-full font-bold hover:bg-gray-800 transition flex items-center gap-2 group mt-2 shadow-lg active:scale-95"
        >
          {isCampaignMode ? 'Mua Ngay' : 'Tư vấn AI'} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* CỘT PHẢI: HIỂN THỊ MEDIA LỚN */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-gray-200 rounded-2xl overflow-hidden shadow-inner">
        {currentMedia?.type === 'video' ? (
          <video 
            key={currentMedia.url} 
            src={currentMedia.url} 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover animate-fade-in" 
          />
        ) : (
          <img 
            key={currentMedia?.url}
            src={currentMedia?.url} 
            alt="Hero Banner" 
            className="w-full h-full object-cover animate-fade-in" 
          />
        )}
      </div>
      
    </div>
  );
}