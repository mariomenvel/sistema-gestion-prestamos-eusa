var Sequelize = require('sequelize');
var db = require('../db');

var Equipo = db.sequelize.define('Equipo', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },

  categoria_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },

  nombre_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },

  marca: {
    type: Sequelize.STRING(120),
    allowNull: false
  },

  modelo: {
    type: Sequelize.STRING(120),
    allowNull: false
  },

  descripcion: {
    type: Sequelize.TEXT,
    allowNull: true
  },

  foto_url: {
    type: Sequelize.STRING(400),
    allowNull: true
  }

}, {
  tableName: 'equipos',
  timestamps: true
});

Equipo.associate = function(models) {
  Equipo.belongsTo(models.Categoria, {
    foreignKey: 'categoria_id'
  });

  Equipo.belongsTo(models.Nombre, {
    foreignKey: 'nombre_id'
  });

  Equipo.hasMany(models.Unidad, {
    foreignKey: 'equipo_id'
  });
};

module.exports = Equipo;
