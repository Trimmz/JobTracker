// Smart database loader - uses PostgreSQL if DATABASE_URL is set, otherwise SQLite

if (process.env.DATABASE_URL) {
  console.log('🐘 Using PostgreSQL database');
} else {
  console.log('📁 Using SQLite database');
}

// Export the wrapper that provides unified interface
module.exports = require('./db-wrapper');
