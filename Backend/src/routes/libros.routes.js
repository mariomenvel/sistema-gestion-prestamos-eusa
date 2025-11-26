var express = require('express');
var router = express.Router();
var librosController = require('../controllers/libros.controller')
var auth = require('../middleware/auth');

router.get('/', auth, librosController.obtenerLibros);

module.exports = router;
