
const db = require('./db');

const ingredientSchema = new db.mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên nguyên liệu (ví dụ: Thịt bò, Gạo, Trứng)
    unit: { type: String, required: true }, // Đơn vị tính (kg, g, lít, quả, lon)
    
    quantity: { type: Number, default: 0 }, // Số lượng tồn kho hiện tại
    
    minThreshold: { type: Number, default: 5 }, // Ngưỡng cảnh báo (nếu quantity < minThreshold thì báo sắp hết)
    
    importPrice: { type: Number, default: 0 }, // Giá nhập trung bình (để tính cost)
    
    supplier: { type: String, default: '' }, // Nhà cung cấp (tùy chọn)
    
    status: {
      type: String,
      enum: ['available', 'low_stock', 'out_of_stock'],
      default: 'available'
    },
    
    lastImportDate: { type: Date }, // Ngày nhập hàng gần nhất
    expirationDate: { type: Date }, // Hạn sử dụng (nếu cần quản lý lô)
  },
  {
    collection: 'ingredients',
    timestamps: true // Tự động tạo createdAt và updatedAt
  }
);

// Middleware: Tự động cập nhật status dựa trên số lượng trước khi lưu
ingredientSchema.pre('save', function(next) {
  if (this.quantity <= 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.minThreshold) {
    this.status = 'low_stock';
  } else {
    this.status = 'available';
  }
  next();
});

let ingredientModel = db.mongoose.model('ingredientModel', ingredientSchema);
module.exports = { ingredientModel };