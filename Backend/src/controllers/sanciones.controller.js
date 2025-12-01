var models = require('../models');

function obtenerMisSanciones(req, res) {
  var usuarioId = req.user.id;

  models.Sancion.findAll({
    where: { usuario_id: usuarioId },
    order: [['inicio', 'DESC']]
  })
    .then(function (sanciones) {
      res.json(sanciones);
    })
    .catch(function (error) {
      console.error('Error al obtener mis sanciones:', error);
      res.status(500).json({ mensaje: 'Error al obtener mis sanciones' });
    });
}

function obtenerSancionesActivas(req, res) {
  models.Sancion.findAll({
    where: { estado: 'activa' },
    include: [
      {
        model: models.Usuario
      }
    ],
    order: [['inicio', 'DESC']]
  })
    .then(function (sanciones) {
      res.json(sanciones);
    })
    .catch(function (error) {
      console.error('Error al obtener sanciones activas:', error);
      res.status(500).json({ mensaje: 'Error al obtener sanciones activas' });
    });
}

module.exports = {
  obtenerMisSanciones: obtenerMisSanciones,
  obtenerSancionesActivas: obtenerSancionesActivas
};
