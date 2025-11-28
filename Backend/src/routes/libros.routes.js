var express = require('express');
var router = express.Router();
var librosController = require('../controllers/libros.controller');
var auth = require('../middlewares/auth');

router.get('/', auth, librosController.obtenerLibros);

module.exports = router;
