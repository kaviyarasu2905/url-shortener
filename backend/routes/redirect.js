const express = require('express');
const Url = require('../models/Url');
const parseUserAgent = require('../utils/deviceParser');

const router = express.Router();

// HTML template helper for 404 page
const render404Page = (message) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkSnip - Link Not Found</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 flex items-center justify-center min-h-screen p-4">
  <div class="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
    <div class="mx-auto w-16 h-16 bg-rose-50 border border-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-6">
      <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Link Not Found</h1>
    <p class="mt-3 text-sm text-slate-500">${message}</p>
    <div class="mt-8">
      <a href="http://localhost:5173" class="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all">
        Go to LinkSnip
      </a>
    </div>
  </div>
</body>
</html>
`;

// @route   GET /:shortCode
// @desc    Redirect to original URL and record visit analytics
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find the URL in the database
    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).send(render404Page('The short link you clicked could not be found. Please double-check the URL.'));
    }

    // Check if the URL is marked as active
    if (!url.isActive) {
      return res.status(404).send(render404Page('This short link is currently inactive or deactivated by its owner.'));
    }

    // Check if the URL has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
      // Auto-deactivate expired URLs
      url.isActive = false;
      await url.save();
      return res.status(404).send(render404Page('This short link has expired and is no longer available.'));
    }

    // Gather requester analytics
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const { device, browser, os } = parseUserAgent(userAgent);

    // Increment click counts and push new visit record
    url.clicks += 1;
    url.visits.push({
      timestamp: new Date(),
      ip,
      userAgent,
      device,
      browser,
      os
    });

    await url.save();

    // Ensure the original destination has a valid protocol prefix for external redirect
    let destinationUrl = url.originalUrl;
    if (!/^https?:\/\//i.test(destinationUrl)) {
      destinationUrl = `http://${destinationUrl}`;
    }

    // Perform HTTP 302 redirect
    return res.redirect(destinationUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ message: 'Server error during redirection' });
  }
});

module.exports = router;
