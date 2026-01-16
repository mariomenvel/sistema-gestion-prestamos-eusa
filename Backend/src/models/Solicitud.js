var Sequelize = require('sequelize');
var db = require('../db');

var Solicitud = db.sequelize.define('Solicitud', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  usuario_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  tipo: {
    // enum(prof_trabajo,uso_propio, presencial)
    type: Sequelize.ENUM('prof_trabajo', 'uso_propio', 'presencial'),
    allowNull: false
  },
  estado: {
    // enum(pendiente,aprobada,rechazada,cancelada) default pendiente
    type: Sequelize.ENUM('pendiente', 'aprobada', 'rechazada', 'cancelada'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  normas_aceptadas: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  observaciones: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  gestionado_por_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },

  profesor_asociado_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },

  grado_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  motivo_rechazo: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  creada_en: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  resuelta_en: {
    type: Sequelize.DATE,
    allowNull: true
  }
}, {
  tableName: 'solicitudes',
  timestamps: true // createdAt / updatedAt EXTRA, además de creada_en
});
Solicitud.associate = function (models) {
  // La solicitud la hace un usuario (alumno o profesor)
  Solicitud.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id'
  });

  // La solicitud la gestiona un usuario PAS (opcional)
  Solicitud.belongsTo(models.Usuario, {
    as: 'gestor',
    foreignKey: 'gestionado_por_id'
  });

  // Una solicitud puede generar un préstamo
  Solicitud.hasOne(models.Prestamo, {
    foreignKey: 'solicitud_id'
  });

  // Solicitud Tipo A: Profesor asociado
  Solicitud.belongsTo(models.Usuario, {
    as: 'profesorAsociado',
    foreignKey: 'profesor_asociado_id'
  });

  // Solicitud Tipo A: Grado asociado
  Solicitud.belongsTo(models.Grado, {
    foreignKey: 'grado_id'
  });
};

module.exports = Solicitud;
