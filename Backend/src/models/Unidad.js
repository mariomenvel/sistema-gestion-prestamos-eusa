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
    type: Sequelize.STRING(64),
    allowNull: false,
    unique: true
  },
  estado: {
    type: Sequelize.ENUM('disponible', 'no_disponible', 'bloqueado', 'en_reparacion'),
    allowNull: false,
    defaultValue: 'disponible'
  }
}, {
  tableName: 'unidades',
  timestamps: true
});
Unidad.associate = function(models) {
  // Una unidad pertenece a un equipo
  Unidad.belongsTo(models.Equipo, {
    foreignKey: 'equipo_id',
    as: 'equipo'
  });

  // Una unidad puede estar en muchas solicitudes
  Unidad.hasMany(models.Solicitud, {
    foreignKey: 'unidad_id'
  });

  // Una unidad puede estar en muchos préstamos
  Unidad.hasMany(models.Prestamo, {
    foreignKey: 'unidad_id'
  });
};


module.exports = Unidad;
