var express = require('express');
var router = express.Router();
var equiposController = require('../controllers/equipos.controller');

// Obtener todos los equipos
router.get('/', equiposController.obtenerEquipos);

var roles = require('../middlewares/roles');

router.get('/:id', auth, roles.soloPAS, equiposController.obtenerEquipoPorId);
router.post('/', auth, roles.soloPAS, equiposController.crearEquipo);
router.put('/:id', auth, roles.soloPAS, equiposController.actualizarEquipo);
router.delete('/:id', auth, roles.soloPAS, equiposController.eliminarEquipo);

module.exports = router;