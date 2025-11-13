var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');

// GET - Lấy danh sách tất cả users
router.get('/', userController.getAllUsers);

// GET - Lấy chi tiết một user theo ID
router.get('/:id', userController.getUserById);

// POST - Tạo user mới (đăng ký)
router.post('/', userController.createUser);
router.post('/login', userController.loginUser);
// PUT - Cập nhật user theo ID
router.put('/:id', userController.updateUser);

// DELETE - Xóa user theo ID
router.delete('/:id', userController.deleteUser);

module.exports = router;
