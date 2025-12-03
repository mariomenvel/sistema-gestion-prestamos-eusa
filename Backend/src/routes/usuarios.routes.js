var express = require('express');
var router = express.Router();
var usuariosController = require('../controllers/usuarios.controller');
var auth = require('../middlewares/auth');

// Obtener perfil del usuario actual (alumno/profesor/PAS)
router.get('/me', auth, usuariosController.obtenerPerfilActual);

module.exports = router;
