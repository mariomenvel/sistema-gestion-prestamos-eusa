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

function obtenerReporteSolicitudes(req, res) {
  var where = {};

  var desde = req.query.desde;
  var hasta = req.query.hasta;
  var usuarioId = req.query.usuario_id;
  var estado = req.query.estado;      // pendiente, aprobada...
  var tipo = req.query.tipo;          // uso_propio, prof_trabajo

  // Filtro por fechas (creada_en)
  if (desde || hasta) {
    var rango = [];

    if (desde) {
      rango.push(new Date(desde + 'T00:00:00'));
    } else {
      rango.push(new Date('2000-01-01T00:00:00'));
    }

    if (hasta) {
      rango.push(new Date(hasta + 'T23:59:59'));
    } else {
      rango.push(new Date('2100-01-01T23:59:59'));
    }

    where.creada_en = { [Op.between]: rango };
  }

  if (usuarioId) {
    where.usuario_id = usuarioId;
  }

  if (estado) {
    where.estado = estado;
  }

  if (tipo) {
    where.tipo = tipo;
  }

  models.Solicitud.findAll({
    where: where,
    include: [
      { model: models.Usuario },
      { model: models.Ejemplar },
      { model: models.Unidad }
    ],
    order: [['creada_en', 'DESC']]
  })
    .then(function (solicitudes) {
      res.json(solicitudes);
    })
    .catch(function (error) {
      console.error('Error al obtener reporte de solicitudes:', error);
      res.status(500).json({ mensaje: 'Error al obtener reporte de solicitudes' });
    });
}

function obtenerReporteSanciones(req, res) {
  var where = {};

  var desde = req.query.desde;      // inicio >=
  var hasta = req.query.hasta;      // inicio <=
  var usuarioId = req.query.usuario_id;
  var estado = req.query.estado;    // activa / finalizada
  var severidad = req.query.severidad; // s1_1sem, s2_1mes, s3_indefinida

  // --- filtro fechas (campo inicio) ---
  if (desde || hasta) {
    var rango = [];

    if (desde) rango.push(new Date(desde + 'T00:00:00'));
    else rango.push(new Date('2000-01-01T00:00:00'));

    if (hasta) rango.push(new Date(hasta + 'T23:59:59'));
    else rango.push(new Date('2100-01-01T23:59:59'));

    where.inicio = { [Op.between]: rango };
  }

  if (usuarioId) {
    where.usuario_id = usuarioId;
  }

  if (estado) {
    where.estado = estado;
  }

  if (severidad) {
    where.severidad = severidad;
  }

  models.Sancion.findAll({
    where: where,
    include: [{ model: models.Usuario }],
    order: [['inicio', 'DESC']]
  })
    .then(function (sanciones) {
      res.json(sanciones);
    })
    .catch(function (error) {
      console.error('Error al obtener reporte de sanciones:', error);
      res.status(500).json({ mensaje: 'Error al obtener reporte de sanciones' });
    });
}


module.exports = {
  obtenerReportePrestamos: obtenerReportePrestamos,
  obtenerReporteSolicitudes: obtenerReporteSolicitudes,
  obtenerReporteSanciones: obtenerReporteSanciones
};
