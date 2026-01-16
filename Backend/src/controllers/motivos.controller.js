var models = require('../models');

// GET /motivos
function listarMotivos(req, res) {
    models.MotivoRechazo.findAll()
        .then(function (motivos) {
            res.json(motivos);
        })
        .catch(function (error) {
            console.error('Error al listar motivos:', error);
            res.status(500).json({ mensaje: 'Error al listar motivos' });
        });
}

// POST /motivos (solo PAS)
function crearMotivo(req, res) {
    var { titulo_es, cuerpo_es, titulo_en, cuerpo_en, clave } = req.body;

    if (!titulo_es || !cuerpo_es) {
        return res.status(400).json({ mensaje: 'Título y cuerpo en español son obligatorios' });
    }

    models.MotivoRechazo.create({
        titulo_es: titulo_es,
        cuerpo_es: cuerpo_es,
        titulo_en: titulo_en,
        cuerpo_en: cuerpo_en,
        clave: clave
    })
        .then(function (motivo) {
            res.status(201).json({ mensaje: 'Motivo creado', motivo: motivo });
        })
        .catch(function (error) {
            console.error('Error al crear motivo:', error);
            res.status(500).json({ mensaje: 'Error al crear motivo' });
        });
}

// PUT /motivos/:id (solo PAS)
function actualizarMotivo(req, res) {
    var id = req.params.id;
    var { titulo_es, cuerpo_es, titulo_en, cuerpo_en, clave } = req.body;

    models.MotivoRechazo.findByPk(id)
        .then(function (motivo) {
            if (!motivo) return res.status(404).json({ mensaje: 'Motivo no encontrado' });

            motivo.titulo_es = titulo_es || motivo.titulo_es;
            motivo.cuerpo_es = cuerpo_es || motivo.cuerpo_es;
            motivo.titulo_en = titulo_en || motivo.titulo_en;
            motivo.cuerpo_en = cuerpo_en || motivo.cuerpo_en;
            motivo.clave = clave || motivo.clave;

            return motivo.save();
        })
        .then(function (motivoGuardado) {
            if (motivoGuardado) res.json({ mensaje: 'Motivo actualizado', motivo: motivoGuardado });
        })
        .catch(function (error) {
            console.error('Error al actualizar motivo:', error);
            res.status(500).json({ mensaje: 'Error al actualizar motivo' });
        });
}

// DELETE /motivos/:id (solo PAS)
function eliminarMotivo(req, res) {
    var id = req.params.id;

    models.MotivoRechazo.destroy({ where: { id: id } })
        .then(function (deleted) {
            if (deleted === 0) return res.status(404).json({ mensaje: 'Motivo no encontrado' });
            res.json({ mensaje: 'Motivo eliminado' });
        })
        .catch(function (error) {
            console.error('Error al eliminar motivo:', error);
            res.status(500).json({ mensaje: 'Error al eliminar motivo' });
        });
}

module.exports = {
    listarMotivos,
    crearMotivo,
    actualizarMotivo,
    eliminarMotivo
};
