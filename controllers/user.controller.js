const {userModel} = require('../model/user.model');

// Xem danh sách tất cả users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find().select('-password');
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách users',
            error: error.message
        });
    }
};

// Xem chi tiết một user theo ID
exports.getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết user',
            error: error.message
        });
    }
};

// Tạo user mới (đăng ký)
exports.createUser = async (req, res) => {
    try {
        const {username, password, role, name, phoneNumber, email, isActive} = req.body;
        
        // Kiểm tra username đã tồn tại chưa
        const existingUser = await userModel.findOne({username});
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username đã tồn tại'
            });
        }
        
        const newUser = new userModel({
            username,
            password, // Nên mã hóa password trước khi lưu (sử dụng bcrypt)
            role,
            name,
            phoneNumber,
            email,
            isActive: isActive !== undefined ? isActive : true
        });
        
        await newUser.save();
        
        // Không trả về password
        const userResponse = newUser.toObject();
        delete userResponse.password;
        
        res.status(201).json({
            success: true,
            message: 'Tạo user thành công',
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo user',
            error: error.message
        });
    }
};

// Cập nhật user theo ID
exports.updateUser = async (req, res) => {
    try {
        const {name, phoneNumber, email, role, isActive, password} = req.body;
        
        const updateData = {
            name,
            phoneNumber,
            email,
            role,
            isActive
        };
        
        // Nếu có cập nhật password, thêm vào updateData
        if (password) {
            updateData.password = password; // Nên mã hóa password trước khi lưu
        }
        
        const updatedUser = await userModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            {new: true, runValidators: true}
        ).select('-password');
        
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Cập nhật user thành công',
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật user',
            error: error.message
        });
    }
};

// Xóa user theo ID
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await userModel.findByIdAndDelete(req.params.id).select('-password');
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy user'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Xóa user thành công',
            data: deletedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa user',
            error: error.message
        });
    }
};