// src/routes/events.routes.js
const express = require('express');
const router = express.Router();
const EventsController = require('../controllers/events.controller');

module.exports = function(db) {
  const eventsController = new EventsController(db);

  router.post('/events', eventsController.createEvent);
  router.get('/events', eventsController.getAllEvents);
  router.get('/events/:eventId', eventsController.getEventById);
  router.put('/events/:eventId', eventsController.updateEvent);

  return router;
};
