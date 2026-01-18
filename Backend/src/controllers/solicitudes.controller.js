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
  var profesorAsociadoId = req.body.profesor_asociado_id; // Nuevo
  var gradoId = req.body.grado_id; // Nuevo

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
        throw {
          status: 403,
          mensaje: 'No puedes crear nuevas solicitudes porque tienes una sanción activa en este curso'
        };
      }

      // 2) Validaciones básicas
      if (!tipo || (tipo !== 'prof_trabajo' && tipo !== 'uso_propio')) {
throw {
          status: 400,
          mensaje: 'Tipo de solicitud inválido'
        };      }

      if (tipo === 'prof_trabajo') {
 if (!profesorAsociadoId) {
          throw {
            status: 400,
            mensaje: 'Debes asociar un profesor.'
          };
        }        
  if (!gradoId) {
          throw {
            status: 400,
            mensaje: 'Debes asociar un grado.'
          };
        }
            }

      if (!normasAceptadas) {
throw {
          status: 400,
          mensaje: 'Debe aceptar las normas para crear una solicitud'
        };      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        throw {
          status: 400,
          mensaje: 'Debe indicar al menos un item en la solicitud'
        };
      }

      // 2.2) Validar límite trimestral para 'uso_propio'
      if (tipo === 'uso_propio') {
        // Envolver en promesa para encadenar
        return validarLimiteTrimestral(usuarioId)
          .then(function (dentroDelLimite) {
            if (!dentroDelLimite) {
 throw {
                status: 403,
                mensaje: 'Has superado el límite de 5 préstamos de uso propio este trimestre.'
              };
                        }
            return true;
          });
      }
      return Promise.resolve(true); // Si no es uso_propio, OK
    })
    .then(function () {
      // 3) Crear la solicitud + Items (Transacción)
      return db.sequelize.transaction(function (t) {
        return models.Solicitud.create({
          usuario_id: usuarioId,
          tipo: tipo,
          estado: 'pendiente',
          normas_aceptadas: true,
          observaciones: observaciones,
          profesor_asociado_id: profesorAsociadoId,
          grado_id: gradoId,
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
      res.status(201).json({
        mensaje: 'Solicitud creada correctamente',
        solicitudId: solicitud.id
      });
    })
    .catch(function (error) {
       if (error.status) {
        return res.status(error.status).json({ mensaje: error.mensaje });
      }

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

  // Nuevo: Recibir motivo_id e idioma
  var motivoId = req.body.motivo_id;
  var idioma = req.body.idioma || 'es'; // 'es' o 'en'

  models.Solicitud.findByPk(solicitudId)
    .then(function (solicitud) {
      if (!solicitud) {
        throw new Error('NO_ENCONTRADA');
      }
      if (solicitud.estado !== 'pendiente') {
        throw new Error('NO_PENDIENTE');
      }

      // Si viene motivoId, buscar el texto
      if (motivoId) {
        return models.MotivoRechazo.findByPk(motivoId).then(function (motivo) {
          if (!motivo) throw new Error('MOTIVO_NO_EXISTE');

          var texto = (idioma === 'en') ? motivo.cuerpo_en : motivo.cuerpo_es;
          // Fallback si no hay texto en ese idioma? Usar español.
          if (!texto) texto = motivo.cuerpo_es;

          return { solicitud: solicitud, textoMotivo: texto };
        });
      } else {
        // Rechazo sin motivo estandarizado (opcional o error?)
        // Permitamos rechazo manual si envian "observaciones" o algo asi, 
        // pero por ahora asumimos que el motivo es obligatorio si queremos estandarizar.
        // Dejemos pasar null si no envian nada, campo vacio.
        return { solicitud: solicitud, textoMotivo: null };
      }
    })
    .then(function (data) {
      var solicitud = data.solicitud;
      var textoMotivo = data.textoMotivo;

      solicitud.estado = 'rechazada';
      solicitud.gestionado_por_id = pasId;
      solicitud.resuelta_en = new Date();
      if (textoMotivo) {
        solicitud.motivo_rechazo = textoMotivo;
      }

      return solicitud.save();
    })
    .then(function (solicitudGuardada) {
      res.json({
        mensaje: 'Solicitud rechazada correctamente',
        solicitud: solicitudGuardada
      });
    })
    .catch(function (error) {
      if (error.message === 'NO_ENCONTRADA') return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
      if (error.message === 'NO_PENDIENTE') return res.status(400).json({ mensaje: 'Solo se pueden rechazar solicitudes pendientes' });
      if (error.message === 'MOTIVO_NO_EXISTE') return res.status(400).json({ mensaje: 'El motivo de rechazo indicado no existe' });

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
        throw new Error('NO_ENCONTRADA');
      }

      // Solo el propietario o el PAS pueden cancelar
      // Si es el usuario, debe ser SU solicitud
      if (req.user.rol !== 'pas' && solicitud.usuario_id !== usuarioId) {
        throw new Error('NO_PERMISO');
      }

      if (solicitud.estado !== 'pendiente') {
        throw new Error('NO_PENDIENTE_CANCELAR');
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
      if (error.message === 'NO_ENCONTRADA') return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
      if (error.message === 'NO_PERMISO') return res.status(403).json({ mensaje: 'No tienes permisos para cancelar esta solicitud' });
      if (error.message === 'NO_PENDIENTE_CANCELAR') return res.status(400).json({ mensaje: 'Solo se pueden cancelar solicitudes pendientes' });
      
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

function validarLimiteTrimestral(usuarioId) {
  return models.Configuracion.findAll({ where: { clave: { [Sequelize.Op.like]: 'TRIMESTRE_%_FIN' } } })
    .then(function (configs) {
      // Mapear configs a objeto
      var cfg = {};
      configs.forEach(c => cfg[c.clave] = c.valor); // "15-12", etc.

      var rango = obtenerRangoTrimestreActual(cfg);
      if (!rango) return true; // Si falla algo, permitimos por defecto (fail-open)

      return models.Solicitud.count({
        where: {
          usuario_id: usuarioId,
          tipo: 'uso_propio',
          creada_en: {
            [Sequelize.Op.gte]: rango.inicio,
            [Sequelize.Op.lte]: rango.fin
          },
          estado: { [Sequelize.Op.ne]: 'cancelada' } // Ignorar canceladas?
        }
      }).then(function (count) {
        return count < 5;
      });
    });
}

function obtenerRangoTrimestreActual(config) {
  // Config: { TRIMESTRE_1_FIN: '15-12', ... }
  // Formato 'DD-MM'

  var hoy = new Date();
  var year = hoy.getFullYear();

  // Parsear fechas fin
  // Asumimos fechas de fin naturales: 15-12 (del año actual), 15-03 (del año siguiente), 15-06 (año siguiente)
  // PERO curso fiscal es Sep-Junio.
  // T1: Sep 1 - 15 Dic
  // T2: 16 Dic - 15 Marzo
  // T3: 16 Marzo - 15 Junio

  // Helper para crear fecha
  var makeDate = function (str, y) {
    var parts = str.split('-'); // DD-MM
    return new Date(y, parseInt(parts[1]) - 1, parseInt(parts[0]), 23, 59, 59);
  };

  var finT1 = makeDate(config.TRIMESTRE_1_FIN || '15-12', year);
  var finT2 = makeDate(config.TRIMESTRE_2_FIN || '15-03', year);
  var finT3 = makeDate(config.TRIMESTRE_3_FIN || '15-06', year);

  // Ajuste de años si estamos en Q1 (Ene-Feb-Mar)
  // Si hoy es Enero 2026, finT1 fue Dic 2025. finT2 es Mar 2026.

  // Simplificación Lógica de Curso:
  // Curso empieza Sep año X.
  // T1: Sep X -> Dic X
  // T2: Dic X -> Mar X+1
  // T3: Mar X+1 -> Jun X+1

  var mesActual = hoy.getMonth(); // 0-11
  var inicioCursoYear = (mesActual >= 8) ? year : year - 1; // Si estamos en Ene-Ago, el curso empezó el año pasado

  finT1 = makeDate(config.TRIMESTRE_1_FIN || '15-12', inicioCursoYear); // Dic YearBase
  finT2 = makeDate(config.TRIMESTRE_2_FIN || '15-03', inicioCursoYear + 1); // Marzo YearBase+1
  finT3 = makeDate(config.TRIMESTRE_3_FIN || '15-06', inicioCursoYear + 1); // Junio YearBase+1

  var inicioT1 = new Date(inicioCursoYear, 8, 1); // 1 Sept
  var inicioT2 = new Date(finT1); inicioT2.setDate(inicioT2.getDate() + 1); inicioT2.setHours(0, 0, 0, 0);
  var inicioT3 = new Date(finT2); inicioT3.setDate(inicioT3.getDate() + 1); inicioT3.setHours(0, 0, 0, 0);

  if (hoy <= finT1) return { inicio: inicioT1, fin: finT1 };
  if (hoy <= finT2) return { inicio: inicioT2, fin: finT2 };
  if (hoy <= finT3) return { inicio: inicioT3, fin: finT3 };

  // Fuera de curso (Verano)? 
  // Devolvemos rango verano o null
  return null;
}

