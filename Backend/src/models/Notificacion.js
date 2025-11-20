var Sequelize = require('sequelize');
var db = require('../db');

var Notificacion = db.sequelize.define('Notificacion', {
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
    // enum(preaviso_devolucion,estado_solicitud,inicio_sancion,fin_sancion)
    type: Sequelize.ENUM(
      'preaviso_devolucion',
      'estado_solicitud',
      'inicio_sancion',
      'fin_sancion'
    ),
    allowNull: false
  },

  prestamo_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },

  solicitud_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },

  canal: {
    // enum(email) [ default: EMAIL ]
    type: Sequelize.ENUM('email'),
    allowNull: false,
    defaultValue: 'email'
  },

  enviada_en: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },

  payload: {
    type: Sequelize.TEXT,
    allowNull: true
  }

}, {
  tableName: 'notificaciones',
  timestamps: true
});
Notificacion.associate = function(models) {
  // La notificación pertenece a un usuario
  Notificacion.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id'
  });

  // La notificación puede estar asociada a un préstamo
  Notificacion.belongsTo(models.Prestamo, {
    foreignKey: 'prestamo_id'
  });

  // ...o a una solicitud
  Notificacion.belongsTo(models.Solicitud, {
    foreignKey: 'solicitud_id'
  });
};

module.exports = Notificacion;
