// src/routes/booking.routes.js
const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/booking.controller');

module.exports = function(db) {
  const bookingController = new BookingController(db);

  // POST /api/bookings
//   router.post('/bookings', bookingController.createBooking);
  router.post("/completeBooking", bookingController.completeBooking);
  // You can add GET /api/bookings or other endpoints as needed
  // NEW GET endpoint for booking details
router.get('/booking/:bookingId', (req, res) => {
    bookingController.getBookingDetails(req, res);
  });
  return router;
};
