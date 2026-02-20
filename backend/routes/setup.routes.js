const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Setup endpoint - creates admin user if doesn't exist
router.post('/initialize', async (req, res) => {
    try {
        console.log('🔧 Initializing database...');

        // Create a SuperAdmin user
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const superAdmin = await prisma.user.upsert({
            where: { email: 'admin@schoolerp.com' },
            update: {},
            create: {
                name: 'Super Admin',
                email: 'admin@schoolerp.com',
                password_hash: hashedPassword,
                role: 'SUPERADMIN',
                is_active: true,
            },
        });

        console.log('✅ SuperAdmin created/updated:', {
            id: superAdmin.id,
            email: superAdmin.email,
            role: superAdmin.role,
        });

        // Create demo institution
        const institution = await prisma.institution.upsert({
            where: { code: 'DEMO-001' },
            update: {},
            create: {
                name: 'Demo International School',
                code: 'DEMO-001',
                address: '123 Education Street',
                city: 'Bangalore',
                state: 'Karnataka',
                phone: '9876543210',
                email: 'info@demoschool.edu',
                type: 'school',
                is_active: true,
                subscription: 'pro',
            },
        });

        console.log('✅ Institution created:', {
            id: institution.id,
            name: institution.name,
        });

        res.json({
            message: 'Database initialized successfully',
            admin: {
                email: superAdmin.email,
                password: 'Admin@123',
            }
        });
    } catch (error) {
        console.error('❌ Setup error:', error.message);
        res.status(500).json({ 
            message: 'Setup failed',
            error: error.message 
        });
    }
});

module.exports = router;
