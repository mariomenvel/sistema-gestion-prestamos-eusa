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

function obtenerLibroPorId(req, res) {
  var libroId = req.params.id;

  models.Libro.findByPk(libroId, {
    include: [
      { model: models.Categoria },
      { model: models.Ejemplar }
    ]
  })
    .then(function (libro) {
      if (!libro) {
        return res.status(404).json({ mensaje: 'Libro no encontrado' });
      }

      res.json(libro);
    })
    .catch(function (error) {
      console.error('Error al obtener libro:', error);
      res.status(500).json({ mensaje: 'Error al obtener el libro' });
    });
}

function crearLibro(req, res) {
  var titulo = req.body.titulo;
  var autor = req.body.autor;
  var editorial = req.body.editorial;
  var libroNumero = req.body.libro_numero;
  var categoriaCodigo = req.body.categoria_codigo;

  if (!titulo || !libroNumero || !categoriaCodigo) {
    return res.status(400).json({
      mensaje: 'Faltan campos obligatorios'
    });
  }

  models.Libro.create({
    titulo: titulo,
    autor: autor,
    editorial: editorial,
    libro_numero: libroNumero,
    categoria_codigo: categoriaCodigo
  })
    .then(function (libro) {
      res.status(201).json(libro);
    })
    .catch(function (error) {
      console.error('Error al crear libro:', error);
      res.status(500).json({ mensaje: 'Error al crear el libro' });
    });
}

function actualizarLibro(req, res) {
  var libroId = req.params.id;

  models.Libro.findByPk(libroId)
    .then(function (libro) {
      if (!libro) {
        return res.status(404).json({ mensaje: 'Libro no encontrado' });
      }

      return libro.update({
        titulo: req.body.titulo ?? libro.titulo,
        autor: req.body.autor ?? libro.autor,
        editorial: req.body.editorial ?? libro.editorial,
        categoria_codigo: req.body.categoria_codigo ?? libro.categoria_codigo
      });
    })
    .then(function (libroActualizado) {
      res.json(libroActualizado);
    })
    .catch(function (error) {
      console.error('Error al actualizar libro:', error);
      res.status(500).json({ mensaje: 'Error al actualizar el libro' });
    });
}

function eliminarLibro(req, res) {
  var libroId = req.params.id;

  models.Ejemplar.count({
    where: { libro_id: libroId }
  })
    .then(function (numEjemplares) {
      if (numEjemplares > 0) {
        return res.status(400).json({
          mensaje: 'No se puede eliminar un libro con ejemplares asociados'
        });
      }

      return models.Libro.destroy({
        where: { id: libroId }
      });
    })
    .then(function () {
      res.json({ mensaje: 'Libro eliminado correctamente' });
    })
    .catch(function (error) {
      console.error('Error al eliminar libro:', error);
      res.status(500).json({ mensaje: 'Error al eliminar el libro' });
    });
}





module.exports = {
  obtenerLibros: obtenerLibros,
  obtenerLibroPorId: obtenerLibroPorId,
  crearLibro: crearLibro,
  actualizarLibro: actualizarLibro,
  eliminarLibro: eliminarLibro
};
