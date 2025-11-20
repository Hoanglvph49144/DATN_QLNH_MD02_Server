// controllers/order.controller.js
const { orderModel } = require('../model/order.model');

/**
 * Order controller
 * - getAllOrders supports optional ?tableNumber= filter and populates items.menuItem (name, price, imageUrl).
 * - getOrderById populates items.menuItem and related fields.
 * - createOrder and updateOrder return populated order after save/update.
 *
 * Notes:
 * - For populate to include menu info, items[].menuItem must be a valid ObjectId referencing menuModel.
 * - If your menu model uses a different field name for image (e.g. "image" or "thumbnail"), include it in select.
 */

exports.getAllOrders = async (req, res) => {
  try {
    // Support optional tableNumber filter: /orders?tableNumber=1
    const filter = {};
    if (req.query && typeof req.query.tableNumber !== 'undefined' && req.query.tableNumber !== '') {
      const tn = Number(req.query.tableNumber);
      if (!isNaN(tn)) filter.tableNumber = tn;
      else filter.tableNumber = req.query.tableNumber;
    }

    const orders = await orderModel
      .find(filter)
      .populate('server', 'name username')
      .populate('cashier', 'name username')
      .populate({
        path: 'items.menuItem',
        select: 'name price imageUrl' // adjust if your menu model uses different image field names
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('getAllOrders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách orders',
      error: error.message
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id)
      .populate('server', 'name username')
      .populate('cashier', 'name username')
      .populate({
        path: 'items.menuItem',
        select: 'name price imageUrl'
      })
      .populate('mergedFrom')
      .populate('splitTo')
      .lean()
      .exec();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy order' });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('getOrderById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết order',
      error: error.message
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      tableNumber, server, cashier, items,
      totalAmount, discount, finalAmount,
      paymentMethod, orderStatus
    } = req.body;

    const safeItems = Array.isArray(items) ? items : [];

    const newOrder = new orderModel({
      tableNumber,
      server,
      cashier,
      items: safeItems,
      totalAmount,
      discount: discount || 0,
      finalAmount,
      paymentMethod,
      orderStatus: orderStatus || 'pending'
    });

    const saved = await newOrder.save();

    // Return populated order so client receives menu item details
    const populated = await orderModel.findById(saved._id)
      .populate('server', 'name username')
      .populate('cashier', 'name username')
      .populate({
        path: 'items.menuItem',
        select: 'name price imageUrl'
      })
      .lean()
      .exec();

    return res.status(201).json({
      success: true,
      message: 'Tạo order thành công',
      data: populated || saved
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo order',
      error: error.message
    });
  }
};

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

    if (orderStatus === 'paid' && paidAt) {
      updateData.paidAt = paidAt;
    }

    const updated = await orderModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).exec();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy order' });
    }

    const populated = await orderModel.findById(updated._id)
      .populate('server', 'name username')
      .populate('cashier', 'name username')
      .populate({
        path: 'items.menuItem',
        select: 'name price imageUrl'
      })
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật order thành công',
      data: populated || updated
    });
  } catch (error) {
    console.error('updateOrder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật order',
      error: error.message
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const deleted = await orderModel.findByIdAndDelete(req.params.id).exec();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy order' });
    }
    return res.status(200).json({ success: true, message: 'Xóa order thành công', data: deleted });
  } catch (error) {
    console.error('deleteOrder error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa order',
      error: error.message
    });
  }
};