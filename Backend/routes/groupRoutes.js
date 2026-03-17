const express = require('express');
const router = express.Router();
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', uc.getGroups);
router.post('/', uc.createGroup);
router.put('/:id', uc.updateGroup);
router.delete('/:id', uc.deleteGroup);
router.get('/removed', uc.getRemovedGroups);
router.get('/batches', uc.getGroupBatches);

module.exports = router;
