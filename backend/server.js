const express = require('express');
const cors = require('cors');
const config = require('./config');
const healthRoutes = require('./routes/health');
const garenaRoutes = require('./routes/garena');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/garena', garenaRoutes);

app.listen(config.port, () => {
  console.log(`ShadowTopUp Backend Microservice running on port ${config.port}`);
});
