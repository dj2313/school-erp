const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfMonth, endOfMonth, format } = require('date-fns');

// 1. Attendance Summary
exports.getAttendanceSummary = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { month, year } = req.query;

        const date = new Date(year, month - 1, 1);
        const start = startOfMonth(date);
        const end = endOfMonth(date);

        const classes = await prisma.class.findMany({
            where: { institution_id: parseInt(institution_id) },
            include: {
                attendance: {
                    where: {
                        date: { gte: start, lte: end }
                    }
                },
                students: {
                    where: { is_active: true }
                }
            }
        });

        const summary = classes.map(c => {
            const totalPossible = c.students.length * 25; // Assuming 25 working days
            const totalPresent = c.attendance.filter(a => a.status === 'PRESENT').length;
            const percentage = totalPossible > 0 ? (totalPresent / totalPossible) * 100 : 0;

            return {
                class_id: c.id,
                class_name: `${c.name} (${c.section})`,
                student_count: c.students.length,
                present_count: totalPresent,
                attendance_percentage: percentage.toFixed(2)
            };
        });

        res.json({ data: summary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 2. Fee Collection Report
exports.getFeeCollectionReport = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { start_date, end_date } = req.query;

        const payments = await prisma.feePayment.findMany({
            where: {
                invoice: { institution_id: parseInt(institution_id) },
                payment_date: {
                    gte: new Date(start_date),
                    lte: new Date(end_date)
                }
            },
            include: { invoice: { include: { student: true } } }
        });

        const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
        const modeBreakdown = payments.reduce((acc, p) => {
            acc[p.payment_mode] = (acc[p.payment_mode] || 0) + p.amount;
            return acc;
        }, {});

        res.json({
            data: {
                total_collected: totalCollected,
                mode_breakdown: modeBreakdown,
                transactions: payments.length
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 3. Student Strength
exports.getStudentStrength = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const classes = await prisma.class.findMany({
            where: { institution_id: parseInt(institution_id) },
            include: {
                _count: {
                    select: { students: { where: { is_active: true } } }
                }
            }
        });

        const strength = classes.map(c => ({
            class_name: `${c.name} (${c.section})`,
            count: c._count.students
        }));

        res.json({ data: strength });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 4. Staff Payroll Summary
exports.getStaffPayrollSummary = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { month, year } = req.query;

        const payslips = await prisma.payslip.findMany({
            where: {
                staff: { institution_id: parseInt(institution_id) },
                month: parseInt(month),
                year: parseInt(year)
            }
        });

        const totalPayout = payslips.reduce((sum, p) => sum + p.net_salary, 0);
        const unpaidCount = payslips.filter(p => !p.is_paid).length;

        res.json({
            data: {
                total_payout: totalPayout,
                payslips_count: payslips.length,
                pending_payments: unpaidCount
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
