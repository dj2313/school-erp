const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all leaves (filtered by status or staff)
exports.getLeaves = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { status, staff_id } = req.query;

        const where = {
            staff: { institution_id: parseInt(institution_id) }
        };
        if (status) where.status = status;
        if (staff_id) where.staff_id = parseInt(staff_id);

        const leaves = await prisma.leave.findMany({
            where,
            include: { staff: true },
            orderBy: { created_at: 'desc' }
        });

        res.json({ data: leaves });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Apply for leave (Staff perspective)
exports.applyLeave = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const { leave_type, from_date, to_date, reason } = req.body;

        const staff = await prisma.staff.findUnique({
            where: { user_id: parseInt(user_id) }
        });

        if (!staff) return res.status(404).json({ message: 'Staff profile not found' });

        const from = new Date(from_date);
        const to = new Date(to_date);
        const diffTime = Math.abs(to - from);
        const total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        const leave = await prisma.leave.create({
            data: {
                staff_id: staff.id,
                leave_type,
                from_date: from,
                to_date: to,
                total_days,
                reason,
                status: 'PENDING'
            }
        });

        res.status(201).json({ message: 'Leave applied successfully', data: leave });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update leave status (Admin/HR perspective)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body; // status: APPROVED | REJECTED
        const { id: approved_by } = req.user;

        const leave = await prisma.leave.update({
            where: { id: parseInt(id) },
            data: {
                status,
                remarks,
                approved_by: parseInt(approved_by),
                approved_at: new Date()
            }
        });

        res.json({ message: `Leave ${status.toLowerCase()} successfully`, data: leave });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
