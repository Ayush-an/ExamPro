const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const historyController = require('../controllers/historyController');
const { authenticateToken, restrictTo } = require('../middlewares/auth');

router.use(authenticateToken);
router.use(restrictTo('ADMIN', 'SUPERADMIN'));

// ─── Groups ───────────────────────────────────────────────────────────────────
router.post('/groups', adminController.createGroup);
router.get('/groups', adminController.getGroups);
router.delete('/groups/:id', adminController.removeGroup);

// ─── Participants — Upload ────────────────────────────────────────────────────
router.post('/participants/upload', adminController.upload.single('file'), adminController.uploadParticipants);
router.post('/participants/single', adminController.createSingleParticipant);

// ─── Participants — Staging ───────────────────────────────────────────────────
router.get('/participants/staging', adminController.getStagingParticipants);
router.put('/participants/staging/:id', adminController.updateStagingParticipant);
router.post('/participants/staging/approve-batch', adminController.approveAllStagingBatch);
router.post('/participants/staging/:id/approve', adminController.approveStagingParticipant);
router.post('/participants/confirm', adminController.confirmParticipants); // legacy compat

// ─── Exams ────────────────────────────────────────────────────────────────────
router.post('/exams', adminController.createExam);
router.get('/exams', adminController.getExams);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/superusers', adminController.getSuperUsers);

// ─── Notices / Feedback ───────────────────────────────────────────────────────
router.get('/notices', adminController.getNotices);
router.post('/notices', adminController.sendNotice);
router.post('/feedback', adminController.sendFeedback);

// ─── History ──────────────────────────────────────────────────────────────────
router.get('/history/participants', historyController.getParticipantHistory);
router.get('/history/questions', historyController.getQuestionHistory);

module.exports = router;
