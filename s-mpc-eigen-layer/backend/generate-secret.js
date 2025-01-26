const crypto = require('crypto');

function generateSecureSecret() {
  // Generate a cryptographically secure random secret
  const secret = crypto.randomBytes(64).toString('hex');
  console.log('Generated Secure Secret:', secret);
  return secret;
}

// Only run if called directly
if (require.main === module) {
  generateSecureSecret();
}

module.exports = { generateSecureSecret }; 