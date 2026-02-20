const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllInstitutions = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', type = '', status = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (type) where.type = type;
        if (status === 'active') where.is_active = true;
        if (status === 'inactive') where.is_active = false;

        const [institutions, total] = await Promise.all([
            prisma.institution.findMany({
                where,
                skip,
                take: parseInt(limit),
                select: {
                    id: true,
                    name: true,
                    code: true,
                    city: true,
                    state: true,
                    type: true,
                    subscription: true,
                    is_active: true,
                    email: true,
                    phone: true,
                    created_at: true,
                    _count: { select: { users: true, students: true } },
                },
                orderBy: { created_at: 'desc' },
            }),
            prisma.institution.count({ where }),
        ]);

        res.json({
            data: institutions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createInstitution = async (req, res) => {
    try {
        const { name, code, address, city, state, phone, email, type, subscription } = req.body;

        // Check if code already exists
        const existing = await prisma.institution.findUnique({ where: { code } });
        if (existing) return res.status(400).json({ message: 'Institution code already exists' });

        const institution = await prisma.institution.create({
            data: {
                name,
                code,
                address,
                city,
                state,
                phone,
                email,
                type: type || 'school',
                subscription: subscription || 'basic',
                is_active: true,
            },
        });

        res.status(201).json({ message: 'Institution created successfully', data: institution });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateInstitution = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, address, city, state, phone, email, type, subscription, is_active } = req.body;

        const institution = await prisma.institution.update({
            where: { id: parseInt(id) },
            data: {
                ...(name && { name }),
                ...(code && { code }),
                ...(address && { address }),
                ...(city && { city }),
                ...(state && { state }),
                ...(phone && { phone }),
                ...(email && { email }),
                ...(type && { type }),
                ...(subscription && { subscription }),
                ...(is_active !== undefined && { is_active }),
            },
        });

        res.json({ message: 'Institution updated successfully', data: institution });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteInstitution = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if institution has active users
        const userCount = await prisma.user.count({
            where: { institution_id: parseInt(id) },
        });

        if (userCount > 0) {
            return res.status(400).json({ message: 'Cannot delete institution with active users. Delete users first.' });
        }

        await prisma.institution.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Institution deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.assignAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, password } = req.body;

        // Check if institution exists
        const institution = await prisma.institution.findUnique({ where: { id: parseInt(id) } });
        if (!institution) return res.status(404).json({ message: 'Institution not found' });

        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User with this email already exists' });

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password_hash: passwordHash,
                role: 'ADMIN',
                institution_id: parseInt(id),
                is_active: true,
            },
        });

        res.status(201).json({
            message: 'Admin assigned successfully',
            data: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
