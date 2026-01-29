var models = require('../models');

/**
 * GET /nombres
 */
function obtenerNombres(req, res) {
    models.Nombre.findAll({
        where: { activa: true },
        order: [['nombre', 'ASC']]
    })
        .then(function (nombres) {
            res.json(nombres);
        })
        .catch(function (error) {
            console.error('Error al obtener nombres:', error);
            res.status(500).json({ mensaje: 'Error al obtener nombres' });
        });
}

/**
 * POST /nombres
 */
function crearNombre(req, res) {
    var nombre = req.body.nombre;

    if (!nombre) {
        return res.status(400).json({
            mensaje: 'El nombre es obligatorio'
        });
    }

    models.Nombre.create({
        nombre: nombre,
        activa: true
    })
        .then(function (nombreCreado) {
            res.status(201).json(nombreCreado);
        })
        .catch(function (error) {
            console.error('Error al crear nombre:', error);
            res.status(500).json({ mensaje: 'Error al crear el nombre genérico' });
        });
}

/**
 * PUT /nombres/:id
 */
function actualizarNombre(req, res) {
    var nombreId = req.params.id;

    models.Nombre.findByPk(nombreId)
        .then(function (nombre) {
            if (!nombre) {
                return res.status(404).json({ mensaje: 'Nombre genérico no encontrado' });
            }

            return nombre.update({
                activa: req.body.activa ?? nombre.activa,
                nombre: req.body.nombre ?? nombre.nombre
            });
        })
        .then(function (nombreActualizado) {
            res.json(nombreActualizado);
        })
        .catch(function (error) {
            console.error('Error al actualizar nombre:', error);
            res.status(500).json({ mensaje: 'Error al actualizar el nombre genérico' });
        });
}

module.exports = {
    obtenerNombres: obtenerNombres,
    crearNombre: crearNombre,
    actualizarNombre: actualizarNombre
};
