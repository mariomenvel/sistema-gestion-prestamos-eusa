var express = require('express');
var router = express.Router();
var equiposController = require('../controllers/equipos.controller');

router.get('/', equiposController.obtenerEquipos);

module.exports = router;
