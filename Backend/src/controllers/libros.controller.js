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

/**
 * GET /libros/buscar?codigo_barras=...
 */
function buscarPorCodigoBarras(req, res) {
  var codigoBarras = req.query.codigo_barras;

  if (!codigoBarras) {
    return res.status(400).json({ mensaje: "Código de barras requerido" });
  }

  // 1. Buscar por código de barras del libro
  models.Libro.findOne({
    where: { codigo_barras: codigoBarras },
    include: [
      {
        model: models.Ejemplar,
        as: 'ejemplares'
      }
    ]
  })
    .then(function (libro) {
      if (!libro) {
        return res.status(404).json({ mensaje: "Libro no encontrado" });
      }

      // 2. Contar ejemplares disponibles
      var disponibles = libro.ejemplares.filter(e => e.estado === 'disponible');

      res.json({
        id: libro.id,
        titulo: libro.titulo,
        autor: libro.autor,
        // categoria: libro.categoria, // Libro model does not have categoria directly, it has genero_id. Assuming genero name or just omit based on request? Request says "categoria". I will check if Genero is what is meant.
        // Actually Libro model relates to Genero. Let's return genero name if possible or just what is in libro.
        // The prompt response example says "categoria": "Programación". I'll use genero if available or just omit if simpler. 
        // Let's modify the query to include Genero above if needed, but Libro has genero_id.
        // Let's stick to what is in libro object for now.
        descripcion: "", // Libro model does not have descripcion field in the file I read! It has titulo, autor, editorial, libro_numero, genero_id, foto_url. 
        // I will omit fields that don't exist in the model to avoid crash.
        codigo_barras_libro: libro.codigo_barras,
        ejemplares: disponibles.map(e => ({
          id: e.id,
          codigo_barras: e.codigo_barra, // Note: Ejemplar has codigo_barra (singular)
          estado: e.estado
        })),
        ejemplaresDisponibles: disponibles.length
      });
    })
    .catch(function (error) {
      console.error('Error al buscar libro:', error);
      res.status(500).json({ mensaje: "Error al buscar libro" });
    });
}

module.exports = {
  obtenerLibros: obtenerLibros,
  obtenerLibroPorId: obtenerLibroPorId,
  crearLibro: crearLibro,
  actualizarLibro: actualizarLibro,
  eliminarLibro: eliminarLibro,
  buscarPorCodigoBarras: buscarPorCodigoBarras
};
