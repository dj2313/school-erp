const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTeacherDashboardData = async (req, res) => {
    try {
        const { institution_id, id: user_id } = req.user;

        // Find the staff record for this teacher user
        const staff = await prisma.staff.findUnique({
            where: { user_id: parseInt(user_id) }
        });

        if (!staff) return res.status(404).json({ message: 'Teacher profile not found' });

        // Get assigned classes and subjects
        const assignments = await prisma.teacherAssignment.findMany({
            where: { staff_id: staff.id },
            include: {
                class: true,
                subject: true
            }
        });

        // Get recent attendance for one of their classes (as example)
        let attendanceRate = 0;
        if (assignments.length > 0) {
            const class_id = assignments[0].class_id;
            const totalStudents = await prisma.student.count({ where: { class_id, is_active: true } });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const present = await prisma.attendance.count({
                where: { class_id, date: today, status: 'PRESENT' }
            });
            attendanceRate = totalStudents > 0 ? (present / totalStudents) * 100 : 0;
        }

        // Get timetable
        const timetable = await prisma.timetable.findMany({
            where: { staff_id: staff.id },
            include: { class: true, subject: true },
            orderBy: [{ day: 'asc' }, { period_no: 'asc' }]
        });

        res.json({
            data: {
                assignments,
                attendanceRate: attendanceRate.toFixed(1),
                timetable,
                staff
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
