const express = require('express');
const router = express.Router();
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/exam/:examId', uc.getQuestionsByExam);
router.get('/available', uc.getAvailableQuestions);
router.get('/', uc.getQuestions);
router.post('/', uc.createQuestion);
router.post('/upload', uc.upload.single('file'), uc.uploadQuestions);
router.post('/link', uc.assignQuestionsToExam);
router.post('/unlink', uc.unassignQuestionFromExam);
router.delete('/:id', uc.deleteQuestion);
router.get('/batches', uc.getQuestionBatches);

module.exports = router;
