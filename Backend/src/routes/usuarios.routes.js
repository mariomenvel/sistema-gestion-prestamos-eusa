var express = require('express');
var router = express.Router();
var usuariosController = require('../controllers/usuarios.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Perfil del usuario actual (alumno/profesor/PAS)
router.get('/me', auth, usuariosController.obtenerPerfilActual);

// Buscar usuario por código de barras (PAS)
router.get('/buscar', auth, roles.soloPAS, usuariosController.buscarPorCodigoBarras);

// Lista de usuarios (solo PAS)
router.get('/', auth, roles.soloPAS, usuariosController.listarUsuarios);

// Detalle completo de un usuario (solo PAS)
router.get('/:id/detalle', auth, roles.soloPAS, usuariosController.obtenerDetalleUsuario);

// Actualizar usuario (solo PAS)
router.put('/:id', auth, roles.soloPAS, usuariosController.actualizarUsuario);

// Obtener contador de préstamos tipo B del usuario actual (alumno/profesor)
router.get('/me/contador-prestamos-b', auth, roles.alumnoOProfesor, usuariosController.obtenerContadorPrestamosB);

// Obtener contador de préstamos tipo B para un usuario específico (solo PAS)
router.get('/:id/contador-tipo-b', auth, roles.soloPAS, usuariosController.obtenerContadorTipoB);

module.exports = router;
