const express = require('express');
const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/class.controller');
const { getSubjects, createSubject, assignToClass } = require('../controllers/subject.controller');
const { getAcademicYears, createAcademicYear } = require('../controllers/academic-year.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Classes
router.get('/classes', getClasses);
router.post('/classes', authorize('ADMIN', 'SUPERADMIN'), createClass);
router.put('/classes/:id', authorize('ADMIN', 'SUPERADMIN'), updateClass);
router.delete('/classes/:id', authorize('ADMIN', 'SUPERADMIN'), deleteClass);

// Subjects
router.get('/subjects', getSubjects);
router.post('/subjects', authorize('ADMIN', 'SUPERADMIN'), createSubject);
router.post('/subjects/assign', authorize('ADMIN', 'SUPERADMIN'), assignToClass);

// Academic Years
router.get('/years', getAcademicYears);
router.post('/years', authorize('ADMIN', 'SUPERADMIN'), createAcademicYear);

module.exports = router;
