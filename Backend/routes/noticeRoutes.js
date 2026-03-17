const express = require('express');
const router = express.Router();
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/my', uc.getMyNotices);
router.post('/', uc.sendNotice);
router.post('/admin', uc.sendNotice);
router.post('/superuser', uc.sendNotice);
router.post('/superadmin', uc.sendNotice);

module.exports = router;
