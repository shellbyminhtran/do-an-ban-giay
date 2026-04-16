// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  Settings, ArrowLeft, TrendingUp, Box, DollarSign, Activity,
  Plus, Search, Edit, Trash2, X, Image as ImageIcon, Minus
} from 'lucide-react';

// ĐÃ THÊM: Gọi Component InventoryTab từ file riêng vào
import InventoryTab from '../components/InventoryTab';

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'products', label: 'Quản lý kho giày', icon: Package },
    // Dùng Icon Package (hoặc Tag nếu bạn có) cho tab này
    { id: 'inventory', label: 'Marketing & Tồn kho', icon: Package }, 
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
    { id: 'users', label: 'Khách hàng', icon: Users },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'products': return <ProductsTab />;
      case 'inventory': return <InventoryTab />;
      case 'orders': return <OrdersTab />;
      case 'users': return <UsersTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      
      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-8 pb-10 border-b border-gray-50 flex flex-col gap-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <span className="text-3xl tracking-widest text-black" style={{ fontFamily: "'Comic Jungle', sans-serif" }}>MINHTRAN</span>
          </div>
          <span className="text-[10px] font-black tracking-[0.2em] text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-max">ADMINISTRATOR</span>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-4">Menu Chính</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                  isActive ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 border-t border-gray-50 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-gray-500 hover:bg-gray-100 hover:text-black transition-colors">
            <Settings size={18} /> Cài đặt hệ thống
          </button>
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-red-500 hover:bg-red-50 transition-colors mt-2">
            <ArrowLeft size={18} /> Thoát về Trang chủ
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-72 p-10 overflow-y-auto h-screen">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-black">Dashboard</h1>
            <p className="text-gray-500 font-medium mt-1">Hệ thống quản trị trung tâm.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-600 shadow-sm">
            Hôm nay: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENT: TỔNG QUAN
