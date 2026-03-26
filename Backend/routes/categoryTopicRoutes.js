const express = require('express');
const router = express.Router();
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

// Categories
router.get('/categories', uc.getCategories);
router.post('/categories', uc.createCategory);
router.put('/categories/:id', uc.updateCategory);
router.delete('/categories/:id', uc.deleteCategory);
router.get('/categories/removed', uc.getRemovedCategories);

// Topics
router.get('/topics', uc.getTopics);
router.post('/topics', uc.createTopic);
router.put('/topics/:id', uc.updateTopic);
router.delete('/topics/:id', uc.deleteTopic);
router.get('/topics/removed', uc.getRemovedTopics);

module.exports = router;
