const { userModel } = require('../model/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/* ============================
   LẤY DS USERS
=============================== */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi lấy danh sách', error: error.message });
    }
};

/* ============================
   LẤY USER THEO ID
=============================== */
exports.getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi chi tiết user', error: error.message });
    }
};

/* ============================
   TẠO USER (CÓ HASH PASSWORD)
=============================== */
exports.createUser = async (req, res) => {
    try {
        const { username, password, role, name, phoneNumber, email } = req.body;

        const existing = await userModel.findOne({ username });
        if (existing) return res.status(400).json({ message: 'Username đã tồn tại!' });

        // Hash password trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            username,
            password: hashedPassword,
            role,
            name,
            phoneNumber,
            email,
            isActive: true
        });

        await newUser.save();

        const result = newUser.toObject();
        delete result.password;

        res.status(201).json({ success: true, message: 'Tạo user thành công', data: result });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi tạo user', error: error.message });
    }
};

/* ============================
   UPDATE USER (HASH PASSWORD)
=============================== */
exports.updateUser = async (req, res) => {
    try {
        const { name, phoneNumber, email, role, isActive, password } = req.body;

        const updateData = { name, phoneNumber, email, role, isActive };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy user' });

        res.status(200).json({ success: true, message: 'Cập nhật thành công', data: updatedUser });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật user', error: error.message });
    }
};

/* ============================
   XÓA USER
=============================== */
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await userModel.findByIdAndDelete(req.params.id).select('-password');
        if (!deletedUser) return res.status(404).json({ message: 'Không tìm thấy user' });

        res.status(200).json({ success: true, message: 'Xóa thành công', data: deletedUser });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xóa user', error: error.message });
    }
};

/* ============================
   LOGIN (SỬA: DÙNG username)
=============================== */
exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password)
            return res.status(400).json({ message: "Username và password là bắt buộc!" });

        const user = await userModel.findOne({ username });
        if (!user) return res.status(404).json({ message: "Không tìm thấy user!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu!" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret123",
            { expiresIn: "7d" }
        );

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(200).json({
            message: "Đăng nhập thành công!",
            user: safeUser,
            token
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
