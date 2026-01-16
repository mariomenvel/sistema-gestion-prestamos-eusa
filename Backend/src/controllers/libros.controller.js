var models = require('../models');


/**
 * GET /libros
 * Listar todos los libros con género y ejemplares
 */
function obtenerLibros(req, res) {
  models.Libro.findAll({
    include: [
      {
        model: models.Genero,
        as: 'genero'
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


/**
 * GET /libros/:id
 * Obtener libro por ID
 */
function obtenerLibroPorId(req, res) {
  var libroId = req.params.id;

  models.Libro.findByPk(libroId, {
    include: [
      {
        model: models.Genero,
        as: 'genero'
      },
      {
        model: models.Ejemplar,
        as: 'ejemplares'
      }
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


/**
 * POST /libros
 * Crear libro (con imagen opcional)
 */
function crearLibro(req, res) {
  var titulo = req.body.titulo;
  var autor = req.body.autor;
  var editorial = req.body.editorial;
  var libroNumero = req.body.libro_numero;
  var generoId = req.body.genero_id;

  if (!titulo || !libroNumero || !generoId) {
    return res.status(400).json({
      mensaje: 'Faltan campos obligatorios'
    });
  }

  // 🖼️ Imagen (opcional)
  var fotoUrl = null;
  if (req.file) {
    fotoUrl = '/uploads/libros/' + req.file.filename;
  }

  models.Libro.create({
    titulo: titulo,
    autor: autor,
    editorial: editorial,
    libro_numero: libroNumero,
    genero_id: generoId,
    foto_url: fotoUrl
  })
    .then(function (libro) {
      res.status(201).json(libro);
    })
    .catch(function (error) {
      console.error('Error al crear libro:', error);
      res.status(500).json({ mensaje: 'Error al crear el libro' });
    });
}


/**
 * PUT /libros/:id
 * Actualizar libro (y opcionalmente cambiar imagen)
 */
function actualizarLibro(req, res) {
  var libroId = req.params.id;

  models.Libro.findByPk(libroId)
    .then(function (libro) {
      if (!libro) {
        return res.status(404).json({ mensaje: 'Libro no encontrado' });
      }

      // 🖼️ Si viene nueva imagen, se actualiza
      var nuevaFotoUrl = libro.foto_url;
      if (req.file) {
        nuevaFotoUrl = '/uploads/libros/' + req.file.filename;
      }

      return libro.update({
        titulo: req.body.titulo ?? libro.titulo,
        autor: req.body.autor ?? libro.autor,
        editorial: req.body.editorial ?? libro.editorial,
        libro_numero: req.body.libro_numero ?? libro.libro_numero,
        genero_id: req.body.genero_id ?? libro.genero_id,
        foto_url: nuevaFotoUrl
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

/**
 * DELETE /libros/:id
 * Eliminar libro (solo si no tiene ejemplares)
 */
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
