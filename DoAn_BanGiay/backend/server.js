// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config(); 
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const priority = req.body.priority || '1';
        const dir = path.join(__dirname, '../frontend/public/Event', String(priority));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// API upload hình ảnh cho chiến dịch
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        const priority = req.body.priority || '1';
        const fileUrl = `/Event/${priority}/${req.file.filename}`;
        res.json({ success: true, url: fileUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Lỗi upload file' });
    }
});

// 1. KẾT NỐI DATABASE
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'doan_bangiay'
}).promise(); 

// 2. TẠO API ĐĂNG KÝ (REGISTER)
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, full_name, height, weight } = req.body;

        const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email này đã được sử dụng!' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await db.query(
            'INSERT INTO users (full_name, email, password, height, weight) VALUES (?, ?, ?, ?, ?)',
            [full_name || 'Khách Hàng', email, hashedPassword, height || null, weight || null]
        );

        res.status(201).json({ message: 'Đăng ký thành công!', userId: result.insertId });
    } catch (error) {
        console.error("Lỗi Đăng Ký:", error);
        res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký.' });
    }
});

// 3. TẠO API ĐĂNG NHẬP (LOGIN)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query('SELECT id, email, full_name, role, password, height, weight FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Sai email hoặc mật khẩu!' });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Sai email hoặc mật khẩu!' });
        }

        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role, 
                height: user.height,
                weight: user.weight
            }
        });
    } catch (error) {
        console.error("Lỗi Đăng Nhập:", error);
        res.status(500).json({ success: false, error: 'Lỗi máy chủ khi đăng nhập.' });
    }
});

