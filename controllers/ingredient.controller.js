const { ingredientModel } = require('../model/ingredient.model');

// 1. Xem danh sách tất cả nguyên liệu (Kho)
exports.getAllIngredients = async (req, res) => {
    try {
        // Có thể sort theo createdAt để thấy cái mới nhất, hoặc theo quantity để thấy cái sắp hết
        const ingredients = await ingredientModel.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: ingredients.length,
            data: ingredients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách nguyên liệu',
            error: error.message
        });
    }
};

// 2. Xem chi tiết một nguyên liệu theo ID
exports.getIngredientById = async (req, res) => {
    try {
        const ingredient = await ingredientModel.findById(req.params.id);
        
        if (!ingredient) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nguyên liệu'
            });
        }
        
        res.status(200).json({
            success: true,
            data: ingredient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết nguyên liệu',
            error: error.message
        });
    }
};

// 3. Thêm nguyên liệu mới vào kho
exports.createIngredient = async (req, res) => {
    try {
        const { name, unit, quantity, minThreshold, importPrice, supplier } = req.body;
        
        // Kiểm tra xem nguyên liệu đã tồn tại chưa (tuỳ chọn)
        const existingIngredient = await ingredientModel.findOne({ name });
        if (existingIngredient) {
            return res.status(400).json({
                success: false,
                message: 'Nguyên liệu này đã tồn tại trong kho'
            });
        }

        const newIngredient = new ingredientModel({
            name,
            unit,
            quantity: quantity || 0,
            minThreshold: minThreshold || 5, // Mặc định cảnh báo khi dưới 5
            importPrice: importPrice || 0,
            supplier
            // status sẽ tự động được tính toán trong model pre-save middleware
        });

        await newIngredient.save();

        res.status(201).json({
            success: true,
            message: 'Thêm nguyên liệu thành công',
            data: newIngredient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm nguyên liệu',
            error: error.message
        });
    }
};

// 4. Sửa nguyên liệu (Cập nhật số lượng, giá nhập, thông tin...)
exports.updateIngredient = async (req, res) => {
    try {
        const { name, unit, quantity, minThreshold, importPrice, supplier } = req.body;
        
        // Logic cập nhật status dựa trên quantity mới (nếu bạn không dùng middleware pre-save)
        let status = 'available';
        if (quantity !== undefined) {
             if (quantity <= 0) status = 'out_of_stock';
             else if (minThreshold && quantity <= minThreshold) status = 'low_stock';
             else if (!minThreshold && quantity <= 5) status = 'low_stock'; // fallback nếu không gửi minThreshold
        }

        const updatedIngredient = await ingredientModel.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                unit, 
                quantity, 
                minThreshold, 
                importPrice, 
                supplier,
                status // Cập nhật lại status luôn cho đồng bộ
            },
            { new: true, runValidators: true }
        );

        if (!updatedIngredient) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nguyên liệu'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật nguyên liệu thành công',
            data: updatedIngredient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật nguyên liệu',
            error: error.message
        });
    }
};

// 5. Xóa nguyên liệu
exports.deleteIngredient = async (req, res) => {
    try {
        const deletedIngredient = await ingredientModel.findByIdAndDelete(req.params.id);
        
        if (!deletedIngredient) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy nguyên liệu'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa nguyên liệu thành công',
            data: deletedIngredient
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa nguyên liệu',
            error: error.message
        });
    }
};