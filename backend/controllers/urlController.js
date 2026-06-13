const { validationResult } = require('express-validator');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const Url = require('../models/Url');

// @desc    Create a short URL
// @route   POST /api/urls
// @access  Protected
const createUrl = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { originalUrl, customAlias, expiresAt } = req.body;

  try {
    let shortCode;

    // Handle Custom Alias
    if (customAlias) {
      // Clean customAlias (trim and convert to lowercase / URL safe formatting)
      const formattedAlias = customAlias.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
      if (!formattedAlias) {
        return res.status(400).json({ message: 'Custom alias contains invalid characters' });
      }

      // Check if customAlias (shortCode) is already taken
      const existingUrl = await Url.findOne({ shortCode: formattedAlias });
      if (existingUrl) {
        return res.status(400).json({ message: 'Custom alias is already in use' });
      }
      shortCode = formattedAlias;
    } else {
      // Generate unique nanoid of 7 characters
      let isUnique = false;
      while (!isUnique) {
        shortCode = nanoid(7);
        const existingUrl = await Url.findOne({ shortCode });
        if (!existingUrl) {
          isUnique = true;
        }
      }
    }

    // Build URL object
    const newUrl = new Url({
      user: req.user._id,
      originalUrl,
      shortCode,
      customAlias: customAlias ? shortCode : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    const url = await newUrl.save();
    
    // Construct the actual short URL for return
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${baseUrl}/${url.shortCode}`;

    res.status(201).json({
      ...url.toObject(),
      shortUrl
    });
  } catch (error) {
    console.error('Create URL error:', error);
    res.status(500).json({ message: 'Server error creating short URL' });
  }
};

// @desc    Get all URLs of the logged-in user
// @route   GET /api/urls
// @access  Protected
const getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    // Map with completed shortUrl fields
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const mappedUrls = urls.map(url => ({
      ...url.toObject(),
      shortUrl: `${baseUrl}/${url.shortCode}`
    }));

    res.json(mappedUrls);
  } catch (error) {
    console.error('Get My URLs error:', error);
    res.status(500).json({ message: 'Server error retrieving URLs' });
  }
};

// @desc    Update original URL
// @route   PUT /api/urls/:id
// @access  Protected
const updateUrl = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { originalUrl } = req.body;

  try {
    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Ensure user owns this URL
    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this URL' });
    }

    url.originalUrl = originalUrl;
    await url.save();

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    res.json({
      ...url.toObject(),
      shortUrl: `${baseUrl}/${url.shortCode}`
    });
  } catch (error) {
    console.error('Update URL error:', error);
    res.status(500).json({ message: 'Server error updating URL' });
  }
};

// @desc    Delete a URL
// @route   DELETE /api/urls/:id
// @access  Protected
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Ensure user owns this URL
    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this URL' });
    }

    await Url.findByIdAndDelete(req.params.id);
    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ message: 'Server error deleting URL' });
  }
};

// @desc    Get analytics for a specific URL
// @route   GET /api/urls/:id/analytics
// @access  Protected
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Ensure user owns this URL
    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this URL' });
    }

    // Determine last visited date
    let lastVisited = null;
    if (url.visits.length > 0) {
      // Find the visit with the latest timestamp
      lastVisited = new Date(
        Math.max(...url.visits.map(v => new Date(v.timestamp).getTime()))
      );
    }

    // Sort and get recent 10 visits (newest first)
    const recentVisits = [...url.visits]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    // Compute daily trend for the last 7 days (including today)
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      const dateString = targetDate.toISOString().split('T')[0];

      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Count visits that occurred within this day
      const dayClicks = url.visits.filter(visit => {
        const visitTime = new Date(visit.timestamp);
        return visitTime >= startOfDay && visitTime <= endOfDay;
      }).length;

      dailyTrend.push({
        date: dateString,
        clicks: dayClicks
      });
    }

    // Device breakdown
    const deviceStats = {};
    url.visits.forEach(v => {
      const d = v.device || 'Unknown';
      deviceStats[d] = (deviceStats[d] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceStats).map(
      ([name, value]) => ({ name, value })
    );

    // Browser breakdown
    const browserStats = {};
    url.visits.forEach(v => {
      const b = v.browser || 'Unknown';
      browserStats[b] = (browserStats[b] || 0) + 1;
    });
    const browserBreakdown = Object.entries(browserStats).map(
      ([name, value]) => ({ name, value })
    );

    // OS breakdown
    const osStats = {};
    url.visits.forEach(v => {
      const o = v.os || 'Unknown';
      osStats[o] = (osStats[o] || 0) + 1;
    });
    const osBreakdown = Object.entries(osStats).map(
      ([name, value]) => ({ name, value })
    );

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    res.json({
      originalUrl: url.originalUrl,
      shortUrl: `${baseUrl}/${url.shortCode}`,
      totalClicks: url.clicks,
      lastVisited,
      recentVisits,
      dailyTrend,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown,
      createdAt: url.createdAt
    });
  } catch (error) {
    console.error('Get Analytics error:', error);
    res.status(500).json({ message: 'Server error retrieving analytics' });
  }
};

// @desc    Get QR code for a specific URL
// @route   GET /api/urls/:id/qr
// @access  Protected
const getQrCode = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Ensure user owns this URL
    if (url.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access QR code for this URL' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${baseUrl}/${url.shortCode}`;

    // Generate QR code as a base64 Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl);

    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ message: 'Server error generating QR code' });
  }
};

