// src/app.js
const express = require('express');
const cors = require('cors');
const db = require('./db');

// Import your route factories
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const createAuthRoutes = require('./routes/auth.routes');
const createEventRoutes = require('./routes/events.routes');
const createPerformanceRoutes = require('./routes/performance.routes');
const createBookingRoutes = require('./routes/booking.routes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', createAuthRoutes(db));
app.use('/api', createEventRoutes(db));
app.use('/api', createPerformanceRoutes(db));
app.use('/api', createBookingRoutes(db));

module.exports = app;
