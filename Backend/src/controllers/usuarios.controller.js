var models = require('../models');

function obtenerPerfilActual(req, res) {
  var usuarioId = req.user.id;

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

// LISTAR TODOS LOS USUARIOS (solo PAS)
function listarUsuarios(req, res) {
  // Más adelante se pueden añadir filtros por rol, estado, etc.
  models.Usuario.findAll({
    attributes: [
      'id',
      'email',
      'nombre',
      'apellidos',
      'rol',
      'estado_perfil',
      'tipo_estudios'
    ],
    order: [['nombre', 'ASC']]
  })
    .then(function (usuarios) {
      res.json(usuarios);
    })
    .catch(function (error) {
      console.error('Error al listar usuarios:', error);
      res.status(500).json({ mensaje: 'Error al obtener la lista de usuarios' });
    });
}

// DETALLE DE UN USUARIO (solo PAS)
// Incluye datos básicos + préstamos + solicitudes + sanciones
function obtenerDetalleUsuario(req, res) {
  var usuarioId = req.params.id;

  // 1) Datos básicos del usuario
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

      // 2) Cargar préstamos, solicitudes y sanciones en paralelo
      var promesas = [];

      var promPrestamos = models.Prestamo.findAll({
        where: { usuario_id: usuarioId },
        order: [['fecha_inicio', 'DESC']]
      });

      promesas.push(promPrestamos);

      var promSolicitudes = models.Solicitud.findAll({
        where: { usuario_id: usuarioId },
        order: [['creada_en', 'DESC']]
      });

      promesas.push(promSolicitudes);

      var promSanciones = models.Sancion.findAll({
        where: { usuario_id: usuarioId },
        order: [['inicio', 'DESC']]
      });

      promesas.push(promSanciones);

      return Promise.all(promesas)
        .then(function (resultados) {
          var prestamos = resultados[0];
          var solicitudes = resultados[1];
          var sanciones = resultados[2];

          res.json({
            usuario: usuario,
            prestamos: prestamos,
            solicitudes: solicitudes,
            sanciones: sanciones
          });
        });
    })
    .catch(function (error) {
      console.error('Error al obtener detalle de usuario:', error);
      res.status(500).json({ mensaje: 'Error al obtener el detalle del usuario' });
    });
}

// ACTUALIZAR DATOS DE UN USUARIO (solo PAS)
function actualizarUsuario(req, res) {
  var usuarioId = req.params.id;
  var datos = req.body;

  // Campos permitidos para actualizar
  var camposActualizables = {
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    email: datos.email,
    tipo_estudios: datos.tipo_estudios,
    fecha_inicio_est: datos.fecha_inicio_est,
    fecha_fin_prev: datos.fecha_fin_prev,
    estado_perfil: datos.estado_perfil
  };

  // Eliminar campos undefined
  Object.keys(camposActualizables).forEach(function(key) {
    if (camposActualizables[key] === undefined) {
      delete camposActualizables[key];
    }
  });

  models.Usuario.findByPk(usuarioId)
    .then(function(usuario) {
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      return usuario.update(camposActualizables);
    })
    .then(function(usuarioActualizado) {
      res.json({
        mensaje: 'Usuario actualizado correctamente',
        usuario: {
          id: usuarioActualizado.id,
          email: usuarioActualizado.email,
          nombre: usuarioActualizado.nombre,
          apellidos: usuarioActualizado.apellidos,
          rol: usuarioActualizado.rol,
          estado_perfil: usuarioActualizado.estado_perfil,
          tipo_estudios: usuarioActualizado.tipo_estudios,
          fecha_inicio_est: usuarioActualizado.fecha_inicio_est,
          fecha_fin_prev: usuarioActualizado.fecha_fin_prev
        }
      });
    })
    .catch(function(error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
    });
}

module.exports = {
  obtenerPerfilActual: obtenerPerfilActual,
  listarUsuarios: listarUsuarios,
  obtenerDetalleUsuario: obtenerDetalleUsuario,
  actualizarUsuario: actualizarUsuario
};
