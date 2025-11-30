const db = require('./db');

const shiftSchema = new db.mongoose.Schema({
  shiftName: { type: String, required: true },
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true },   // HH:mm
  description: { type: String }
}, {
  collection: 'shifts'
});

const shiftModel = db.mongoose.model('shiftModel', shiftSchema);
module.exports = { shiftModel };
