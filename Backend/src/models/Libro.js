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
  // DBML: libro_numero varchar(20) [ not null ]
  libro_numero: {
    type: Sequelize.STRING(20),
    allowNull: false
  },
  // DBML: categoria_codigo varchar(10) [ not null ]
  // (de momento seguimos EXACTO a tu DBML)
  categoria_codigo: {
    type: Sequelize.STRING(10),
    allowNull: false
  }
}, {
  tableName: 'libros',
  timestamps: true
});
Libro.associate = function(models) {
  // Libro pertenece a una categoría (por codigo)
  Libro.belongsTo(models.Categoria, {
    foreignKey: 'categoria_codigo',
    targetKey: 'codigo'
  });

  // Libro tiene muchos ejemplares
  Libro.hasMany(models.Ejemplar, {
    foreignKey: 'libro_id'
  });
};



module.exports = Libro;
