const express = require('express');
const router = express.Router();
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/exam/:examId', uc.getQuestionsByExam);
router.post('/', uc.createQuestion);
router.post('/upload/:examId', uc.upload.single('file'), uc.uploadQuestions);
router.delete('/:id', uc.deleteQuestion);
router.get('/batches', uc.getQuestionBatches);

module.exports = router;
