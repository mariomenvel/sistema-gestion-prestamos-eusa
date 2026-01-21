var models = require("../models");
var db = require("../db");
var Sequelize = require('sequelize');
var DateUtils = require('../utils/date.utils');

/**
 * Prestamos del usuario (alumno/profesor)
 */
function obtenerMisPrestamos(req, res) {
  var usuarioId = req.user.id;

  models.Prestamo.findAll({
    where: { usuario_id: usuarioId },
    include: [
      {
        model: models.PrestamoItem,
        as: 'items',
        include: [
          { model: models.Unidad, include: [{ model: models.Equipo, as: 'equipo' }] },
          { model: models.Ejemplar, include: [{ model: models.Libro, as: 'libro' }] }
        ]
      },
      {
        model: models.Solicitud,
      },
    ],
    order: [["fecha_inicio", "DESC"]],
  })
    .then(function (prestamos) {
      res.json(prestamos);
    })
    .catch(function (error) {
      console.error("Error al obtener mis préstamos:", error);
      res.status(500).json({ mensaje: "Error al obtener mis préstamos" });
    });
}

/**
 * Prestamos activos (para PAS)
 */
function obtenerPrestamosActivos(req, res) {
  models.Prestamo.findAll({
    where: { estado: "activo" },
    include: [
      {
        model: models.Usuario, // quién tiene el préstamo
      },
      {
        model: models.PrestamoItem,
        as: 'items',
        include: [
          { model: models.Unidad, include: [{ model: models.Equipo, as: 'equipo' }] },
          { model: models.Ejemplar, include: [{ model: models.Libro, as: 'libro' }] }
        ]
      },
      {
        model: models.Solicitud,
      },
    ],
    order: [["fecha_inicio", "ASC"]],
  })
    .then(function (prestamos) {
      res.json(prestamos);
    })
    .catch(function (error) {
      console.error("Error al obtener préstamos activos (PAS):", error);
      res.status(500).json({ mensaje: "Error al obtener préstamos activos" });
    });
}

/**
 * Devolver un préstamo (solo PAS)
 */
function devolverPrestamo(req, res) {
  var prestamoId = req.params.id;

  // Opcional: devolver solo un item específico
  var prestamoItemId = req.body.prestamo_item_id;

  db.sequelize.transaction(function (t) {
    return models.Prestamo.findByPk(prestamoId, {
      include: [{ model: models.PrestamoItem, as: 'items' }],
      transaction: t
    })
      .then(function (prestamo) {
        if (!prestamo) throw new Error("NO_ENCONTRADO");
        if (prestamo.estado !== "activo") throw new Error("NO_ACTIVO");

        var itemsAProcesar = [];

        if (prestamoItemId) {
          // Devolución parcial de un item
          var item = prestamo.items.find(i => i.id == prestamoItemId);
          if (!item) throw new Error("ITEM_NO_ENCONTRADO");
          if (item.devuelto) throw new Error("ITEM_YA_DEVUELTO");
          itemsAProcesar.push(item);
        } else {
          // Devolución total (todos los items pendientes)
          itemsAProcesar = prestamo.items.filter(i => !i.devuelto);
        }

        if (itemsAProcesar.length === 0) {
          throw new Error("NADA_QUE_DEVOLVER");
        }

        var promesasDevolucion = itemsAProcesar.map(function (item) {
          item.devuelto = true;
          item.fecha_devolucion = new Date(); // Fecha real de este item

          var pLiberar = Promise.resolve();

          // Liberar Unidad
          if (item.unidad_id) {
            pLiberar = models.Unidad.findByPk(item.unidad_id, { transaction: t })
              .then(function (u) {
                if (u) {
                  u.esta_prestado = false;
                  return u.save({ transaction: t });
                }
              });
          }
          // Liberar Ejemplar
          else if (item.ejemplar_id) {
            pLiberar = models.Ejemplar.findByPk(item.ejemplar_id, { transaction: t })
              .then(function (e) {
                if (e) {
                  e.estado = 'disponible';
                  return e.save({ transaction: t });
                }
              });
          }

          return pLiberar.then(function () {
            return item.save({ transaction: t });
          });
        });

        return Promise.all(promesasDevolucion).then(function () {
          // Verificar si queda algo pendiente en el préstamo
          return models.PrestamoItem.count({
            where: {
              prestamo_id: prestamo.id,
              devuelto: false
            },
            transaction: t
          }).then(function (pendientes) {
            if (pendientes === 0) {
              // Cerrar préstamo completo
              prestamo.estado = 'cerrado';
              prestamo.fecha_devolucion_real = new Date();

              // Cálculo de sanciones (simplificado: solo si cierra el préstamo tardío)
              // Podría mejorarse para sancionar por item tardío
              return prestamo.save({ transaction: t }).then(function () {
                return checkSancion(prestamo, t);
              });
            }
          });
        });
      });
  })
    .then(function () {
      res.json({ mensaje: "Devolución procesada correctamente" });
    })
    .catch(function (error) {
      if (error.message === "NO_ENCONTRADO") return res.status(404).json({ mensaje: "Préstamo no encontrado" });
      if (error.message === "NO_ACTIVO") return res.status(400).json({ mensaje: "El préstamo no está activo" });
      if (error.message === "ITEM_NO_ENCONTRADO") return res.status(404).json({ mensaje: "Item no encontrado en este préstamo" });
      if (error.message === "ITEM_YA_DEVUELTO") return res.status(400).json({ mensaje: "El item ya fue devuelto" });

      console.error("Error al devolver préstamo:", error);
      res.status(500).json({ mensaje: "Error al devolver el préstamo" });
    });
}

