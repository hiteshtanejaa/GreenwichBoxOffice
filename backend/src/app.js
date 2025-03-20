// src/app.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Import route factories
const createAuthRoutes = require('./routes/auth.routes');
const createEventRoutes = require('./routes/events.routes');
const createPerformanceRoutes = require('./routes/performance.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount the routers
app.use('/api', createAuthRoutes(db));
app.use('/api', createEventRoutes(db));
app.use('/api', createPerformanceRoutes(db));

module.exports = app;
