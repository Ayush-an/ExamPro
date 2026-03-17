const express = require('express');
const router = express.Router();
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.post('/', uc.upload.single('file'), uc.createAssignment);
router.get('/group/:groupId', uc.getAssignmentsByGroup);

module.exports = router;
