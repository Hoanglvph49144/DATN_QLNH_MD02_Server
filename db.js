const mongoose = require('mongoose');

// Sử dụng MongoDB Atlas (Cloud) - Thay YOUR_CONNECTION_STRING bằng connection string từ MongoDB Atlas
// Hoặc giữ localhost nếu chỉ chạy local
const mongoURI = 'mongodb://localhost:27017/DATN_QLNH_MD02';
// const mongoURI_Atlas = 'mongodb+srv://admin:iyFxFWlrGtuNhhrB@cluster0.x98a7dd.mongodb.net/DATN_QLNH_MD02?retryWrites=true&w=majority&appName=Cluster0';


// Kết nối MongoDB
mongoose.connect(mongoURI)
.then(() => console.log('✅ Kết nối MongoDB Atlas thành công!'))
.catch((err) => {
    console.log('❌ Lỗi kết nối CSDL');
    console.log(err);
    throw new Error("Lỗi kết nối CSDL");
});

module.exports = {mongoose};
