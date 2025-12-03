var models = require('../models');

function obtenerPerfilActual(req, res) {
  var usuarioId = req.user.id; // viene del middleware auth

  models.Usuario.findByPk(usuarioId, {
    attributes: [
      'id',
      'email',
      'nombre',
      'apellidos',
      'rol',
      'estado_perfil',
      'tipo_estudios',
      'fecha_inicio_est',
      'fecha_fin_prev'
    ]
  })
    .then(function (usuario) {
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      res.json(usuario);
    })
    .catch(function (error) {
      console.error('Error al obtener perfil actual:', error);
      res.status(500).json({ mensaje: 'Error al obtener el perfil del usuario' });
    });
}

module.exports = {
  obtenerPerfilActual: obtenerPerfilActual
};
