const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const uc = require('../controllers/unifiedController');
const { authenticateToken } = require('../middlewares/auth');

// Public participant routes (no auth required)
router.post('/login', authController.login);

// Protected routes
router.use(authenticateToken);

router.get('/exams', participantController.getParticipantExams);
router.get('/notices', participantController.getMyNotices);
router.get('/', uc.getParticipants);
router.post('/register', adminController.createSingleParticipant);
router.put('/me', uc.updateMyProfile);
router.put('/:id', uc.updateParticipant);
router.delete('/:id', uc.deleteParticipant);
router.get('/removed', uc.getRemovedParticipants);
router.get('/staging', adminController.getStagingParticipants);
router.get('/batch/:batchCode', uc.getParticipantsBatch);
router.get('/batches', uc.getUploadBatches);
router.post('/upload', adminController.upload.single('file'), adminController.uploadParticipants);

module.exports = router;
