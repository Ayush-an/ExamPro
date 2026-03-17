const express = require('express');
const router = express.Router();
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/my', uc.getMyFeedback);
router.post('/admin', uc.sendFeedback);
router.post('/participant', uc.sendFeedback);

module.exports = router;
