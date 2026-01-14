var models = require('../models');

/**
 * GET /categorias
 */
function obtenerCategorias(req, res) {
  models.Categoria.findAll()
    .then(function (categorias) {
      res.json(categorias);
    })
    .catch(function (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ mensaje: 'Error al obtener categorías' });
    });
}

/**
 * POST /categorias
 */
function crearCategoria(req, res) {
  var codigo = req.body.codigo;
  var nombre = req.body.nombre;
  var tipo = req.body.tipo;

  if (!codigo || !tipo) {
    return res.status(400).json({
      mensaje: 'Código y tipo son obligatorios'
    });
  }

  models.Categoria.create({
    codigo: codigo,
    nombre: nombre,
    tipo: tipo,
    activa: true
  })
    .then(function (categoria) {
      res.status(201).json(categoria);
    })
    .catch(function (error) {
      console.error('Error al crear categoría:', error);
      res.status(500).json({ mensaje: 'Error al crear la categoría' });
    });
}

/**
 * PUT /categorias/:id
 * Activar / desactivar categoría
 */
function actualizarCategoria(req, res) {
  var categoriaId = req.params.id;

  models.Categoria.findByPk(categoriaId)
    .then(function (categoria) {
      if (!categoria) {
        return res.status(404).json({ mensaje: 'Categoría no encontrada' });
      }

      return categoria.update({
        activa: req.body.activa ?? categoria.activa,
        nombre: req.body.nombre ?? categoria.nombre
      });
    })
    .then(function (categoriaActualizada) {
      res.json(categoriaActualizada);
    })
    .catch(function (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({ mensaje: 'Error al actualizar la categoría' });
    });
}

module.exports = {
  obtenerCategorias: obtenerCategorias,
  crearCategoria: crearCategoria,
  actualizarCategoria: actualizarCategoria
};
