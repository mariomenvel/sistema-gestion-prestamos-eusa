var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth.controller');

// Ruta de login
router.post('/login', authController.login);

// Ruta de registro
router.post('/registro', authController.registro);

module.exports = router;
