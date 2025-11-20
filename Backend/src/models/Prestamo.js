var Sequelize = require('sequelize');
var db = require('../db');

var Prestamo = db.sequelize.define('Prestamo', {
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

  solicitud_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },

  tipo: {
    type: Sequelize.ENUM('a', 'b'),  // A=profesor/trabajo, B=uso propio
    allowNull: false
  },

  estado: {
    type: Sequelize.ENUM('activo', 'vencido', 'cerrado'),
    allowNull: false,
    defaultValue: 'activo'
  },

  fecha_inicio: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },

  fecha_devolucion_prevista: {
    type: Sequelize.DATE,
    allowNull: false
  },

  fecha_devolucion_real: {
    type: Sequelize.DATE,
    allowNull: true
  },

  profesor_solicitante_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  }

}, {
  tableName: 'prestamos',
  timestamps: true
});
Prestamo.associate = function(models) {
  // El préstamo pertenece a un usuario (prestatario, normalmente alumno)
  Prestamo.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id'
  });

  // Profesor solicitante (opcional, para tipo A)
  Prestamo.belongsTo(models.Usuario, {
    as: 'profesor_solicitante',
    foreignKey: 'profesor_solicitante_id'
  });

  // El préstamo puede ser sobre un ejemplar de libro
  Prestamo.belongsTo(models.Ejemplar, {
    foreignKey: 'ejemplar_id'
  });

  // ...o sobre una unidad de equipo
  Prestamo.belongsTo(models.Unidad, {
    foreignKey: 'unidad_id'
  });

  // El préstamo viene de una solicitud
  Prestamo.belongsTo(models.Solicitud, {
    foreignKey: 'solicitud_id'
  });
};

module.exports = Prestamo;
