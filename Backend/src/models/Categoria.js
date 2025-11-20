var Sequelize = require('sequelize');
var db = require('../db');

var Categoria = db.sequelize.define('Categoria', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  codigo: {
    type: Sequelize.STRING(10),
    allowNull: false,
    unique: true  // igual que en tu DBML
  },
  nombre: {
    type: Sequelize.STRING(120),
    allowNull: true
  },
  tipo: {
    type: Sequelize.ENUM('libro', 'equipo'),
    allowNull: false
  },
  activa: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'categorias',
  timestamps: true
});
Categoria.associate = function(models) {
  // Una categoría tiene muchos libros
  Categoria.hasMany(models.Libro, {
    foreignKey: 'categoria_codigo',
    sourceKey: 'codigo'
  });

  // Una categoría tiene muchos equipos
  Categoria.hasMany(models.Equipo, {
    foreignKey: 'categoria_codigo',
    sourceKey: 'codigo'
  });
};


module.exports = Categoria;
