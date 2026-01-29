var models = require('../models');

/**
 * GET /generos
 */
function obtenerGeneros(req, res) {
    models.Genero.findAll({
        where: { activo: true },
        order: [['nombre', 'ASC']]
    })
        .then(function (generos) {
            res.json(generos);
        })
        .catch(function (error) {
            console.error('Error al obtener géneros:', error);
            res.status(500).json({ mensaje: 'Error al obtener géneros' });
        });
}

/**
 * POST /generos
 */
function crearGenero(req, res) {
    var nombre = req.body.nombre;

    if (!nombre) {
        return res.status(400).json({
            mensaje: 'El nombre del género es obligatorio'
        });
    }

    models.Genero.create({
        nombre: nombre,
        activo: true
    })
        .then(function (generoCreado) {
            res.status(201).json(generoCreado);
        })
        .catch(function (error) {
            console.error('Error al crear género:', error);
            res.status(500).json({ mensaje: 'Error al crear el género' });
        });
}

/**
 * PUT /generos/:id
 */
function actualizarGenero(req, res) {
    var generoId = req.params.id;

    models.Genero.findByPk(generoId)
        .then(function (genero) {
            if (!genero) {
                return res.status(404).json({ mensaje: 'Género no encontrado' });
            }

            return genero.update({
                activo: req.body.activo ?? genero.activo,
                nombre: req.body.nombre ?? genero.nombre
            });
        })
        .then(function (generoActualizado) {
            res.json(generoActualizado);
        })
        .catch(function (error) {
            console.error('Error al actualizar género:', error);
            res.status(500).json({ mensaje: 'Error al actualizar el género' });
        });
}

module.exports = {
    obtenerGeneros: obtenerGeneros,
    crearGenero: crearGenero,
    actualizarGenero: actualizarGenero
};
