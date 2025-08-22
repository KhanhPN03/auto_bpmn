const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const processRoutes = require('./routes/processRoutes');
const questionRoutes = require('./routes/questionRoutes');
const exportRoutes = require('./routes/exportRoutes');
const authRoutes = require('./routes/authRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
console.log('🔗 Attempting MongoDB connection...');
console.log('📍 MongoDB URI:', process.env.MONGODB_URI ? 'Configured' : 'Missing');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auto_bpmn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  console.log('📊 Database:', mongoose.connection.name);
  console.log('🏠 Host:', mongoose.connection.host);
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('💡 Check your MONGODB_URI environment variable');
  console.error('🔗 Current URI prefix:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'undefined');
  
  // Don't exit process, let the app start with limited functionality
  console.log('⚠️  Starting server without database connection...');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    port: process.env.PORT || 5000,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    apis: {
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      huggingface: process.env.HUGGINGFACE_API_KEY ? 'configured' : 'missing'
    },
    clientUrl: process.env.CLIENT_URL || 'not-set'
  });
});

// Detailed diagnostic endpoint (only in development)
app.get('/diagnostic', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Diagnostic endpoint disabled in production' });
  }
  
  res.json({
    environment: {
      node_version: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      env_vars: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        MONGODB_URI: process.env.MONGODB_URI ? 'set' : 'missing',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'set' : 'missing',
        CLIENT_URL: process.env.CLIENT_URL
      }
    },
    database: {
      state: mongoose.connection.readyState,
      name: mongoose.connection.name || 'unknown',
      host: mongoose.connection.host || 'unknown'
    }
  });
});

// Database connection check middleware
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database connection unavailable',
      error: 'Service temporarily unavailable'
    });
  }
  next();
};

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/processes', checkDatabaseConnection, processRoutes);
app.use('/api/questions', checkDatabaseConnection, questionRoutes);
app.use('/api/export', exportRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
