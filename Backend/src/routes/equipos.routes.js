var express = require('express');
var router = express.Router();
var equiposController = require('../controllers/equipos.controller');

// Obtener todos los equipos
router.get('/', equiposController.obtenerEquipos);

// Eliminar un equipo por ID
router.delete('/:id', equiposController.eliminarEquipo);

module.exports = router;