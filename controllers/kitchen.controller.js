const {orderModel} = require('../model/order.model');

// Lấy tất cả order đang chờ và đang chuẩn bị (cho bếp)
exports.getAllKitchenOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({
            orderStatus: {$in: ['pending', 'preparing']}
        })
        .populate('items.menuItem')
        .populate('server', 'name')
        .sort({createdAt: 1});

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách order',
            error: error.message
        });
    }
};

// Lấy chi tiết một order (cho bếp)
exports.getKitchenOrderById = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id)
            .populate('items.menuItem')
            .populate('server', 'name');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy order'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết order',
            error: error.message
        });
    }
};

// Cập nhật trạng thái món ăn trong order
exports.updateItemStatus = async (req, res) => {
    try {
        const {orderId, itemId} = req.params;
        const {status} = req.body;

        // Validate status
        const validStatuses = ['pending', 'preparing', 'ready', 'soldout'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy order'
            });
        }

        // Tìm và cập nhật trạng thái món
        const item = order.items.id(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy món trong order'
            });
        }

        item.status = status;
        await order.save();

        // Cập nhật trạng thái order tổng thể
        await updateOrderStatus(order);

        const updatedOrder = await orderModel.findById(orderId)
            .populate('items.menuItem')
            .populate('server', 'name');

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái món thành công',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái món',
            error: error.message
        });
    }
};

// Cập nhật trạng thái tất cả món trong order
exports.updateAllItemsStatus = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {status} = req.body;

        const validStatuses = ['pending', 'preparing', 'ready', 'soldout'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy order'
            });
        }

        // Cập nhật tất cả món
        order.items.forEach(item => {
            item.status = status;
        });

        await order.save();
        await updateOrderStatus(order);

        const updatedOrder = await orderModel.findById(orderId)
            .populate('items.menuItem')
            .populate('server', 'name');

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái tất cả món thành công',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật trạng thái',
            error: error.message
        });
    }
};

// Bắt đầu chuẩn bị order (chuyển tất cả món sang preparing)
exports.startPreparing = async (req, res) => {
    try {
        const {orderId} = req.params;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy order'
            });
        }

        // Chuyển tất cả món sang preparing
        order.items.forEach(item => {
            if (item.status === 'pending') {
                item.status = 'preparing';
            }
        });

        order.orderStatus = 'preparing';
        await order.save();

        const updatedOrder = await orderModel.findById(orderId)
            .populate('items.menuItem')
            .populate('server', 'name');

        res.status(200).json({
            success: true,
            message: 'Đã bắt đầu chuẩn bị order',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi bắt đầu chuẩn bị',
            error: error.message
        });
    }
};

// Đánh dấu order hoàn thành (tất cả món ready)
exports.markOrderReady = async (req, res) => {
    try {
        const {orderId} = req.params;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy order'
            });
        }

        // Chuyển tất cả món sang ready
        order.items.forEach(item => {
            item.status = 'ready';
        });

        order.orderStatus = 'ready';
        await order.save();

        const updatedOrder = await orderModel.findById(orderId)
            .populate('items.menuItem')
            .populate('server', 'name');

        res.status(200).json({
            success: true,
            message: 'Order đã sẵn sàng phục vụ',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi đánh dấu order sẵn sàng',
            error: error.message
        });
    }
};

// Lấy danh sách order theo trạng thái
exports.getOrdersByStatus = async (req, res) => {
    try {
        const {status} = req.params;
        
        const orders = await orderModel.find({orderStatus: status})
            .populate('items.menuItem')
            .populate('server', 'name')
            .sort({createdAt: 1});

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách order',
            error: error.message
        });
    }
};

// Helper function: Tự động cập nhật trạng thái order dựa trên trạng thái món
async function updateOrderStatus(order) {
    const allServed = order.items.every(item => item.status === 'soldout');
    const allReady = order.items.every(item => item.status === 'ready' || item.status === 'soldout');
    const anyPreparing = order.items.some(item => item.status === 'preparing');
    const allPending = order.items.every(item => item.status === 'pending');

    if (allServed) {
        order.orderStatus = 'soldout';
    } else if (allReady) {
        order.orderStatus = 'ready';
    } else if (anyPreparing) {
        order.orderStatus = 'preparing';
    } else if (allPending) {
        order.orderStatus = 'pending';
    }

    await order.save();
}
