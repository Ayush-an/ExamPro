const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const { authenticateToken, restrictTo } = require('../middlewares/auth');

router.use(authenticateToken);
router.use(restrictTo('SUPERADMIN'));

router.get('/dashboard', superadminController.getDashboardStats);
router.get('/organizations', superadminController.getOrganizations);
router.get('/transactions', superadminController.getTransactions);
router.post('/plans', superadminController.createPlan);
router.get('/plans', superadminController.getPlans);
router.put('/plans/:id', superadminController.updatePlan);
router.delete('/plans/:id', superadminController.deletePlan);

// ─── New routes ───────────────────────────────────────────────────────────────
router.get('/admins', superadminController.getAdmins);
router.get('/stats', superadminController.getSuperadminStats);
router.get('/list/:type', superadminController.getListByType);

module.exports = router;
