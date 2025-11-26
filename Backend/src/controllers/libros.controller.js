var models = require('../models');

function obtenerLibros(req, res) {
  models.Libro.findAll({
    include: [
      {
        model: models.Categoria,
        as: 'categorias'
      },
      {
        model: models.Ejemplar,
        as: 'ejemplares'
      }
    ]
  })
    .then(function (libros) {
      res.json(libros);
    })
    .catch(function (error) {
      console.error('Error al obtener libros:', error);
      res.status(500).json({ mensaje: 'Error al obtener libros' });
    });
}

module.exports = {
  obtenerLibros: obtenerLibros
};
