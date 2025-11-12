const {orderModel} = require('../model/order.model');
const {tableModel} = require('../model/table.model');

// Lấy tất cả hóa đơn (orders)
exports.getAllInvoices = async (req, res) => {
    try {
        const orders = await orderModel.find()
            .populate('items.menuItem')
            .populate('server', 'name')
            .populate('cashier', 'name')
            .sort({createdAt: -1});

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách hóa đơn',
            error: error.message
        });
    }
};

// Lấy hóa đơn theo trạng thái thanh toán
exports.getInvoicesByStatus = async (req, res) => {
    try {
        const {status} = req.params; // pending, paid, cancelled
        
        const orders = await orderModel.find({orderStatus: status})
            .populate('items.menuItem')
            .populate('server', 'name')
            .populate('cashier', 'name')
            .sort({createdAt: -1});

        res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách hóa đơn',
            error: error.message
        });
    }
};

// Lấy chi tiết một hóa đơn
exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await orderModel.findById(req.params.id)
            .populate('items.menuItem')
            .populate('server', 'name')
            .populate('cashier', 'name');
        
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết hóa đơn',
            error: error.message
        });
    }
};

// Lấy hóa đơn theo số bàn
exports.getInvoiceByTable = async (req, res) => {
    try {
        const {tableNumber} = req.params;
        
        const invoice = await orderModel.findOne({
            tableNumber: parseInt(tableNumber),
            orderStatus: {$in: ['pending', 'preparing', 'ready', 'served']}
        })
        .populate('items.menuItem')
        .populate('server', 'name')
        .populate('cashier', 'name');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn cho bàn này'
            });
        }

        res.status(200).json({
            success: true,
            data: invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy hóa đơn',
            error: error.message
        });
    }
};

// Tính tổng tiền hóa đơn (có thể áp dụng giảm giá)
exports.calculateTotal = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {discount} = req.body; // Giảm giá (%)

        const order = await orderModel.findById(orderId)
            .populate('items.menuItem');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        // Tính tổng tiền
        let totalAmount = 0;
        order.items.forEach(item => {
            totalAmount += item.price * item.quantity;
        });

        // Áp dụng giảm giá
        const discountAmount = discount ? (totalAmount * discount / 100) : 0;
        const finalAmount = totalAmount - discountAmount;

        // Cập nhật order
        order.totalAmount = totalAmount;
        order.discount = discount || 0;
        order.finalAmount = finalAmount;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Tính toán thành công',
            data: {
                totalAmount,
                discount: discount || 0,
                discountAmount,
                finalAmount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tính tổng tiền',
            error: error.message
        });
    }
};

// Thanh toán hóa đơn
exports.processPayment = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {paymentMethod, paidAmount, cashierId} = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        // Validate số tiền
        if (paidAmount < order.finalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Số tiền thanh toán không đủ'
            });
        }

        // Tính tiền thừa
        const change = paidAmount - order.finalAmount;

        // Cập nhật thông tin thanh toán
        order.paymentMethod = paymentMethod;
        order.paidAmount = paidAmount;
        order.change = change;
        order.orderStatus = 'paid';
        order.paidAt = new Date();
        if (cashierId) {
            order.cashier = cashierId;
        }

        await order.save();

        // Cập nhật trạng thái bàn về available
        await tableModel.findOneAndUpdate(
            {tableNumber: order.tableNumber},
            {status: 'available', currentOrder: null}
        );

        const updatedOrder = await orderModel.findById(orderId)
            .populate('items.menuItem')
            .populate('server', 'name')
            .populate('cashier', 'name');

        res.status(200).json({
            success: true,
            message: 'Thanh toán thành công',
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thanh toán',
            error: error.message
        });
    }
};

// In hóa đơn (trả về dữ liệu để in)
exports.printInvoice = async (req, res) => {
    try {
        const {orderId} = req.params;

        const order = await orderModel.findById(orderId)
            .populate('items.menuItem')
            .populate('server', 'name')
            .populate('cashier', 'name');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        // Format dữ liệu để in
        const invoiceData = {
            invoiceNumber: order._id.toString().slice(-8).toUpperCase(),
            date: order.createdAt,
            paidAt: order.paidAt,
            tableNumber: order.tableNumber,
            server: order.server ? order.server.name : 'N/A',
            cashier: order.cashier ? order.cashier.name : 'N/A',
            items: order.items.map(item => ({
                name: item.menuItem ? item.menuItem.name : 'N/A',
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            })),
            totalAmount: order.totalAmount,
            discount: order.discount,
            discountAmount: order.totalAmount * order.discount / 100,
            finalAmount: order.finalAmount,
            paymentMethod: order.paymentMethod,
            paidAmount: order.paidAmount,
            change: order.change
        };

        res.status(200).json({
            success: true,
            data: invoiceData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin in hóa đơn',
            error: error.message
        });
    }
};

// Hủy hóa đơn
exports.cancelInvoice = async (req, res) => {
    try {
        const {orderId} = req.params;
        const {reason} = req.body;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy hóa đơn'
            });
        }

        if (order.orderStatus === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy hóa đơn đã thanh toán'
            });
        }

        order.orderStatus = 'cancelled';
        order.cancelReason = reason;
        order.cancelledAt = new Date();
        await order.save();

        // Cập nhật trạng thái bàn
        await tableModel.findOneAndUpdate(
            {tableNumber: order.tableNumber},
            {status: 'available', currentOrder: null}
        );

        res.status(200).json({
            success: true,
            message: 'Đã hủy hóa đơn',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi hủy hóa đơn',
            error: error.message
        });
    }
};

// Thống kê doanh thu theo ngày
exports.getDailySales = async (req, res) => {
    try {
        const {date} = req.query; // Format: YYYY-MM-DD
        
        const startDate = date ? new Date(date) : new Date();
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        const orders = await orderModel.find({
            orderStatus: 'paid',
            paidAt: {
                $gte: startDate,
                $lte: endDate
            }
        });

        const totalSales = orders.reduce((sum, order) => sum + order.finalAmount, 0);
        const totalOrders = orders.length;

        res.status(200).json({
            success: true,
            data: {
                date: startDate,
                totalOrders,
                totalSales,
                orders
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê',
            error: error.message
        });
    }
};
