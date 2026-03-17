const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.post('/register-organization', publicController.registerOrganization);
router.get('/plans', publicController.getPlans);

module.exports = router;