function checkSancion(prestamo, t) {
  var fechaPrevista = prestamo.fecha_devolucion_prevista;
  var fechaReal = prestamo.fecha_devolucion_real;
  if (!fechaPrevista || !fechaReal) return;

  var msPorDia = 24 * 60 * 60 * 1000;
  var diffMs = fechaReal.getTime() - fechaPrevista.getTime();
  var diasRetraso = Math.floor(diffMs / msPorDia);

  if (diasRetraso <= 0) return;

  var inicioCurso = DateUtils.obtenerInicioCurso();
  return models.Sancion.count({
    where: {
      usuario_id: prestamo.usuario_id,
      inicio: { [Sequelize.Op.gte]: inicioCurso },
    },
    transaction: t,
  }).then(function (numSancionesPrevias) {
    var severidad;
    var inicio = new Date();
    var fin = null;

    if (numSancionesPrevias === 0) {
      severidad = "s1_1sem";
      fin = new Date(inicio.getTime());
      fin.setDate(fin.getDate() + 7);
    } else if (numSancionesPrevias === 1) {
      severidad = "s2_1mes";
      fin = new Date(inicio.getTime());
      fin.setMonth(fin.getMonth() + 1);
    } else {
      severidad = "s3_indefinida";
      fin = null;
    }

    return models.Sancion.create({
      usuario_id: prestamo.usuario_id,
      severidad: severidad,
      estado: "activa",
      inicio: inicio,
      fin: fin,
      motivo: "Retraso préstamo ID " + prestamo.id,
    }, { transaction: t });
  });
}

function obtenerDetallePrestamo(req, res) {
  var prestamoId = req.params.id;
  var usuarioId = req.user.id;
  var esPas = req.user.rol === 'pas';

  models.Prestamo.findByPk(prestamoId, {
    include: [
      { model: models.Usuario }, // Para ver quién lo tiene
      {
        model: models.PrestamoItem,
        as: 'items',
        include: [
          { model: models.Unidad, include: [{ model: models.Equipo, as: 'equipo' }] },
          { model: models.Ejemplar, include: [{ model: models.Libro, as: 'libro' }] }
        ]
      },
      { model: models.Solicitud }
    ]
  })
    .then(function (prestamo) {
      if (!prestamo) {
        return res.status(404).json({ mensaje: 'Préstamo no encontrado' });
      }

      // Seguridad: Solo PAS o el dueño del préstamo
      if (!esPas && prestamo.usuario_id !== usuarioId) {
        return res.status(403).json({ mensaje: 'No tienes permiso para ver este préstamo' });
      }

      res.json(prestamo);
    })
    .catch(function (error) {
      console.error('Error al obtener detalle préstamo:', error);
      res.status(500).json({ mensaje: 'Error interno' });
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
        return res.status(404).json({ mensaje: "Préstamo no encontrado" });
      }

      if (prestamo.estado !== "activo") {
        return res
          .status(400)
          .json({ mensaje: "Solo se pueden ampliar préstamos activos" });
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

      return prestamo.save().then(function (prestamoGuardado) {
        res.json({
          mensaje: "Préstamo ampliado correctamente",
          nuevo_plazo: prestamoGuardado.fecha_devolucion_prevista,
        });
      });
    })
    .catch(function (error) {
      console.error("Error al ampliar préstamo (PAS):", error);
      res.status(500).json({ mensaje: "Error al ampliar el préstamo" });
    });
}

