const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadminController');
const { authenticateToken, restrictTo } = require('../middlewares/auth');

router.use(authenticateToken);
router.use(restrictTo('SUPERADMIN'));

router.get('/dashboard', superadminController.getDashboardStats);
router.get('/organizations', superadminController.getOrganizations);
router.get('/organizations/:id', superadminController.getOrganizationDetails);
router.get('/transactions', superadminController.getTransactions);
router.post('/plans', superadminController.createPlan);
router.get('/plans', superadminController.getPlans);
router.put('/plans/:id', superadminController.updatePlan);
router.delete('/plans/:id', superadminController.deletePlan);

// Coupon routes
router.post('/coupons', superadminController.createCoupon);
router.get('/coupons', superadminController.getCoupons);
router.put('/coupons/:id', superadminController.updateCoupon);
router.delete('/coupons/:id', superadminController.deleteCoupon);

// ─── New routes ───────────────────────────────────────────────────────────────
router.get('/admins', superadminController.getAdmins);
router.get('/stats', superadminController.getSuperadminStats);
router.get('/list/:type', superadminController.getListByType);

// Profile routes
router.get('/profile', superadminController.getProfile);
router.put('/profile', superadminController.updateProfile);
router.put('/profile/password', superadminController.updatePassword);
router.post('/profile/photo', superadminController.uploadPhoto);

module.exports = router;
