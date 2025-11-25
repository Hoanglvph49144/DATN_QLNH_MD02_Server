const {tableModel} = require('../model/table.model');

// Lấy danh sách tất cả các bàn
exports.getAllTables = async (req, res) => {
    try {
        const tables = await tableModel.find();
        res.status(200).json({
            success: true,
            data: tables
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách bàn',
            error: error.message
        });
    }
};

// Lấy chi tiết một bàn theo ID
exports.getTableById = async (req, res) => {
    try {
        const table = await tableModel.findById(req.params.id);
        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }
        res.status(200).json({
            success: true,
            data: table
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết bàn',
            error: error.message
        });
    }
};

// Lấy danh sách bàn theo trạng thái
exports.getTablesByStatus = async (req, res) => {
    try {
        const {status} = req.params;
        const tables = await tableModel.find({status});
        res.status(200).json({
            success: true,
            data: tables
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách bàn theo trạng thái',
            error: error.message
        });
    }
};

// Thêm bàn mới
exports.createTable = async (req, res) => {
    try {
        const {tableNumber, capacity, location, status} = req.body;
        const newTable = new tableModel({
            tableNumber,
            capacity,
            location,
            status: status || 'available'
        });
        await newTable.save();
        res.status(201).json({
            success: true,
            message: 'Thêm bàn thành công',
            data: newTable
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm bàn',
            error: error.message
        });
    }
};

// Cập nhật thông tin bàn
exports.updateTable = async (req, res) => {
    try {
        const {tableNumber, capacity, location, status, currentOrder} = req.body;
        const updatedTable = await tableModel.findByIdAndUpdate(
            req.params.id,
            {tableNumber, capacity, location, status, currentOrder},
            {new: true, runValidators: true}
        );
        if (!updatedTable) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cập nhật bàn thành công',
            data: updatedTable
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật bàn',
            error: error.message
        });
    }
};

// Cập nhật trạng thái bàn
exports.updateTableStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const updatedTable = await Table.findByIdAndUpdate(
            req.params.id,
            { status, currentOrder: null, updatedAt: Date.now() },
            { new: true }
        );
        if (!updatedTable) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy bàn"
            });
        }
        res.status(200).json({
            success: true,
            message: "Cập nhật trạng thái bàn thành công",
            data: updatedTable
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi cập nhật trạng thái bàn",
            error: error.message
        });
    }
};

// Xóa bàn
exports.deleteTable = async (req, res) => {
    try {
        const deletedTable = await tableModel.findByIdAndDelete(req.params.id);
        if (!deletedTable) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bàn'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Xóa bàn thành công',
            data: deletedTable
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa bàn',
            error: error.message
        });
    }
};
