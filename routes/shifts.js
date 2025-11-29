const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shift.controller');

router.post('/', shiftController.createShift);
router.get('/', shiftController.getAllShifts);

module.exports = router;
