var express = require('express');
var router = express.Router();
var categoriasController = require('../controllers/categorias.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Listar categorías (cualquier usuario logueado)
router.get('/', auth, categoriasController.obtenerCategorias);

// Crear categoría (solo PAS)
router.post('/', auth, roles.soloPAS, categoriasController.crearCategoria);

// Activar / desactivar categoría (solo PAS)
router.put('/:id', auth, roles.soloPAS, categoriasController.actualizarCategoria);

module.exports = router;
