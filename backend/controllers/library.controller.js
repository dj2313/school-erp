const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all books
exports.getBooks = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const { search = '', category = '' } = req.query;

        const where = { institution_id: parseInt(institution_id) };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { author: { contains: search, mode: 'insensitive' } },
                { isbn: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) where.category = category;

        const books = await prisma.book.findMany({
            where,
            orderBy: { title: 'asc' }
        });
        res.json({ data: books });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add new book
exports.addBook = async (req, res) => {
    try {
        const { institution_id } = req.user;
        const data = req.body;

        const book = await prisma.book.create({
            data: {
                ...data,
                institution_id: parseInt(institution_id),
                copies_total: parseInt(data.copies_total || 1),
                copies_available: parseInt(data.copies_total || 1),
                price: data.price ? parseFloat(data.price) : null
            }
        });
        res.status(201).json({ data: book, message: 'Book added to library' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Issue book
exports.issueBook = async (req, res) => {
    try {
        const { book_id, student_id, staff_id, due_date } = req.body;

        const book = await prisma.book.findUnique({ where: { id: parseInt(book_id) } });
        if (!book || book.copies_available <= 0) {
            return res.status(400).json({ message: 'Book not available' });
        }

        const transaction = await prisma.$transaction([
            prisma.libraryTransaction.create({
                data: {
                    book_id: parseInt(book_id),
                    student_id: student_id ? parseInt(student_id) : null,
                    staff_id: staff_id ? parseInt(staff_id) : null,
                    due_date: new Date(due_date),
                    status: 'ISSUED'
                }
            }),
            prisma.book.update({
                where: { id: parseInt(book_id) },
                data: { copies_available: { decrement: 1 } }
            })
        ]);

        res.status(201).json({ data: transaction[0], message: 'Book issued successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Return book
exports.returnBook = async (req, res) => {
    try {
        const { transaction_id, fine_amount = 0 } = req.body;

        const transaction = await prisma.libraryTransaction.findUnique({
            where: { id: parseInt(transaction_id) }
        });

        if (!transaction || transaction.status !== 'ISSUED') {
            return res.status(400).json({ message: 'Invalid transaction' });
        }

        const result = await prisma.$transaction([
            prisma.libraryTransaction.update({
                where: { id: parseInt(transaction_id) },
                data: {
                    return_date: new Date(),
                    status: 'RETURNED',
                    fine_amount: parseFloat(fine_amount)
                }
            }),
            prisma.book.update({
                where: { id: transaction.book_id },
                data: { copies_available: { increment: 1 } }
            })
        ]);

        res.json({ message: 'Book returned successfully', data: result[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get library history for student
exports.getStudentHistory = async (req, res) => {
    try {
        const { id: user_id } = req.user;
        const student = await prisma.student.findUnique({ where: { user_id: parseInt(user_id) } });

        if (!student) return res.status(404).json({ message: 'Student not found' });

        const history = await prisma.libraryTransaction.findMany({
            where: { student_id: student.id },
            include: { book: true },
            orderBy: { issue_date: 'desc' }
        });
        res.json({ data: history });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
