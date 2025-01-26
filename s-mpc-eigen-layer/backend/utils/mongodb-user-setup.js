const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function createMongoUser() {
  try {
    // Connect to MongoDB without authentication first
    await mongoose.connect('mongodb://localhost:27017/smpc-eigenlayer', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Use the admin database to create a new user
    const db = mongoose.connection.db.admin();
    
    await db.addUser(process.env.MONGODB_USERNAME, process.env.MONGODB_PASSWORD, {
      roles: [
        { role: 'readWrite', db: 'smpc-eigenlayer' },
        { role: 'dbAdmin', db: 'smpc-eigenlayer' }
      ]
    });

    console.log('MongoDB user created successfully');
    
    // Close the connection
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating MongoDB user:', error);
    process.exit(1);
  }
}

createMongoUser(); 