const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./api/routes');

const app = express();
const port = process.env.PORT || 8080;

// Security & Parsing
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// API Ecosystem Proxy
app.use('/api', apiRoutes);

// Logger pentru monitorizare Cloud Run
app.use((req, res, next) => {
  console.log(`[REQ] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Servire Frontend (SPA Mode)
const publicPath = path.join(__dirname, 'dist');
app.use(express.static(publicPath));
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  // Verificăm dacă fișierul index.html există în dist (producție)
  const productionIndex = path.join(publicPath, 'index.html');
  const devIndex = path.join(__dirname, 'index.html');
  
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(productionIndex);
  } else {
    res.sendFile(devIndex);
  }
});

// Global Error Handler for Cloud Run logs
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ error: 'Internal Core Error' });
});

app.listen(port, () => {
  console.log(`
  =========================================
  🛡️  PEGASUS PRODUCTION SERVER ACTIVE
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  🔌 Listening on Port: ${port}
  🛰️  API logic attached to /api
  =========================================
  `);
});