// 4. API CẬP NHẬT HỒ SƠ (UPDATE PROFILE)
app.post('/api/update-profile', async (req, res) => {
    try {
        const { email, name, phone, address, height, weight } = req.body;

        const [result] = await db.query(
            'UPDATE users SET full_name = ?, phone = ?, address = ?, height = ?, weight = ? WHERE email = ?',
            [name, phone, address, height || null, weight || null, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng này trong hệ thống.' });
        }

        res.json({ success: true, message: 'Đã cập nhật thông tin thành công!' });
    } catch (error) {
        console.error("Lỗi Cập Nhật Hồ Sơ:", error);
        res.status(500).json({ error: 'Lỗi máy chủ khi lưu hồ sơ.' });
    }
});

// ==========================================
// API QUẢN LÝ KHO GIÀY
// ==========================================
app.get('/api/products', async (req, res) => {
    try {
        // ĐÃ SỬA: Thêm câu lệnh JOIN để tính toán số lượng giày đã bán (sold_quantity)
        const query = `
            SELECT p.*, 
                   COALESCE(SUM(od.quantity), 0) AS sold_quantity 
            FROM products p
            LEFT JOIN order_details od ON p.id = od.product_id
            LEFT JOIN orders o ON od.order_id = o.id AND o.status = 'Completed'
            GROUP BY p.id
            ORDER BY p.id DESC
        `;
        const [results] = await db.query(query);
        const data = results.map(row => ({
            ...row,
            image_urls: row.image_urls ? JSON.parse(row.image_urls) : (row.image_url ? [row.image_url] : [])
        }));
        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, price, image_url, image_urls, category, cushion_level, shoe_form, description } = req.body;
        const imgJson = JSON.stringify(image_urls || []);
        
        await db.query(
            'INSERT INTO products (name, price, image_url, image_urls, category, cushion_level, shoe_form, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, price, image_url, imgJson, category, cushion_level, shoe_form, description]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, image_url, image_urls, category, cushion_level, shoe_form, description } = req.body;
        const imgJson = JSON.stringify(image_urls || []);

        await db.query(
            'UPDATE products SET name=?, price=?, image_url=?, image_urls=?, category=?, cushion_level=?, shoe_form=?, description=? WHERE id=?',
            [name, price, image_url, imgJson, category, cushion_level, shoe_form, description, id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM products WHERE id=?', [id]);
        res.json({ success: true, message: 'Xóa giày thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// API CHATBOT AI (SỬ DỤNG GEMINI)
// ==========================================
app.post('/api/chat', async (req, res) => {
    try {
        const { message, height, weight } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Chưa cấu hình GEMINI_API_KEY trong file .env!");
        }

        let productListStr = "";
        try {
            const [products] = await db.query('SELECT name, description, cushion_level FROM products');
            productListStr = products.map(p => `- ${p.name}: ${p.description}`).join('\n');
        } catch (sqlError) {
            throw new Error(`Lỗi SQL Database: ${sqlError.message}`);
        }

        const customerContext = `Khách hàng cao ${height}cm, nặng ${weight}kg. `;
        
        const prompt = `
            Bạn là trợ lý ảo chuyên gia về giày Nike.
            Thông tin khách hàng: ${customerContext}
            Danh sách sản phẩm có trong kho:
            ${productListStr}

            Dựa trên thông số cơ thể và danh sách giày trên, hãy tư vấn cho khách hàng. 
            Nếu nhắc đến tên giày, bắt buộc viết định dạng **Tên Giày** (ví dụ: **Nike Pegasus Premium**).
            Câu hỏi: ${message}
        `;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error("❌ LỖI CHAT AI CHI TIẾT:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// API QUẢN LÝ ĐƠN HÀNG (DÀNH CHO ADMIN & USER)
// ==========================================
app.get('/api/admin/orders', async (req, res) => {
    try {
        const [orders] = await db.query(`
            SELECT o.*, u.full_name as customer_name, u.email as customer_email, u.phone, u.address
            FROM orders o
            JOIN users u ON o.user_id = u.id
            ORDER BY o.create_at DESC
        `);

        const fullOrders = await Promise.all(orders.map(async (order) => {
            const [details] = await db.query(`
                SELECT od.*, p.name as product_name, p.image_url
                FROM order_details od
                JOIN products p ON od.product_id = p.id
                WHERE od.order_id = ?
            `, [order.id]);
            return { ...order, items: details };
        }));

        res.json({ success: true, data: fullOrders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    const { user_id, total_price, items } = req.body;

    if (!user_id || !items || items.length === 0) {
        return res.status(400).json({ success: false, error: "Dữ liệu đơn hàng không hợp lệ!" });
    }

    try {
        await db.query('START TRANSACTION');

        const [orderResult] = await db.query(
            'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)',
            [user_id, total_price, 'Pending']
        );
        const orderId = orderResult.insertId;

        for (const item of items) {
            await db.query(
                'INSERT INTO order_details (order_id, product_id, quantity, size, price) VALUES (?, ?, ?, ?, ?)',
                [
                    orderId, 
                    item.id, 
                    item.quantity, 
                    item.size || '42', 
                    item.price
                ]
            );
        }

        await db.query('COMMIT');
        return res.json({ success: true, message: 'Đặt hàng thành công!', orderId });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error("Lỗi SQL tại /api/orders:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// API QUẢN LÝ NGƯỜI DÙNG (ADMIN)
// ==========================================
app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, full_name, email, role, height, weight, create_at FROM users ORDER BY create_at DESC');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; 
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ success: true, message: 'Cập nhật quyền thành công' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/my-orders/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY create_at DESC', 
            [userId]
        );
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error("Lỗi lấy đơn hàng của user:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/products/:id/inventory', async (req, res) => {
    try {
        const { id } = req.params;
        const { price, sale_price, stock, status } = req.body;
        
        await db.query(
            'UPDATE products SET price=?, sale_price=?, stock=?, status=? WHERE id=?',
            [price, sale_price || null, stock, status, id]
        );
        res.json({ success: true, message: 'Cập nhật kho thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==========================================
// API QUẢN LÝ CHIẾN DỊCH (CAMPAIGNS)
// ==========================================

app.get('/api/campaigns', async (req, res) => {
    try {
        const [campaigns] = await db.query('SELECT * FROM campaigns ORDER BY priority ASC, id DESC');
        const data = campaigns.map(c => ({
            ...c,
            media_items: c.media_items ? JSON.parse(c.media_items) : [],
            product_ids: c.product_ids ? JSON.parse(c.product_ids) : []
        }));
        res.json({ success: true, data: data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/campaigns', async (req, res) => {
    try {
        const { title, media_items, status, priority, end_date, product_ids } = req.body;
        const mediaJson = JSON.stringify(media_items || []);
        const productsJson = JSON.stringify(product_ids || []);
        const finalEndDate = end_date ? end_date : null; 
        
        await db.query(
            'INSERT INTO campaigns (title, media_items, status, priority, end_date, product_ids) VALUES (?, ?, ?, ?, ?, ?)',
            [title, mediaJson, status, priority || 1, finalEndDate, productsJson]
        );
        res.json({ success: true, message: 'Tạo chiến dịch thành công' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/campaigns/:id', async (req, res) => {
    try {
        const { title, media_items, status, priority, end_date, product_ids } = req.body;
        const mediaJson = JSON.stringify(media_items || []);
        const productsJson = JSON.stringify(product_ids || []);
        const finalEndDate = end_date ? end_date : null;
        
        await db.query(
            'UPDATE campaigns SET title=?, media_items=?, status=?, priority=?, end_date=?, product_ids=? WHERE id=?',
            [title, mediaJson, status, priority || 1, finalEndDate, productsJson, req.params.id]
        );
        res.json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/campaigns/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM campaigns WHERE id=?', [req.params.id]);
        res.json({ success: true, message: 'Đã xóa chiến dịch' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/banner-defaults', (req, res) => {
    const dirPath = path.join(__dirname, '../frontend/public/Banner');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    try {
        const files = fs.readdirSync(dirPath);
        const mediaFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.webp', '.mp4', '.webm'].includes(ext);
        }).map(file => ({
            type: file.endsWith('.mp4') || file.endsWith('.webm') ? 'video' : 'image',
            url: `/Banner/${file}` 
        }));
        res.json({ success: true, data: mediaFiles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Lấy toàn bộ đánh giá của 1 sản phẩm cụ thể
app.get('/api/products/:id/reviews', (req, res) => {
    const productId = req.params.id;
    db.query('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [productId], (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json({ success: true, data: results });
    });
});

// Gửi đánh giá mới
app.post('/api/products/:id/reviews', (req, res) => {
    const productId = req.params.id;
    const { name, rating, comment } = req.body;
    db.query('INSERT INTO reviews (product_id, customer_name, rating, comment) VALUES (?, ?, ?, ?)', 
    [productId, name, rating, comment], (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json({ success: true, message: "Đánh giá thành công!" });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang chạy tại cổng ${PORT}`);
});