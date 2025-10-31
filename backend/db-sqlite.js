const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Use persistent storage on Render, fallback to local for development
const isProd = process.env.NODE_ENV === 'production';
const dbDir = isProd && process.env.DB_DIR ? process.env.DB_DIR : __dirname;

// Ensure directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'applications.db');
console.log(`📁 Database path: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Create table if not exists
db.serialize(() => {
  // Create users table if not exists
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        role TEXT DEFAULT 'user'  -- 'user' or 'admin'
    )
    `);

    // Create jobs table (admin creates jobs)
    db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT,
        jobLink TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdBy INTEGER,
        FOREIGN KEY (createdBy) REFERENCES users(id)
    )
    `);

    // Create user_applications table (tracks user-specific status for each job)
    db.run(`
    CREATE TABLE IF NOT EXISTS user_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        jobId INTEGER NOT NULL,
        status TEXT DEFAULT 'Not Applied',
        dateApplied DATE,
        notes TEXT,
        UNIQUE(userId, jobId),
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
    )
    `);

    // Keep old applications table for backward compatibility (can be removed later)
    db.run(`
    CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT,
        jobLink TEXT,
        status TEXT DEFAULT 'Not Applied',
        dateApplied DATE,
        notes TEXT,
        FOREIGN KEY (userId) REFERENCES users(id)
    )
    `);

    // Insert default admin from environment variables (only if not exists)
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminUsername && adminPassword) {
        db.get(`SELECT * FROM users WHERE username = ?`, [adminUsername], (err, row) => {
            if (!row) {
                const bcrypt = require('bcrypt');
                const saltRounds = 10;
                bcrypt.hash(adminPassword, saltRounds, (err, hash) => {
                    if (err) return console.error('❌ Failed to create admin:', err);
                    db.run(
                        `INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)`,
                        [adminUsername, hash, 'admin'],
                        function(err) {
                            if (err) {
                                console.error('❌ Failed to create admin user:', err);
                            } else {
                                console.log(`✅ Admin user created: ${adminUsername}`);
                            }
                        }
                    );
                });
            } else {
                console.log(`✅ Admin user already exists: ${adminUsername}`);
            }
        });
    } else {
        console.warn('⚠️  ADMIN_USERNAME and ADMIN_PASSWORD not set in environment variables');
        console.warn('⚠️  No admin user will be created. Set these variables to create an admin account.');
    }
});

module.exports = db;