var models = require('../models');
var db = require('../db');


function crearSolicitud(req, res) {
  // Usuario autenticado (viene del middleware auth)
  var usuarioId = req.user.id;
  var rol = req.user.rol;

  // Datos del body
  var tipo = req.body.tipo;              // 'prof_trabajo' o 'uso_propio'
  var ejemplarId = req.body.ejemplar_id; // opcional
  var unidadId = req.body.unidad_id;     // opcional
  var normasAceptadas = req.body.normas_aceptadas;
  var observaciones = req.body.observaciones || null;

  // 1) Comprobar si el usuario tiene sanción activa
  models.Sancion.findOne({
  where: {
    usuario_id: usuarioId,
    estado: 'activa',
    // Solo sanciones cuyo fin es null o está en el futuro
    [db.Sequelize.Op.or]: [
      { fin: null },
      { fin: { [db.Sequelize.Op.gt]: new Date() } }
    ]
  }
})
    .then(function (sancionActiva) {

      if (sancionActiva) {
        return res.status(403).json({
          mensaje: 'No puedes crear nuevas solicitudes porque tienes una sanción activa',
          sancion: sancionActiva
        });
      }

      // 2) Validaciones básicas
      if (!tipo || (tipo !== 'prof_trabajo' && tipo !== 'uso_propio')) {
        return res.status(400).json({ mensaje: 'Tipo de solicitud inválido' });
      }

      if (!normasAceptadas) {
        return res.status(400).json({ mensaje: 'Debe aceptar las normas para crear una solicitud' });
      }

      // Debe elegir o ejemplar o unidad, pero no ambos a la vez
      if ((!ejemplarId && !unidadId) || (ejemplarId && unidadId)) {
        return res.status(400).json({
          mensaje: 'Debe indicar SOLO ejemplar_id o SOLO unidad_id'
        });
      }

      // Para tipo prof_trabajo, tiene que ser profesor
      if (tipo === 'prof_trabajo' && rol !== 'profesor') {
        return res.status(403).json({
          mensaje: 'Solo un profesor puede crear una solicitud de tipo prof_trabajo'
        });
      }

      // 3) Crear la solicitud
      return models.Solicitud.create({
        usuario_id: usuarioId,
        ejemplar_id: ejemplarId || null,
        unidad_id: unidadId || null,
        tipo: tipo,
        estado: 'pendiente',
        normas_aceptadas: true,
        observaciones: observaciones,
        gestionado_por_id: null,
        creada_en: new Date(),
        resuelta_en: null
      });
    })
    .then(function (solicitud) {
      if (!solicitud) {
        // Ya se respondió antes (por sanción, validación, etc.)
        return;
      }

      res.status(201).json({
        mensaje: 'Solicitud creada correctamente',
        solicitud: solicitud
      });
    })
    .catch(function (error) {
      console.error('Error al crear solicitud:', error);
      res.status(500).json({ mensaje: 'Error al crear la solicitud' });
    });
}



function obtenerSolicitudesPendientes(req, res) {
  models.Solicitud.findAll({
    where: { estado: 'pendiente' },
    include: [
      {
        model: models.Usuario,
        // usuario que la creó
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
        model: models.Usuario,
        as: 'gestor' // PAS que la gestionó (aún null en pendientes)
      }
    ],
    order: [['creada_en', 'ASC']]
  })
    .then(function (solicitudes) {
      res.json(solicitudes);
    })
    .catch(function (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      res.status(500).json({ mensaje: 'Error al obtener solicitudes pendientes' });
    });
}

