const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const apiRoutes = require('./api/routes');
const { errorHandler } = require('./api/middleware/errorHandler');

const app = express();
const port = 3000;

// 1. CORS Configuration
// Allow all origins for development/testing (Vercel -> Localhost)
app.use(cors({
  origin: true, // Reflects the request origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Middleware for JSON parsing
app.use(bodyParser.json());
app.use(express.json());

//Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 3. API Routes
// Mounting the Pegasus API ecosystem
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    engine: 'Pegasus Elite Core',
    version: '1.2.0',
    uptime: process.uptime(),
    endpoints: 44
  });
});

// 4. Centralized Error Handling
app.use(errorHandler);

// 5. Initialize Server
app.listen(port, () => {
  console.log(`
  =========================================
  🛡️  PEGASUS BACKEND API INITIALIZED
  🚀 Status: RUNNING
  🔌 Port: ${port}
  🛰️  URL: http://localhost:${port}/api
  📊 Endpoints: 44 active routes
  =========================================
  `);
});