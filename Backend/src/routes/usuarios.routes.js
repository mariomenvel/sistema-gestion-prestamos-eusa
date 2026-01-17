var express = require('express');
var router = express.Router();
var usuariosController = require('../controllers/usuarios.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Perfil del usuario actual (alumno/profesor/PAS)
router.get('/me', auth, usuariosController.obtenerPerfilActual);

// Lista de usuarios (solo PAS)
router.get('/', auth, roles.soloPAS, usuariosController.listarUsuarios);

// Detalle completo de un usuario (solo PAS)
router.get('/:id/detalle', auth, roles.soloPAS, usuariosController.obtenerDetalleUsuario);

// Actualizar usuario (solo PAS)
router.put('/:id', auth, roles.soloPAS, usuariosController.actualizarUsuario);

// Obtener contador de préstamos tipo B del usuario actual (alumno/profesor)
router.get('/me/contador-prestamos-b', auth, roles.alumnoOProfesor, usuariosController.obtenerContadorPrestamosB);

module.exports = router;
