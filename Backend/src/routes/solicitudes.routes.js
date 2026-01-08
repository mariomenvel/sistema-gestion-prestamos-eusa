var express = require('express');
var router = express.Router();
var solicitudesController = require('../controllers/solicitudes.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Crear solicitud: solo alumno o profesor
router.post('/', auth, roles.alumnoOProfesor, solicitudesController.crearSolicitud);

// Listar solicitudes pendientes (solo PAS)
router.get('/pendientes', auth, roles.soloPAS, solicitudesController.obtenerSolicitudesPendientes);

// Aprobar solicitud (solo PAS)
router.put('/:id/aprobar', auth, roles.soloPAS, solicitudesController.aprobarSolicitud);

// Rechazar solicitud (solo PAS)
router.put('/:id/rechazar', auth, roles.soloPAS, solicitudesController.rechazarSolicitud);

// Ver mis solicitudes: solo usuario logueado (alumno o profesor)
router.get('/mias', auth, roles.alumnoOProfesor, solicitudesController.obtenerMisSolicitudes);

// Todas las solicitudes (pendientes y no pendientes)
router.get('/', auth, roles.soloPAS, solicitudesController.obtenerTodasLasSolicitudes);


module.exports = router;
