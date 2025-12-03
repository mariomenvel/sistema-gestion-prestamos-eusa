var express = require('express');
var router = express.Router();
var reportesController = require('../controllers/reportes.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

router.get('/prestamos', auth, roles.soloPAS, reportesController.obtenerReportePrestamos);

module.exports = router;
