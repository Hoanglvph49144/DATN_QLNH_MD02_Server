const db = require('./db');


// định nghĩa khuôn mẫu cho model
const menuSchema = new db.mongoose.Schema(
   {
       name: {type: String, required: true},
       price: {type: Number, required: true},
       category: {type: String, required: true},
       status: {type: String, required: true, default: 'available'},
       createdAt: {type: Date, default: Date.now}
   },
   {
       collection:'menu' // tên bảng dữ liệu
   }
)
// tạo model
let menuModel = db.mongoose.model('menuModel', menuSchema);
module.exports = {menuModel};
