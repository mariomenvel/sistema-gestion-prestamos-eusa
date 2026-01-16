var Sequelize = require('sequelize');
var db = require('../db');

var Nombre = db.sequelize.define('Nombre', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: Sequelize.STRING(120),
    allowNull: false,
    unique: true
  },
  activa: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'nombres',
  timestamps: true
});

Nombre.associate = function(models) {
  Nombre.hasMany(models.Equipo, {
    foreignKey: 'nombre_id'
  });
};

module.exports = Nombre;
