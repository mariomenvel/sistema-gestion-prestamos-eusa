var Sequelize = require('sequelize');
var db = require('../db');

var Unidad = db.sequelize.define('Unidad', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },

  equipo_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },

  numero_serie: {
    type: Sequelize.STRING(120),
    allowNull: true
  },

  codigo_barra: {
    type: Sequelize.STRING(120),
    allowNull: false,
    unique: true
  },

  // 📍 UBICACIÓN FÍSICA
  ubicacion: {
    type: Sequelize.STRING(150),
    allowNull: true,
    comment: 'Ej: Almacén A - Estantería 3 - Balda 2'
  },

  estado_fisico: {
    type: Sequelize.ENUM('funciona', 'no_funciona', 'en_reparacion', 'obsoleto', 'falla', 'perdido_sustraido'),
    allowNull: false,
    defaultValue: 'funciona'
  },

  esta_prestado: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }

}, {
  tableName: 'unidades',
  timestamps: true
});

Unidad.associate = function (models) {
  Unidad.belongsTo(models.Equipo, {
    foreignKey: 'equipo_id',
    as: 'equipo'
  });
};

module.exports = Unidad;
