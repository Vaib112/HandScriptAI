const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool instead of a single connection for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medscript_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialization function to ensure tables exist
async function initializeDB() {
  try {
    // First connect without a specific database to ensure it exists
    const tempConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'medscript_db';
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    await tempConnection.end();

    // Now initialize the tables using our configured pool
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NULL,
        google_id VARCHAR(255) UNIQUE NULL,
        name VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createPrescriptionsTableQuery = `
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        image_preview LONGTEXT NOT NULL,
        result_json JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await pool.query(createUsersTableQuery);
    
    // Add columns dynamically if the table already existed before this update
    try {
      await pool.query('ALTER TABLE users MODIFY password VARCHAR(255) NULL');
      await pool.query('ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE NULL');
      await pool.query('ALTER TABLE users ADD COLUMN name VARCHAR(255) NULL');
    } catch (e) {
      // Ignore if columns already exist
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.warn('Note: Could not alter users table (might already be altered)', e.message);
      }
    }

    await pool.query(createPrescriptionsTableQuery);

    console.log('[DB] Database and tables successfully initialized.');
  } catch (error) {
    console.error('[DB Error] Failed to initialize database:', error.message);
    // Note: We don't crash the server here, so the developer can see the error
    // and correctly set up the .env file credentials.
  }
}

// Kick off initialization immediately
initializeDB();

module.exports = pool;
