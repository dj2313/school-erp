const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generatePDF } = require('../utils/pdfGenerator');
const { format } = require('date-fns');

// Download Fee Receipt PDF
exports.downloadFeeReceipt = async (req, res) => {
    try {
        const { receipt_no } = req.params;
        const payment = await prisma.feePayment.findUnique({
            where: { receipt_no },
            include: {
                invoice: {
                    include: {
                        student: { include: { institution: true, class: true } }
                    }
                }
            }
        });

        if (!payment) return res.status(404).json({ message: 'Receipt not found' });

        const pdfData = {
            institution_name: payment.invoice.student.institution.name,
            receipt_no: payment.receipt_no,
            payment_date: format(payment.payment_date, 'dd MMM yyyy HH:mm'),
            student_name: `${payment.invoice.student.first_name} ${payment.invoice.student.last_name}`,
            admission_no: payment.invoice.student.admission_no,
            class_name: `${payment.invoice.student.class.name}-${payment.invoice.student.class.section}`,
            invoice_no: payment.invoice.invoice_no,
            amount: payment.amount,
            payment_mode: payment.payment_mode,
            transaction_id: payment.transaction_id
        };

        const pdfBuffer = await generatePDF('fee_receipt', pdfData);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Receipt_${receipt_no}.pdf`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Download Payslip PDF
exports.downloadPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const payslip = await prisma.payslip.findUnique({
            where: { id: parseInt(id) },
            include: {
                staff: { include: { institution: true } }
            }
        });

        if (!payslip) return res.status(404).json({ message: 'Payslip not found' });

        const monthName = format(new Date(payslip.year, payslip.month - 1), 'MMMM');

        const pdfData = {
            institution_name: payslip.staff.institution.name,
            month_name: monthName,
            year: payslip.year,
            staff_name: `${payslip.staff.first_name} ${payslip.staff.last_name}`,
            employee_code: payslip.staff.employee_code,
            designation: payslip.staff.designation,
            department: payslip.staff.department,
            present_days: payslip.present_days,
            working_days: payslip.working_days,
            leaves_taken: payslip.leaves_taken,
            basic_salary: payslip.basic_salary,
            allowances: payslip.allowances || [],
            deductions: payslip.deductions || [],
            gross_salary: payslip.gross_salary,
            total_deductions: (payslip.deductions || []).reduce((sum, d) => sum + d.amount, 0),
            net_salary: payslip.net_salary
        };

        const pdfBuffer = await generatePDF('payslip', pdfData);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Payslip_${payslip.staff.employee_code}_${monthName}.pdf`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Download Report Card PDF
exports.downloadReportCard = async (req, res) => {
    try {
        const { student_id, exam_id } = req.params;

        const student = await prisma.student.findUnique({
            where: { id: parseInt(student_id) },
            include: { institution: true, class: true }
        });

        const results = await prisma.examResult.findMany({
            where: {
                student_id: parseInt(student_id),
                exam_id: parseInt(exam_id)
            },
            include: {
                subject: true,
                exam: true
            }
        });

        if (!results.length) return res.status(404).json({ message: 'Results not found' });

        const exam = results[0].exam;
        const subjects = results.map(r => ({
            name: r.subject.name,
            max_marks: 100, // Assuming standard max
            min_marks: 33,  // Assuming standard min
            obtained_marks: r.marks_obtained,
            grade: r.marks_obtained >= 90 ? 'A+' : r.marks_obtained >= 80 ? 'A' : r.marks_obtained >= 70 ? 'B' : r.marks_obtained >= 60 ? 'C' : r.marks_obtained >= 33 ? 'D' : 'F'
        }));

        const totalObtained = subjects.reduce((sum, s) => sum + s.obtained_marks, 0);
        const totalMax = subjects.length * 100;
        const percentage = ((totalObtained / totalMax) * 100).toFixed(2);

        const pdfData = {
            institution_name: student.institution.name,
            student_name: `${student.first_name} ${student.last_name}`,
            roll_no: student.admission_no,
            class_name: `${student.class.name}-${student.class.section}`,
            exam_name: exam.name,
            academic_year: '2023-24', // Should dynamic if available
            subjects: subjects,
            total_obtained: totalObtained,
            total_max: totalMax,
            percentage: percentage,
            result: parseFloat(percentage) >= 33 ? 'PASS' : 'FAIL'
        };

        const pdfBuffer = await generatePDF('report_card', pdfData);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=ReportCard_${student.admission_no}.pdf`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
