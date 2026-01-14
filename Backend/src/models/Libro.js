var Sequelize = require('sequelize');
var db = require('../db');

var Libro = db.sequelize.define('Libro', {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    primaryKey: true
  },
  titulo: {
    type: Sequelize.STRING(255),
    allowNull: false
  },
  autor: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  editorial: {
    type: Sequelize.STRING(255),
    allowNull: true
  },
  libro_numero: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  categoria_codigo: {
    type: Sequelize.STRING(10),
    allowNull: false
  },

  // NUEVO CAMPO PARA LA IMAGEN
  foto_url: {
    type: Sequelize.STRING(400),
    allowNull: true
  }

}, {
  tableName: 'libros',
  timestamps: true
});

Libro.associate = function(models) {
  Libro.belongsTo(models.Categoria, {
    foreignKey: 'categoria_codigo',
    targetKey: 'codigo',
    as: 'categorias'
  });

  Libro.hasMany(models.Ejemplar, {
    foreignKey: 'libro_id',
    as: 'ejemplares'
  });
};

module.exports = Libro;
