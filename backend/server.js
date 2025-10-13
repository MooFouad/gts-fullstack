const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Validate environment variables
const validateEnv = require('./config/validateEnv');
validateEnv();

// Error handlers
const { errorHandler, handleUnhandledRejection, handleUncaughtException } = require('./middleware/errorHandler');

// Authentication middleware
const { authenticate, authorize } = require('./middleware/auth');

// Notification scheduler
const notificationScheduler = require('./services/notificationScheduler');

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

const app = express();

// MongoDB connection options
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  family: 4
};

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Rate limiting for auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 in production, 50 in development
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.DISABLE_RATE_LIMIT === 'true' // Allow disabling for testing
});

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);

// Public routes (no authentication required)
app.use('/api/auth', require('./routes/authRoutes'));

// Health Check (public)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date(),
    routes: {
      auth: '/api/auth',
      vehicles: '/api/vehicles',
      homeRents: '/api/home-rents',
      electricity: '/api/electricity',
      notifications: '/api/notifications',
      import: '/api/import'
    }
  });
});

// Protected routes (authentication required)
// You can add role-based authorization like: authenticate, authorize('admin', 'user')
app.use('/api/vehicles', authenticate, require('./routes/vehicleRoutes'));
app.use('/api/home-rents', authenticate, require('./routes/homeRentRoutes'));
app.use('/api/electricity', authenticate, require('./routes/electricityRoutes'));
app.use('/api/notifications', authenticate, require('./routes/notificationRoutes'));
app.use('/api/import', authenticate, authorize('admin', 'user'), require('./routes/importRoutes'));

// Use centralized error handler
app.use(errorHandler);

// Handle 404s
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.path);
  res.status(404).json({ 
    error: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      '/api/auth',
      '/api/vehicles',
      '/api/home-rents',
      '/api/electricity',
      '/api/notifications',
      '/api/import'
    ]
  });
});

// Start server
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
      console.log(`🚗 Vehicles: http://localhost:${PORT}/api/vehicles`);
      console.log(`🏠 Home Rents: http://localhost:${PORT}/api/home-rents`);
      console.log(`⚡ Electricity: http://localhost:${PORT}/api/electricity`);

      // Start notification scheduler
      notificationScheduler.start();
    });
    
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', handleUnhandledRejection);