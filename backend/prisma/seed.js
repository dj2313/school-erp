const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

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

    console.log('✅ SuperAdmin created:', {
        id: superAdmin.id,
        email: superAdmin.email,
        role: superAdmin.role,
    });

    // Create a sample institution
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
        code: institution.code,
    });

    // Create an Institute Admin user linked to the institution
    const adminPassword = await bcrypt.hash('Admin@123', 10);

    const instituteAdmin = await prisma.user.upsert({
        where: { email: 'principal@demoschool.edu' },
        update: {},
        create: {
            name: 'Dr. Rajesh Kumar',
            email: 'principal@demoschool.edu',
            password_hash: adminPassword,
            role: 'ADMIN',
            is_active: true,
            institution_id: institution.id,
        },
    });

    console.log('✅ Institute Admin created:', {
        id: instituteAdmin.id,
        email: instituteAdmin.email,
        role: instituteAdmin.role,
        institution_id: instituteAdmin.institution_id,
    });

    // Create a Teacher user
    const teacherPassword = await bcrypt.hash('Admin@123', 10);

    const teacherUser = await prisma.user.upsert({
        where: { email: 'teacher@demoschool.edu' },
        update: {},
        create: {
            name: 'Priya Sharma',
            email: 'teacher@demoschool.edu',
            password_hash: teacherPassword,
            role: 'TEACHER',
            is_active: true,
            institution_id: institution.id,
        },
    });

    console.log('✅ Teacher created:', {
        id: teacherUser.id,
        email: teacherUser.email,
        role: teacherUser.role,
    });

    // Create an Accountant user
    const accountantPassword = await bcrypt.hash('Admin@123', 10);

    const accountantUser = await prisma.user.upsert({
        where: { email: 'accountant@demoschool.edu' },
        update: {},
        create: {
            name: 'Vikram Singh',
            email: 'accountant@demoschool.edu',
            password_hash: accountantPassword,
            role: 'ACCOUNTANT',
            is_active: true,
            institution_id: institution.id,
        },
    });

    console.log('✅ Accountant created:', {
        id: accountantUser.id,
        email: accountantUser.email,
        role: accountantUser.role,
    });

    console.log('\n📋 Test Credentials:');
    console.log('──────────────────────────────────────────');
    console.log('  SuperAdmin:  admin@schoolerp.com        / Admin@123');
    console.log('  Admin:       principal@demoschool.edu    / Admin@123');
    console.log('  Teacher:     teacher@demoschool.edu      / Admin@123');
    console.log('  Accountant:  accountant@demoschool.edu   / Admin@123');
    console.log('──────────────────────────────────────────');
    console.log('\n🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
