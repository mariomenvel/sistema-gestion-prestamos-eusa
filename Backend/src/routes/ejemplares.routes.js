var express = require('express');
var router = express.Router();
var ejemplaresController = require('../controllers/ejemplares.controller');
var auth = require('../middlewares/auth');
var roles = require('../middlewares/roles');

router.post('/', auth, roles.soloPAS, ejemplaresController.crearEjemplar);
router.put('/:id', auth, roles.soloPAS, ejemplaresController.actualizarEjemplar);
router.delete('/:id', auth, roles.soloPAS, ejemplaresController.eliminarEjemplar);

module.exports = router;
