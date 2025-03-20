// src/routes/performance.routes.js
const express = require('express');
const router = express.Router();
const PerformanceController = require('../controllers/performance.controller');

module.exports = function(db) {
  const perfController = new PerformanceController(db);

  router.post('/performance', perfController.createPerformance);
  router.get('/performance', perfController.getAllPerformances);
  router.get('/performance/:eventId', perfController.getPerformancesByEvent);
  router.put('/performance/:performanceId', perfController.updatePerformance);

  return router;
};
