var express = require('express');
var router = express.Router();
var presencialController = require('../controllers/presencial.controller');
var auth = require('../middlewares/auth');

var roles = require('../middlewares/roles');

// Middleware para asegurar que es PAS/Profesor?
// La logica dice que solo PAS (o profesor con permiso) deberia poder operar la "caja"
// Asumiremos rol: 'pas' por seguridad.

router.get('/usuario/:codigo', auth, roles.soloPAS, presencialController.buscarUsuarioPorTarjeta);
router.post('/checkout', auth, roles.soloPAS, presencialController.crearPrestamoPresencial);

module.exports = router;
