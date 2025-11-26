var express = require('express');
var router = express.Router();
var authController = require('../controllers/auth.controller');

router.post('/login', authController.login);

module.exports = router;
