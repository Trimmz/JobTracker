// Database wrapper that provides a unified interface for both SQLite and PostgreSQL

const isPostgres = !!process.env.DATABASE_URL;
const dbModule = isPostgres ? require('./db-postgres') : require('./db-sqlite');

// Wrapper to make PostgreSQL work like SQLite's callback API
const db = {
  // For SELECT queries that return multiple rows
  all: async (sql, params, callback) => {
    if (!isPostgres) {
      // SQLite - use as-is
      return dbModule.all(sql, params, callback);
    }

    // PostgreSQL - convert to async
    try {
      // Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
      let pgSql = sql;
      let pgParams = params;
      if (Array.isArray(params) && params.length > 0) {
        let paramIndex = 1;
        pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        pgParams = params;
      }

      const result = await dbModule.query(pgSql, pgParams);
      callback(null, result.rows);
    } catch (err) {
      callback(err);
    }
  },

  // For SELECT queries that return a single row
  get: async (sql, params, callback) => {
    if (!isPostgres) {
      return dbModule.get(sql, params, callback);
    }

    try {
      let pgSql = sql;
      let pgParams = params;
      if (Array.isArray(params) && params.length > 0) {
        let paramIndex = 1;
        pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        pgParams = params;
      }

      console.log('[DB] Executing query:', pgSql, 'with params:', pgParams);
      const result = await dbModule.query(pgSql, pgParams);
      console.log('[DB] Result:', result.rows[0]);
      callback(null, result.rows[0]);
    } catch (err) {
      console.error('[DB] Query error:', err);
      callback(err);
    }
  },

  // For INSERT, UPDATE, DELETE
  run: async (sql, params, callback) => {
    if (!isPostgres) {
      return dbModule.run(sql, params, callback);
    }

    try {
      let pgSql = sql;
      let pgParams = params;
      if (Array.isArray(params) && params.length > 0) {
        let paramIndex = 1;
        pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        pgParams = params;
      }

      // Add RETURNING id for INSERT statements to get lastID
      if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
        pgSql += ' RETURNING id';
      }

      const result = await dbModule.query(pgSql, pgParams);

      // Simulate SQLite's this context
      const context = {
        lastID: result.rows[0]?.id || null,
        changes: result.rowCount || 0
      };

      callback.call(context, null);
    } catch (err) {
      callback(err);
    }
  },

  // Prepared statement (for SQLite compatibility)
  prepare: (sql) => {
    if (!isPostgres) {
      return dbModule.prepare(sql);
    }

    // For PostgreSQL, return a simple wrapper
    return {
      run: async (params, callback) => {
        db.run(sql, params, callback);
      },
      finalize: () => {} // No-op for PostgreSQL
    };
  }
};

module.exports = db;
