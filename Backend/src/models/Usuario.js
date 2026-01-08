var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');
var db = require('../db');

var Usuario = db.sequelize.define('Usuario', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },

  email: {
    type: Sequelize.STRING(255),
    allowNull: false,
    unique: true
  },

  password_hash: {
    type: Sequelize.STRING(255),
    allowNull: false
  },

  nombre: {
    type: Sequelize.STRING(120),
    allowNull: false
  },

  apellidos: {
    type: Sequelize.STRING(150),
    allowNull: false
  },

  rol: {
    type: Sequelize.ENUM('alumno', 'profesor', 'pas'),
    allowNull: false
  },

  estado_perfil: {
    type: Sequelize.ENUM('activo', 'bloqueado', 'inactivo'),
    allowNull: false,
    defaultValue: 'activo'
  },

  // 🔹 Datos académicos
  tipo_estudios: {
    type: Sequelize.ENUM('grado_uni', 'grado_sup', 'master'),
    allowNull: true
  },

  grado: {
    type: Sequelize.STRING(100),
    allowNull: true
  },

  curso: {
    type: Sequelize.INTEGER,
    allowNull: true
  },

  fecha_inicio_est: {
    type: Sequelize.DATEONLY,
    allowNull: true
  },

  fecha_fin_prev: {
    type: Sequelize.DATEONLY,
    allowNull: true
  }

}, {
  tableName: 'usuarios',
  timestamps: true,

  hooks: {

    // 🔐 Hash de contraseña al crear usuario
    beforeCreate: async function (usuario) {
      if (usuario.password_hash) {
        var salt = await bcrypt.genSalt(10);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    },

    // 🔐 Hash de contraseña al actualizarla
    beforeUpdate: async function (usuario) {
      if (usuario.changed('password_hash')) {
        var salt = await bcrypt.genSalt(10);
        usuario.password_hash = await bcrypt.hash(usuario.password_hash, salt);
      }
    }
  }
});

// ======================
// Asociaciones
// ======================
Usuario.associate = function(models) {

  // Solicitudes creadas por el usuario (alumno/profesor)
  Usuario.hasMany(models.Solicitud, {
    foreignKey: 'usuario_id'
  });

  // Solicitudes gestionadas por PAS
  Usuario.hasMany(models.Solicitud, {
    as: 'solicitudesGestionadas',
    foreignKey: 'gestionado_por_id'
  });

  // Préstamos como prestatario
  Usuario.hasMany(models.Prestamo, {
    foreignKey: 'usuario_id'
  });

  // Préstamos donde aparece como profesor solicitante
  Usuario.hasMany(models.Prestamo, {
    as: 'prestamosComoProfesor',
    foreignKey: 'profesor_solicitante_id'
  });

  // Sanciones del usuario
  Usuario.hasMany(models.Sancion, {
    foreignKey: 'usuario_id'
  });

  // Notificaciones recibidas
  Usuario.hasMany(models.Notificacion, {
    foreignKey: 'usuario_id'
  });
};

module.exports = Usuario;
