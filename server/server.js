require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
    origin: process.env.CORS_ORIGIN === '*' ? '*' : process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.text());

// Routes
app.use('/api', routes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Finance Backend API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
