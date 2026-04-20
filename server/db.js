const mysql = require('mysql2/promise');

// Database connection pool
let pool;

async function initializePool() {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'farm_fresh',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}

async function getConnection() {
  if (!pool) {
    await initializePool();
  }
  return pool.getConnection();
}

async function queryDatabase(sql, params = []) {
  const connection = await getConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
}

module.exports = {
  initializePool,
  getConnection,
  queryDatabase,
};
