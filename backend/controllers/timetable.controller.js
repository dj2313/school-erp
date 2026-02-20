const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Timetable for a class
exports.getTimetableByClass = async (req, res) => {
    try {
        const { class_id } = req.params;
        const timetable = await prisma.timetable.findMany({
            where: { class_id: parseInt(class_id) },
            include: {
                subject: true,
                staff: true,
                class: true
            },
            orderBy: [{ day: 'asc' }, { period_no: 'asc' }]
        });
        res.json({ data: timetable });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create or Update Timetable entry
exports.upsertTimetableEntry = async (req, res) => {
    try {
        const { class_id, subject_id, staff_id, day, period_no, start_time, end_time } = req.body;

        // Conflict check: Is the teacher busy at this time on this day?
        if (staff_id) {
            const conflict = await prisma.timetable.findFirst({
                where: {
                    staff_id: parseInt(staff_id),
                    day: parseInt(day),
                    period_no: parseInt(period_no)
                },
                include: { class: true }
            });

            if (conflict && (conflict.class_id !== parseInt(class_id))) {
                return res.status(400).json({
                    message: `Teacher is already assigned to ${conflict.class.name} during this period.`
                });
            }
        }

        const entry = await prisma.timetable.upsert({
            where: {
                // We need a unique constraint for [class_id, day, period_no] for upsert to work effectively with where
                // But since we don't have one in schema yet, let's use find-then-update or create
                id: req.body.id || 0
            },
            update: { subject_id, staff_id, start_time, end_time },
            create: { class_id, subject_id, staff_id, day, period_no, start_time, end_time }
        });

        res.status(201).json({ data: entry, message: 'Timetable updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Timetable entry
exports.deleteTimetableEntry = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.timetable.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Entry removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
