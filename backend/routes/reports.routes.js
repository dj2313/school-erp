const express = require('express');
const {
    getAttendanceSummary,
    getFeeCollectionReport,
    getStudentStrength,
    getStaffPayrollSummary
} = require('../controllers/reports.controller');
const {
    downloadFeeReceipt,
    downloadPayslip,
    downloadReportCard
} = require('../controllers/pdf.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Data Reports
router.get('/attendance', authorize('ADMIN', 'SUPERADMIN'), getAttendanceSummary);
router.get('/fees', authorize('ADMIN', 'ACCOUNTANT', 'SUPERADMIN'), getFeeCollectionReport);
router.get('/strength', authorize('ADMIN', 'SUPERADMIN'), getStudentStrength);
router.get('/payroll', authorize('ADMIN', 'HR', 'SUPERADMIN'), getStaffPayrollSummary);

// PDF Generation
router.get('/pdf/receipt/:receipt_no', downloadFeeReceipt);
router.get('/pdf/payslip/:id', downloadPayslip);
router.get('/pdf/report-card/:student_id/:exam_id', downloadReportCard);

module.exports = router;
