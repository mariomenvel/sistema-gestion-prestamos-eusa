var express = require('express');
var router = express.Router();
var configController = require('../controllers/configuracion.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Solo PAS puede ver y editar configuración
router.get('/', auth, roles.soloPAS, configController.listarConfig);
router.put('/', auth, roles.soloPAS, configController.actualizarConfig);

module.exports = router;
