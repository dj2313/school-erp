const express = require('express');
const {
    createFeeStructure,
    getFeeStructures,
    generateInvoices,
    getInvoices,
    collectPayment,
    getReceipt,
    getPendingDues,
    getFeeReport
} = require('../controllers/fees.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Fee Structures
router.post('/structures', authorize('ADMIN', 'ACCOUNTANT'), createFeeStructure);
router.get('/structures', getFeeStructures);

// Invoices
router.post('/generate-invoices', authorize('ADMIN', 'ACCOUNTANT'), generateInvoices);
router.get('/invoices', getInvoices);
router.get('/pending-dues', getPendingDues);

// Payments
router.post('/collect', authorize('ADMIN', 'ACCOUNTANT'), collectPayment);
router.get('/receipts/:receipt_no', getReceipt);

// Reports
router.get('/report', authorize('ADMIN', 'ACCOUNTANT'), getFeeReport);

module.exports = router;
