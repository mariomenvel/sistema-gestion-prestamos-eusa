var express = require('express');
var router = express.Router();
var solicitudesController = require('../controllers/solicitudes.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Crear solicitud: solo alumno o profesor
router.post('/', auth, roles.alumnoOProfesor, solicitudesController.crearSolicitud);

// Ver mis solicitudes: solo usuario logueado (alumno o profesor)
router.get('/mias', auth, roles.alumnoOProfesor, solicitudesController.obtenerMisSolicitudes);


module.exports = router;
