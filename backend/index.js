const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes placeholder
app.get('/', (req, res) => {
    res.json({ message: 'School ERP API is running...' });
});

// Import and use routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/superadmin', require('./routes/superadmin.routes'));
app.use('/api/superadmin/institutions', require('./routes/institution.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/academic', require('./routes/academic.routes'));
app.use('/api/fees', require('./routes/fees.routes'));
app.use('/api/staff', require('./routes/staff.routes'));
app.use('/api/leaves', require('./routes/leave.routes'));
app.use('/api/payroll', require('./routes/payroll.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/teacher', require('./routes/teacher.routes'));
app.use('/api/timetable', require('./routes/timetable.routes'));
app.use('/api/exams', require('./routes/exam.routes'));
// app.use('/api/attendance', require('./routes/attendance.routes'));
// app.use('/api/fees', require('./routes/fee.routes'));
// app.use('/api/attendance', require('./routes/attendance.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
