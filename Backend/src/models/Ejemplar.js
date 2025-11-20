var Sequelize = require('sequelize');
var db = require('../db');

var Ejemplar = db.sequelize.define('Ejemplar', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  libro_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  codigo_barra: {
    type: Sequelize.STRING(64),
    allowNull: false,
    unique: true
  },
  c122003: {
    type: Sequelize.STRING(10),
    allowNull: true
  },
  estanteria: {
    type: Sequelize.STRING(10),
    allowNull: true
  },
  balda: {
    type: Sequelize.STRING(10),
    allowNull: true
  },
  estado: {
    type: Sequelize.ENUM('disponible', 'no_disponible', 'bloqueado', 'en_reparacion'),
    allowNull: false,
    defaultValue: 'disponible'
  }
}, {
  tableName: 'ejemplares',
  timestamps: true
});
Ejemplar.associate = function(models) {
  // Un ejemplar pertenece a un libro
  Ejemplar.belongsTo(models.Libro, {
    foreignKey: 'libro_id'
  });

  // Un ejemplar puede estar en muchas solicitudes
  Ejemplar.hasMany(models.Solicitud, {
    foreignKey: 'ejemplar_id'
  });

  // Un ejemplar puede estar en muchos préstamos
  Ejemplar.hasMany(models.Prestamo, {
    foreignKey: 'ejemplar_id'
  });
};


module.exports = Ejemplar;
