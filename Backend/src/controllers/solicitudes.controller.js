var models = require('../models');

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

  // Validaciones básicas
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

  // Crear la solicitud
  models.Solicitud.create({
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
  })
    .then(function (solicitud) {
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

  models.Solicitud.findByPk(solicitudId)
    .then(function (solicitud) {
      if (!solicitud) {
        return res.status(404).json({ mensaje: 'Solicitud no encontrada' });
      }

      if (solicitud.estado !== 'pendiente') {
        return res.status(400).json({ mensaje: 'Solo se pueden aprobar solicitudes pendientes' });
      }

      solicitud.estado = 'aprobada';
      solicitud.gestionado_por_id = pasId;
      solicitud.resuelta_en = new Date();

      return solicitud.save();
    })
    .then(function (solicitudGuardada) {
      if (!solicitudGuardada) {
        return; // ya se respondió antes
      }

      res.json({
        mensaje: 'Solicitud aprobada correctamente',
        solicitud: solicitudGuardada
      });
    })
    .catch(function (error) {
      console.error('Error al aprobar solicitud:', error);
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

