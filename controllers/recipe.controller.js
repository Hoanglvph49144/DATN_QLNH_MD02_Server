const { recipeModel } = require('../model/recipe.model');
const { menuModel } = require('../model/menu.model');
const { ingredientModel } = require('../model/ingredient.model');

// Lấy tất cả công thức
exports.getAllRecipes = async (req, res) => {
    try {
        const { status, category, difficulty, menuItemId } = req.query;
        let filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;
        if (menuItemId) filter.menuItemId = menuItemId;

        const recipes = await recipeModel
            .find(filter)
            .populate('menuItemId', 'name price category image')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: recipes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách công thức',
            error: error.message
        });
    }
};

// Lấy công thức theo ID
exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await recipeModel
            .findById(req.params.id)
            .populate('menuItemId', 'name price category image')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công thức'
            });
        }

        res.status(200).json({
            success: true,
            data: recipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy chi tiết công thức',
            error: error.message
        });
    }
};

// Lấy công thức theo menu item ID
exports.getRecipeByMenuItemId = async (req, res) => {
    try {
        const recipe = await recipeModel
            .findOne({ menuItemId: req.params.menuItemId })
            .populate('menuItemId', 'name price category image')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công thức cho món ăn này'
            });
        }

        res.status(200).json({
            success: true,
            data: recipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy công thức',
            error: error.message
        });
    }
};

// Tạo công thức mới
exports.createRecipe = async (req, res) => {
    try {
        const {
            menuItemId,
            menuItemName,
            ingredients,
            instructions,
            preparationTime,
            cookingTime,
            servings,
            difficulty,
            notes,
            tips,
            category,
            tags,
            image,
            video,
            status,
            createdBy
        } = req.body;

        // Kiểm tra menu item có tồn tại không
        const menuItem = await menuModel.findById(menuItemId);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy món ăn'
            });
        }

        // Kiểm tra các nguyên liệu có tồn tại không
        if (ingredients && ingredients.length > 0) {
            for (const ing of ingredients) {
                const ingredient = await ingredientModel.findById(ing.ingredientId);
                if (!ingredient) {
                    return res.status(404).json({
                        success: false,
                        message: `Không tìm thấy nguyên liệu: ${ing.ingredientName}`
                    });
                }
            }
        }

        const newRecipe = new recipeModel({
            menuItemId,
            menuItemName: menuItemName || menuItem.name,
            ingredients,
            instructions,
            preparationTime,
            cookingTime,
            servings,
            difficulty,
            notes,
            tips,
            category: category || menuItem.category,
            tags,
            image: image || menuItem.image,
            video,
            status: status || 'active',
            createdBy
        });

        await newRecipe.save();

        const populatedRecipe = await recipeModel
            .findById(newRecipe._id)
            .populate('menuItemId', 'name price category image')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Tạo công thức thành công',
            data: populatedRecipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo công thức',
            error: error.message
        });
    }
};

// Cập nhật công thức
exports.updateRecipe = async (req, res) => {
    try {
        const {
            menuItemId,
            menuItemName,
            ingredients,
            instructions,
            preparationTime,
            cookingTime,
            servings,
            difficulty,
            notes,
            tips,
            category,
            tags,
            image,
            video,
            status,
            updatedBy
        } = req.body;

        // Nếu có menuItemId mới, kiểm tra xem có tồn tại không
        if (menuItemId) {
            const menuItem = await menuModel.findById(menuItemId);
            if (!menuItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy món ăn'
                });
            }
        }

        // Kiểm tra các nguyên liệu có tồn tại không
        if (ingredients && ingredients.length > 0) {
            for (const ing of ingredients) {
                const ingredient = await ingredientModel.findById(ing.ingredientId);
                if (!ingredient) {
                    return res.status(404).json({
                        success: false,
                        message: `Không tìm thấy nguyên liệu: ${ing.ingredientName}`
                    });
                }
            }
        }

        const updateData = {
            ...(menuItemId && { menuItemId }),
            ...(menuItemName && { menuItemName }),
            ...(ingredients && { ingredients }),
            ...(instructions && { instructions }),
            ...(preparationTime !== undefined && { preparationTime }),
            ...(cookingTime !== undefined && { cookingTime }),
            ...(servings !== undefined && { servings }),
            ...(difficulty && { difficulty }),
            ...(notes !== undefined && { notes }),
            ...(tips && { tips }),
            ...(category && { category }),
            ...(tags && { tags }),
            ...(image !== undefined && { image }),
            ...(video !== undefined && { video }),
            ...(status && { status }),
            ...(updatedBy && { updatedBy })
        };

        const updatedRecipe = await recipeModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('menuItemId', 'name price category image')
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!updatedRecipe) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công thức'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật công thức thành công',
            data: updatedRecipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật công thức',
            error: error.message
        });
    }
};

// Xóa công thức (soft delete)
exports.deleteRecipe = async (req, res) => {
    try {
        const deletedRecipe = await recipeModel.softDelete(req.params.id);
        if (!deletedRecipe) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công thức'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Xóa công thức thành công',
            data: deletedRecipe
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa công thức',
            error: error.message
        });
    }
};

// Tính toán tổng thời gian nấu
exports.calculateTotalTime = async (req, res) => {
    try {
        const recipe = await recipeModel.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công thức'
            });
        }

        const totalTime = recipe.preparationTime + recipe.cookingTime;

        res.status(200).json({
            success: true,
            data: {
                preparationTime: recipe.preparationTime,
                cookingTime: recipe.cookingTime,
                totalTime
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tính toán thời gian',
            error: error.message
        });
    }
};

// Kiểm tra nguyên liệu có đủ để nấu không
exports.checkIngredientsAvailability = async (req, res) => {
    try {
        const recipe = await recipeModel.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy công thức'
            });
        }

        const servings = req.query.servings || recipe.servings;
        const multiplier = servings / recipe.servings;

        const availability = [];
        let allAvailable = true;

        for (const recipeIng of recipe.ingredients) {
            const ingredient = await ingredientModel.findById(recipeIng.ingredientId);
            const requiredQuantity = recipeIng.quantity * multiplier;

            const isAvailable = ingredient && ingredient.quantity >= requiredQuantity;
            if (!isAvailable) allAvailable = false;

            availability.push({
                ingredientId: recipeIng.ingredientId,
                ingredientName: recipeIng.ingredientName,
                required: requiredQuantity,
                available: ingredient ? ingredient.quantity : 0,
                unit: recipeIng.unit,
                isAvailable
            });
        }

        res.status(200).json({
            success: true,
            data: {
                recipeId: recipe._id,
                recipeName: recipe.menuItemName,
                servings,
                allAvailable,
                ingredients: availability
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi kiểm tra nguyên liệu',
            error: error.message
        });
    }
};
