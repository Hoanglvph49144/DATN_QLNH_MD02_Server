var express = require('express');
var router = express.Router();
const menuController = require('../controllers/menu.controller');

// GET - Lấy danh sách tất cả menu items
router.get('/', menuController.getAllMenuItems);

// GET - Lấy chi tiết một menu item theo ID
router.get('/:id', menuController.getMenuItemById);

// POST - Tạo menu item mới
router.post('/', menuController.createMenuItem);

// PUT - Cập nhật menu item theo ID
router.put('/:id', menuController.updateMenuItem);

// DELETE - Xóa menu item theo ID
router.delete('/:id', menuController.deleteMenuItem);

module.exports = router;
