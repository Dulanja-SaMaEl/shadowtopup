const express = require('express');
const cors = require('cors');
const config = require('./config');
const healthRoutes = require('./routes/health');
const garenaRoutes = require('./routes/garena');

const app = express();

// Restrict CORS to trusted origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:3000', 'http://localhost:3456', 'https://shadowtopup.com'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.use('/api', healthRoutes);
app.use('/api/garena', garenaRoutes);

app.listen(config.port, () => {
  console.log(`ShadowTopUp Backend Microservice running on port ${config.port}`);
});
