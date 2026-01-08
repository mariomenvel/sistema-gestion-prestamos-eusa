var express = require('express');
var router = express.Router();
var unidadesController = require('../controllers/unidades.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

router.post('/', auth, roles.soloPAS, unidadesController.crearUnidad);
router.put('/:id', auth, roles.soloPAS, unidadesController.actualizarUnidad);
router.delete('/:id', auth, roles.soloPAS, unidadesController.eliminarUnidad);

module.exports = router;
