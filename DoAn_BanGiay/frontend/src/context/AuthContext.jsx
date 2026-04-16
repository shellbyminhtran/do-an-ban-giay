// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Vừa vào web, kiểm tra xem trước đó có đăng nhập chưa
    useEffect(() => {
        const storedUser = localStorage.getItem("nike_user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // 1. HÀM ĐĂNG NHẬP (GỌI NODE.JS)
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                setUser(data.user); // Lưu vào React State
                localStorage.setItem("nike_user", JSON.stringify(data.user)); // Lưu vào Trình duyệt
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Không kết nối được máy chủ Backend!" };
        }
    };

    // 2. MỚI: HÀM ĐĂNG KÝ (GỌI NODE.JS)
    const register = async (full_name, email, password) => {
        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name, email, password })
            });
            const data = await response.json();

            if (response.ok) {
                // Đăng ký thành công thì tự động Đăng nhập luôn cho mượt!
                return await login(email, password);
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: "Không kết nối được máy chủ Backend!" };
        }
    };

    // 3. HÀM ĐĂNG XUẤT
    const logout = () => {
        setUser(null);
        localStorage.removeItem("nike_user");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);