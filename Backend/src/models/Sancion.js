var Sequelize = require('sequelize');
var db = require('../db');

var Sancion = db.sequelize.define('Sancion', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },

  usuario_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },

  severidad: {
    // enum(s1_1sem,s2_1mes,s3_indefinida)
    type: Sequelize.ENUM('s1_1sem', 's2_1mes', 's3_indefinida'),
    allowNull: false
  },

  estado: {
    // enum(activa,finalizada) [ default: ACTIVA ]
    type: Sequelize.ENUM('activa', 'finalizada'),
    allowNull: false,
    defaultValue: 'activa'   // usamos minúsculas para cuadrar con el enum
  },

  inicio: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },

  fin: {
    type: Sequelize.DATE,
    allowNull: true
  },

  motivo: {
    type: Sequelize.TEXT,
    allowNull: true
  }

}, {
  tableName: 'sanciones',
  timestamps: true
});
Sancion.associate = function(models) {
  // La sanción pertenece a un usuario
  Sancion.belongsTo(models.Usuario, {
    foreignKey: 'usuario_id'
  });
};

module.exports = Sancion;
