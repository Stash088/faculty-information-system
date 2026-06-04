/**
 * Маршруты контента лендинга абитуриента
 * @module routes/applicantContent
 */

const express = require('express');
const router = express.Router();
const {
  getApplicantContent,
  updateApplicantContent,
} = require('../controllers/applicantContentController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.get('/', authenticate, getApplicantContent);
router.put('/', authenticate, requireAdmin, updateApplicantContent);

module.exports = router;
