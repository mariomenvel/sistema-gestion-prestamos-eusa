var models = require('../models');
var db = require('../db');
var Sequelize = require('sequelize');
var { calcularSiguienteDiaLectivo } = require('./solicitudes.controller');

// GET /presencial/usuario/:codigo
function buscarUsuarioPorTarjeta(req, res) {
    var codigo = req.params.codigo;

    models.Usuario.findOne({
        where: { codigo_tarjeta: codigo },
        include: [
            {
                model: models.Sancion,
                required: false,
                where: { estado: 'activa' } // Solo traer activas para comprobar bloqueo rápido
            }
        ]
    })
        .then(function (usuario) {
            if (!usuario) {
                return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            }

            var bloqueado = false;
            var sancionesActivas = [];

            if (usuario.Sancions && usuario.Sancions.length > 0) {
                // Comprobar fechas
                var hoy = new Date();
                sancionesActivas = usuario.Sancions.filter(s => {
                    return (!s.fin || s.fin > hoy);
                });
                if (sancionesActivas.length > 0) bloqueado = true;
            }

            // Obtener historial completo (opcional, en otra query si es muy pesado)
            var historialPromesa = models.Prestamo.findAll({
                where: { usuario_id: usuario.id },
                limit: 5,
                order: [['fecha_inicio', 'DESC']],
                include: [{ model: models.PrestamoItem, as: 'items', include: [models.Unidad, models.Ejemplar] }] // Para ver qué se llevó
            });

            return historialPromesa.then(function (historial) {
                res.json({
                    usuario: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        apellidos: usuario.apellidos,
                        email: usuario.email,
                        rol: usuario.rol,
                        grado: usuario.grado,
                        curso: usuario.curso,
                        foto: usuario.foto // Si existiera
                    },
                    bloqueado: bloqueado,
                    sanciones: sancionesActivas,
                    historial_reciente: historial
                });
            });
        })
        .catch(function (error) {
            console.error('Error al buscar usuario por tarjeta:', error);
            res.status(500).json({ mensaje: 'Error interno' });
        });
}

