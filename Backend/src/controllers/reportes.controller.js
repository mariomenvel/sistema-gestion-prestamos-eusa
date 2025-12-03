var models = require('../models');
var Sequelize = require('sequelize');
var Op = Sequelize.Op;

function obtenerReportePrestamos(req, res) {
  var where = {};

  var desde = req.query.desde;        // formato YYYY-MM-DD
  var hasta = req.query.hasta;        // formato YYYY-MM-DD
  var usuarioId = req.query.usuario_id;
  var estado = req.query.estado;      // activo, cerrado, vencido...
  var tipo = req.query.tipo;          // a o b

  // --- Filtro por rango de fechas (fecha_inicio) ---
  if (desde || hasta) {
    // Creamos un array de valores para between
    var rango = [];

    if (desde) {
      // inicio del día "desde"
      var fechaDesde = new Date(desde + 'T00:00:00');
      rango.push(fechaDesde);
    } else {
      // si no hay desde, ponemos algo muy antiguo
      rango.push(new Date('2000-01-01T00:00:00'));
    }

    if (hasta) {
      // fin del día "hasta"
      var fechaHasta = new Date(hasta + 'T23:59:59');
      rango.push(fechaHasta);
    } else {
      // si no hay hasta, ponemos algo muy futuro
      rango.push(new Date('2100-01-01T23:59:59'));
    }

    where.fecha_inicio = { [Op.between]: rango };
  }

  // --- filtro usuario ---
  if (usuarioId) {
    where.usuario_id = usuarioId;
  }

  // --- filtro estado ---
  if (estado) {
    where.estado = estado;
  }

  // --- filtro tipo ---
  if (tipo) {
    where.tipo = tipo;
  }

  models.Prestamo.findAll({
    where: where,
    include: [
      { model: models.Usuario },
      { model: models.Ejemplar },
      { model: models.Unidad }
    ],
    order: [['fecha_inicio', 'DESC']]
  })
    .then(function (prestamos) {
      res.json(prestamos);
    })
    .catch(function (error) {
      console.error('Error al obtener reporte de préstamos:', error);
      res.status(500).json({ mensaje: 'Error al obtener reporte de préstamos' });
    });
}

module.exports = {
  obtenerReportePrestamos: obtenerReportePrestamos
};
