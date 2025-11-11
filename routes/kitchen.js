const express = require('express');
const router = express.Router();
const kitchenController = require('../controllers/kitchen.controller');

// Lấy tất cả order đang chờ và đang chuẩn bị
router.get('/orders', kitchenController.getAllKitchenOrders);

// Lấy order theo trạng thái (pending, preparing, ready, served)
router.get('/orders/status/:status', kitchenController.getOrdersByStatus);

// Lấy chi tiết một order
router.get('/orders/:id', kitchenController.getKitchenOrderById);

// Bắt đầu chuẩn bị order (chuyển tất cả món sang preparing)
router.post('/orders/:orderId/start', kitchenController.startPreparing);

// Đánh dấu order hoàn thành (tất cả món ready)
router.post('/orders/:orderId/ready', kitchenController.markOrderReady);

// Cập nhật trạng thái một món trong order
router.patch('/orders/:orderId/items/:itemId/status', kitchenController.updateItemStatus);

// Cập nhật trạng thái tất cả món trong order
router.patch('/orders/:orderId/items/status', kitchenController.updateAllItemsStatus);

module.exports = router;
