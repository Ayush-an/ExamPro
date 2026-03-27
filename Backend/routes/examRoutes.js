const express = require('express');
const router = express.Router();
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', uc.getExams);
router.post('/', uc.createExam);
router.put('/:id', uc.updateExam);
router.delete('/:id', uc.deleteExam);
router.get('/removed/list', uc.getRemovedExams);
router.post('/:id/restore', uc.restoreExam);
router.post('/:id/submit', uc.submitExam);
router.post('/:id/assign-questions', uc.assignQuestionsToExam);
router.delete('/:examId/questions/:questionId', uc.unassignQuestionFromExam);

module.exports = router;
