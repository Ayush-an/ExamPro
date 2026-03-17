const express = require('express');
const router = express.Router();
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/participant/me', uc.getMyResults);
router.get('/participant/:participantId', uc.getResultsByParticipant);

module.exports = router;
