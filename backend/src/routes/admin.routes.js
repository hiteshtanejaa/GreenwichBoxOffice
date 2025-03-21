// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const db = require('../db');

const adminController = new AdminController(db);

// GET all events (admin)
router.get('/events', adminController.getAllEvents);

// GET all bookings for an event
router.get('/events/:eventId/bookings', adminController.getEventBookings);

module.exports = router;
