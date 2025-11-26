var express = require('express');
var router = express.Router();
var librosController = require('../controllers/libros.controller');

router.get('/', librosController.obtenerLibros);

module.exports = router;
