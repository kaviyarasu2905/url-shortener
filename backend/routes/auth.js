const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register user and return JWT
router.post(
  '/signup',
  [
    check('name', 'Name is required').notEmpty().trim(),
    check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  authController.signup
);

// @route   POST /api/auth/login
// @desc    Authenticate user and return JWT
router.post(
  '/login',
  [
    check('email', 'Please include a valid email address').isEmail().normalizeEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   GET /api/auth/me
// @desc    Get current user details
router.get('/me', authMiddleware, authController.getMe);

// @route   PUT /api/auth/profile
// @desc    Update profile name
router.put(
  '/profile',
  authMiddleware,
  [
    check('name', 'Name is required').notEmpty().trim()
  ],
  authController.updateProfile
);

// @route   PUT /api/auth/password
// @desc    Update password
router.put(
  '/password',
  authMiddleware,
  [
    check('currentPassword', 'Current password is required').notEmpty(),
    check('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 })
  ],
  authController.updatePassword
);

// @route   DELETE /api/auth/account
// @desc    Delete user account
router.delete('/account', authMiddleware, authController.deleteAccount);

module.exports = router;
