const express = require('express');
const router = express.Router();

const {
  getAnalyticsSummary,
  getCategoryAnalytics,
  getMonthlyAnalytics,
  getAnalyticsReports,
} = require('../controllers/analyticsController');

router.get('/summary', getAnalyticsSummary);
router.get('/categories', getCategoryAnalytics);
router.get('/monthly', getMonthlyAnalytics);
router.get('/reports', getAnalyticsReports);

module.exports = router;
