const express = require('express');
const { getExpenses, createExpense, deleteExpense, getAccountantStats } = require('../controllers/expense.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('ACCOUNTANT', 'ADMIN', 'SUPERADMIN'));

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);
router.get('/stats', getAccountantStats);

module.exports = router;
