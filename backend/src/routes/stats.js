const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const statsController = require('../controllers/statsController');

router.use(authenticate);

router.get('/', statsController.getStats);

module.exports = router;
