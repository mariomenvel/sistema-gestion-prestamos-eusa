var express = require('express');
var router = express.Router();
var prestamosController = require('../controllers/prestamos.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Ver mis préstamos (alumno o profesor)
router.get('/mios', auth, roles.alumnoOProfesor, prestamosController.obtenerMisPrestamos);

// Ver préstamos activos (PAS)
router.get('/activos', auth, roles.soloPAS, prestamosController.obtenerPrestamosActivos);

// Marcar préstamo como devuelto (PAS)
router.put('/:id/devolver', auth, roles.soloPAS, prestamosController.devolverPrestamo);

// Ampliar plazo de un préstamo (PAS)
router.put('/:id/ampliar', auth, roles.soloPAS, prestamosController.ampliarPrestamo);

// Detalle de un prestamo (PAS o dueño)
router.get('/:id', auth, prestamosController.obtenerDetallePrestamo);

// Crear préstamo presencial (solo PAS)
router.post('/presencial', auth, roles.soloPAS, prestamosController.crearPrestamoPresencial);

module.exports = router;
