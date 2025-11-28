// routes/ingredients.js
const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredient.controller');

// GET - Lấy danh sách tất cả nguyên liệu (có thể filter theo status, tag)
// Example: /ingredients?status=low_stock&tag=thit
router.get('/', ingredientController.getAllIngredients);

// GET - Lấy danh sách nguyên liệu cảnh báo (hết hoặc sắp hết)
router.get('/warnings', ingredientController.getWarningIngredients);

// GET - Lấy chi tiết một nguyên liệu theo ID
router.get('/:id', ingredientController.getIngredientById);

// POST - Tạo nguyên liệu mới (Admin)
router.post('/', ingredientController.createIngredient);

// POST - Bếp lấy nguyên liệu (trừ số lượng)
router.post('/:id/take', ingredientController.takeIngredient);

// POST - Nhập thêm nguyên liệu (Admin)
router.post('/:id/restock', ingredientController.restockIngredient);

// PUT - Cập nhật thông tin nguyên liệu (Admin)
router.put('/:id', ingredientController.updateIngredient);

// DELETE - Xóa nguyên liệu (Admin)
router.delete('/:id', ingredientController.deleteIngredient);

module.exports = router;