// POST /presencial/checkout
// Body: { codigo_tarjeta: '...', items: { unidades: [1,2], ejemplares: [] }, forzar_prestamo: true/false, profesor_id: 123, fecha_limite: 'YYYY-MM-DD HH:mm'}
function crearPrestamoPresencial(req, res) {
    var codigo = req.body.codigo_tarjeta;
    var entregas = req.body.entregas || {};
    var unidadesIds = entregas.unidades || [];
    var ejemplaresIds = entregas.ejemplares || [];
    var pasId = req.user.id; // PAS autenticado

    // Opciones autorizadas por profesor
    var forzar = req.body.forzar_prestamo === true;
    var profesorId = req.body.profesor_id || null;
    var fechaLimiteCustom = req.body.fecha_limite || null;

    if (!codigo) return res.status(400).json({ mensaje: 'Falta código de tarjeta' });
    if (unidadesIds.length === 0 && ejemplaresIds.length === 0) return res.status(400).json({ mensaje: 'Cesta vacía' });

    db.sequelize.transaction(function (t) {
        // 1. Buscar Usuario
        return models.Usuario.findOne({ where: { codigo_tarjeta: codigo }, transaction: t })
            .then(function (usuario) {
                if (!usuario) throw new Error('USUARIO_NO_ENCONTRADO');
                // IMPORTANTE: Si es profesor, no comprobamos sanciones igual que a alumnos (regla de negocio?)
                // Asumimos que profesor siempre puede. Si es alumno, miramos sanciones.

                if (usuario.rol === 'alumno' && !forzar) {
                    // Validar Sanciones (Rápido)
                    return models.Sancion.findOne({
                        where: {
                            usuario_id: usuario.id,
                            estado: 'activa',
                            inicio: { [Sequelize.Op.lte]: new Date() },
                            [Sequelize.Op.or]: [{ fin: null }, { fin: { [Sequelize.Op.gt]: new Date() } }]
                        },
                        transaction: t
                    }).then(function (sancion) {
                        if (sancion) throw new Error('USUARIO_SANCIONADO');
                        return usuario;
                    });
                }

                return usuario;
            })
            .then(function (usuario) {
                // 2. Crear Solicitud Fantasma
                return models.Solicitud.create({
                    usuario_id: usuario.id,
                    tipo: 'presencial',
                    estado: 'aprobada', // Nace aprobada
                    normas_aceptadas: true, // Se asume firma presencial
                    gestionado_por_id: pasId,
                    creada_en: new Date(),
                    resuelta_en: new Date(),
                    observaciones: forzar ? 'Préstamo forzado/autorizado por profesor' : 'Préstamo presencial automático'
                }, { transaction: t });
            })
            .then(function (solicitud) {
                // 3. Crear Préstamo (Vence HOY 21:00 o fecha personalizada)
                var fechaDev;

                if (fechaLimiteCustom) {
                    fechaDev = new Date(fechaLimiteCustom);
                } else {
                    fechaDev = new Date();
                    fechaDev.setHours(21, 0, 0, 0); // Default hoy 21:00
                }

                return models.Prestamo.create({
                    usuario_id: solicitud.usuario_id,
                    solicitud_id: solicitud.id,
                    tipo: 'c', // Presencial
                    estado: 'activo',
                    fecha_inicio: new Date(),
                    fecha_devolucion_prevista: fechaDev,
                    profesor_solicitante_id: profesorId
                }, { transaction: t });
            })
            .then(function (prestamo) {
                // 4. Procesar Items (Copiar lógica de aprobacion)
                var promesasItems = [];

                // Procesar UNIDADES
                unidadesIds.forEach(function (uId) {
                    var p = models.Unidad.findByPk(uId, { transaction: t })
                        .then(function (unidad) {
                            if (!unidad) throw new Error('UNIDAD_NO_EXISTE');
                            if (unidad.esta_prestado) throw new Error('UNIDAD_YA_PRESTADA');

                            if (['funciona', 'obsoleto'].indexOf(unidad.estado_fisico) === -1) {
                                throw new Error('UNIDAD_NO_APTA');
                            }

                            unidad.esta_prestado = true;
                            return unidad.save({ transaction: t });
                        })
                        .then(function () {
                            return models.PrestamoItem.create({
                                prestamo_id: prestamo.id,
                                unidad_id: uId,
                                devuelto: false
                            }, { transaction: t });
                        });
                    promesasItems.push(p);
                });

                // Procesar EJEMPLARES
                ejemplaresIds.forEach(function (eId) {
                    var p = models.Ejemplar.findByPk(eId, { transaction: t })
                        .then(function (ejemplar) {
                            if (!ejemplar) throw new Error('EJEMPLAR_NO_EXISTE');
                            if (ejemplar.estado !== 'disponible') throw new Error('EJEMPLAR_NO_DISPONIBLE');

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

                return Promise.all(promesasItems);
            });
    })
        .then(function () {
            res.json({ mensaje: 'Préstamo presencial creado correctamente' });
        })
        .catch(function (error) {
            console.error('Error checkout presencial:', error);
            if (error.message === 'USUARIO_NO_ENCONTRADO') return res.status(404).json({ mensaje: 'Usuario no encontrado' });
            if (error.message === 'USUARIO_SANCIONADO') return res.status(403).json({ mensaje: 'Usuario tiene sanciones activas' });
            if (error.message === 'UNIDAD_YA_PRESTADA') return res.status(400).json({ mensaje: 'Un item ya está prestado' });
            res.status(500).json({ mensaje: 'Error creando préstamo presencial' });
        });
}

// GET /presencial/item/:codigo
function buscarItemPorCodigo(req, res) {
    var codigo = req.params.codigo;

    // 1. Buscar en Unidades (Equipos)
    models.Unidad.findOne({
        where: { codigo_barra: codigo },
        include: [{ model: models.Equipo, as: 'equipo' }]
    })
        .then(function (unidad) {
            if (unidad) {
                return res.json({
                    tipo: 'unidad',
                    id: unidad.id, // ID interno para el checkout
                    codigo: unidad.codigo_barra,
                    titulo: unidad.equipo ? unidad.equipo.nombre : 'Equipo desconocido',
                    estado: unidad.estado_fisico,
                    disponible: !unidad.esta_prestado
                });
            }

            // 2. Buscar en Ejemplares (Libros)
            return models.Ejemplar.findOne({
                where: { codigo_barra: codigo },
                include: [{ model: models.Libro, as: 'libro' }]
            }).then(function (ejemplar) {
                if (ejemplar) {
                    return res.json({
                        tipo: 'ejemplar',
                        id: ejemplar.id,
                        codigo: ejemplar.codigo_barra,
                        titulo: ejemplar.libro ? ejemplar.libro.titulo : 'Libro desconocido',
                        estado: ejemplar.estado,
                        disponible: ejemplar.estado === 'disponible'
                    });
                }

                // 3. No encontrado
                return res.status(404).json({ mensaje: 'Item no encontrado' });
            });
        })
        .catch(function (error) {
            console.error('Error buscando item:', error);
            res.status(500).json({ mensaje: 'Error al buscar item' });
        });
}

module.exports = {
    buscarUsuarioPorTarjeta,
    crearPrestamoPresencial,
    buscarItemPorCodigo
};
