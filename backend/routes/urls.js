const express = require('express');
const { check } = require('express-validator');
const { 
  createUrl, getUserUrls, getUrlAnalytics, 
  deleteUrl, updateUrl, getQrCode, getPublicStats,
  deleteAllUrls, bulkCreateUrls
} = require('../controllers/urlController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/urls/public/:shortCode
// @desc    Get public analytics for a short URL
router.get('/public/:shortCode', getPublicStats);

// Protect all subsequent routes in this file with JWT verification
router.use(authMiddleware);

// @route   POST /api/urls/bulk
// @desc    Bulk create short URLs
router.post('/bulk', bulkCreateUrls);

// @route   POST /api/urls
// @desc    Create a short URL
router.post(
  '/',
  [
    check('originalUrl', 'Please include a valid URL').isURL()
  ],
  createUrl
);

// @route   GET /api/urls
// @desc    Get all URLs of the logged-in user
router.get('/', getUserUrls);

// @route   PUT /api/urls/:id
// @desc    Update a short URL's original destination
router.put(
  '/:id',
  [
    check('originalUrl', 'Please include a valid URL').isURL()
  ],
  updateUrl
);

// @route   DELETE /api/urls/all
// @desc    Delete all URLs of the logged-in user
router.delete('/all', deleteAllUrls);

// @route   DELETE /api/urls/:id
// @desc    Delete a short URL
router.delete('/:id', deleteUrl);

// @route   GET /api/urls/:id/analytics
// @desc    Get analytics for a short URL
router.get('/:id/analytics', getUrlAnalytics);

// @route   GET /api/urls/:id/qr
// @desc    Get QR code base64 payload for a short URL
router.get('/:id/qr', getQrCode);

module.exports = router;
