const express = require('express');
const {
    getAllInstitutions,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    assignAdmin
} = require('../controllers/institution.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes protected and restricted to SUPERADMIN
router.use(protect, authorize('SUPERADMIN'));

router.get('/', getAllInstitutions);
router.post('/', createInstitution);
router.put('/:id', updateInstitution);
router.delete('/:id', deleteInstitution);
router.post('/:id/admin', assignAdmin);

module.exports = router;
