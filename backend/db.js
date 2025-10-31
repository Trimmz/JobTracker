const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'applications.db');
const db = new sqlite3.Database(dbPath);

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

    // Insert default admin (only if not exists)
    db.get(`SELECT * FROM users WHERE username = 'admin'`, (err, row) => {
    if (!row) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const adminPass = 'password123';
        bcrypt.hash(adminPass, saltRounds, (err, hash) => {
        if (err) return console.error('Failed to create admin:', err);
        db.run(
            `INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)`,
            ['admin', hash, 'admin']
        );
        console.log('✅ Default admin created: username=admin, password=password123');
        });
    }
    });
});

module.exports = db;