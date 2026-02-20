const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAcademicYears = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const years = await prisma.academicYear.findMany({
            where: { institution_id: parseInt(institution_id) },
            orderBy: { start_date: 'desc' }
        });
        res.json({ data: years });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createAcademicYear = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { name, start_date, end_date, is_current } = req.body;

        if (is_current) {
            await prisma.academicYear.updateMany({
                where: { institution_id: parseInt(institution_id) },
                data: { is_current: false }
            });
        }

        const year = await prisma.academicYear.create({
            data: {
                institution_id: parseInt(institution_id),
                name,
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                is_current: is_current || false
            }
        });
        res.status(201).json({ data: year, message: 'Academic year created' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
