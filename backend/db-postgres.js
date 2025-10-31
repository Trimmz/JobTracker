const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ PostgreSQL database connected successfully');
  }
});

// Initialize database tables
async function initializeDatabase() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      )
    `);

    // Create jobs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT,
        jobLink TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdBy INTEGER REFERENCES users(id)
      )
    `);

    // Create user_applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_applications (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES users(id),
        jobId INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'Not Applied',
        dateApplied DATE,
        notes TEXT,
        UNIQUE(userId, jobId)
      )
    `);

    // Create old applications table for backward compatibility
    await client.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        userId INTEGER REFERENCES users(id),
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT,
        jobLink TEXT,
        status TEXT DEFAULT 'Not Applied',
        dateApplied DATE,
        notes TEXT
      )
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables created/verified');

    // Create admin user if credentials are provided
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminUsername && adminPassword) {
      const existingAdmin = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [adminUsername]
      );

      if (existingAdmin.rows.length === 0) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await client.query(
          'INSERT INTO users (username, passwordHash, role) VALUES ($1, $2, $3)',
          [adminUsername, hash, 'admin']
        );
        console.log(`✅ Admin user created: ${adminUsername}`);
      } else {
        console.log(`✅ Admin user already exists: ${adminUsername}`);
      }
    } else {
      console.warn('⚠️  ADMIN_USERNAME and ADMIN_PASSWORD not set in environment variables');
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization error:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Initialize on startup
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = pool;
