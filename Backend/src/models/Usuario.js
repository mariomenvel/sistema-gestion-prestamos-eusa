var Sequelize = require('sequelize');
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
    // DBML: enum(alumno,profesor,pas)
    type: Sequelize.ENUM('alumno', 'profesor', 'pas'),
    allowNull: false
  },
  estado_perfil: {
    // DBML: enum(activo,bloqueado,inactivo) [ default: ACTIVO ]
    // Usamos 'activo' en minúsculas para que coincida con el enum
    type: Sequelize.ENUM('activo', 'bloqueado', 'inactivo'),
    allowNull: false,
    defaultValue: 'activo'
  },
  tipo_estudios: {
    // DBML: enum(grado_uni,grado_sup,master)
    type: Sequelize.ENUM('grado_uni', 'grado_sup', 'master'),
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
  tableName: 'usuarios',   // exactamente igual que en el DBML
  timestamps: true         // createdAt y updatedAt
});

Usuario.associate = function(models) {
  // Un usuario (alumno/profesor) puede crear muchas solicitudes
  Usuario.hasMany(models.Solicitud, {
    foreignKey: 'usuario_id'
  });

  // Un usuario (PAS) puede gestionar muchas solicitudes
  Usuario.hasMany(models.Solicitud, {
    as: 'solicitudesGestionadas',
    foreignKey: 'gestionado_por_id'
  });

  // Un usuario (alumno) puede tener muchos préstamos como prestatario
  Usuario.hasMany(models.Prestamo, {
    foreignKey: 'usuario_id'
  });

  // Un usuario (profesor) puede aparecer como profesor solicitante en muchos préstamos
  Usuario.hasMany(models.Prestamo, {
    as: 'prestamosComoProfesor',
    foreignKey: 'profesor_solicitante_id'
  });

  // Un usuario puede tener muchas sanciones
  Usuario.hasMany(models.Sancion, {
    foreignKey: 'usuario_id'
  });

  // Un usuario puede recibir muchas notificaciones
  Usuario.hasMany(models.Notificacion, {
    foreignKey: 'usuario_id'
  });
};

module.exports = Usuario;
