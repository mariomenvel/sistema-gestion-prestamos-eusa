var models = require('../models');

function crearEjemplar(req, res) {
  var libroId = req.body.libro_id;
  var c122003 = req.body.c122003 || null;
  var estanteria = req.body.estanteria || null;
  var balda = req.body.balda || null;

  if (!libroId) {
    return res.status(400).json({ mensaje: 'libro_id es obligatorio' });
  }

  // Comprobar que el libro existe
  models.Libro.findByPk(libroId)
    .then(function (libro) {
      if (!libro) {
        return res.status(404).json({ mensaje: 'Libro no encontrado' });
      }

      // Generar código de barras (simple por ahora)
      var codigoBarra = 'LIB-' + libroId + '-' + Date.now();

      return models.Ejemplar.create({
        libro_id: libroId,
        codigo_barra: codigoBarra,
        c122003: c122003,
        estanteria: estanteria,
        balda: balda,
        estado: 'disponible'
      });
    })
    .then(function (ejemplar) {
      res.status(201).json(ejemplar);
    })
    .catch(function (error) {
      console.error('Error al crear ejemplar:', error);
      res.status(500).json({ mensaje: 'Error al crear el ejemplar' });
    });
}


function actualizarEjemplar(req, res) {
  var ejemplarId = req.params.id;

  models.Ejemplar.findByPk(ejemplarId)
    .then(function (ejemplar) {
      if (!ejemplar) {
        return res.status(404).json({ mensaje: 'Ejemplar no encontrado' });
      }

      return ejemplar.update({
        c122003: req.body.c122003 ?? ejemplar.c122003,
        estanteria: req.body.estanteria ?? ejemplar.estanteria,
        balda: req.body.balda ?? ejemplar.balda,
        estado: req.body.estado ?? ejemplar.estado
      });
    })
    .then(function (ejemplarActualizado) {
      res.json(ejemplarActualizado);
    })
    .catch(function (error) {
      console.error('Error al actualizar ejemplar:', error);
      res.status(500).json({ mensaje: 'Error al actualizar el ejemplar' });
    });
}


function eliminarEjemplar(req, res) {
  var ejemplarId = req.params.id;

  models.Prestamo.count({
    where: { ejemplar_id: ejemplarId }
  })
    .then(function (numPrestamos) {
      if (numPrestamos > 0) {
        return res.status(400).json({
          mensaje: 'No se puede eliminar un ejemplar con préstamos asociados'
        });
      }

      return models.Ejemplar.destroy({
        where: { id: ejemplarId }
      });
    })
    .then(function () {
      res.json({ mensaje: 'Ejemplar eliminado correctamente' });
    })
    .catch(function (error) {
      console.error('Error al eliminar ejemplar:', error);
      res.status(500).json({ mensaje: 'Error al eliminar el ejemplar' });
    });
}

module.exports = {
  crearEjemplar: crearEjemplar,
  actualizarEjemplar: actualizarEjemplar,
  eliminarEjemplar: eliminarEjemplar
};
