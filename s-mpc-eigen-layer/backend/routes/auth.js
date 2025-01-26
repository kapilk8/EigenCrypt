const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateInput, sanitizeInput } = require('../middleware/validation');
const { 
  verifyEthereumSignature, 
  generateJWT 
} = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      username: user.username, 
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

// Login/Register with Ethereum signature
router.post('/login', async (req, res) => {
  try {
    const { address, message, signature } = req.body;

    // Validate input
    if (!address || !message || !signature) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify Ethereum signature
    const isValidSignature = await verifyEthereumSignature(address, message, signature);
    if (!isValidSignature) {
      logger.warn(`Invalid signature for address: ${address}`);
      return res.status(401).json({ message: 'Invalid signature' });
    }

    // Find or create user
    let user = await User.findOne({ address: address.toLowerCase() });
    
    if (!user) {
      user = new User({ 
        address: address.toLowerCase(),
        // First user becomes admin
        isAdmin: await User.countDocuments() === 0 
      });
      await user.save();
      logger.info(`New user registered: ${address}`);
    }

    // Generate JWT
    const token = generateJWT(user);

    res.status(200).json({ 
      token, 
      user: { 
        address: user.address, 
        isAdmin: user.isAdmin 
      } 
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Registration Route
router.post('/register', sanitizeInput, validateInput, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username or email already exists' 
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// Login Route
router.post('/login', sanitizeInput, validateInput, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user and validate credentials
    const user = await User.findByCredentials(username, password);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      message: 'Authentication failed', 
      error: error.message 
    });
  }
});

module.exports = router; 