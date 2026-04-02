require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./db/database');
const analysisRoutes = require('./routes/analysis');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

initializeDatabase();

app.use('/api', analysisRoutes);
app.use('/api', reportsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`CodeMentor API running on http://localhost:${PORT}`);
});
