const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getClasses = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const classes = await prisma.class.findMany({
            where: { institution_id: parseInt(institution_id) },
            include: {
                academic_year: true,
                _count: { select: { students: true } },
                subjects: { include: { subject: true } }
            },
            orderBy: { name: 'asc' },
        });
        res.json({ data: classes });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createClass = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { name, section, capacity, academic_year_id } = req.body;

        const newClass = await prisma.class.create({
            data: {
                institution_id: parseInt(institution_id),
                name,
                section,
                capacity: capacity ? parseInt(capacity) : 40,
                academic_year_id: parseInt(academic_year_id),
            },
            include: { academic_year: true }
        });

        res.status(201).json({ data: newClass, message: 'Class created successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedClass = await prisma.class.update({
            where: { id: parseInt(id) },
            data
        });
        res.json({ data: updatedClass });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.class.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
