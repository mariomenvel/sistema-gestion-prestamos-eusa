var express = require('express');
var router = express.Router();
var gradosController = require('../controllers/grados.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Público / Autenticado (Listar para dropdowns)
router.get('/', auth, gradosController.listarGrados);

// PAS (Gestión)
router.post('/', auth, roles.soloPAS, gradosController.crearGrado);
router.put('/:id', auth, roles.soloPAS, gradosController.actualizarGrado);
router.delete('/:id', auth, roles.soloPAS, gradosController.eliminarGrado);

module.exports = router;
