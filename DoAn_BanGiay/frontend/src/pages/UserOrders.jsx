// Cấu trúc gợi ý cho tab Đơn hàng của bạn
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user?.id) return;
      
      try {
        const res = await fetch(`http://localhost:5000/api/my-orders/${user.id}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [user]);

  if (loading) return <p className="p-10 text-center">Đang tải đơn hàng...</p>;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h2 className="text-2xl font-black mb-6 uppercase">Lịch sử đơn hàng</h2>
      
      {orders.length === 0 ? (
        <div className="bg-gray-50 p-10 rounded-3xl text-center text-gray-400">
          Bạn chưa có đơn hàng nào.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Mã đơn: #{order.id}</p>
                <p className="font-black text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}</p>
                <p className="text-sm text-gray-500">{new Date(order.create_at).toLocaleDateString('vi-VN')}</p>
              </div>
              
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  order.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                }`}>
                  {order.status === 'Pending' ? 'Đang xử lý' : 'Đã hoàn thành'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}