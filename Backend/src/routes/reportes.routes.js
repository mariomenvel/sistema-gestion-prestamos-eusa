var express = require('express');
var router = express.Router();
var reportesController = require('../controllers/reportes.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

router.get('/prestamos', auth, roles.soloPAS, reportesController.obtenerReportePrestamos);

router.get('/solicitudes', auth, roles.soloPAS, reportesController.obtenerReporteSolicitudes);

router.get('/sanciones', auth, roles.soloPAS, reportesController.obtenerReporteSanciones);

// Estadísticas
router.get('/libro-mas-prestado', auth, roles.soloPAS, reportesController.obtenerLibroMasPrestado);

router.get('/material-mas-prestado', auth, roles.soloPAS, reportesController.obtenerMaterialMasPrestado);

router.get('/usuario-mas-solicita', auth, roles.soloPAS, reportesController.obtenerUsuarioMasSolicita);

router.get('/top5-materiales', auth, roles.soloPAS, reportesController.obtenerTop5Materiales);

module.exports = router;
