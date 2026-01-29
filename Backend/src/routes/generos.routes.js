var express = require('express');
var router = express.Router();
var generosController = require('../controllers/generos.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Listar géneros
router.get('/', auth, generosController.obtenerGeneros);

// Crear género (solo PAS)
router.post('/', auth, roles.soloPAS, generosController.crearGenero);

// Actualizar género (solo PAS)
router.put('/:id', auth, roles.soloPAS, generosController.actualizarGenero);

module.exports = router;
