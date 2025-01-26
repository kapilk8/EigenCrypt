const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Token authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Token verification failed', { error: error.message });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized access attempt by ${req.user.username}`);
      return res.status(403).json({ 
        message: 'Access denied',
        requiredRoles: roles
      });
    }

    next();
  };
};

// Ethereum signature verification
const verifyEthereumSignature = async (address, message, signature) => {
  try {
    // Verify signature matches the address
    const signerAddress = ethers.utils.verifyMessage(message, signature);
    
    // Normalize addresses for comparison (lowercase)
    return signerAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    logger.error('Ethereum signature verification failed', { error: error.message });
    return false;
  }
};

// Generate JWT with custom payload
const generateJWT = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      username: user.username || user.address, 
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      address: user.address
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  verifyEthereumSignature,
  generateJWT
}; 