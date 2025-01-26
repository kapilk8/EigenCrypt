const validator = require('validator');

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize and validate request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Trim whitespace
        req.body[key] = validator.trim(req.body[key]);
        
        // Escape HTML to prevent XSS
        req.body[key] = validator.escape(req.body[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = validator.trim(req.query[key]);
        req.query[key] = validator.escape(req.query[key]);
      }
    });
  }

  next();
};

// Input validation middleware
const validateInput = (req, res, next) => {
  const errors = [];

  // Example validations (customize as per your needs)
  if (req.body.username) {
    if (!validator.isAlphanumeric(req.body.username)) {
      errors.push('Username must be alphanumeric');
    }
    if (!validator.isLength(req.body.username, { min: 3, max: 20 })) {
      errors.push('Username must be between 3 and 20 characters');
    }
  }

  if (req.body.email) {
    if (!validator.isEmail(req.body.email)) {
      errors.push('Invalid email format');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors 
    });
  }

  next();
};

module.exports = {
  sanitizeInput,
  validateInput
}; 