const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Get all staff
exports.getStaff = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const staff = await prisma.staff.findMany({
            where: { institution_id: parseInt(institution_id) },
            include: { user: true },
            orderBy: { created_at: 'desc' },
        });
        res.json({ data: staff });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create staff
exports.createStaff = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const {
            first_name,
            last_name,
            email,
            phone,
            password,
            role,
            employee_code,
            designation,
            department,
            joining_date,
            salary,
            gender,
            dob,
            address,
            qualification
        } = req.body;

        // 1. Create User
        const hashedPassword = await bcrypt.hash(password || 'Staff@123', 10);

        // Use a transaction to ensure both are created
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    institution_id: parseInt(institution_id),
                    name: `${first_name} ${last_name}`,
                    email,
                    phone,
                    password_hash: hashedPassword,
                    role: role || 'TEACHER',
                }
            });

            const staff = await tx.staff.create({
                data: {
                    institution_id: parseInt(institution_id),
                    user_id: user.id,
                    employee_code,
                    first_name,
                    last_name,
                    email,
                    phone,
                    designation,
                    department,
                    joining_date: new Date(joining_date),
                    salary: parseFloat(salary),
                    gender,
                    dob: dob ? new Date(dob) : null,
                    address,
                    qualification,
                },
                include: { user: true }
            });

            return staff;
        });

        res.status(201).json({ message: 'Staff created successfully', data: result });
    } catch (err) {
        if (err.code === 'P2002') return res.status(400).json({ message: 'Email or Employee Code already exists' });
        res.status(500).json({ message: err.message });
    }
};

// Update staff
exports.updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const staff = await prisma.staff.update({
            where: { id: parseInt(id) },
            data: {
                ...updateData,
                salary: updateData.salary ? parseFloat(updateData.salary) : undefined,
                joining_date: updateData.joining_date ? new Date(updateData.joining_date) : undefined,
                dob: updateData.dob ? new Date(updateData.dob) : undefined,
            },
        });

        res.json({ message: 'Staff updated successfully', data: staff });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete staff (Soft delete?)
exports.deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;

        // For educational purposes, we'll mark as inactive
        await prisma.staff.update({
            where: { id: parseInt(id) },
            data: { is_active: false }
        });

        res.json({ message: 'Staff deactivated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
