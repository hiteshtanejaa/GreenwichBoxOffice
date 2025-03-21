const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const db = require('../db'); // or wherever your db connection is

// Instantiate the controller with the db connection
const userController = new UserController(db);

// GET /api/user/:userId
router.get('/:userId', userController.getUserDetails);

// GET /api/user/:userId/bookings
router.get('/:userId/bookings', userController.getUserBookings);

module.exports = router;
