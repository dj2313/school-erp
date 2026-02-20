const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { format } = require('date-fns');

// 1. Create Fee Structure
exports.createFeeStructure = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { name, class_id, academic_year, total_amount, components, due_day, late_fee_per_day } = req.body;

        const structure = await prisma.feeStructure.create({
            data: {
                institution_id: parseInt(institution_id),
                name,
                class_id: class_id ? parseInt(class_id) : null,
                academic_year,
                total_amount: parseFloat(total_amount),
                components, // Expected as JSON array
                due_day: parseInt(due_day),
                late_fee_per_day: parseFloat(late_fee_per_day || 0),
            },
        });

        res.status(201).json({ message: 'Fee structure created successfully', data: structure });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Get Fee Structures
exports.getFeeStructures = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const structures = await prisma.feeStructure.findMany({
            where: { institution_id: parseInt(institution_id) },
            include: { institution: true },
        });
        res.json({ data: structures });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Generate Invoices for a Class
exports.generateInvoices = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { class_id, fee_structure_id, due_date } = req.body;

        const structure = await prisma.feeStructure.findUnique({
            where: { id: parseInt(fee_structure_id) },
        });

        if (!structure) return res.status(404).json({ message: 'Fee structure not found' });

        const students = await prisma.student.findMany({
            where: {
                class_id: parseInt(class_id),
                institution_id: parseInt(institution_id),
                is_active: true
            },
        });

        const academicYear = await prisma.academicYear.findFirst({
            where: { institution_id: parseInt(institution_id), is_current: true }
        });

        if (!academicYear) return res.status(400).json({ message: 'No active academic year found' });

        const invoices = [];
        for (const student of students) {
            // Check if invoice already exists for this student and structure
            const existing = await prisma.feeInvoice.findFirst({
                where: {
                    student_id: student.id,
                    fee_structure_id: structure.id,
                    academic_year_id: academicYear.id
                }
            });

            if (existing) continue;

            const invoice_no = `INV-${Date.now()}-${student.id}`;

            const invoice = await prisma.feeInvoice.create({
                data: {
                    institution_id: parseInt(institution_id),
                    student_id: student.id,
                    fee_structure_id: structure.id,
                    academic_year_id: academicYear.id,
                    invoice_no,
                    amount: structure.total_amount,
                    total_amount: structure.total_amount,
                    balance: structure.total_amount,
                    due_date: new Date(due_date),
                    status: 'UNPAID',
                },
            });
            invoices.push(invoice);
        }

        res.json({ message: `Generated ${invoices.length} invoices`, data: invoices });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Get Invoices with filters
exports.getInvoices = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { status, class_id, search } = req.query;

        const where = { institution_id: parseInt(institution_id) };
        if (status) where.status = status;
        if (class_id) where.student = { class_id: parseInt(class_id) };
        if (search) {
            where.OR = [
                { invoice_no: { contains: search, mode: 'insensitive' } },
                { student: { first_name: { contains: search, mode: 'insensitive' } } },
                { student: { last_name: { contains: search, mode: 'insensitive' } } },
                { student: { admission_no: { contains: search, mode: 'insensitive' } } },
            ];
        }

        let invoices = await prisma.feeInvoice.findMany({
            where,
            include: {
                student: { include: { class: true } },
                fee_structure: true,
            },
            orderBy: { created_at: 'desc' },
        });

        // Auto-calculate late fees if needed
        const today = new Date();
        invoices = invoices.map(inv => {
            if (inv.status !== 'PAID' && inv.due_date < today) {
                const diffTime = Math.abs(today - inv.due_date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const lateFee = diffDays * (inv.fee_structure.late_fee_per_day || 0);

                // Note: We don't save to DB here to avoid mutation on GET, 
                // but we return it for the UI. Real calc happens during payment.
                return {
                    ...inv,
                    calculated_late_fee: lateFee,
                    current_total: inv.total_amount + lateFee,
                    current_balance: inv.balance + lateFee
                };
            }
            return inv;
        });

        res.json({ data: invoices });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 5. Collect Payment
exports.collectPayment = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { invoice_id, amount, payment_mode, transaction_id, notes } = req.body;

        const invoice = await prisma.feeInvoice.findUnique({
            where: { id: parseInt(invoice_id) },
            include: { fee_structure: true }
        });

        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        // Calculate current late fee
        const today = new Date();
        let lateFee = 0;
        if (invoice.due_date < today && invoice.status !== 'PAID') {
            const diffTime = Math.abs(today - invoice.due_date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            lateFee = diffDays * (invoice.fee_structure.late_fee_per_day || 0);
        }

        const paidAmount = parseFloat(amount);
        const newPaidAmountTotal = invoice.paid_amount + paidAmount;
        const totalWithLateFee = invoice.total_amount + lateFee;
        const newBalance = totalWithLateFee - newPaidAmountTotal;

        let newStatus = 'PARTIAL';
        if (newBalance <= 0) newStatus = 'PAID';

        // Update Invoice
        const updatedInvoice = await prisma.feeInvoice.update({
            where: { id: parseInt(invoice_id) },
            data: {
                late_fee: lateFee,
                total_amount: totalWithLateFee,
                paid_amount: newPaidAmountTotal,
                balance: newBalance,
                status: newStatus
            }
        });

        // Create Payment Record
        const receipt_no = `RCPT-${Date.now()}`;
        const payment = await prisma.feePayment.create({
            data: {
                invoice_id: parseInt(invoice_id),
                receipt_no,
                amount: paidAmount,
                payment_mode,
                transaction_id,
                notes,
                payment_date: new Date(),
            }
        });

        res.json({ message: 'Payment collected successfully', data: { invoice: updatedInvoice, payment } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 6. Get Receipt Data
exports.getReceipt = async (req, res) => {
    try {
        const { receipt_no } = req.params;
        const payment = await prisma.feePayment.findUnique({
            where: { receipt_no },
            include: {
                invoice: {
                    include: {
                        student: { include: { class: true, institution: true } },
                        fee_structure: true
                    }
                }
            }
        });

        if (!payment) return res.status(404).json({ message: 'Receipt not found' });

        res.json({ data: payment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 7. Get Pending Dues
exports.getPendingDues = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const dues = await prisma.feeInvoice.findMany({
            where: {
                institution_id: parseInt(institution_id),
                balance: { gt: 0 },
                status: { not: 'PAID' }
            },
            include: {
                student: { include: { class: true } },
                fee_structure: true
            },
            orderBy: [
                { due_date: 'asc' }, // Overdue first
            ]
        });

        res.json({ data: dues });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 8. Get Fee Report (Daily/Monthly summary)
exports.getFeeReport = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { period } = req.query; // 'daily' or 'monthly'

        const today = new Date();
        const startDate = period === 'monthly' ? new Date(today.getFullYear(), today.getMonth(), 1) : new Date(today.setHours(0, 0, 0, 0));

        const payments = await prisma.feePayment.findMany({
            where: {
                invoice: { institution_id: parseInt(institution_id) },
                payment_date: { gte: startDate }
            },
            include: { invoice: true }
        });

        const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

        // Group by mode
        const modeSummary = payments.reduce((acc, p) => {
            acc[p.payment_mode] = (acc[p.payment_mode] || 0) + p.amount;
            return acc;
        }, {});

        res.json({
            period,
            summary: {
                total_collected: totalCollected,
                count: payments.length,
                by_mode: modeSummary
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
