const db = require('./db');


// định nghĩa khuôn mẫu cho model
const orderSchema = new db.mongoose.Schema(
   {
       tableNumber: {type: Number, required: true},
       server: {type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true},
       cashier: {type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true},
       items: [{
           menuItem: {type: db.mongoose.Schema.Types.ObjectId, ref: 'menuModel'},
           quantity: {type: Number},
           price: {type: Number}
       }],
       totalAmount: {type: Number, required: true},
       discount: {type: Number, default: 0},
       finalAmount: {type: Number, required: true},
       paidAmount: {type: Number, default: 0},
       change: {type: Number, default: 0},
       paymentMethod: {type: String, required: true},
       orderStatus: {type: String, required: true, default: 'pending'},
       mergedFrom: [{type: db.mongoose.Schema.Types.ObjectId, ref: 'orderModel'}],
       splitTo: [{type: db.mongoose.Schema.Types.ObjectId, ref: 'orderModel'}],
       createdAt: {type: Date, default: Date.now},
       paidAt: {type: Date}
   },
   {
       collection:'orders' // tên bảng dữ liệu
   }
)
// tạo model
let orderModel = db.mongoose.model('orderModel', orderSchema);
module.exports = {orderModel};