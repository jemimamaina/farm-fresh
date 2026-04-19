const express = require('express');
const path = require('path');
const apiRouter = require('./routes/api')
const cors= require('cors')

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

app.use(express.json());
app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.send('Farm Fresh Server is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});