var models = require('../models');
var db = require('../db');
var Sequelize = require('sequelize');

function crearSolicitud(req, res) {
  // Usuario autenticado (viene del middleware auth)
  var usuarioId = req.user.id;

  // Datos del body
  var tipo = req.body.tipo;              // 'prof_trabajo' o 'uso_propio'
  var items = req.body.items;            // Array de { equipo_id/libro_id, cantidad }
  var normasAceptadas = req.body.normas_aceptadas;
  var observaciones = req.body.observaciones || null;

  var inicioCurso = obtenerInicioCurso();

  // 1) Comprobar si el usuario tiene sanción activa
  models.Sancion.findOne({
    where: {
      usuario_id: usuarioId,
      estado: 'activa',
      inicio: { [Sequelize.Op.gte]: inicioCurso },
      [Sequelize.Op.or]: [
        { fin: null },
        { fin: { [Sequelize.Op.gt]: new Date() } }
      ]
    }
  })
    .then(function (sancionActiva) {
      if (sancionActiva) {
        return res.status(403).json({
          mensaje: 'No puedes crear nuevas solicitudes porque tienes una sanción activa en este curso',
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

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          mensaje: 'Debe indicar al menos un item en la solicitud'
        });
      }

      // 3) Crear la solicitud + Items (Transacción)
      return db.sequelize.transaction(function (t) {
        return models.Solicitud.create({
          usuario_id: usuarioId,
          tipo: tipo,
          estado: 'pendiente',
          normas_aceptadas: true,
          observaciones: observaciones,
          creada_en: new Date()
        }, { transaction: t })
          .then(function (solicitud) {
            // Crear los items
            var itemsPromises = items.map(function (item) {
              return models.SolicitudItem.create({
                solicitud_id: solicitud.id,
                libro_id: item.libro_id || null, // opcional
                equipo_id: item.equipo_id || null, // opcional
                cantidad: item.cantidad || 1
              }, { transaction: t });
            });

            return Promise.all(itemsPromises).then(function () {
              return solicitud;
            });
          });
      });
    })
    .then(function (solicitud) {
      if (!solicitud) return; // Salió por error previo (sanción, validación)

      res.status(201).json({
        mensaje: 'Solicitud creada correctamente',
        solicitudId: solicitud.id
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
      },
      {
        model: models.SolicitudItem,
        as: 'items',
        include: [
          { model: models.Libro },
          { model: models.Equipo }
        ]
      },
      {
        model: models.Usuario,
        as: 'gestor'
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
  var pasId = req.user.id;

  // Array de IDs físicos que se entregan (escaneados)
  // ej: { unidades: [1, 2], ejemplares: [5] }
  var entregas = req.body.entregas || {};
  var unidadesIds = entregas.unidades || [];
  var ejemplaresIds = entregas.ejemplares || [];

  db.sequelize.transaction(function (t) {
    return models.Solicitud.findByPk(solicitudId, { transaction: t })
      .then(function (solicitud) {
        if (!solicitud) throw new Error('NO_ENCONTRADA');
        if (solicitud.estado !== 'pendiente') throw new Error('NO_PENDIENTE');

        // Validar que se entregue ALGO
        if (unidadesIds.length === 0 && ejemplaresIds.length === 0) {
          throw new Error('SIN_ENTREGAS'); // No se puede aprobar sin dar nada
        }

        // Calcular fechas de préstamo
        var ahora = new Date();
        var fechaPrevista = calcularSiguienteDiaLectivo(ahora);

        // 1. Crear CABECERA Préstamo
        return models.Prestamo.create({
          usuario_id: solicitud.usuario_id,
          solicitud_id: solicitud.id,
          tipo: (solicitud.tipo === 'prof_trabajo') ? 'a' : 'b',
          estado: 'activo',
          fecha_inicio: ahora,
          fecha_devolucion_prevista: fechaPrevista,
          profesor_solicitante_id: null
        }, { transaction: t })
          .then(function (prestamo) {

            var promesasItems = [];

            // 2. Procesar UNIDADES
            unidadesIds.forEach(function (uId) {
              var p = models.Unidad.findByPk(uId, { transaction: t })
                .then(function (unidad) {
                  if (!unidad) throw new Error('UNIDAD_NO_EXISTE');
                  if (unidad.esta_prestado) throw new Error('UNIDAD_YA_PRESTADA');

                  // Permitir 'funciona' u 'obsoleto'
                  if (['funciona', 'obsoleto'].indexOf(unidad.estado_fisico) === -1) {
                    throw new Error('UNIDAD_NO_APTA');
                  }

                  // Marcar prestado
                  unidad.esta_prestado = true;
                  return unidad.save({ transaction: t });
                })
                .then(function () {
                  // Crear Linea Prestamo
                  return models.PrestamoItem.create({
                    prestamo_id: prestamo.id,
                    unidad_id: uId,
                    devuelto: false
                  }, { transaction: t });
                });
              promesasItems.push(p);
            });

            // 3. Procesar EJEMPLARES
            ejemplaresIds.forEach(function (eId) {
              var p = models.Ejemplar.findByPk(eId, { transaction: t })
                .then(function (ejemplar) {
                  if (!ejemplar) throw new Error('EJEMPLAR_NO_EXISTE');
                  if (ejemplar.estado !== 'disponible') throw new Error('EJEMPLAR_NO_DISPONIBLE');

                  // Marcar como no disponible (modelo antiguo Ejemplar)
                  ejemplar.estado = 'no_disponible';
                  return ejemplar.save({ transaction: t });
                })
                .then(function () {
                  return models.PrestamoItem.create({
                    prestamo_id: prestamo.id,
                    ejemplar_id: eId,
                    devuelto: false
                  }, { transaction: t });
                });
              promesasItems.push(p);
            });

            return Promise.all(promesasItems).then(function () {
              // 4. Actualizar Solicitud
              solicitud.estado = 'aprobada';
              solicitud.gestionado_por_id = pasId;
              solicitud.resuelta_en = ahora;
              return solicitud.save({ transaction: t });
            });
          });
      });
  })
    .then(function () {
      res.json({ mensaje: 'Préstamo generado con los items indicados' });
    })
    .catch(function (error) {
      if (error.message === 'NO_ENCONTRADA') return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
      if (error.message === 'NO_PENDIENTE') return res.status(400).json({ mensaje: 'La solicitud no está pendiente' });
      if (error.message === 'SIN_ENTREGAS') return res.status(400).json({ mensaje: 'Debe entregar al menos un item' });
      if (error.message === 'UNIDAD_YA_PRESTADA') return res.status(400).json({ mensaje: 'Alguna unidad ya está prestada' });

      console.error('Error al aprobar solicitud:', error);
      res.status(500).json({ mensaje: 'Error al generar préstamo' });
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

function cancelarSolicitud(req, res) {
  var solicitudId = req.params.id;
  var usuarioId = req.user.id;

  models.Solicitud.findOne({
    where: { id: solicitudId },
    include: [{ model: models.SolicitudItem, as: 'items' }]
  })
    .then(function (solicitud) {
      if (!solicitud) {
        return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
      }

      // Solo el propietario o el PAS pueden cancelar
      // Si es el usuario, debe ser SU solicitud
      if (req.user.rol !== 'pas' && solicitud.usuario_id !== usuarioId) {
        return res.status(403).json({ mensaje: 'No tienes permisos para cancelar esta solicitud' });
      }

      if (solicitud.estado !== 'pendiente') {
        return res.status(400).json({ mensaje: 'Solo se pueden cancelar solicitudes pendientes' });
      }

      // Eliminar items primero (cascade lógico)
      return models.SolicitudItem.destroy({
        where: { solicitud_id: solicitud.id }
      }).then(function () {
        return solicitud.destroy();
      });
    })
    .then(function () {
      res.json({ mensaje: 'Solicitud cancelada y eliminada correctamente' });
    })
    .catch(function (error) {
      console.error('Error al cancelar solicitud:', error);
      res.status(500).json({ mensaje: 'Error al cancelar la solicitud' });
    });
}

function obtenerMisSolicitudes(req, res) {
  var usuarioId = req.user.id;

  models.Solicitud.findAll({
    where: { usuario_id: usuarioId },
    include: [
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
      console.error('Error al obtener mis solicitudes:', error);
      res.status(500).json({ mensaje: 'Error al obtener mis solicitudes' });
    });
}

// Observa se la sancion es de este curso
function obtenerInicioCurso() {
  var hoy = new Date();
  var year = hoy.getFullYear();

  // INICIO DE CURSO: 1 de septiembre (cámbialo si quieres)
  var inicio = new Date(year, 8, 1); // Mes 8 = septiembre (0-based)

  // Si todavía no hemos llegado a esa fecha este año,
  // el curso actual empezó el año anterior
  if (hoy < inicio) {
    inicio = new Date(year - 1, 8, 1);
  }

  return inicio;
}

function obtenerTodasLasSolicitudes(req, res) {
  models.Solicitud.findAll({
    include: [
      { model: models.Usuario },
      {
        model: models.SolicitudItem,
        as: 'items',
        include: [{ model: models.Libro }, { model: models.Equipo }]
      }
    ],
    order: [['creada_en', 'DESC']]
  })
    .then(function (solicitudes) {
      res.json(solicitudes);
    })
    .catch(function (error) {
      console.error('Error al obtener todas las solicitudes:', error);
      res.status(500).json({
        mensaje: 'Error al obtener las solicitudes'
      });
    });
}


function calcularSiguienteDiaLectivo(desdeFecha) {
  var fecha = new Date(desdeFecha);
  var diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, ... 6 = Sabado

  // Si es Viernes (5) -> Lunes (+3 dias)
  // Si es Sabado (6)  -> Lunes (+2 dias)
  // Si es Domingo (0) -> Lunes (+1 dia)
  // Si es Lunes-Jueves -> Dia siguiente (+1 dia)

  if (diaSemana === 5) {
    fecha.setDate(fecha.getDate() + 3);
  } else if (diaSemana === 6) {
    fecha.setDate(fecha.getDate() + 2);
  } else {
    fecha.setDate(fecha.getDate() + 1);
  }

  // Fijar a las 9:00 AM
  fecha.setHours(9, 0, 0, 0);
  return fecha;
}

module.exports = {
  crearSolicitud: crearSolicitud,
  obtenerMisSolicitudes: obtenerMisSolicitudes,
  obtenerSolicitudesPendientes: obtenerSolicitudesPendientes,
  aprobarSolicitud: aprobarSolicitud,
  rechazarSolicitud: rechazarSolicitud,
  cancelarSolicitud: cancelarSolicitud,
  obtenerTodasLasSolicitudes: obtenerTodasLasSolicitudes
};

