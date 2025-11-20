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
  ejemplar_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  unidad_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  tipo: {
    // enum(prof_trabajo,uso_propio)
    type: Sequelize.ENUM('prof_trabajo', 'uso_propio'),
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
Solicitud.associate = function(models) {
  // La solicitud la hace un usuario (alumno o profesor)
  Solicitud.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id'
  });

  // La solicitud puede ser sobre un ejemplar de libro
  Solicitud.belongsTo(models.Ejemplar, {
    foreignKey: 'ejemplar_id'
  });

  // ...o sobre una unidad de equipo
  Solicitud.belongsTo(models.Unidad, {
    foreignKey: 'unidad_id'
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
};

module.exports = Solicitud;
