var express = require('express');
var router = express.Router();
var librosController = require('../controllers/libros.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');
var uploadLibro = require('../middlewares/uploadLibro');

// Catálogo (alumnos, profesores, PAS)
router.get('/', auth, librosController.obtenerLibros);

// Buscar libro por código de barras (PAS)
router.get('/buscar', auth, librosController.buscarPorCodigoBarras);


// Buscar libros con ejemplares disponibles (PAS)
router.get('/disponibles', auth, roles.soloPAS, librosController.buscarLibrosDisponibles);

// Buscar ejemplar por código de barras
router.get('/ejemplar/:codigo', auth, roles.soloPAS, librosController.buscarEjemplarPorCodigo);

// Gestión (solo PAS)
router.get('/:id', auth, roles.soloPAS, librosController.obtenerLibroPorId);
router.post(
  '/',
  auth,
  roles.soloPAS,
  uploadLibro.single('foto'),
  librosController.crearLibro
);
router.post(
  '/:id/imagen',
  auth,
  roles.soloPAS,
  uploadLibro.single('foto'),
  librosController.subirImagenLibro
);

router.put('/:id', auth, roles.soloPAS, librosController.actualizarLibro);
router.delete('/:id', auth, roles.soloPAS, librosController.eliminarLibro);

module.exports = router;
