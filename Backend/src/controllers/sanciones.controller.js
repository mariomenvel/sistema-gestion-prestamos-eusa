var models = require('../models');

function obtenerMisSanciones(req, res) {
  var usuarioId = req.user.id;

  models.Sancion.findAll({
    where: { usuario_id: usuarioId },
    order: [['inicio', 'DESC']]
  })
    .then(function (sanciones) {
      res.json(sanciones);
    })
    .catch(function (error) {
      console.error('Error al obtener mis sanciones:', error);
      res.status(500).json({ mensaje: 'Error al obtener mis sanciones' });
    });
}

function obtenerSancionesActivas(req, res) {
  models.Sancion.findAll({
    where: { estado: 'activa' },
    include: [
      {
        model: models.Usuario
      }
    ],
    order: [['inicio', 'DESC']]
  })
    .then(function (sanciones) {
      res.json(sanciones);
    })
    .catch(function (error) {
      console.error('Error al obtener sanciones activas:', error);
      res.status(500).json({ mensaje: 'Error al obtener sanciones activas' });
    });
}

function finalizarSancion(req, res) {
  var sancionId = req.params.id;

  models.Sancion.findByPk(sancionId)
    .then(function (sancion) {
      if (!sancion) {
        return res.status(404).json({ mensaje: 'Sanción no encontrada' });
      }

      // Si ya está finalizada, no pasa nada
      if (sancion.estado === 'finalizada') {
        return res.json({
          mensaje: 'La sanción ya estaba finalizada',
          sancion: sancion
        });
      }

      sancion.estado = 'finalizada';

      if (!sancion.fin) {
        sancion.fin = new Date();
      }

      return sancion.save()
        .then(function (sancionGuardada) {
          res.json({
            mensaje: 'Sanción finalizada correctamente',
            sancion: sancionGuardada
          });
        });
    })
    .catch(function (error) {
      console.error('Error al finalizar sanción:', error);
      res.status(500).json({ mensaje: 'Error al finalizar la sanción' });
    });
}

function eliminarSancion(req, res) {
  var sancionId = req.params.id;

  models.Sancion.findByPk(sancionId)
    .then(function (sancion) {
      if (!sancion) {
        return res.status(404).json({ mensaje: 'Sanción no encontrada' });
      }

      return sancion.destroy()
        .then(function () {
          res.json({ mensaje: 'Sanción eliminada definitivamente' });
        });
    })
    .catch(function (error) {
      console.error('Error al eliminar sanción:', error);
      res.status(500).json({ mensaje: 'Error al eliminar la sanción' });
    });
}

function resetearSancionesUsuario(req, res) {
  var usuarioId = req.params.usuarioId;
  var ahora = new Date();

  models.Sancion.findAll({
    where: { usuario_id: usuarioId }
  })
    .then(function (sanciones) {
      if (sanciones.length === 0) {
        return res.json({
          mensaje: 'El usuario no tiene sanciones registradas',
          sanciones: []
        });
      }

      var promesas = sanciones.map(function (s) {
        s.estado = 'finalizada';
        if (!s.fin) {
          s.fin = ahora;
        }
        s.cuenta_para_escala = false;
        return s.save();
      });

      return Promise.all(promesas)
        .then(function (sancionesActualizadas) {
          res.json({
            mensaje: 'Sanciones del usuario reseteadas para nuevo curso',
            sanciones: sancionesActualizadas
          });
        });
    })
    .catch(function (error) {
      console.error('Error al resetear sanciones del usuario:', error);
      res.status(500).json({ mensaje: 'Error al resetear sanciones del usuario' });
    });
}




module.exports = {
  obtenerMisSanciones: obtenerMisSanciones,
  obtenerSancionesActivas: obtenerSancionesActivas,
  finalizarSancion: finalizarSancion,
  eliminarSancion: eliminarSancion,
  resetearSancionesUsuario: resetearSancionesUsuario
};
