var models = require('../models');

// GET /grados
function listarGrados(req, res) {
    var soloActivos = req.query.activos === 'true';
    var where = {};
    if (soloActivos) where.activo = true;

    models.Grado.findAll({ where: where, order: [['nombre', 'ASC']] })
        .then(function (grados) {
            res.json(grados);
        })
        .catch(function (error) {
            console.error('Error al listar grados:', error);
            res.status(500).json({ mensaje: 'Error al listar grados' });
        });
}

// POST /grados (PAS)
function crearGrado(req, res) {
    var { nombre } = req.body;
    if (!nombre) return res.status(400).json({ mensaje: 'Nombre obligatorio' });

    models.Grado.create({ nombre: nombre })
        .then(function (grado) {
            res.status(201).json(grado);
        })
        .catch(function (error) {
            console.error('Error al crear grado:', error);
            res.status(500).json({ mensaje: 'Error al crear grado' });
        });
}

// PUT /grados/:id (PAS)
function actualizarGrado(req, res) {
    var id = req.params.id;
    var { nombre, activo } = req.body;

    models.Grado.findByPk(id)
        .then(function (grado) {
            if (!grado) return res.status(404).json({ mensaje: 'Grado no encontrado' });

            if (nombre !== undefined) grado.nombre = nombre;
            if (activo !== undefined) grado.activo = activo;

            return grado.save();
        })
        .then(function (grado) {
            res.json(grado);
        })
        .catch(function (error) {
            console.error('Error al actualizar grado:', error);
            res.status(500).json({ mensaje: 'Error al actualizar grado' });
        });
}

// DELETE /grados/:id (PAS)
function eliminarGrado(req, res) {
    var id = req.params.id;
    models.Grado.destroy({ where: { id: id } })
        .then(function (deleted) {
            if (deleted === 0) return res.status(404).json({ mensaje: 'Grado no encontrado' });
            res.json({ mensaje: 'Grado eliminado' });
        })
        .catch(function (error) {
            console.error('Error al eliminar grado:', error);
            res.status(500).json({ mensaje: 'Error al eliminar grado' });
        });
}

module.exports = {
    listarGrados,
    crearGrado,
    actualizarGrado,
    eliminarGrado
};
