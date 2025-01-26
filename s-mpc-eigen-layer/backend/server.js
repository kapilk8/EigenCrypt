const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./utils/mongodb');
require('dotenv').config({ path: '../.env.local' });
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sanitizeInput, validateInput } = require('./middleware/validation');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const notificationRoutes = require('./routes/notifications');
const net = require('net');

// Performance optimizations
mongoose.set('strictQuery', false);

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware with performance considerations
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Add sanitization and validation middleware globally
app.use(sanitizeInput);

// Connect to MongoDB with timeout
const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: 'admin',
      ssl: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    setTimeout(connectWithRetry, 5000);
  }
};
connectWithRetry();

// Health check route
app.get('/api/health', async (req, res) => {
  try {
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        server: 'Running'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: process.env.NODE_ENV !== 'production' ? error.message : 'Internal server error'
    });
  }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is running!',
    status: 'active',
    endpoints: [
      '/api/health',
      '/api/status',
      '/api/login'
    ]
  });
});

// Status route
app.get('/api/status', authenticateToken, (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Login route (example)
app.post('/api/login', validateInput, (req, res) => {
  // TODO: Replace with actual user authentication
  const username = req.body.username;
  const user = { name: username };

  const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  res.json({ accessToken });
});

// Mount authentication routes
app.use('/api/auth', authRoutes);

// Mount task routes
app.use('/api/tasks', taskRoutes);

// Mount project routes
app.use('/api/projects', projectRoutes);

// Mount notification routes
app.use('/api/notifications', notificationRoutes);

// Detailed error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    body: req.body,
    query: req.query,
    headers: req.headers
  });

  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV !== 'production' ? {
      message: err.message,
      stack: err.stack
    } : 'Unexpected error occurred'
  });
});

// Catch-all route for undefined routes
app.use((req, res, next) => {
  console.warn(`Undefined route accessed: ${req.method} ${req.path}`);
  res.status(404).json({
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Backend server shutting down gracefully');
  process.exit(0);
});

// Enhanced server startup with multiple port attempts
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};

const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(process.env.PORT || 5001);
    
    const server = app.listen(availablePort, () => {
      console.log(`Backend server running on port ${availablePort}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    return server;
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

const server = startServer();

module.exports = app; 