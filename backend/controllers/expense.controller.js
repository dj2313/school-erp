const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Expenses with filters
exports.getExpenses = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { category, start_date, end_date } = req.query;

        const where = {
            institution_id: parseInt(institution_id)
        };

        if (category) where.category = category;
        if (start_date && end_date) {
            where.expense_date = {
                gte: new Date(start_date),
                lte: new Date(end_date)
            };
        }

        const expenses = await prisma.expense.findMany({
            where,
            orderBy: { expense_date: 'desc' }
        });

        res.json({ data: expenses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create Expense
exports.createExpense = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { category, amount, payment_mode, reference_no, description, expense_date } = req.body;

        const expense = await prisma.expense.create({
            data: {
                institution_id: parseInt(institution_id),
                category,
                amount: parseFloat(amount),
                payment_mode,
                reference_no,
                description,
                expense_date: expense_date ? new Date(expense_date) : new Date(),
                created_by: req.user.id // Staff ID usually but user_id is fine here as fallback
            }
        });

        res.status(201).json({ data: expense, message: 'Expense recorded successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.expense.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Expense deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Accountant Stats
exports.getAccountantStats = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [dailyCollection, dailyExpenses, totalPending] = await Promise.all([
            prisma.feePayment.aggregate({
                where: {
                    invoice: { institution_id: parseInt(institution_id) },
                    payment_date: { gte: today }
                },
                _sum: { amount: true }
            }),
            prisma.expense.aggregate({
                where: {
                    institution_id: parseInt(institution_id),
                    expense_date: { gte: today }
                },
                _sum: { amount: true }
            }),
            prisma.feeInvoice.aggregate({
                where: {
                    institution_id: parseInt(institution_id),
                    status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] }
                },
                _sum: { balance: true }
            })
        ]);

        res.json({
            data: {
                today_collection: dailyCollection._sum.amount || 0,
                today_expenses: dailyExpenses._sum.amount || 0,
                total_pending_fees: totalPending._sum.balance || 0
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
