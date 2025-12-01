// model/ingredient.model.js
const db = require('./db');

// Định nghĩa schema cho nguyên liệu
const ingredientSchema = new db.mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    tag: { 
      type: String, 
      enum: ['thit', 'rau_cu_qua', 'hai_san', 'gia_vi', 'do_kho', 'khac'],
      required: true 
    }, // Tag để phân loại nguyên liệu
    unit: { 
      type: String, 
      enum: ['kg', 'so_luong', 'lit', 'gram'],
      required: true 
    }, // Đơn vị tính: kg cho thịt, số_luong cho rau củ
    quantity: { 
      type: Number, 
      required: true,
      min: 0,
      default: 0
    }, // Số lượng hiện có
    minQuantity: { 
      type: Number, 
      default: 5 
    }, // Ngưỡng tối thiểu để cảnh báo
    status: { 
      type: String, 
      enum: ['available', 'low_stock', 'out_of_stock'],
      default: 'available'
    }, // Trạng thái: còn hàng, sắp hết, hết hàng
    image: { 
      type: String 
    }, // Link ảnh nguyên liệu
    description: { 
      type: String 
    }, // Mô tả
    supplier: { 
      type: String 
    }, // Nhà cung cấp
    lastRestocked: { 
      type: Date 
    }, // Lần nhập kho gần nhất
    createdAt: { 
      type: Date, 
      default: () => new Date() 
    },
    updatedAt: { 
      type: Date, 
      default: () => new Date() 
    },
  },
  {
    collection: 'ingredients'
  }
);

// Middleware để tự động cập nhật status dựa trên quantity
ingredientSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.minQuantity) {
    this.status = 'low_stock';
  } else {
    this.status = 'available';
  }
  this.updatedAt = new Date();
  next();
});

// Tạo model
let ingredientModel = db.mongoose.model('ingredientModel', ingredientSchema);

module.exports = { ingredientModel };
