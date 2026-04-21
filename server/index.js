const express = require('express');
const path = require('path');
const apiRouter = require('./routes');
const cors = require('cors');
const { initializePool } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Farm Fresh Server is running!');
});

// Initialize database connection pool and start server
(async () => {
  try {
    await initializePool();
    console.log('Database connected successfully');
    
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    // If database connection fails, still start the server but with limited functionality
    app.listen(port, () => {
      console.log(`Server listening on port ${port} (database connection failed)`);
    });
  }
})();