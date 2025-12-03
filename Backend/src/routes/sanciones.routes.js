var express = require('express');
var router = express.Router();
var sancionesController = require('../controllers/sanciones.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Ver mis sanciones (cualquier usuario autenticado)
router.get('/mias', auth, sancionesController.obtenerMisSanciones);

// Ver sanciones activas (solo PAS)
router.get('/activas', auth, roles.soloPAS, sancionesController.obtenerSancionesActivas);

// Finalizar una sanción (solo PAS)
router.put('/:id/finalizar', auth, roles.soloPAS, sancionesController.finalizarSancion);

// Eliminar sanción definitivamente (solo PAS)
router.delete('/:id', auth, roles.soloPAS, sancionesController.eliminarSancion);

// Reset de sanciones de un usuario (nuevo curso) – solo PAS
router.put('/reset-usuario/:usuarioId', auth, roles.soloPAS, sancionesController.resetearSancionesUsuario);


module.exports = router;
