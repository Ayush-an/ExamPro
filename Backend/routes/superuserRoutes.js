const express = require('express');
const router = express.Router();
const superuserController = require('../controllers/superuserController');
const { authenticateToken, restrictTo } = require('../middlewares/auth');

router.use(authenticateToken);
router.use(restrictTo('SUPERUSER'));

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard-stats', superuserController.getDashboardStats);

// ─── Groups ───────────────────────────────────────────────────────────────────
router.get('/groups', superuserController.getGroups);
router.post('/groups', superuserController.createGroup);
router.delete('/groups/:id', superuserController.removeGroup);

// ─── Participants ────────────────────────────────────────────────────────────
router.get('/participants', superuserController.getParticipants);
router.post('/participants/single', superuserController.createSingleParticipant);
router.post('/participants/upload', superuserController.upload.single('file'), superuserController.uploadParticipants);

// ─── Exams ────────────────────────────────────────────────────────────────────
router.get('/exams', superuserController.getExams);
router.post('/exams', superuserController.createExam);
router.delete('/exams/:id', superuserController.removeExam);

// ─── Notices ─────────────────────────────────────────────────────────────────
router.get('/notices', superuserController.getNotices);
router.post('/notices', superuserController.sendNotice);

router.get('/feedbacks', superuserController.getFeedbacks);
router.post('/assignments', superuserController.upload.single('file'), superuserController.createAssignment);

module.exports = router;
