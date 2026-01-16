var express = require('express');
var router = express.Router();
var motivosController = require('../controllers/motivos.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

// Listar (cualquier usuario autenticado podría verlos, pero mejor solo PAS si es backend de gestión)
// Dejémoslo solo PAS por ahora.
router.get('/', auth, roles.soloPAS, motivosController.listarMotivos);

// Gestión (Solo PAS)
router.post('/', auth, roles.soloPAS, motivosController.crearMotivo);
router.put('/:id', auth, roles.soloPAS, motivosController.actualizarMotivo);
router.delete('/:id', auth, roles.soloPAS, motivosController.eliminarMotivo);

module.exports = router;
