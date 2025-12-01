var models = require('../models');
var db = require('../db');

/**
 * Prestamos del usuario (alumno/profesor)
 */
function obtenerMisPrestamos(req, res) {
  var usuarioId = req.user.id;

  models.Prestamo.findAll({
    where: { usuario_id: usuarioId },
    include: [
      {
        model: models.Ejemplar,
        include: [
          {
            model: models.Libro,
            as: 'libro'
          }
        ]
      },
      {
        model: models.Unidad,
        include: [
          {
            model: models.Equipo,
            as: 'equipo'
          }
        ]
      },
      {
        model: models.Solicitud
      }
    ],
    order: [['fecha_inicio', 'DESC']]
  })
    .then(function (prestamos) {
      res.json(prestamos);
    })
    .catch(function (error) {
      console.error('Error al obtener mis préstamos:', error);
      res.status(500).json({ mensaje: 'Error al obtener mis préstamos' });
    });
}

/**
 * Prestamos activos (para PAS)
 */
function obtenerPrestamosActivos(req, res) {
  models.Prestamo.findAll({
    where: { estado: 'activo' },
    include: [
      {
        model: models.Usuario // quién tiene el préstamo
      },
      {
        model: models.Ejemplar,
        include: [
          {
            model: models.Libro,
            as: 'libro'
          }
        ]
      },
      {
        model: models.Unidad,
        include: [
          {
            model: models.Equipo,
            as: 'equipo'
          }
        ]
      },
      {
        model: models.Solicitud
      }
    ],
    order: [['fecha_inicio', 'ASC']]
  })
    .then(function (prestamos) {
      res.json(prestamos);
    })
    .catch(function (error) {
      console.error('Error al obtener préstamos activos (PAS):', error);
      res.status(500).json({ mensaje: 'Error al obtener préstamos activos' });
    });
}

/**
 * Devolver un préstamo (solo PAS)
 */
function devolverPrestamo(req, res) {
  var prestamoId = req.params.id;

  db.sequelize.transaction(function (t) {
    var prestamoGlobal;

    return models.Prestamo.findByPk(prestamoId, { transaction: t })
      .then(function (prestamo) {
        if (!prestamo) {
          throw new Error('NO_ENCONTRADO');
        }

        if (prestamo.estado !== 'activo') {
          throw new Error('NO_ACTIVO');
        }

        var ahora = new Date();
        prestamo.fecha_devolucion_real = ahora;
        prestamo.estado = 'cerrado';
        prestamoGlobal = prestamo;

        // Marcar ejemplar/unidad como disponible
        if (prestamo.ejemplar_id) {
          return models.Ejemplar.findByPk(prestamo.ejemplar_id, { transaction: t })
            .then(function (ejemplar) {
              if (ejemplar) {
                ejemplar.estado = 'disponible';
                return ejemplar.save({ transaction: t });
              }
            });
        } else if (prestamo.unidad_id) {
          return models.Unidad.findByPk(prestamo.unidad_id, { transaction: t })
            .then(function (unidad) {
              if (unidad) {
                unidad.estado = 'disponible';
                return unidad.save({ transaction: t });
              }
            });
        } else {
          return null;
        }
      })
      .then(function () {
        if (!prestamoGlobal) {
          return;
        }
        return prestamoGlobal.save({ transaction: t });
      });
  })
    .then(function () {
      res.json({ mensaje: 'Préstamo devuelto correctamente' });
    })
    .catch(function (error) {
      if (error.message === 'NO_ENCONTRADO') {
        return res.status(404).json({ mensaje: 'Préstamo no encontrado' });
      }
      if (error.message === 'NO_ACTIVO') {
        return res.status(400).json({ mensaje: 'Solo se pueden devolver préstamos activos' });
      }

      console.error('Error al devolver préstamo (PAS):', error);
      res.status(500).json({ mensaje: 'Error al devolver el préstamo' });
    });
}

/**
 * Ampliar plazo de un préstamo (solo PAS)
 * De momento +7 días sobre la fecha_devolucion_prevista
 */
function ampliarPrestamo(req, res) {
  var prestamoId = req.params.id;

  models.Prestamo.findByPk(prestamoId)
    .then(function (prestamo) {
      if (!prestamo) {
        return res.status(404).json({ mensaje: 'Préstamo no encontrado' });
      }

      if (prestamo.estado !== 'activo') {
        return res.status(400).json({ mensaje: 'Solo se pueden ampliar préstamos activos' });
      }

      var fechaPrevista = prestamo.fecha_devolucion_prevista;

      if (!fechaPrevista) {
        // Por si acaso, si es null usamos hoy
        fechaPrevista = new Date();
      }

      // Regla provisional: añadir 7 días
      var nuevaFecha = new Date(fechaPrevista.getTime());
      nuevaFecha.setDate(nuevaFecha.getDate() + 7);

      prestamo.fecha_devolucion_prevista = nuevaFecha;

      return prestamo.save()
        .then(function (prestamoGuardado) {
          res.json({
            mensaje: 'Préstamo ampliado correctamente',
            nuevo_plazo: prestamoGuardado.fecha_devolucion_prevista
          });
        });
    })
    .catch(function (error) {
      console.error('Error al ampliar préstamo (PAS):', error);
      res.status(500).json({ mensaje: 'Error al ampliar el préstamo' });
    });
}

module.exports = {
  obtenerMisPrestamos: obtenerMisPrestamos,
  obtenerPrestamosActivos: obtenerPrestamosActivos,
  devolverPrestamo: devolverPrestamo,
  ampliarPrestamo: ampliarPrestamo
};
