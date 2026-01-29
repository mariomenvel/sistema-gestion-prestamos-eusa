var express = require('express');
var router = express.Router();
var nombresController = require('../controllers/nombres.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Listar nombres genéricos
router.get('/', auth, nombresController.obtenerNombres);

// Crear nombre genérico (solo PAS)
router.post('/', auth, roles.soloPAS, nombresController.crearNombre);

// Actualizar nombre genérico (solo PAS)
router.put('/:id', auth, roles.soloPAS, nombresController.actualizarNombre);

module.exports = router;
