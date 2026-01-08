var models = require('../models');

function crearUnidad(req, res) {
  var equipoId = req.body.equipo_id;
  var numeroSerie = req.body.numero_serie || null;

  if (!equipoId) {
    return res.status(400).json({ mensaje: 'equipo_id es obligatorio' });
  }

  models.Equipo.findByPk(equipoId)
    .then(function (equipo) {
      if (!equipo) {
        return res.status(404).json({ mensaje: 'Equipo no encontrado' });
      }

      // Código de barras simple (luego se puede mejorar)
      var codigoBarra = 'EQ-' + equipoId + '-' + Date.now();

      return models.Unidad.create({
        equipo_id: equipoId,
        numero_serie: numeroSerie,
        codigo_barra: codigoBarra,
        estado: 'disponible'
      });
    })
    .then(function (unidad) {
      res.status(201).json(unidad);
    })
    .catch(function (error) {
      console.error('Error al crear unidad:', error);
      res.status(500).json({ mensaje: 'Error al crear la unidad' });
    });
}

function actualizarUnidad(req, res) {
  var unidadId = req.params.id;

  models.Unidad.findByPk(unidadId)
    .then(function (unidad) {
      if (!unidad) {
        return res.status(404).json({ mensaje: 'Unidad no encontrada' });
      }

      return unidad.update({
        numero_serie: req.body.numero_serie ?? unidad.numero_serie,
        estado: req.body.estado ?? unidad.estado
      });
    })
    .then(function (unidadActualizada) {
      res.json(unidadActualizada);
    })
    .catch(function (error) {
      console.error('Error al actualizar unidad:', error);
      res.status(500).json({ mensaje: 'Error al actualizar la unidad' });
    });
}

function eliminarUnidad(req, res) {
  var unidadId = req.params.id;

  models.Prestamo.count({
    where: { unidad_id: unidadId }
  })
    .then(function (numPrestamos) {
      if (numPrestamos > 0) {
        return res.status(400).json({
          mensaje: 'No se puede eliminar una unidad con préstamos asociados'
        });
      }

      return models.Unidad.destroy({
        where: { id: unidadId }
      });
    })
    .then(function () {
      res.json({ mensaje: 'Unidad eliminada correctamente' });
    })
    .catch(function (error) {
      console.error('Error al eliminar unidad:', error);
      res.status(500).json({ mensaje: 'Error al eliminar la unidad' });
    });
}

module.exports = {
  crearUnidad: crearUnidad,
  actualizarUnidad: actualizarUnidad,
  eliminarUnidad: eliminarUnidad
};
