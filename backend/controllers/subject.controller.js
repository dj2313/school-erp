const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all subjects
exports.getSubjects = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const subjects = await prisma.subject.findMany({
            where: { institution_id: parseInt(institution_id) },
            include: { class_subjects: { include: { class: true } } }
        });
        res.json({ data: subjects });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create subject
exports.createSubject = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { name, code, type } = req.body;

        const subject = await prisma.subject.create({
            data: {
                institution_id: parseInt(institution_id),
                name,
                code,
                type: type || 'theory'
            }
        });
        res.status(201).json({ data: subject, message: 'Subject created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Assign subject to class
exports.assignToClass = async (req, res) => {
    try {
        const { class_id, subject_id } = req.body;
        const assignment = await prisma.classSubject.create({
            data: {
                class_id: parseInt(class_id),
                subject_id: parseInt(subject_id)
            }
        });
        res.status(201).json({ data: assignment, message: 'Subject assigned to class' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
