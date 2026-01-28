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
      {
        model: models.PrestamoItem,
        as: 'items',
        include: [
          { model: models.Unidad, include: [{ model: models.Equipo, as: 'equipo' }] },
          { model: models.Ejemplar, include: [{ model: models.Libro, as: 'libro' }] }
        ]
      }
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
      {
        model: models.SolicitudItem,
        as: 'items',
        include: [
          { model: models.Libro },
          { model: models.Equipo }
        ]
      }
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

/**
 * Obtiene el libro más prestado
 */
function obtenerLibroMasPrestado(req, res) {
  var db = require('../db');

  db.sequelize.query(`
    SELECT 
      l.id,
      l.titulo,
      l.autor,
      COUNT(pi.id) as total_prestamos
    FROM libros l
    INNER JOIN ejemplares e ON e.libro_id = l.id
    INNER JOIN prestamo_items pi ON pi.ejemplar_id = e.id
    GROUP BY l.id, l.titulo, l.autor
    ORDER BY total_prestamos DESC
    LIMIT 1
  `, {
    type: Sequelize.QueryTypes.SELECT
  })
    .then(function (resultados) {
      if (resultados.length === 0) {
        return res.json({
          titulo: 'Sin datos',
          autor: 'No hay préstamos registrados',
          totalPrestamos: 0
        });
      }

      var libro = resultados[0];
      res.json({
        titulo: libro.titulo,
        autor: libro.autor || 'Autor desconocido',
        totalPrestamos: parseInt(libro.total_prestamos)
      });
    })
    .catch(function (error) {
      console.error('Error al obtener libro más prestado:', error);
      res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    });
}

/**
 * Obtiene el material (equipo) más prestado
 */
function obtenerMaterialMasPrestado(req, res) {
  var db = require('../db');

  db.sequelize.query(`
    SELECT 
      eq.id,
      eq.marca,
      eq.modelo,
      cat.nombre as categoria,
      COUNT(pi.id) as total_prestamos
    FROM equipos eq
    INNER JOIN unidades u ON u.equipo_id = eq.id
    INNER JOIN prestamo_items pi ON pi.unidad_id = u.id
    LEFT JOIN categorias cat ON cat.id = eq.categoria_id
    GROUP BY eq.id, eq.marca, eq.modelo, cat.nombre
    ORDER BY total_prestamos DESC
    LIMIT 1
  `, {
    type: Sequelize.QueryTypes.SELECT
  })
    .then(function (resultados) {
      if (resultados.length === 0) {
        return res.json({
          nombre: 'Sin datos',
          categoria: 'No hay préstamos registrados',
          totalPrestamos: 0
        });
      }

      var material = resultados[0];
      res.json({
        nombre: material.marca + ' ' + material.modelo,
        categoria: material.categoria || 'Sin categoría',
        totalPrestamos: parseInt(material.total_prestamos)
      });
    })
    .catch(function (error) {
      console.error('Error al obtener material más prestado:', error);
      res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    });
}
/**
 * Obtiene el grado y curso que más solicita material
 */
function obtenerUsuarioMasSolicita(req, res) {
  var db = require('../db');

  db.sequelize.query(`
    SELECT 
      u.grado,
      u.curso,
      COUNT(s.id) as total_solicitudes
    FROM usuarios u
    INNER JOIN solicitudes s ON s.usuario_id = u.id
    WHERE u.grado IS NOT NULL
    GROUP BY u.grado, u.curso
    ORDER BY total_solicitudes DESC
    LIMIT 1
  `, {
    type: Sequelize.QueryTypes.SELECT
  })
    .then(function (resultados) {
      if (resultados.length === 0) {
        return res.json({
          nombre: 'Sin datos',
          curso: '-',
          totalSolicitudes: 0
        });
      }

      var dato = resultados[0];

      res.json({
        nombre: dato.grado,
        curso: dato.curso + 'º',
        totalSolicitudes: parseInt(dato.total_solicitudes)
      });
    })
    .catch(function (error) {
      console.error('Error al obtener grado que más solicita:', error);
      res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    });
}

/**
 * Obtiene el top 5 de materiales más demandados
 */
function obtenerTop5Materiales(req, res) {
  var db = require('../db');

  db.sequelize.query(`
    SELECT 
      eq.id,
      eq.marca,
      eq.modelo,
      cat.nombre as categoria,
      COUNT(pi.id) as total_prestamos
    FROM equipos eq
    INNER JOIN unidades u ON u.equipo_id = eq.id
    INNER JOIN prestamo_items pi ON pi.unidad_id = u.id
    LEFT JOIN categorias cat ON cat.id = eq.categoria_id
    GROUP BY eq.id, eq.marca, eq.modelo, cat.nombre
    ORDER BY total_prestamos DESC
    LIMIT 5
  `, {
    type: Sequelize.QueryTypes.SELECT
  })
    .then(function (resultados) {
      var top5 = resultados.map(function (item, index) {
        return {
          posicion: index + 1,
          nombre: item.marca + ' ' + item.modelo,
          categoria: item.categoria || 'Sin categoría',
          totalPrestamos: parseInt(item.total_prestamos)
        };
      });

      // Si hay menos de 5, completar con datos vacíos
      while (top5.length < 5) {
        top5.push({
          posicion: top5.length + 1,
          nombre: 'Sin datos',
          categoria: '-',
          totalPrestamos: 0
        });
      }

      res.json(top5);
    })
    .catch(function (error) {
      console.error('Error al obtener top 5 materiales:', error);
      res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    });
}

module.exports = {
  obtenerReportePrestamos: obtenerReportePrestamos,
  obtenerReporteSolicitudes: obtenerReporteSolicitudes,
  obtenerReporteSanciones: obtenerReporteSanciones,
  obtenerLibroMasPrestado: obtenerLibroMasPrestado,
  obtenerMaterialMasPrestado: obtenerMaterialMasPrestado,
  obtenerUsuarioMasSolicita: obtenerUsuarioMasSolicita,
  obtenerTop5Materiales: obtenerTop5Materiales
};
