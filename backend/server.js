require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  db.get('SELECT role FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

// ===== JOB ENDPOINTS (Admin creates jobs) =====

// GET all jobs with user-specific application status
app.get('/api/jobs', (req, res) => {
  const userId = req.headers['user-id'];

  // Get all jobs
  db.all('SELECT * FROM jobs ORDER BY createdAt DESC', [], (err, jobs) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!userId) {
      // Not logged in - return jobs with default "Not Applied" status
      const jobsWithStatus = jobs.map(job => ({
        ...job,
        status: 'Not Applied',
        dateApplied: null,
        notes: ''
      }));
      return res.json(jobsWithStatus);
    }

    // Logged in - get user's application status for each job
    const jobIds = jobs.map(j => j.id);
    if (jobIds.length === 0) return res.json([]);

    const placeholders = jobIds.map(() => '?').join(',');
    db.all(
      `SELECT jobId, status, dateApplied, notes FROM user_applications WHERE userId = ? AND jobId IN (${placeholders})`,
      [userId, ...jobIds],
      (err, applications) => {
        if (err) return res.status(500).json({ error: err.message });

        // Create a map of jobId -> application
        const appMap = {};
        applications.forEach(app => {
          appMap[app.jobId] = app;
        });

        // Merge jobs with user's application status
        const jobsWithStatus = jobs.map(job => ({
          ...job,
          status: appMap[job.id]?.status || 'Not Applied',
          dateApplied: appMap[job.id]?.dateApplied || null,
          notes: appMap[job.id]?.notes || '',
          applicationId: appMap[job.id]?.id || null
        }));

        res.json(jobsWithStatus);
      }
    );
  });
});

// POST create new job (admin only)
app.post('/api/jobs', requireAdmin, (req, res) => {
  const { company, role, location, jobLink } = req.body;
  const userId = req.headers['user-id'];

  if (!company || !role) {
    return res.status(400).json({ error: 'Company and role are required' });
  }

  db.run(
    'INSERT INTO jobs (company, role, location, jobLink, createdBy) VALUES (?, ?, ?, ?, ?)',
    [company, role, location, jobLink, userId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
});

// PUT update job (admin only)
app.put('/api/jobs/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { company, role, location, jobLink } = req.body;

  db.run(
    'UPDATE jobs SET company = ?, role = ?, location = ?, jobLink = ? WHERE id = ?',
    [company, role, location, jobLink, id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Job not found' });
      res.json({ updated: true });
    }
  );
});

// DELETE job (admin only)
app.delete('/api/jobs/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM jobs WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ deleted: true });
  });
});

// ===== USER APPLICATION ENDPOINTS =====

// POST/UPDATE user's application to a job
app.post('/api/jobs/:jobId/apply', (req, res) => {
  const { jobId } = req.params;
  const { status, dateApplied, notes } = req.body;
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if job exists
  db.get('SELECT id FROM jobs WHERE id = ?', [jobId], (err, job) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Check if user already has an application for this job
    db.get(
      'SELECT id FROM user_applications WHERE userId = ? AND jobId = ?',
      [userId, jobId],
      (err, existing) => {
        if (err) return res.status(500).json({ error: err.message });

        if (existing) {
          // Update existing application
          db.run(
            'UPDATE user_applications SET status = ?, dateApplied = ?, notes = ? WHERE id = ?',
            [status || 'Not Applied', dateApplied, notes || '', existing.id],
            function(err) {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ id: existing.id, updated: true });
            }
          );
        } else {
          // Create new application
          db.run(
            'INSERT INTO user_applications (userId, jobId, status, dateApplied, notes) VALUES (?, ?, ?, ?, ?)',
            [userId, jobId, status || 'Not Applied', dateApplied, notes || ''],
            function(err) {
              if (err) return res.status(500).json({ error: err.message });
              res.status(201).json({ id: this.lastID });
            }
          );
        }
      }
    );
  });
});

