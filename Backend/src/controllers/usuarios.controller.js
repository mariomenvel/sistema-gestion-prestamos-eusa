var models = require('../models');
var Sequelize = require('sequelize');

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
  var { rol, q } = req.query;
  var whereClause = {};

  if (rol) {
    whereClause.rol = rol;
  }

  if (q) {
    // Búsqueda simple por nombre o apellidos (LIKE)
    whereClause[Sequelize.Op.or] = [
      { nombre: { [Sequelize.Op.like]: '%' + q + '%' } },
      { apellidos: { [Sequelize.Op.like]: '%' + q + '%' } }
    ];
  }

  models.Usuario.findAll({
    where: whereClause,
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
      'codigo_tarjeta',
      'nombre',
      'apellidos',
      'rol',
      'estado_perfil',
      'tipo_estudios',
      'grado_id',      
      'curso',     
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
    estado_perfil: datos.estado_perfil,
    grado_id: datos.grado_id // Nuevo
  };

  // Eliminar campos undefined
  Object.keys(camposActualizables).forEach(function (key) {
    if (camposActualizables[key] === undefined) {
      delete camposActualizables[key];
    }
  });

  models.Usuario.findByPk(usuarioId)
    .then(function (usuario) {
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      return usuario.update(camposActualizables);
    })
    .then(function (usuarioActualizado) {
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
    .catch(function (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
    });
}

function obtenerContadorPrestamosB(req, res) {
  var usuarioId = req.user.id;
  var Sequelize = require('sequelize');
  
  // Obtener configuración de trimestres
  models.Configuracion.findAll({
    where: {
      clave: {
        [Sequelize.Op.like]: 'TRIMESTRE_%_FIN'
      }
    }
  })
  .then(function(configs) {
    // Convertir a objeto
    var cfg = {};
    configs.forEach(function(c) {
      cfg[c.clave] = c.valor;
    });
    
    var rango = obtenerRangoTrimestreActual(cfg);
    
    if (!rango) {
      // Fuera de curso (verano), devolver ceros
      return res.json({
        usados: 0,
        limite: 5,
        trimestre_actual: 0,
        mensaje: 'Fuera del periodo lectivo'
      });
    }
    
    // Contar préstamos tipo B en el trimestre actual
    return models.Prestamo.count({
      where: {
        usuario_id: usuarioId,
        tipo: 'b',
        fecha_inicio: {
          [Sequelize.Op.between]: [rango.inicio, rango.fin]
        }
      }
    })
    .then(function(usados) {
      res.json({
        usados: usados,
        limite: 5,
        trimestre_actual: calcularNumeroTrimestre(rango, cfg)
      });
    });
  })
  .catch(function(error) {
    console.error('Error al obtener contador préstamos B:', error);
    res.status(500).json({ mensaje: 'Error al obtener contador' });
  });
}

function calcularNumeroTrimestre(rango, cfg) {
  var hoy = new Date();
  var finT1 = parsearFecha(cfg.TRIMESTRE_1_FIN);
  var finT2 = parsearFecha(cfg.TRIMESTRE_2_FIN);
  
  if (hoy <= finT1) return 1;
  if (hoy <= finT2) return 2;
  return 3;
}

function parsearFecha(str) {
  // str = "15-12" (DD-MM)
  var hoy = new Date();
  var year = hoy.getFullYear();
  var parts = str.split('-');
  var mes = parseInt(parts[1]) - 1;
  var dia = parseInt(parts[0]);
  
  // Ajustar año si estamos en Q1 del año siguiente
  if (hoy.getMonth() < 8 && mes > 8) {
    year = year - 1;
  }
  
  return new Date(year, mes, dia, 23, 59, 59);
}
;
module.exports = {
  obtenerPerfilActual: obtenerPerfilActual,
  listarUsuarios: listarUsuarios,
  obtenerDetalleUsuario: obtenerDetalleUsuario,
  actualizarUsuario: actualizarUsuario,
  obtenerContadorPrestamosB: obtenerContadorPrestamosB 
};
