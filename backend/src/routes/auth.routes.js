// src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

module.exports = function(db) {
  const authController = new AuthController(db);

  router.post('/register', authController.register);
  router.post('/login', authController.login);

  return router;
};