function aprobarSolicitud(req, res) {
  var solicitudId = req.params.id;
  var pasId = req.user.id; // el PAS que aprueba

  // Usamos una transacción para que todo vaya junto
  db.sequelize.transaction(function (t) {
    var solicitudGuardadaGlobal;
    var prestamoCreadoGlobal;

    return models.Solicitud.findByPk(solicitudId, { transaction: t })
      .then(function (solicitud) {
        if (!solicitud) {
          // Forzar rollback devolviendo error
          throw new Error('NO_ENCONTRADA');
        }

        if (solicitud.estado !== 'pendiente') {
          throw new Error('NO_PENDIENTE');
        }

        // Calcular fechas de préstamo
        var ahora = new Date();
        var fechaPrevista = new Date();
        fechaPrevista.setDate(fechaPrevista.getHours() + 24);

        // Tipo de préstamo: 'a' para prof_trabajo, 'b' para uso_propio
        var tipoPrestamo = (solicitud.tipo === 'prof_trabajo') ? 'a' : 'b';

        var profesorSolicitanteId = null;
        if (solicitud.tipo === 'prof_trabajo') {
          profesorSolicitanteId = solicitud.usuario_id; // el propio profesor
        }

        // Creamos el préstamo
        return models.Prestamo.create({
          usuario_id: solicitud.usuario_id,
          ejemplar_id: solicitud.ejemplar_id || null,
          unidad_id: solicitud.unidad_id || null,
          solicitud_id: solicitud.id,
          tipo: tipoPrestamo,
          estado: 'activo',
          fecha_inicio: ahora,
          fecha_devolucion_prevista: fechaPrevista,
          fecha_devolucion_real: null,
          profesor_solicitante_id: profesorSolicitanteId
        }, { transaction: t })
          .then(function (prestamoCreado) {
            prestamoCreadoGlobal = prestamoCreado;

            // Actualizar estado de la solicitud
            solicitud.estado = 'aprobada';
            solicitud.gestionado_por_id = pasId;
            solicitud.resuelta_en = ahora;
            solicitudGuardadaGlobal = solicitud;

            // Marcar ejemplar/unidad como no_disponible
            if (solicitud.ejemplar_id) {
              return models.Ejemplar.findByPk(solicitud.ejemplar_id, { transaction: t })
                .then(function (ejemplar) {
                  if (ejemplar) {
                    ejemplar.estado = 'no_disponible';
                    return ejemplar.save({ transaction: t });
                  }
                });
            } else if (solicitud.unidad_id) {
              return models.Unidad.findByPk(solicitud.unidad_id, { transaction: t })
                .then(function (unidad) {
                  if (unidad) {
                    unidad.estado = 'no_disponible';
                    return unidad.save({ transaction: t });
                  }
                });
            } else {
              // Ni ejemplar ni unidad (raro), pero seguimos
              return null;
            }
          })
          .then(function () {
            // Guardar la solicitud con su nuevo estado
            return solicitudGuardadaGlobal.save({ transaction: t });
          });
      });
  })
    .then(function (resultado) {
      // Si todo fue bien
      res.json({
        mensaje: 'Solicitud aprobada y préstamo creado correctamente',
        // No devolvemos todo, pero podrías añadir más info si quieres
      });
    })
    .catch(function (error) {
      if (error.message === 'NO_ENCONTRADA') {
        return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
      }
      if (error.message === 'NO_PENDIENTE') {
        return res.status(400).json({ mensaje: 'Solo se pueden aprobar solicitudes pendientes' });
      }

      console.error('Error al aprobar solicitud y crear préstamo:', error);
      res.status(500).json({ mensaje: 'Error al aprobar la solicitud' });
    });
}


function rechazarSolicitud(req, res) {
  var solicitudId = req.params.id;
  var pasId = req.user.id;

  models.Solicitud.findByPk(solicitudId)
    .then(function (solicitud) {
      if (!solicitud) {
        return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
      }

      if (solicitud.estado !== 'pendiente') {
        return res.status(400).json({ mensaje: 'Solo se pueden rechazar solicitudes pendientes' });
      }

      solicitud.estado = 'rechazada';
      solicitud.gestionado_por_id = pasId;
      solicitud.resuelta_en = new Date();

      return solicitud.save();
    })
    .then(function (solicitudGuardada) {
      if (!solicitudGuardada) {
        return;
      }

      res.json({
        mensaje: 'Solicitud rechazada correctamente',
        solicitud: solicitudGuardada
      });
    })
    .catch(function (error) {
      console.error('Error al rechazar solicitud:', error);
      res.status(500).json({ mensaje: 'Error al rechazar la solicitud' });
    });
}


function obtenerMisSolicitudes(req, res) {
  var usuarioId = req.user.id;

  models.Solicitud.findAll({
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
      }
    ],
    order: [['creada_en', 'DESC']]
  })
    .then(function (solicitudes) {
      res.json(solicitudes);
    })
    .catch(function (error) {
      console.error('Error al obtener mis solicitudes:', error);
      res.status(500).json({ mensaje: 'Error al obtener mis solicitudes' });
    });
}


module.exports = {
  crearSolicitud: crearSolicitud,
  obtenerMisSolicitudes: obtenerMisSolicitudes,
  obtenerSolicitudesPendientes: obtenerSolicitudesPendientes,
  aprobarSolicitud: aprobarSolicitud,
  rechazarSolicitud: rechazarSolicitud
};

