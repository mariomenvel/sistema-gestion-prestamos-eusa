var express = require('express');
var router = express.Router();
var solicitudesController = require('../controllers/solicitudes.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Listar solicitudes pendientes (solo PAS)
router.get('/pendientes', auth, roles.soloPAS, solicitudesController.obtenerSolicitudesPendientes);

// Ver mis solicitudes: solo usuario logueado (alumno o profesor)
router.get('/mias', auth, roles.alumnoOProfesor, solicitudesController.obtenerMisSolicitudes);

// Crear solicitud: solo alumno o profesor
router.post('/', auth, roles.alumnoOProfesor, solicitudesController.crearSolicitud);


// Verificar disponibilidad de items (PAS)
router.get('/:id/disponibilidad', auth, roles.soloPAS, solicitudesController.verificarDisponibilidad);

// Aprobar solicitud (solo PAS)
router.put('/:id/aprobar', auth, roles.soloPAS, solicitudesController.aprobarSolicitud);

// Rechazar solicitud (solo PAS)
router.put('/:id/rechazar', auth, roles.soloPAS, solicitudesController.rechazarSolicitud);

// Cancelar/Borrar solicitud (Alumno dueño o PAS)
router.delete('/:id', auth, solicitudesController.cancelarSolicitud);


// Todas las solicitudes (pendientes y no pendientes)
router.get('/', auth, roles.soloPAS, solicitudesController.obtenerTodasLasSolicitudes);


module.exports = router;
