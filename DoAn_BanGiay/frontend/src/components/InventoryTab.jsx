// src/components/InventoryTab.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Image as ImageIcon, Minus } from 'lucide-react';

// Thư viện Word Editor (tương thích React 19)
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function InventoryTab() {
  const [subTab, setSubTab] = useState('campaign'); 

  // ==========================================
  // LOGIC TAB TỒN KHO
  // ==========================================
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ price: '', sale_price: '', stock: '', status: '' });

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (error) { console.error(error); }
    setIsLoading(false);
  };
  
  useEffect(() => { fetchInventory(); }, []);

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm({
      price: product.price || '',
      sale_price: product.sale_price || '',
      stock: product.stock !== undefined ? product.stock : 10,
      status: product.status || 'Active'
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}/inventory`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: editForm.price,
          sale_price: editForm.sale_price || null,
          stock: editForm.stock,
          status: editForm.status
        })
      });
      const data = await res.json();
      if (data.success) { 
        setEditingId(null); 
        fetchInventory(); 
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (error) { alert("Lỗi kết nối Server"); }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // ==========================================
  // LOGIC TAB CHIẾN DỊCH QUẢNG CÁO
  // ==========================================
  const [campaigns, setCampaigns] = useState([]);
  const [isCampModalOpen, setIsCampModalOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);

  const [prodSearch, setProdSearch] = useState('');
  const [prodCategory, setProdCategory] = useState('All');
  
  const [campForm, setCampForm] = useState({
    title: '', status: 'inactive', priority: 1, end_date: '', product_ids: [],
    media_items: [{ sourceType: 'link', type: 'image', url: '', rawFile: null }] 
  });

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/campaigns');
      const data = await res.json();
      if (data.success) setCampaigns(data.data);
    } catch (err) { console.error(err); }
  };
  
  useEffect(() => { if (subTab === 'campaign') fetchCampaigns(); }, [subTab]);

  const openCampModal = (camp = null) => {
    if (camp) {
      setEditingCamp(camp);
      let formattedDate = '';
      if (camp.end_date) {
        const d = new Date(camp.end_date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        formattedDate = d.toISOString().slice(0, 16);
      }
      const parsedMedia = (camp.media_items || []).map(m => ({ ...m, sourceType: 'link', rawFile: null }));
      setCampForm({ 
        ...camp, 
        title: camp.title ?? '',
        priority: camp.priority ?? 1,
        status: camp.status ?? 'inactive',
        end_date: formattedDate ?? '', 
        product_ids: camp.product_ids ?? [],
        media_items: parsedMedia.length ? parsedMedia : [{ sourceType: 'link', type: 'image', url: '', rawFile: null }] 
      });
    } else {
      setEditingCamp(null);
      setCampForm({ title: '', status: 'inactive', priority: 1, end_date: '', product_ids: [], media_items: [{ sourceType: 'link', type: 'image', url: '', rawFile: null }] });
    }
    setProdSearch(''); setProdCategory('All');
    setIsCampModalOpen(true);
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    setIsSavingCampaign(true);

    try {
      const processedMedia = await Promise.all(campForm.media_items.map(async (item) => {
        if (item.sourceType === 'link' && !item.url.trim()) return null;
        if (item.sourceType === 'file' && !item.rawFile) return null;

        if (item.sourceType === 'file' && item.rawFile) {
          const formData = new FormData();
          formData.append('file', item.rawFile);
          formData.append('priority', campForm.priority || 1);

          const uploadRes = await fetch('http://localhost:5000/api/upload-media', { method: 'POST', body: formData });
          const uploadData = await uploadRes.json();
          if (uploadData.success) {
            return { type: item.type, url: uploadData.url };
          } else {
            throw new Error("Lỗi upload file!");
          }
        }
        return { type: item.type, url: item.url };
      }));

      const cleanMedia = processedMedia.filter(item => item !== null);
      if (cleanMedia.length === 0) {
        setIsSavingCampaign(false);
        return alert("Vui lòng nhập ít nhất 1 đường link hoặc chọn 1 file hợp lệ!");
      }

      const payload = { ...campForm, media_items: cleanMedia };
      const url = editingCamp ? `http://localhost:5000/api/campaigns/${editingCamp.id}` : 'http://localhost:5000/api/campaigns';
      const method = editingCamp ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      
      if (data.success) {
        setIsCampModalOpen(false);
        fetchCampaigns();
      } else alert("Lỗi: " + data.error);
    } catch (err) {
      alert("Lỗi quá trình lưu: " + err.message);
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const toggleCampStatus = async (camp) => {
    const newStatus = camp.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`http://localhost:5000/api/campaigns/${camp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...camp, status: newStatus })
      });
      fetchCampaigns();
    } catch (err) { alert("Lỗi kết nối"); }
  };

  const deleteCampaign = async (id) => {
    if (window.confirm('Xóa vĩnh viễn chương trình này?')) {
      await fetch(`http://localhost:5000/api/campaigns/${id}`, { method: 'DELETE' });
      fetchCampaigns();
    }
  };

  const addMediaItem = () => setCampForm({ ...campForm, media_items: [...campForm.media_items, { sourceType: 'link', type: 'image', url: '', rawFile: null }] });
  const removeMediaItem = (idx) => setCampForm({ ...campForm, media_items: campForm.media_items.filter((_, i) => i !== idx) });
  const updateMediaItem = (idx, key, value) => {
    const newItems = [...campForm.media_items];
    newItems[idx][key] = value;
    if (key === 'sourceType') { 
      newItems[idx].url = '';
      newItems[idx].rawFile = null;
    }
    setCampForm({ ...campForm, media_items: newItems });
  };

  const toggleProductSelection = (productId) => {
    const currentIds = campForm.product_ids || [];
    if (currentIds.includes(productId)) {
      setCampForm({ ...campForm, product_ids: currentIds.filter(id => id !== productId) });
    } else {
      setCampForm({ ...campForm, product_ids: [...currentIds, productId] });
    }
  };

  const filteredModalProducts = products.filter(p => {
    const matchName = p.name.toLowerCase().includes(prodSearch.toLowerCase());
    const matchCat = prodCategory === 'All' || p.category === prodCategory;
    return matchName && matchCat;
  });

  return (
    <div className="transition-opacity duration-300 animate-modal-enter">
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Marketing & Kho</h2>
          <p className="text-gray-500 font-medium mt-1">Quản lý các chương trình khuyến mãi và số lượng sản phẩm.</p>
        </div>
        <div className="flex bg-white rounded-full p-1 border border-gray-200 w-max shadow-sm">
          <button onClick={() => setSubTab('inventory')} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${subTab === 'inventory' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}>Quản lý Giá & Tồn Kho</button>
          <button onClick={() => setSubTab('campaign')} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${subTab === 'campaign' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'}`}>Thiết kế Chiến dịch</button>
        </div>
      </div>

      {subTab === 'inventory' && (
        <div className="animate-fade-in">
          <div className="flex justify-end items-center mb-4">
            <div className="relative w-80">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Tìm tên giày..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white p-3 pl-12 rounded-xl border border-gray-200 focus:border-black outline-none font-medium shadow-sm" />
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Sản Phẩm</th>
                  <th className="p-4 w-32">Giá Gốc</th>
                  <th className="p-4 w-32">Giá Sale</th>
                  <th className="p-4 text-center w-24">Tồn Kho</th>
                  <th className="p-4 text-center w-32">Trạng Thái</th>
                  <th className="p-4 pr-6 text-right w-32">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-gray-700">
                {isLoading ? <tr><td colSpan="6" className="p-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr> : 
                  filteredProducts.map(p => {
                    const isEditing = editingId === p.id;
                    const isLowStock = !isEditing && (p.stock < 5);
                    const currentStock = p.stock !== undefined ? p.stock : 10;
                    return (
                      <tr key={p.id} className={`border-b border-gray-50 transition-colors ${isLowStock ? 'bg-red-50/30' : 'hover:bg-gray-50'}`}>
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                              {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-300 m-3" />}
                            </div>
                            <div>
                              <p className="font-bold text-black truncate w-48">{p.name}</p>
                              {isLowStock && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">⚠️ Sắp hết hàng</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {isEditing ? <input type="number" value={editForm.price ?? ''} onChange={e => setEditForm({...editForm, price: e.target.value})} className="w-full p-2 border border-black rounded-lg text-sm font-bold outline-none" /> : <span className={p.sale_price ? "line-through text-gray-400" : "font-bold"}>{Number(p.price).toLocaleString('vi-VN')}</span>}
                        </td>
                        <td className="p-4">
                          {isEditing ? <input type="number" placeholder="Trống=Ko Sale" value={editForm.sale_price ?? ''} onChange={e => setEditForm({...editForm, sale_price: e.target.value})} className="w-full p-2 border border-red-500 rounded-lg text-sm font-bold text-red-600 outline-none" /> : <span className="font-black text-red-600">{p.sale_price ? Number(p.sale_price).toLocaleString('vi-VN') : '-'}</span>}
                        </td>
                        <td className="p-4 text-center">
                          {isEditing ? <input type="number" value={editForm.stock ?? ''} 
                            onChange={e => {
                                const val = e.target.value;
                                setEditForm({
                                    ...editForm,
                                    stock: val === '' ? '' : Number(val)
                                });
                            }}
                            className="w-16 p-2 border border-black rounded-lg text-sm font-bold text-center outline-none mx-auto" /> : <span className={`font-black ${currentStock < 5 ? 'text-red-600 text-lg' : ''}`}>{currentStock}</span>}
                        </td>
                        <td className="p-4 text-center">
                          {isEditing ? (
                            <select value={editForm.status ?? 'Active'} onChange={e => setEditForm({...editForm, status: e.target.value})} className="p-2 border border-black rounded-lg text-xs font-bold outline-none cursor-pointer">
                              <option value="Active">Đang bán</option>
                              <option value="Inactive">Ngừng bán</option>
                            </select>
                          ) : (
                            <span className={`whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'Inactive' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {p.status === 'Inactive' ? 'Ngừng bán' : 'Đang bán'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleSaveEdit(p.id)} className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-gray-800 transition">Lưu</button>
                              <button onClick={() => setEditingId(null)} className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition">Hủy</button>
                            </div>
                          ) : (
                            <button onClick={() => handleEditClick(p)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase hover:underline transition">Thiết lập</button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'campaign' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onClick={() => openCampModal()} className="border-2 border-dashed border-gray-300 rounded-3xl min-h-[200px] flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-black hover:border-black transition-all cursor-pointer group shadow-sm bg-white">
              <div className="bg-gray-100 p-4 rounded-full group-hover:scale-110 transition-transform mb-3"><Plus size={32} /></div>
              <p className="font-bold uppercase tracking-widest text-xs">Thêm Chương Trình</p>
            </div>

            {campaigns.map(camp => {
              const isExpired = camp.end_date && new Date(camp.end_date) < new Date();
              const displayStatus = isExpired ? 'expired' : camp.status;
              return (
              <div key={camp.id} className={`bg-white rounded-3xl border transition-all shadow-sm overflow-hidden flex flex-col ${displayStatus === 'active' ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-100 opacity-80'}`}>
                <div className="h-32 bg-gray-100 relative">
                  {camp.media_items?.[0] && (
                    camp.media_items[0].type === 'video' ? <video src={camp.media_items[0].url} className="w-full h-full object-cover" /> : <img src={camp.media_items[0].url} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-3 left-4 text-white flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-400">Ưu tiên: {camp.priority}</span>
                    <span className={`w-max px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${displayStatus === 'active' ? 'bg-green-500' : displayStatus === 'expired' ? 'bg-red-500' : 'bg-gray-500'}`}>
                      {displayStatus === 'active' ? 'ĐANG CHẠY' : displayStatus === 'expired' ? 'ĐÃ HẾT HẠN' : 'ĐÃ TẮT'}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="mb-2 truncate max-h-12 overflow-hidden prose" dangerouslySetInnerHTML={{__html: camp.title}}></div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">{camp.product_ids?.length || 0} Sản phẩm • {camp.media_items?.length || 0} Media</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" disabled={isExpired} checked={camp.status === 'active' && !isExpired} onChange={() => toggleCampStatus(camp)} />
                      <div className={`w-11 h-6 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isExpired ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-200 peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:bg-green-500'}`}></div>
                    </label>
                    <div className="flex gap-2">
                      <button onClick={() => openCampModal(camp)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg flex items-center gap-2 text-xs font-bold uppercase"><Edit size={16}/> Sửa</button>
                      <button onClick={() => deleteCampaign(camp.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-2 text-xs font-bold uppercase"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {/* MODAL THÊM/SỬA CHIẾN DỊCH */}
      {isCampModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCampModalOpen(false)}></div>
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl relative z-10 overflow-y-auto max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-20">
              <h2 className="text-xl font-black uppercase tracking-tight">{editingCamp ? 'Sửa Chương Trình' : 'Tạo Chương Trình'}</h2>
              <button onClick={() => setIsCampModalOpen(false)}><X size={20} className="text-gray-500 hover:text-black" /></button>
            </div>

            <form onSubmit={handleSaveCampaign} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề (Thiết kế như Word)</label>
                  <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                    <ReactQuill 
                      theme="snow" 
                      value={campForm.title ?? ''} 
                      onChange={(val) => setCampForm({...campForm, title: val})} 
                      modules={quillModules}
                      style={{ height: '200px', paddingBottom: '40px' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Ưu Tiên (1 là ưu tiên nhất)</label>
                    <input 
                        type="number" min="1" 
                        value={campForm.priority ?? 1} 
                        onChange={e => {
                            const val = e.target.value;
                            setCampForm({
                                ...campForm,
                                priority: val === '' ? '' : parseInt(val)
                            });
                            }}
                        className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 outline-none focus:border-black font-bold" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Tự động kết thúc lúc</label>
                    <input type="datetime-local" value={campForm.end_date || ''} onChange={e => setCampForm({...campForm, end_date: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl border border-gray-200 outline-none focus:border-black font-bold text-sm text-gray-600" />
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Media Quảng Cáo</label>
                    <button type="button" onClick={addMediaItem} className="text-blue-600 font-bold text-[11px] flex items-center gap-1 hover:underline"><Plus size={14}/> THÊM</button>
                  </div>
                  <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2">
                    {campForm.media_items.map((item, idx) => (
                      <div key={idx} className="flex flex-wrap gap-2 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm shrink-0">
                        <select value={item.type || 'image'} onChange={e => updateMediaItem(idx, 'type', e.target.value)} className="p-2 border border-gray-200 outline-none font-bold text-xs bg-gray-50 rounded-lg cursor-pointer">
                          <option value="image">Ảnh</option>
                          <option value="video">Video</option>
                        </select>
                        <select value={item.sourceType || 'link'} onChange={e => updateMediaItem(idx, 'sourceType', e.target.value)} className="p-2 border border-gray-200 outline-none font-bold text-xs bg-gray-50 rounded-lg cursor-pointer text-blue-600">
                          <option value="link">Dùng Link (URL)</option>
                          <option value="file">Tải File lên</option>
                        </select>
                        
                        {item.sourceType === 'link' ? (
                          <input key="link" type="url" value={item.url ?? ''} onChange={e => updateMediaItem(idx, 'url', e.target.value)} placeholder="Nhập đường link mạng..." className="flex-1 min-w-[150px] p-2 outline-none text-sm font-medium border-b border-dashed border-gray-300" />
                        ) : (
                          // QUAN TRỌNG: Không truyền value vào thẻ input type="file" để tránh lỗi Uncontrolled component
                          <input key="file" type="file" accept={item.type === 'video' ? 'video/*' : 'image/*'} onChange={e => updateMediaItem(idx, 'rawFile', e.target.files[0])} className="flex-1 min-w-[150px] text-xs font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                        )}
                        <button type="button" onClick={() => removeMediaItem(idx)} className="p-2 text-red-400 hover:text-red-600 bg-red-50 rounded-lg ml-auto"><Minus size={16}/></button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-3 font-medium italic">* File tải lên sẽ tự động lưu vào folder: /Event/[Ưu tiên]/</p>
                </div>
              </div>

              <div className="flex flex-col h-full">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col h-full max-h-[600px]">
                  <div className="mb-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Gắn sản phẩm vào Sale ({campForm.product_ids?.length || 0} SP)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Tìm tên giày..." value={prodSearch ?? ''} onChange={e => setProdSearch(e.target.value)} className="w-full p-2.5 pl-9 rounded-lg border border-gray-200 text-sm outline-none focus:border-black" />
                      </div>
                      <select value={prodCategory ?? 'All'} onChange={e => setProdCategory(e.target.value)} className="p-2.5 rounded-lg border border-gray-200 text-sm font-bold outline-none cursor-pointer">
                        <option value="All">Tất cả danh mục</option>
                        <option value="Bóng rổ">Bóng rổ</option>
                        <option value="Chạy bộ">Chạy bộ</option>
                        <option value="Thời trang">Thời trang</option>
                        <option value="Bóng đá">Bóng đá</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-100 p-2 space-y-1">
                    {filteredModalProducts.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-10">Không tìm thấy sản phẩm phù hợp.</p>
                    ) : (
                      filteredModalProducts.map(p => (
                        <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-100">
                          <input type="checkbox" checked={(campForm.product_ids || []).includes(p.id)} onChange={() => toggleProductSelection(p.id)} className="w-4 h-4 accent-black cursor-pointer rounded" />
                          <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden shrink-0 border">
                            {p.image_url && <img src={p.image_url} className="w-full h-full object-cover"/>}
                          </div>
                          <div className="flex-1 truncate">
                            <p className="text-sm font-bold text-black truncate">{p.name}</p>
                            <p className="text-[10px] font-bold text-red-500">{p.sale_price ? `Giá Sale: ${Number(p.sale_price).toLocaleString()}₫` : '⚠️ Chưa cài giá Sale ở Kho'}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-full flex justify-end pt-4 border-t border-gray-100 gap-3">
                <button type="button" onClick={() => setIsCampModalOpen(false)} className="px-8 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-100 transition text-gray-500">Hủy bỏ</button>
                <button type="submit" disabled={isSavingCampaign} className="bg-black text-white px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-gray-800 shadow-lg active:scale-95 transition-transform disabled:opacity-50">
                  {isSavingCampaign ? 'Đang tải file & Lưu...' : 'Lưu Chương Trình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}