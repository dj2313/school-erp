const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Exams
exports.getExams = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const exams = await prisma.exam.findMany({
            where: { institution_id: parseInt(institution_id) },
            include: { academic_year: true, class: true },
            orderBy: { start_date: 'desc' }
        });
        res.json({ data: exams });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create Exam
exports.createExam = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { name, start_date, end_date, type, class_id, academic_year_id } = req.body;

        const exam = await prisma.exam.create({
            data: {
                institution_id: parseInt(institution_id),
                academic_year_id: parseInt(academic_year_id),
                class_id: class_id ? parseInt(class_id) : null,
                name,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                type: type || 'written'
            }
        });
        res.status(201).json({ data: exam, message: 'Exam scheduled successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Bulk Entry Marks
exports.bulkEntryMarks = async (req, res) => {
    try {
        const { exam_id, subject_id, class_id, results } = req.body; // results: [{student_id, obtained_marks, max_marks, remarks}]

        const gradeSystem = (percent) => {
            if (percent >= 90) return 'A+';
            if (percent >= 80) return 'A';
            if (percent >= 70) return 'B';
            if (percent >= 60) return 'C';
            if (percent >= 50) return 'D';
            return 'F';
        };

        const upserts = results.map(r => {
            const percent = (r.obtained_marks / r.max_marks) * 100;
            return prisma.examResult.upsert({
                where: {
                    exam_id_student_id_subject_id: {
                        exam_id: parseInt(exam_id),
                        student_id: parseInt(r.student_id),
                        subject_id: parseInt(subject_id)
                    }
                },
                update: {
                    obtained_marks: parseFloat(r.obtained_marks),
                    max_marks: parseFloat(r.max_marks),
                    grade: gradeSystem(percent),
                    remarks: r.remarks
                },
                create: {
                    exam_id: parseInt(exam_id),
                    student_id: parseInt(r.student_id),
                    subject_id: parseInt(subject_id),
                    obtained_marks: parseFloat(r.obtained_marks),
                    max_marks: parseFloat(r.max_marks),
                    grade: gradeSystem(percent),
                    remarks: r.remarks
                }
            });
        });

        await Promise.all(upserts);
        res.json({ message: 'Marks entry successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Results for specific exam and class
exports.getExamResults = async (req, res) => {
    try {
        const { exam_id, class_id, subject_id } = req.query;
        const results = await prisma.examResult.findMany({
            where: {
                exam_id: parseInt(exam_id),
                subject_id: parseInt(subject_id),
                student: { class_id: parseInt(class_id) }
            },
            include: { student: true }
        });
        res.json({ data: results });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
