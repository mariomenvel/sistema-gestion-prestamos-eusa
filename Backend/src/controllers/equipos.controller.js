var models = require('../models');

function obtenerEquipos(req, res) {
  models.Equipo.findAll({
    include: [
      {
        model: models.Categoria,
        as: 'categoria'
      },
      {
        model: models.Unidad,
        as: 'unidades'
      }
    ]
  })
    .then(function (equipos) {
      res.json(equipos);
    })
    .catch(function (error) {
      console.error('Error al obtener equipos:', error);
      res.status(500).json({ mensaje: 'Error al obtener equipos' });
    });
}

/**
 * Eliminar un equipo por ID
 */
function eliminarEquipo(req, res) {
  var equipoId = req.params.id;

  models.Equipo.findByPk(equipoId)
    .then(function(equipo) {
      if (!equipo) {
        return res.status(404).json({ mensaje: 'Equipo no encontrado' });
      }

      return equipo.destroy();
    })
    .then(function() {
      res.json({ mensaje: 'Equipo eliminado correctamente' });
    })
    .catch(function(error) {
      console.error('Error al eliminar equipo:', error);
      res.status(500).json({ mensaje: 'Error al eliminar el equipo' });
    });
}

module.exports = {
  obtenerEquipos: obtenerEquipos,
  eliminarEquipo: eliminarEquipo
};
