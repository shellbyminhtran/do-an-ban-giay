// authController.js
const { auth } = require('./firebaseConfig'); // Gọi đúng tên file của bạn
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// API ĐĂNG KÝ
const registerUser = async (req, res) => {
  try {
    // ÁO GIÁP 1: Bọc req.body lại, nếu Postman gửi lỗi thì tự hiểu là mảng rỗng {}
    const body = req.body || {};
    const { email, password } = body;

    // ÁO GIÁP 2: Báo lỗi thẳng ra Postman chứ không sập Server
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Thiếu Email hoặc Mật khẩu! (Vào Postman check xem đã chọn raw -> JSON chưa nhé)" 
      });
    }

    // Gọi Firebase tạo tài khoản
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    res.status(201).json({ 
      success: true, 
      message: "Đăng ký thành công!", 
      data: { uid: user.uid, email: user.email } 
    });

  } catch (error) {
    // ÁO GIÁP 3: Bắt mọi lỗi từ Firebase và in đỏ ra Terminal để dễ trị bệnh
    console.error("❌ Lỗi Đăng Ký:", error.message); 
    res.status(400).json({ success: false, message: error.message });
  }
};

// API ĐĂNG NHẬP
const loginUser = async (req, res) => {
  try {
    const body = req.body || {};
    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Thiếu Email hoặc Mật khẩu!" });
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    res.status(200).json({ 
      success: true, 
      message: "Đăng nhập thành công!", 
      token: user.accessToken,
      data: { uid: user.uid, email: user.email } 
    });

  } catch (error) {
    console.error("❌ Lỗi Đăng Nhập:", error.message);
    res.status(401).json({ success: false, message: "Sai email hoặc mật khẩu!" });
  }
};

module.exports = { registerUser, loginUser };