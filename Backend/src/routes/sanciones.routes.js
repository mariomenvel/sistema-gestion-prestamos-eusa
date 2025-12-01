var express = require('express');
var router = express.Router();
var sancionesController = require('../controllers/sanciones.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Ver mis sanciones (cualquier usuario autenticado)
router.get('/mias', auth, sancionesController.obtenerMisSanciones);

// Ver sanciones activas (solo PAS)
router.get('/activas', auth, roles.soloPAS, sancionesController.obtenerSancionesActivas);

module.exports = router;