// @desc    Get public analytics for a specific URL by shortCode
// @route   GET /api/urls/public/:shortCode
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    const url = await Url.findOne({ shortCode, isActive: true });
    
    if (!url) {
      return res.status(404).json({ message: 'Stats not found' });
    }

    // Daily trend last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = url.visits.filter((v) => {
        return new Date(v.timestamp).toISOString().split('T')[0] === dateStr;
      }).length;
      last7Days.push({ date: dateStr, clicks: count });
    }

    // Device breakdown
    const deviceStats = {};
    url.visits.forEach(v => {
      const d = v.device || 'Unknown';
      deviceStats[d] = (deviceStats[d] || 0) + 1;
    });
    const deviceBreakdown = Object.entries(deviceStats).map(
      ([name, value]) => ({ name, value })
    );

    // Browser breakdown
    const browserStats = {};
    url.visits.forEach(v => {
      const b = v.browser || 'Unknown';
      browserStats[b] = (browserStats[b] || 0) + 1;
    });
    const browserBreakdown = Object.entries(browserStats).map(
      ([name, value]) => ({ name, value })
    );

    // OS breakdown
    const osStats = {};
    url.visits.forEach(v => {
      const o = v.os || 'Unknown';
      osStats[o] = (osStats[o] || 0) + 1;
    });
    const osBreakdown = Object.entries(osStats).map(
      ([name, value]) => ({ name, value })
    );

    res.json({
      shortCode: url.shortCode,
      shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${url.shortCode}`,
      totalClicks: url.clicks,
      createdAt: url.createdAt,
      lastVisited: url.visits.length > 0 
        ? url.visits[url.visits.length - 1].timestamp 
        : null,
      dailyTrend: last7Days,
      deviceBreakdown,
      browserBreakdown,
      osBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public stats.' });
  }
};

const bulkCreateUrls = async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ message: 'No URLs provided.' });
    }

    if (urls.length > 50) {
      return res.status(400).json({ 
        message: 'Maximum 50 URLs allowed at once.' 
      });
    }

    const results = [];
    const errors = [];
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

    for (let i = 0; i < urls.length; i++) {
      let { originalUrl, customAlias } = urls[i];
      
      try {
        if (!originalUrl) {
          throw new Error('Original URL is required');
        }

        let formattedUrl = originalUrl.trim();
        // Auto-prepend protocol if missing
        if (!/^https?:\/\//i.test(formattedUrl)) {
          formattedUrl = 'http://' + formattedUrl;
        }

        // Validate URL structure
        new URL(formattedUrl);
        
        let shortCode;
        if (customAlias) {
          const formattedAlias = customAlias.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
          if (!formattedAlias) {
            throw new Error('Custom alias contains invalid characters');
          }

          // Check uniqueness
          const existing = await Url.findOne({ shortCode: formattedAlias });
          if (existing) {
            // fallback to random nanoid if collision
            let isUnique = false;
            while (!isUnique) {
              shortCode = nanoid(7);
              const existingUrl = await Url.findOne({ shortCode });
              if (!existingUrl) {
                isUnique = true;
              }
            }
          } else {
            shortCode = formattedAlias;
          }
        } else {
          // Generate unique nanoid of 7 characters
          let isUnique = false;
          while (!isUnique) {
            shortCode = nanoid(7);
            const existingUrl = await Url.findOne({ shortCode });
            if (!existingUrl) {
              isUnique = true;
            }
          }
        }

        const url = await Url.create({
          user: req.user._id,
          originalUrl: formattedUrl,
          shortCode,
          customAlias: customAlias ? shortCode : null,
        });

        results.push({
          originalUrl: formattedUrl,
          shortCode,
          shortUrl: `${baseUrl}/${shortCode}`,
          status: 'success'
        });
      } catch (err) {
        errors.push({
          originalUrl: originalUrl || 'Unknown URL',
          status: 'error',
          message: err.message || 'Invalid URL or alias conflict'
        });
      }
    }

    res.status(201).json({
      message: `${results.length} URLs shortened successfully.`,
      results,
      errors,
      total: urls.length,
      success: results.length,
      failed: errors.length
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ message: 'Error processing bulk URLs.' });
  }
};

const deleteAllUrls = async (req, res) => {
  try {
    await Url.deleteMany({ user: req.user._id });
    res.json({ message: 'All URLs deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting URLs.' });
  }
};

module.exports = { 
  createUrl, getUserUrls, getUrlAnalytics, 
  deleteUrl, updateUrl, getQrCode, getPublicStats,
  deleteAllUrls, bulkCreateUrls
};
