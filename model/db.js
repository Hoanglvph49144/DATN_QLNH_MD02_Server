const mongoose = require('mongoose');

// Cấu hình MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/restaurant_db'; // Thay đổi theo database của bạn

// Kết nối MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Kết nối MongoDB thành công!'))
.catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Export mongoose để sử dụng trong models
module.exports = { mongoose };
