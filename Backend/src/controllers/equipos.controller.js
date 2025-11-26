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

module.exports = {
  obtenerEquipos: obtenerEquipos
};