// Crear préstamo presencial (solo PAS)
function crearPrestamoPresencial(req, res) {
  var usuarioId = req.body.usuario_id;
  var materiales = req.body.materiales;  // Array de {tipo, ejemplar_id/unidad_id}
  var fechaDevolucion = req.body.fecha_devolucion_prevista;
  var observaciones = req.body.observaciones || 'Préstamo presencial';
  var pasId = req.user.id;  // Quién registra el préstamo

  // 1. Validar que el alumno existe y no tiene sanciones
  models.Usuario.findByPk(usuarioId)
    .then(function (usuario) {
      if (!usuario) {
        throw { status: 404, mensaje: "Usuario no encontrado" };
      }

      // 2. Verificar si el usuario tiene sanciones activas
      var inicioCurso = DateUtils.obtenerInicioCurso();

      return models.Sancion.findOne({
        where: {
          usuario_id: usuarioId,
          estado: 'activa',
          inicio: { [Sequelize.Op.gte]: inicioCurso },
          [Sequelize.Op.or]: [
            { fin: null },
            { fin: { [Sequelize.Op.gt]: new Date() } }
          ]
        }
      }).then(function (sancion) {
        if (sancion) {
          throw { status: 403, mensaje: "El usuario tiene sanciones activas" };
        }
        return usuario;
      });
    })
    .then(function (usuario) {
      // 3. Crear transacción para préstamo + items
      return db.sequelize.transaction(function (t) {
        // 3a. Crear el préstamo
        return models.Prestamo.create({
          usuario_id: usuarioId,
          tipo: 'b',  // Siempre Tipo B (uso personal)
          estado: 'activo',
          fecha_inicio: new Date(),
          fecha_devolucion_prevista: fechaDevolucion,
          observaciones: observaciones,
          // registrado_por_id: pasId // Note: Prestamo model may not have 'registrado_por_id'. I will check model or just omit if unnecessary.
          // Viewing Prestamo.js model earlier: It has usuario_id, solicitud_id, tipo, estado, fecha_inicio, fecha_devolucion_prevista, fecha_devolucion_real, profesor_solicitante_id.
          // It DOES NOT have registrado_por_id. So I will omit this field to avoid SQL error.
        }, { transaction: t })
          .then(function (prestamo) {
            // 3b. Procesar cada material
            var promesasItems = [];

            if (!materiales || materiales.length === 0) {
              throw { status: 400, mensaje: "Debe agregar al menos un libro o equipo" };
            }

            materiales.forEach(function (material) {
              if (material.tipo === 'libro' && material.ejemplar_id) {
                // Procesar libro
                var pLibro = models.Ejemplar.findByPk(material.ejemplar_id, { transaction: t })
                  .then(function (ejemplar) {
                    if (!ejemplar) throw new Error('EJEMPLAR_NO_EXISTE');
                    if (ejemplar.estado !== 'disponible') {
                      throw new Error('EJEMPLAR_NO_DISPONIBLE');
                    }

                    // Marcar como no disponible
                    ejemplar.estado = 'no_disponible';
                    return ejemplar.save({ transaction: t });
                  })
                  .then(function () {
                    // Crear item del préstamo
                    return models.PrestamoItem.create({
                      prestamo_id: prestamo.id,
                      ejemplar_id: material.ejemplar_id,
                      unidad_id: null,
                      devuelto: false
                    }, { transaction: t });
                  });

                promesasItems.push(pLibro);
              }
              else if (material.tipo === 'equipo' && material.unidad_id) {
                // Procesar equipo
                var pEquipo = models.Unidad.findByPk(material.unidad_id, { transaction: t })
                  .then(function (unidad) {
                    if (!unidad) throw new Error('UNIDAD_NO_EXISTE');
                    if (unidad.esta_prestado) throw new Error('UNIDAD_YA_PRESTADA');

                    // Marcar como prestado
                    unidad.esta_prestado = true;
                    return unidad.save({ transaction: t });
                  })
                  .then(function () {
                    // Crear item del préstamo
                    return models.PrestamoItem.create({
                      prestamo_id: prestamo.id,
                      ejemplar_id: null,
                      unidad_id: material.unidad_id,
                      devuelto: false
                    }, { transaction: t });
                  });

                promesasItems.push(pEquipo);
              }
            });

            return Promise.all(promesasItems).then(function () {
              return prestamo;
            });
          });
      });
    })
    .then(function (prestamo) {
      // 4. Obtener préstamo con items para responder
      return models.Prestamo.findByPk(prestamo.id, {
        include: [
          {
            model: models.PrestamoItem,
            as: 'items',
            include: [
              { model: models.Unidad, include: [{ model: models.Equipo, as: 'equipo' }] },
              { model: models.Ejemplar, include: [{ model: models.Libro, as: 'libro' }] }
            ]
          }
        ]
      }).then(function (prestamoCompleto) {
        res.status(201).json({
          mensaje: "Préstamo presencial registrado exitosamente",
          prestamo: prestamoCompleto
        });
      });
    })
    .catch(function (error) {
      if (error.status) {
        return res.status(error.status).json({ mensaje: error.mensaje });
      }
      if (error.message === 'EJEMPLAR_NO_EXISTE') {
        return res.status(404).json({ mensaje: "Ejemplar no encontrado" });
      }
      if (error.message === 'EJEMPLAR_NO_DISPONIBLE') {
        return res.status(400).json({ mensaje: "El ejemplar no está disponible (ya prestado o bloqueado)" });
      }
      if (error.message === 'UNIDAD_NO_EXISTE') {
        return res.status(404).json({ mensaje: "Unidad no encontrada" });
      }
      if (error.message === 'UNIDAD_YA_PRESTADA') {
        return res.status(400).json({ mensaje: "La unidad ya está prestada" });
      }

      console.error('Error al crear préstamo presencial:', error);
      res.status(500).json({ mensaje: "Error al crear préstamo presencial" });
    });
}

module.exports = {
  obtenerMisPrestamos: obtenerMisPrestamos,
  obtenerPrestamosActivos: obtenerPrestamosActivos,
  devolverPrestamo: devolverPrestamo,
  ampliarPrestamo: ampliarPrestamo,
  obtenerDetallePrestamo: obtenerDetallePrestamo,
  crearPrestamoPresencial: crearPrestamoPresencial
};
