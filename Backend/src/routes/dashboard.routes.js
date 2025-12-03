var express = require('express');
var router = express.Router();
var dashboardController = require('../controllers/dashboard.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Dashboard para PAS
router.get('/pas', auth, roles.soloPAS, dashboardController.obtenerDashboardPAS);

module.exports = router;
