require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import route files
const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/urls');
const redirectRoutes = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.CLIENT_URL
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/urlshortener')
  .then(() => console.log('MongoDB Connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Trust proxy header if hosting behind a proxy (like Nginx/Heroku/Render) to get correct visitor IPs
app.set('trust proxy', true);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/', redirectRoutes); // Must be mounted last as it contains /:shortCode wildcard

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred'
  });
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = server; // Exported for potential testing purposes
