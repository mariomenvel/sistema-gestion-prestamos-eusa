var express = require('express');
var router = express.Router();
var librosController = require('../controllers/libros.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');
var uploadLibro = require('../middlewares/uploadLibro');

// Catálogo (alumnos, profesores, PAS)
router.get('/', auth, librosController.obtenerLibros);

// Gestión (solo PAS)
router.get('/:id', auth, roles.soloPAS, librosController.obtenerLibroPorId);
router.post(
  '/',
  auth,
  roles.soloPAS,
  uploadLibro.single('foto'),
  librosController.crearLibro
);
router.put('/:id', auth, roles.soloPAS, librosController.actualizarLibro);
router.delete('/:id', auth, roles.soloPAS, librosController.eliminarLibro);

module.exports = router;
