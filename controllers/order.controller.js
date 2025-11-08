const {orderModel} = require('../model/order.model');

// Xem danh sách tất cả orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.find()
            .populate('server', 'name username')
            .populate('cashier', 'name username')
            .populate('items.menuItem', 'name price');
        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách orders',
            error: error.message
        });
    }
};

// Xem chi tiết một order theo ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id)
            .populate('server', 'name username')
            .populate('cashier', 'name username')
            .populate('items.menuItem', 'name price')
            .populate('mergedFrom')
            .populate('splitTo');
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

// Tạo order mới
exports.createOrder = async (req, res) => {
    try {
        const {
            tableNumber, server, cashier, items, 
            totalAmount, discount, finalAmount, 
            paymentMethod, orderStatus
        } = req.body;
        
        const newOrder = new orderModel({
            tableNumber,
            server,
            cashier,
            items,
            totalAmount,
            discount: discount || 0,
            finalAmount,
            paymentMethod,
            orderStatus: orderStatus || 'pending'
        });
        
        await newOrder.save();
        res.status(201).json({
            success: true,
            message: 'Tạo order thành công',
            data: newOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo order',
            error: error.message
        });
    }
};

// Cập nhật order theo ID
exports.updateOrder = async (req, res) => {
    try {
        const {
            tableNumber, items, totalAmount, discount, 
            finalAmount, paidAmount, change, 
            paymentMethod, orderStatus, paidAt
        } = req.body;
        
        const updateData = {
            tableNumber,
            items,
            totalAmount,
            discount,
            finalAmount,
            paidAmount,
            change,
            paymentMethod,
            orderStatus
        };
        
        // Nếu order được thanh toán, cập nhật thời gian thanh toán
        if (orderStatus === 'paid' && paidAt) {
            updateData.paidAt = paidAt;
        }
        
        const updatedOrder = await orderModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            {new: true, runValidators: true}
        );
        
        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy order'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Cập nhật order thành công',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật order',
            error: error.message
        });
    }
};

// Xóa order theo ID
exports.deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await orderModel.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy order'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Xóa order thành công',
            data: deletedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa order',
            error: error.message
        });
    }
};