// ==========================================
function OverviewTab() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    orderCount: 0,
    productCount: 0,
    userCount: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resP, resO, resU] = await Promise.all([
          fetch('http://localhost:5000/api/products'),
          fetch('http://localhost:5000/api/admin/orders'),
          fetch('http://localhost:5000/api/admin/users')
        ]);
        const [dataP, dataO, dataU] = await Promise.all([resP.json(), resO.json(), resU.json()]);

        const recenue = dataO.data?.reduce((sum, order) => sum + (order.status === 'Completed' ? order.total_price : 0), 0);

        setStats({
          totalRevenue: recenue || 0,
          orderCount: dataO.data?.length || 0,
          productCount: dataP.data?.length || 0,
          userCount: dataU.data?.length || 0
        });
        if (dataO.success && dataO.data) {
          const sortedOrders = dataO.data.sort((a, b) => new Date(b.create_at) - new Date(a.create_at)).slice(0, 5);
          setRecentOrders(sortedOrders);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">Chờ xử lý</span>;
      case 'Processing': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">Đang đóng gói</span>;
      case 'Completed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">Hoàn thành</span>;
      case 'Cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">Đã hủy</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Doanh thu thực" value={`${stats.totalRevenue.toLocaleString('vi-VN')}₫`} trend="+100%" icon={DollarSign} color="green" />
        <StatCard title="Tổng đơn hàng" value={stats.orderCount} trend="Mới" icon={ShoppingCart} color="blue" />
        <StatCard title="Số lượng giày" value={stats.productCount} trend="Kho" icon={Box} color="orange" />
        <StatCard title="Thành viên" value={stats.userCount} trend="User" icon={Users} color="purple" />
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black uppercase tracking-widest text-black">Đơn hàng gần đây</h3>
          <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">Xem tất cả</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="pb-4">Mã Đơn</th>
              <th className="pb-4">Khách Hàng</th>
              <th className="pb-4">Tổng Tiền</th>
              <th className="pb-4 text-right">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium text-gray-700">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="py-4 font-bold text-black">#ORD-{order.id}</td>
                  <td className="py-4">{order.customer_name}</td>
                  <td className="py-4 font-bold">{Number(order.total_price).toLocaleString('vi-VN')}₫</td>
                  <td className="py-4 text-right">{getStatusBadge(order.status)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-400">Chưa có đơn hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color }) {
  const colorStyles = { blue: "bg-blue-50 text-blue-600", green: "bg-green-50 text-green-600", orange: "bg-orange-50 text-orange-600", purple: "bg-purple-50 text-purple-600" };
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorStyles[color]}`}><Icon size={24} strokeWidth={2.5} /></div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          <TrendingUp size={14} className={!isPositive ? "rotate-180" : ""} />{trend}
        </div>
      </div>
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-2xl font-black text-black">{value}</p>
    </div>
  );
}

// ==========================================
// COMPONENT: QUẢN LÝ KHO GIÀY (ĐÃ BỌC KHIÊN CHỐNG LỖI)
// ==========================================
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', price: '', image_urls: [''], category: 'Thể Thao', 
    cushion_level: 'Vừa', shoe_form: 'Standard', description: ''
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      
      // BẢO VỆ DỮ LIỆU: Đảm bảo image_urls LUÔN LUÔN là một mảng hợp lệ
      let safeImageUrls = [''];
      if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
        safeImageUrls = product.image_urls;
      } else if (typeof product.image_urls === 'string' && product.image_urls.trim() !== '') {
        // Trường hợp DB cũ lưu nhầm thành String
        safeImageUrls = [product.image_urls];
      } else if (product.image_url) {
        // Trường hợp chỉ có 1 ảnh cũ
        safeImageUrls = [product.image_url];
      }

      setFormData({ 
        ...product, 
        name: product.name || '',
        price: product.price || '',
        category: product.category || 'Thể Thao',
        cushion_level: product.cushion_level || 'Vừa',
        shoe_form: product.shoe_form || 'Standard',
        description: product.description || '',
        image_urls: safeImageUrls
      }); 
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', image_urls: [''], category: 'Bóng rổ', cushion_level: 'Vừa', shoe_form: 'Standard', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const safeUrls = formData.image_urls || [];
    const cleanUrls = safeUrls.filter(url => typeof url === 'string' && url.trim() !== '');
    const primaryImage = cleanUrls.length > 0 ? cleanUrls[0] : '';
    
    const dataToSave = { 
      ...formData, 
      image_urls: cleanUrls,
      image_url: primaryImage
    };

    const url = editingProduct ? `http://localhost:5000/api/products/${editingProduct.id}` : 'http://localhost:5000/api/products';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSave) });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchProducts();
      } else alert('Lỗi: ' + data.error);
    } catch (error) { alert('Không kết nối được Server'); }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi kho hệ thống?`)) {
      await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...(formData.image_urls || [''])];
    newUrls[index] = value;
    setFormData({ ...formData, image_urls: newUrls });
  };
  const addImageUrlField = () => {
    setFormData({ ...formData, image_urls: [...(formData.image_urls || ['']), ''] });
  };
  const removeImageUrlField = (index) => {
    const newUrls = (formData.image_urls || ['']).filter((_, i) => i !== index);
    setFormData({ ...formData, image_urls: newUrls.length ? newUrls : [''] });
  };

  const filteredProducts = products.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="transition-opacity duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Tìm tên giày..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white p-3 pl-12 rounded-xl border border-gray-200 focus:border-black outline-none font-medium shadow-sm" />
        </div>
        <button onClick={() => openModal()} className="bg-black text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition flex items-center gap-2 shadow-sm active:scale-95">
          <Plus size={16} strokeWidth={3} /> Thêm Giày Mới
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <th className="p-4 pl-6 w-24">Ảnh Bìa</th>
              <th className="p-4">Tên Sản Phẩm</th>
              <th className="p-4">Danh Mục</th>
              <th className="p-4">Giá Bán</th>
              <th className="p-4 text-center">Form/Đệm</th>
              <th className="p-4 pr-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium text-gray-700">
            {isLoading ? <tr><td colSpan="6" className="p-10 text-center text-gray-400">Đang tải dữ liệu kho giày...</td></tr> : 
              filteredProducts.map(product => {
                let thumbnail = null;
                if (Array.isArray(product.image_urls) && product.image_urls.length > 0) thumbnail = product.image_urls[0];
                else if (product.image_url) thumbnail = product.image_url;

                return (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                        {thumbnail ? <img src={thumbnail} alt={product.name} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-300" />}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-black">{product.name}</td>
                    <td className="p-4"><span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest">{product.category || 'N/A'}</span></td>
                    <td className="p-4 font-bold">{Number(product.price || 0).toLocaleString('vi-VN')}₫</td>
                    <td className="p-4 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">{product.shoe_form || '-'} • {product.cushion_level || '-'}</td>
                    <td className="p-4 pr-6 flex justify-end gap-2 mt-2">
                      <button onClick={() => openModal(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(product.id, product.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                )
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-xl relative z-10 overflow-y-auto max-h-[90vh] p-8 animate-modal-enter">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 sticky top-0 bg-white z-20">
              <h2 className="text-xl font-black uppercase tracking-tight">{editingProduct ? 'Chỉnh sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 text-gray-500 hover:text-black rounded-full transition hover:bg-gray-200"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tên Giày</label>
                <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 focus:border-black outline-none text-sm font-bold text-black" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Giá Bán Gốc (VNĐ)</label>
                <input type="number" required value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 focus:border-black outline-none text-sm font-bold text-black" />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Danh mục</label>
                <select 
                  value={formData.category || 'Thể Thao'} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                  className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 focus:border-black outline-none text-sm font-bold text-black cursor-pointer"
                >
                  <option value="Bóng rổ">Bóng rổ</option>
                  <option value="Chạy bộ">Chạy bộ</option>
                  <option value="Thời trang">Thời trang</option>
                  <option value="Bóng đá">Bóng đá</option>
                  <option value="Thể Thao">Thể Thao</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Mô tả sản phẩm (Dành cho AI tư vấn & Hiện trên web)</label>
                <textarea rows="4" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 focus:border-black outline-none text-sm font-medium text-black resize-none" placeholder="Nhập chi tiết về công nghệ, chất liệu..." />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Độ Êm (Cushion)</label>
                <select value={formData.cushion_level || 'Vừa'} onChange={e => setFormData({...formData, cushion_level: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 focus:border-black outline-none text-sm font-bold text-black cursor-pointer">
                  <option value="Cao">Cao</option>
                  <option value="Vừa">Vừa</option>
                  <option value="Thấp">Thấp</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Form Giày</label>
                <select value={formData.shoe_form || 'Standard'} onChange={e => setFormData({...formData, shoe_form: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 focus:border-black outline-none text-sm font-bold text-black cursor-pointer">
                  <option value="Standard">Standard (Chuẩn)</option>
                  <option value="Slim">Slim (Ôm)</option>
                  <option value="Wide">Wide (Rộng)</option>
                </select>
              </div>

              <div className="col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Hình ảnh sản phẩm (Link mạng)
                  </label>
                  <button 
                    type="button" 
                    onClick={addImageUrlField} 
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-[11px] bg-blue-50 px-2 py-1 rounded"
                  >
                    <Plus size={14} strokeWidth={3} /> THÊM ẢNH
                  </button>
                </div>
                
                <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-2">
                  {(formData.image_urls || ['']).map((url, index) => (
                    <div key={index} className="flex gap-3 items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                      <span className="text-[10px] font-black text-gray-400 w-4 text-center">{index + 1}</span>
                      <input 
                        type="url" 
                        value={url || ''} 
                        onChange={e => handleImageUrlChange(index, e.target.value)} 
                        className="flex-1 bg-transparent p-2 border-b border-dashed border-gray-300 focus:border-black outline-none text-sm font-medium text-blue-600" 
                        placeholder="Dán link ảnh (https://...)" 
                      />
                      <button 
                        type="button" 
                        onClick={() => removeImageUrlField(index)} 
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa link này"
                      >
                        <Minus size={18} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-3 font-medium italic">* Ảnh đầu tiên (số 1) sẽ được dùng làm ảnh đại diện cho sản phẩm.</p>
              </div>

              <div className="col-span-2 flex justify-end mt-4 pt-6 border-t border-gray-100">
                <button type="submit" className="bg-black text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition shadow-lg active:scale-95">
                  {editingProduct ? 'Cập Nhật Thay Đổi' : 'Lưu Sản Phẩm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENT: QUẢN LÝ ĐƠN HÀNG (ORDERS)
// ==========================================
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); 

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/orders');
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchOrders(); 
    } catch (error) { alert('Lỗi cập nhật trạng thái'); }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-100 text-orange-600';
      case 'Processing': return 'bg-blue-100 text-blue-600';
      case 'Completed': return 'bg-green-100 text-green-600';
      case 'Cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="transition-opacity duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tight">Danh sách đơn hàng</h2>
        <button onClick={fetchOrders} className="p-2 hover:bg-gray-100 rounded-full transition"><Activity size={20}/></button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <th className="p-4 pl-6">Mã Đơn</th>
              <th className="p-4">Khách Hàng</th>
              <th className="p-4">Tổng Tiền</th>
              <th className="p-4">Ngày Đặt</th>
              <th className="p-4">Trạng Thái</th>
              <th className="p-4 pr-6 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {isLoading ? <tr><td colSpan="6" className="p-10 text-center text-gray-400">Đang tải...</td></tr> : 
              orders.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6 font-bold">#ORD-{order.id}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-black font-bold">{order.customer_name}</span>
                      <span className="text-xs text-gray-400">{order.customer_email}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-black">{Number(order.total_price).toLocaleString('vi-VN')}₫</td>
                  <td className="p-4 text-gray-500">{new Date(order.create_at).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4">
                    <select 
                      value={order.status} 
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-full border-none outline-none cursor-pointer ${getStatusStyle(order.status)}`}
                    >
                      <option value="Pending">Chờ xử lý</option>
                      <option value="Processing">Đang đóng gói</option>
                      <option value="Completed">Hoàn thành</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:underline font-bold text-xs uppercase tracking-tighter">Xem</button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl relative z-10 p-8 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-black uppercase">Chi tiết đơn #ORD-{selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)}><X size={24} /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Thông tin nhận hàng</p>
                <p className="font-bold text-black">{selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-600">{selectedOrder.phone}</p>
                <p className="text-sm text-gray-600">{selectedOrder.address}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng thanh toán</p>
                <p className="text-2xl font-black text-black">{Number(selectedOrder.total_price).toLocaleString('vi-VN')}₫</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Sản phẩm đã mua</p>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl">
                  <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-black">{item.product_name}</p>
                    <p className="text-xs text-gray-500 font-bold">Size: 42 | SL: {item.quantity}</p>
                  </div>
                  <div className="text-right font-bold text-sm">
                    {Number(item.price).toLocaleString('vi-VN')}₫
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENT: QUẢN LÝ KHÁCH HÀNG (USERS)
// ==========================================
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (window.confirm(`Bạn có chắc muốn đổi quyền người dùng này thành ${newRole.toUpperCase()}?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        });
        if (res.ok) fetchUsers();
      } catch (error) { alert('Lỗi cập nhật quyền'); }
    }
  };

  return (
    <div className="transition-opacity duration-300">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black uppercase tracking-tight">Quản lý thành viên</h2>
        <div className="text-sm font-bold text-gray-400">Tổng cộng: {users.length} người dùng</div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <th className="p-4 pl-6">Người dùng</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-center">BMI (H/W)</th>
              <th className="p-4">Ngày tham gia</th>
              <th className="p-4">Vai trò</th>
              <th className="p-4 pr-6 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm font-medium">
            {isLoading ? <tr><td colSpan="6" className="p-10 text-center text-gray-400">Đang tải...</td></tr> : 
              users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        {u.full_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-black font-bold">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4 text-center text-xs text-gray-400 font-bold">
                    {u.height}cm / {u.weight}kg
                  </td>
                  <td className="p-4 text-gray-400">{new Date(u.create_at).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button 
                      onClick={() => toggleRole(u.id, u.role)}
                      className="text-[11px] font-bold text-blue-600 hover:underline uppercase"
                    >
                      Đổi quyền
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}