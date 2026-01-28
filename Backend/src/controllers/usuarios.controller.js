var models = require('../models');
var Sequelize = require('sequelize');
var DateUtils = require('../utils/date.utils');

function obtenerPerfilActual(req, res) {
  var usuarioId = req.user.id;

  models.Usuario.findByPk(usuarioId, {
    attributes: [
      'id',
      'email',
      'nombre',
      'apellidos',
      'telefono',
      'rol',
      'estado_perfil',
      'codigo_tarjeta',
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
      'telefono',
      'rol',
      'estado_perfil',
      'codigo_tarjeta',
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
      'telefono',
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
    telefono: datos.telefono,
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
          telefono: usuarioActualizado.telefono,
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
    .then(function (configs) {
      // Convertir a objeto
      var cfg = {};
      configs.forEach(function (c) {
        cfg[c.clave] = c.valor;
      });

      var rango = DateUtils.obtenerRangoTrimestreActual(cfg);

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
        .then(function (usados) {
          res.json({
            usados: usados,
            limite: 5,
            trimestre_actual: rango.numero
          });
        });
    })
    .catch(function (error) {
      console.error('Error al obtener contador préstamos B:', error);
      res.status(500).json({ mensaje: 'Error al obtener contador' });
    });
}

;
// Buscar usuario por código de barras (PAS)
function buscarPorCodigoBarras(req, res) {
  var codigoBarras = req.query.codigo_barras;

  if (!codigoBarras) {
    return res.status(400).json({ mensaje: "Código de barras requerido" });
  }

  // 1. Buscar usuario por código de barras
  models.Usuario.findOne({
    where: { codigo_barras: codigoBarras },
    attributes: ['id', 'nombre', 'email', 'grado_id', 'codigo_barras', 'estado_perfil']
  })
    .then(function (usuario) {
      if (!usuario) {
        return res.status(404).json({ mensaje: "Alumno no encontrado" });
      }

      // 2. Verificar si tiene sanciones activas
      var inicioCurso = DateUtils.obtenerInicioCurso();

      return models.Sancion.findOne({
        where: {
          usuario_id: usuario.id,
          estado: 'activa',
          inicio: { [Sequelize.Op.gte]: inicioCurso },
          [Sequelize.Op.or]: [
            { fin: null },
            { fin: { [Sequelize.Op.gt]: new Date() } }
          ]
        }
      }).then(function (sancion) {
        res.json({
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          grado_id: usuario.grado_id,
          codigo_barras: usuario.codigo_barras,
          estado: usuario.estado_perfil,
          tieneOSanciones: !!sancion
        });
      });
    })
    .catch(function (error) {
      console.error('Error al buscar usuario:', error);
      res.status(500).json({ mensaje: "Error al buscar usuario" });
    });
}

/**
 * Genera un código de tarjeta único con formato EUSA[YYYY][NNNN]
 * Ejemplo: EUSA202400001
 */
function generarCodigoTarjeta() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const ms = now.getMilliseconds().toString().padStart(3, '0');

  // Formato: EUSA20260128094512555
  return `EUSA${year}${month}${day}${hours}${minutes}${seconds}${ms}`;
}

// CREAR NUEVO USUARIO (solo PAS)
function crearUsuario(req, res) {
  var datos = req.body;

  models.Usuario.create({
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    telefono: datos.telefono,
    email: datos.email,
    password_hash: datos.password_hash || '123456', // Password por defecto si no viene
    rol: datos.rol || 'alumno',
    grado_id: datos.grado_id,
    curso: datos.curso,
    tipo_estudios: datos.tipo_estudios,
    fecha_inicio_est: datos.fecha_inicio_est,
    fecha_fin_prev: datos.fecha_fin_prev,
    codigo_tarjeta: generarCodigoTarjeta() // ⬅️ AGREGAR ESTA LÍNEA
  })
    .then(function (usuario) {
      res.status(201).json({
        mensaje: 'Usuario creado correctamente',
        usuario: usuario
      });
    })
    .catch(function (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ mensaje: 'Error al crear el usuario', error: error.message });
    });
}

// Regenerar código de tarjeta de un usuario (solo PAS)
function regenerarCodigoTarjeta(req, res) {
  var usuarioId = req.params.id;

  models.Usuario.findByPk(usuarioId)
    .then(function (usuario) {
      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      // Generar nuevo código
      const nuevoCodigoTarjeta = generarCodigoTarjeta();

      return usuario.update({ codigo_tarjeta: nuevoCodigoTarjeta })
        .then(function () {
          res.json({
            mensaje: "Código de tarjeta regenerado",
            codigo_tarjeta: nuevoCodigoTarjeta
          });
        });
    })
    .catch(function (error) {
      console.error('Error regenerando código:', error);
      res.status(500).json({ error: error.message });
    });
}

module.exports = {
  obtenerPerfilActual: obtenerPerfilActual,
  listarUsuarios: listarUsuarios,
  crearUsuario: crearUsuario,
  obtenerDetalleUsuario: obtenerDetalleUsuario,
  actualizarUsuario: actualizarUsuario,
  regenerarCodigoTarjeta: regenerarCodigoTarjeta,
  obtenerContadorPrestamosB: obtenerContadorPrestamosB,
  obtenerContadorTipoB: obtenerContadorTipoB,
  buscarPorCodigoBarras: buscarPorCodigoBarras
};

function obtenerContadorTipoB(req, res) {
  var usuarioId = req.params.id; // ID del usuario solicitado
  var Sequelize = require('sequelize');

  // Obtener configuración de trimestres
  models.Configuracion.findAll({
    where: {
      clave: {
        [Sequelize.Op.like]: 'TRIMESTRE_%_FIN'
      }
    }
  })
    .then(function (configs) {
      // Convertir a objeto
      var cfg = {};
      configs.forEach(function (c) {
        cfg[c.clave] = c.valor;
      });

      var rango = DateUtils.obtenerRangoTrimestreActual(cfg);

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
        .then(function (usados) {
          res.json({
            usados: usados,
            limite: 5,
            trimestre_actual: rango.numero
          });
        });
    })
    .catch(function (error) {
      console.error('Error al obtener contador préstamos B (PAS):', error);
      res.status(500).json({ mensaje: 'Error al obtener contador' });
    });
}
