const express = require('express');
const { generatePayroll, getPayslips, markAsPaid } = require('../controllers/payroll.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN', 'HR', 'ACCOUNTANT'));

router.post('/generate', generatePayroll);
router.get('/payslips', getPayslips);
router.put('/payslips/:id/pay', markAsPaid);

module.exports = router;
