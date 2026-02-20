const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', class_id = '', section = '', status = '' } = req.query;
        const { institution_id } = req.user;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter
        const where = { institution_id: parseInt(institution_id) };

        if (search) {
            where.OR = [
                { first_name: { contains: search, mode: 'insensitive' } },
                { last_name: { contains: search, mode: 'insensitive' } },
                { admission_no: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (class_id) where.class_id = parseInt(class_id);
        if (section) where.class = { section: { contains: section, mode: 'insensitive' } };
        if (status === 'active') where.is_active = true;
        if (status === 'inactive') where.is_active = false;

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                skip,
                take: parseInt(limit),
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    admission_no: true,
                    roll_no: true,
                    photo_url: true,
                    father_phone: true,
                    mother_phone: true,
                    is_active: true,
                    category: true,
                    admission_date: true,
                    class: {
                        select: {
                            id: true,
                            name: true,
                            section: true,
                        },
                    },
                },
                orderBy: { admission_date: 'desc' },
            }),
            prisma.student.count({ where }),
        ]);

        res.json({
            data: students,
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

exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { institution_id } = req.user;

        const student = await prisma.student.findFirst({
            where: { id: parseInt(id), institution_id: parseInt(institution_id) },
            include: {
                class: true,
                attendance: {
                    select: { id: true, date: true, status: true },
                    orderBy: { date: 'desc' },
                    take: 30,
                },
                fee_invoices: {
                    select: { id: true, amount: true, paid_amount: true, due_date: true, status: true },
                    orderBy: { created_at: 'desc' },
                    take: 10,
                },
                exam_results: {
                    include: { exam: true },
                    orderBy: { created_at: 'desc' },
                    take: 10,
                },
                documents: {
                    select: { id: true, document_type: true, file_url: true, uploaded_at: true },
                },
            },
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Calculate attendance summary
        const attendanceStats = {
            total: student.attendance.length,
            present: student.attendance.filter(a => a.status === 'Present').length,
            absent: student.attendance.filter(a => a.status === 'Absent').length,
            late: student.attendance.filter(a => a.status === 'Late').length,
        };

        // Calculate fee summary
        const feeSummary = {
            total_invoices: student.fee_invoices.length,
            total_amount: student.fee_invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
            total_paid: student.fee_invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0),
            pending: student.fee_invoices.reduce((sum, inv) => sum + ((inv.amount || 0) - (inv.paid_amount || 0)), 0),
        };

        res.json({
            data: {
                ...student,
                attendance_stats: attendanceStats,
                fee_summary: feeSummary,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createStudent = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const {
            first_name,
            last_name,
            admission_no,
            roll_no,
            dob,
            gender,
            blood_group,
            address,
            phone,
            email,
            father_name,
            father_phone,
            father_email,
            mother_name,
            mother_phone,
            guardian_name,
            guardian_phone,
            class_id,
            category,
            photo_url,
        } = req.body;

        // Check if admission_no is unique
        if (admission_no) {
            const existing = await prisma.student.findUnique({
                where: { admission_no },
            });
            if (existing) {
                return res.status(400).json({ message: 'Admission number already exists' });
            }
        }

        // Handle photo upload
        let finalPhotoUrl = photo_url;
        if (req.file) {
            finalPhotoUrl = `/uploads/${req.file.filename}`;
        }

        const student = await prisma.student.create({
            data: {
                institution_id: parseInt(institution_id),
                first_name,
                last_name,
                admission_no,
                roll_no,
                dob: dob ? new Date(dob) : null,
                gender,
                blood_group,
                address,
                phone,
                email,
                father_name,
                father_phone,
                father_email,
                mother_name,
                mother_phone,
                guardian_name,
                guardian_phone,
                class_id: class_id ? parseInt(class_id) : null,
                category,
                photo_url: finalPhotoUrl,
                is_active: true,
            },
            include: { class: true },
        });

        res.status(201).json({
            message: 'Student created successfully',
            data: student,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { institution_id } = req.user;

        // Verify student belongs to institution
        const existing = await prisma.student.findFirst({
            where: { id: parseInt(id), institution_id: parseInt(institution_id) },
        });
        if (!existing) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { admission_no, ...updateData } = req.body;

        // If admission_no is being updated, check uniqueness
        if (admission_no && admission_no !== existing.admission_no) {
            const duplicate = await prisma.student.findUnique({
                where: { admission_no },
            });
            if (duplicate) {
                return res.status(400).json({ message: 'Admission number already exists' });
            }
        }

        // Handle photo upload
        let finalPhotoUrl = updateData.photo_url;
        if (req.file) {
            finalPhotoUrl = `/uploads/${req.file.filename}`;
        }

        const student = await prisma.student.update({
            where: { id: parseInt(id) },
            data: {
                ...updateData,
                admission_no: admission_no || undefined,
                dob: updateData.dob ? new Date(updateData.dob) : undefined,
                class_id: updateData.class_id ? parseInt(updateData.class_id) : undefined,
                photo_url: finalPhotoUrl || undefined,
            },
            include: { class: true },
        });

        res.json({
            message: 'Student updated successfully',
            data: student,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { institution_id } = req.user;

        const student = await prisma.student.findFirst({
            where: { id: parseInt(id), institution_id: parseInt(institution_id) },
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Soft delete
        await prisma.student.update({
            where: { id: parseInt(id) },
            data: { is_active: false },
        });

        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.bulkImport = async (req, res) => {
    try {
        const { institution_id } = req.user;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const XLSX = require('xlsx');
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(sheetName);

        const created = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            try {
                const row = data[i];

                // Check if admission_no exists
                const existing = await prisma.student.findUnique({
                    where: { admission_no: row.admission_no },
                });

                if (existing) {
                    errors.push(`Row ${i + 2}: Admission number ${row.admission_no} already exists`);
                    continue;
                }

                const student = await prisma.student.create({
                    data: {
                        institution_id: parseInt(institution_id),
                        first_name: row.first_name || '',
                        last_name: row.last_name || '',
                        admission_no: row.admission_no,
                        roll_no: row.roll_no,
                        dob: row.dob ? new Date(row.dob) : null,
                        gender: row.gender,
                        blood_group: row.blood_group,
                        address: row.address,
                        phone: row.phone,
                        email: row.email,
                        father_name: row.father_name,
                        father_phone: row.father_phone,
                        father_email: row.father_email,
                        mother_name: row.mother_name,
                        mother_phone: row.mother_phone,
                        guardian_name: row.guardian_name,
                        guardian_phone: row.guardian_phone,
                        class_id: row.class_id ? parseInt(row.class_id) : null,
                        category: row.category,
                        is_active: true,
                    },
                });

                created.push(student);
            } catch (rowErr) {
                errors.push(`Row ${i + 2}: ${rowErr.message}`);
            }
        }

        res.json({
            message: `${created.length} students imported successfully`,
            created: created.length,
            errors: errors.length > 0 ? errors : null,
            total_processed: data.length,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getStudentAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const attendance = await prisma.attendance.findMany({
            where: { student_id: parseInt(id) },
            orderBy: { date: 'desc' },
        });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getStudentFees = async (req, res) => {
    try {
        const { id } = req.params;
        const fees = await prisma.feeInvoice.findMany({
            where: { student_id: parseInt(id) },
            orderBy: { created_at: 'desc' },
        });
        res.json(fees);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getStudentResults = async (req, res) => {
    try {
        const { id } = req.params;
        const results = await prisma.examResult.findMany({
            where: { student_id: parseInt(id) },
            include: { exam: true },
            orderBy: { created_at: 'desc' },
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.getStudentDashboard = async (req, res) => {
    try {
        const { id: user_id, institution_id } = req.user;

        const student = await prisma.student.findUnique({
            where: { user_id: parseInt(user_id) },
            include: {
                class: {
                    include: {
                        academic_year: true,
                        timetable: {
                            include: { subject: true, staff: true }
                        }
                    }
                },
                attendance: {
                    where: {
                        date: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    },
                    orderBy: { date: 'desc' }
                },
                fee_invoices: {
                    where: { status: { not: 'PAID' } },
                    take: 5
                },
                exam_results: {
                    include: { exam: true, subject: true },
                    take: 10,
                    orderBy: { created_at: 'desc' }
                }
            }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student profile not linked to this user.' });
        }

        res.json({ data: student });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