// PUT update user's application status
app.put('/api/applications/:jobId/status', (req, res) => {
  const { jobId } = req.params;
  const { status, dateApplied, notes } = req.body;
  const userId = req.headers['user-id'];

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if application exists
  db.get(
    'SELECT id FROM user_applications WHERE userId = ? AND jobId = ?',
    [userId, jobId],
    (err, app) => {
      if (err) return res.status(500).json({ error: err.message });

      if (app) {
        // Update existing
        db.run(
          'UPDATE user_applications SET status = ?, dateApplied = ?, notes = ? WHERE id = ?',
          [status, dateApplied, notes || '', app.id],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: true });
          }
        );
      } else {
        // Create new
        db.run(
          'INSERT INTO user_applications (userId, jobId, status, dateApplied, notes) VALUES (?, ?, ?, ?, ?)',
          [userId, jobId, status, dateApplied, notes || ''],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
          }
        );
      }
    }
  );
});

// ===== OLD APPLICATIONS ENDPOINTS (for backward compatibility) =====

// GET all applications (filtered by user if logged in)
app.get('/api/applications', (req, res) => {
  const userId = req.headers['user-id'];

  if (userId) {
    // Get user-specific applications
    db.all('SELECT * FROM applications WHERE userId = ? ORDER BY dateApplied DESC', [userId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    // Get all applications (public view)
    db.all('SELECT * FROM applications ORDER BY dateApplied DESC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

// POST a new application
app.post('/api/applications', (req, res) => {
  const { company, role, location, jobLink, dateApplied, notes } = req.body;
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required to add applications' });
  }
  
  // Check if user already has an entry for this job
  db.get(`
    SELECT id FROM applications
    WHERE userId = ? AND company = ? AND role = ?
  `, [userId, company, role], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (existing) {
      // Update existing entry instead of creating new one
      db.run(`
        UPDATE applications
        SET location = ?, jobLink = ?, dateApplied = ?, notes = ?
        WHERE id = ?
      `, [location, jobLink, dateApplied, notes || '', existing.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: existing.id, updated: true });
      });
    } else {
      // Create new entry
      const stmt = db.prepare(`
        INSERT INTO applications (userId, company, role, location, jobLink, dateApplied, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run([userId, company, role, location, jobLink, dateApplied, notes || ''], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
      });
      stmt.finalize();
    }
  });
});

// UPDATE an application
app.put('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required to update applications' });
  }
  
  // Check if user owns this application
  db.get('SELECT userId FROM applications WHERE id = ?', [id], (err, app) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!app) return res.status(404).json({ error: 'Not found' });
    if (app.userId != userId && !req.headers['admin-role']) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.run(`UPDATE applications SET status = ? WHERE id = ?`, [status, id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ updated: true });
    });
  });
});

// DELETE an application
app.delete('/api/applications/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.headers['user-id'];
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required to delete applications' });
  }
  
  // Check if user owns this application
  db.get('SELECT userId FROM applications WHERE id = ?', [id], (err, app) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!app) return res.status(404).json({ error: 'Not found' });
    if (app.userId != userId && !req.headers['admin-role']) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.run(`DELETE FROM applications WHERE id = ?`, id, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.json({ deleted: true });
    });
  });
});

const bcrypt = require('bcrypt');

// SIGNUP: create new user (role = 'user')
app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  try {
    // Check if user exists
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (row) {
        return res.status(409).json({ success: false, message: 'Username already taken' });
      }

      // Hash password
      const hash = await bcrypt.hash(password, 10);
      // Insert user (default role = 'user')
      db.run(
        'INSERT INTO users (username, passwordHash, role) VALUES (?, ?, ?)',
        [username, hash, 'user'],
        function (err) {
          if (err) return res.status(500).json({ success: false, message: 'Signup failed' });
          res.status(201).json({ success: true, message: 'Account created!' });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// LOGIN: return user role + token
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id, username, passwordHash, role FROM users WHERE username = ?', [username], async (err, user) => {
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Fake token + include role
    res.json({
      success: true,
      token: 'fake-jwt-' + user.id,
      user: { id: user.id, username: user.username, role: user.role }
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});