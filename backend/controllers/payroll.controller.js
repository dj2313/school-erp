const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfMonth, endOfMonth, daysInMonth } = require('date-fns');

// Generate Payroll for all staff
exports.generatePayroll = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { month, year } = req.body; // month is 1-12

        const activeStaff = await prisma.staff.findMany({
            where: { institution_id: parseInt(institution_id), is_active: true }
        });

        const startDate = new Date(year, month - 1, 1);
        const endDate = endOfMonth(startDate);
        const totalWorkingDays = 30; // Standard school payroll working days or use daysInMonth(startDate)

        const payslips = [];

        for (const staff of activeStaff) {
            // 1. Count Present Days
            const presentDaysCount = await prisma.staffAttendance.count({
                where: {
                    staff_id: staff.id,
                    date: { gte: startDate, lte: endDate },
                    status: 'PRESENT'
                }
            });

            // 2. Count Unpaid Leaves
            const unpaidLeaves = await prisma.leave.aggregate({
                where: {
                    staff_id: staff.id,
                    status: 'APPROVED',
                    from_date: { lte: endDate },
                    to_date: { gte: startDate },
                    leave_type: 'UNPAID' // Or logic to detect unpaid
                },
                _sum: { total_days: true }
            });

            const leavesToDeduct = unpaidLeaves._sum.total_days || 0;

            // 3. Calculation
            const perDaySalary = staff.salary / totalWorkingDays;
            const gross_salary = staff.salary;

            // deductions: absents + unpaid leaves
            // if we assume days not marked as present are absents:
            const absents = totalWorkingDays - presentDaysCount;
            const deductionsAmount = (absents * perDaySalary);

            const net_salary = gross_salary - deductionsAmount;

            // 4. Create or Update Payslip
            const payslip = await prisma.payslip.upsert({
                where: {
                    staff_id_month_year: {
                        staff_id: staff.id,
                        month: parseInt(month),
                        year: parseInt(year)
                    }
                },
                update: {
                    basic_salary: staff.salary,
                    gross_salary,
                    net_salary,
                    working_days: totalWorkingDays,
                    present_days: presentDaysCount,
                    leaves_taken: Math.ceil(leavesToDeduct),
                },
                create: {
                    staff_id: staff.id,
                    month: parseInt(month),
                    year: parseInt(year),
                    basic_salary: staff.salary,
                    gross_salary,
                    net_salary,
                    working_days: totalWorkingDays,
                    present_days: presentDaysCount,
                    leaves_taken: Math.ceil(leavesToDeduct),
                    allowances: [],
                    deductions: [{ name: 'Absence/Unpaid', amount: deductionsAmount }],
                    is_paid: false
                }
            });
            payslips.push(payslip);
        }

        res.json({ message: `Payroll generated for ${payslips.length} staff members`, data: payslips });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Payslips
exports.getPayslips = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { month, year } = req.query;

        const payslips = await prisma.payslip.findMany({
            where: {
                staff: { institution_id: parseInt(institution_id) },
                month: parseInt(month),
                year: parseInt(year)
            },
            include: { staff: true },
            orderBy: { staff: { first_name: 'asc' } }
        });

        res.json({ data: payslips });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Mark as Paid
exports.markAsPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_mode } = req.body;

        const payslip = await prisma.payslip.update({
            where: { id: parseInt(id) },
            data: {
                is_paid: true,
                payment_date: new Date(),
                payment_mode: payment_mode || 'bank_transfer'
            }
        });

        res.json({ message: 'Payslip marked as paid', data: payslip });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
