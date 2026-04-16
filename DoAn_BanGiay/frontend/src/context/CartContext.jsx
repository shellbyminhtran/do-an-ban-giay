import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); // Lấy thông tin user từ AuthContext
  const cartKey = user ? `nike_cart_${user.email}` : 'nike_cart_guest';

  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const saveCart = localStorage.getItem(cartKey);
    setCartItems(saveCart ? JSON.parse(saveCart) : []);  
  }, [cartKey]);

  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cartItems));
  }, [cartItems, cartKey]);
  
  const addToCart = (product) => {
    // Tạm thời fix cứng size 42 nếu product truyền vào chưa có size
    const productSize = product.size || "42"; 
    
    setCartItems(prev => {
      // ĐÃ SỬA: Kiểm tra trùng cả ID VÀ SIZE
      const existingItem = prev.find(item => item.id === product.id && item.size === productSize);
      
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id && item.size === productSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, size: productSize, quantity: 1 }];
    });
  };

  // ĐÃ SỬA: Nhận thêm tham số size
  const updateQuantity = (id, size, delta) => {
    setCartItems(prev => prev.map(item => {
      // ĐÃ SỬA: Chỉ update đúng đôi giày có cùng id và cùng size
      if (item.id === id && item.size === size) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  // ĐÃ SỬA: Nhận thêm tham số size
  const removeItem = (id, size) => {
    // Lọc ra và giữ lại những item KHÔNG trùng cả id lẫn size
    setCartItems(prev => prev.filter(item => !(item.id === id && item.size === size)));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeItem, totalAmount, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};