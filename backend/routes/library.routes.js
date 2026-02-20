const express = require('express');
const { 
    getBooks, 
    addBook, 
    issueBook, 
    returnBook, 
    getStudentHistory 
} = require('../controllers/library.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Student Portal Routes
router.get('/my-history', authorize('STUDENT'), getStudentHistory);

// Admin / Librarian Routes
router.get('/', authorize('ADMIN', 'SUPERADMIN', 'LIBRARIAN'), getBooks);
router.post('/', authorize('ADMIN', 'SUPERADMIN', 'LIBRARIAN'), addBook);
router.post('/issue', authorize('ADMIN', 'SUPERADMIN', 'LIBRARIAN'), issueBook);
router.post('/return', authorize('ADMIN', 'SUPERADMIN', 'LIBRARIAN'), returnBook);

module.exports = router;
