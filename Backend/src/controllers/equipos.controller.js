var models = require('../models');

function obtenerEquipos(req, res) {
  models.Equipo.findAll({
    include: [
      {
        model: models.Categoria,
        as: 'categoria'
      },
      {
        model: models.Unidad,
        as: 'unidades'
      }
    ]
  })
    .then(function (equipos) {
      res.json(equipos);
    })
    .catch(function (error) {
      console.error('Error al obtener equipos:', error);
      res.status(500).json({ mensaje: 'Error al obtener equipos' });
    });
}

function obtenerEquipoPorId(req, res) {
  var equipoId = req.params.id;

  models.Equipo.findByPk(equipoId, {
    include: [
      { model: models.Categoria },
      { model: models.Unidad }
    ]
  })
    .then(function (equipo) {
      if (!equipo) {
        return res.status(404).json({ mensaje: 'Equipo no encontrado' });
      }

      res.json(equipo);
    })
    .catch(function (error) {
      console.error('Error al obtener equipo:', error);
      res.status(500).json({ mensaje: 'Error al obtener el equipo' });
    });
}

function crearEquipo(req, res) {
  var categoriaCodigo = req.body.categoria_codigo;
  var marca = req.body.marca;
  var modelo = req.body.modelo;
  var descripcion = req.body.descripcion || null;
  var fotoUrl = req.body.foto_url || null;

  if (!categoriaCodigo || !marca || !modelo) {
    return res.status(400).json({
      mensaje: 'categoria_codigo, marca y modelo son obligatorios'
    });
  }

  models.Equipo.create({
    categoria_codigo: categoriaCodigo,
    marca: marca,
    modelo: modelo,
    descripcion: descripcion,
    foto_url: fotoUrl
  })
    .then(function (equipo) {
      res.status(201).json(equipo);
    })
    .catch(function (error) {
      console.error('Error al crear equipo:', error);
      res.status(500).json({ mensaje: 'Error al crear el equipo' });
    });
}

function actualizarEquipo(req, res) {
  var equipoId = req.params.id;

  models.Equipo.findByPk(equipoId)
    .then(function (equipo) {
      if (!equipo) {
        return res.status(404).json({ mensaje: 'Equipo no encontrado' });
      }

      return equipo.update({
        categoria_codigo: req.body.categoria_codigo ?? equipo.categoria_codigo,
        marca: req.body.marca ?? equipo.marca,
        modelo: req.body.modelo ?? equipo.modelo,
        descripcion: req.body.descripcion ?? equipo.descripcion,
        foto_url: req.body.foto_url ?? equipo.foto_url
      });
    })
    .then(function (equipoActualizado) {
      res.json(equipoActualizado);
    })
    .catch(function (error) {
      console.error('Error al actualizar equipo:', error);
      res.status(500).json({ mensaje: 'Error al actualizar el equipo' });
    });
}

function eliminarEquipo(req, res) {
  var equipoId = req.params.id;

  models.Unidad.count({
    where: { equipo_id: equipoId }
  })
    .then(function (numUnidades) {
      if (numUnidades > 0) {
        return res.status(400).json({
          mensaje: 'No se puede eliminar un equipo con unidades asociadas'
        });
      }

      return models.Equipo.destroy({
        where: { id: equipoId }
      });
    })
    .then(function () {
      res.json({ mensaje: 'Equipo eliminado correctamente' });
    })
    .catch(function (error) {
      console.error('Error al eliminar equipo:', error);
      res.status(500).json({ mensaje: 'Error al eliminar el equipo' });
    });
}


module.exports = {
  obtenerEquipos: obtenerEquipos,
  obtenerEquipoPorId: obtenerEquipoPorId,
  crearEquipo: crearEquipo,
  actualizarEquipo: actualizarEquipo,
  eliminarEquipo: eliminarEquipo
};
