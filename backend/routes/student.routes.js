const express = require('express');
const multer = require('multer');
const {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    bulkImport,
    getStudentAttendance,
    getStudentFees,
    getStudentResults,
    getStudentDashboard,
} = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

// Student Self routes
router.get('/dashboard', authorize('STUDENT'), getStudentDashboard);

// Admin routes
router.use(authorize('ADMIN', 'SUPERADMIN'));

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', upload.single('photo'), createStudent);
router.put('/:id', upload.single('photo'), updateStudent);
router.delete('/:id', deleteStudent);
router.post('/import/bulk', upload.single('file'), bulkImport);
router.get('/:id/attendance', getStudentAttendance);
router.get('/:id/fees', getStudentFees);
router.get('/:id/results', getStudentResults);

module.exports = router;
