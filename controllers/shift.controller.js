const { shiftModel } = require('../model/shift.model');

exports.createShift = async (req, res) => {
  try {
    const { shiftName, startTime, endTime, description } = req.body;
    const shift = new shiftModel({ shiftName, startTime, endTime, description });
    await shift.save();
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await shiftModel.find().sort({ startTime: 1 });
    res.status(200).json({ success: true, data: shifts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
