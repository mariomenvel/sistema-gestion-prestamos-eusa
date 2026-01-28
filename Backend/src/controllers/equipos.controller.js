var models = require('../models');
var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');

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
  var categoriaId = req.body.categoria_id;
  var marca = req.body.marca;
  var modelo = req.body.modelo;
  var descripcion = req.body.descripcion || null;
  var fotoUrl = null;

  if (req.file) {
    fotoUrl = '/uploads/equipos/' + req.file.filename;
  }

  if (!categoriaId || !marca || !modelo) {
    return res.status(400).json({
      mensaje: 'categoria_id, marca y modelo son obligatorios'
    });
  }

  models.Equipo.create({
    categoria_id: categoriaId,
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
        categoria_id: req.body.categoria_id ?? equipo.categoria_id,
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

async function subirImagenEquipo(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }

    // USAR models.Equipo
    const equipo = await models.Equipo.findByPk(id);
    if (!equipo) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    if (equipo.foto_url) {
      const oldImagePath = path.join(__dirname, '../../', equipo.foto_url);
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error('Error al eliminar imagen anterior:', err);
        }
      }
    }

    const foto_url = `/uploads/equipos/${req.file.filename}`;
    equipo.foto_url = foto_url;
    await equipo.save();

    const equipoCompleto = await models.Equipo.findByPk(id, {
      include: [
        { model: models.Categoria, as: 'categoria', attributes: ['id', 'nombre', 'activa'] },
        { model: models.Unidad, as: 'unidades', attributes: ['id', 'numero_serie', 'codigo_barra', 'estado'] }
      ]
    });

    res.json(equipoCompleto);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) { }
    }
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
}


/**
 * GET /equipos/buscar?codigo_barras=...
 */
function buscarPorCodigoBarras(req, res) {
  var codigoBarras = req.query.codigo_barras;

  if (!codigoBarras) {
    return res.status(400).json({ mensaje: "Código de barras requerido" });
  }

  // 1. Buscar por código de barras de la unidad
  models.Unidad.findOne({
    where: { codigo_barra: codigoBarras }, // Unidad uses codigo_barra (singular)
    include: [
      {
        model: models.Equipo
      }
    ]
  })
    .then(function (unidad) {
      if (!unidad) {
        return res.status(404).json({ mensaje: "Equipo no encontrado" });
      }

      res.json({
        id: unidad.Equipo.id,
        marca: unidad.Equipo.marca,
        modelo: unidad.Equipo.modelo,
        // categoria: unidad.Equipo.categoria, // Equipo has categoria_id
        descripcion: unidad.Equipo.descripcion,
        unidades: [{
          id: unidad.id,
          codigo_barras: unidad.codigo_barra,
          estado_fisico: unidad.estado_fisico,
          esta_prestado: unidad.esta_prestado
        }],
        disponible: !unidad.esta_prestado && unidad.estado_fisico === 'funciona'
      });
    })
    .catch(function (error) {
      console.error('Error al buscar equipo:', error);
      res.status(500).json({ mensaje: "Error al buscar equipo" });
    });
}
/**
 * GET /equipos/disponibles?q=texto
 * Buscar equipos con unidades disponibles
 */
function buscarEquiposDisponibles(req, res) {
  var query = req.query.q || '';

  var whereClause = {};

  if (query) {
    whereClause = {
      [Sequelize.Op.or]: [
        { marca: { [Sequelize.Op.like]: '%' + query + '%' } },
        { modelo: { [Sequelize.Op.like]: '%' + query + '%' } }
      ]
    };
  }

  models.Equipo.findAll({
    where: whereClause,
    include: [{
      model: models.Unidad,
      as: 'unidades',
      where: {
        esta_prestado: false,
        [Sequelize.Op.or]: [
          { estado_fisico: { [Sequelize.Op.in]: ['funciona', 'obsoleto'] } },
          { estado_fisico: '' },
          { estado_fisico: null }
        ]
      },
      required: false
    }],
    limit: 20
  })
    .then(function (equipos) {
      // Filtrar solo los que tienen unidades disponibles
      var equiposConDisponibles = equipos.filter(function (equipo) {
        return equipo.unidades && equipo.unidades.length > 0;
      }).map(function (equipo) {
        return {
          id: equipo.id,
          marca: equipo.marca,
          modelo: equipo.modelo,
          nombre: equipo.marca + ' ' + equipo.modelo,
          disponibles: equipo.unidades.length
        };
      });

      res.json(equiposConDisponibles);
    })
    .catch(function (error) {
      console.error('Error buscando equipos disponibles:', error);
      res.status(500).json({ mensaje: 'Error al buscar equipos' });
    });
}

/**
 * GET /equipos/unidad/:codigo
 * Buscar unidad específica por código de barras
 */
function buscarUnidadPorCodigo(req, res) {
  var codigo = req.params.codigo;
  
  models.Unidad.findOne({
    where: { codigo_barra: codigo },
    include: [{
      model: models.Equipo,
      as: 'equipo'
    }]
  })
  .then(function(unidad) {
    if (!unidad) {
      return res.status(404).json({ mensaje: 'Unidad no encontrada' });
    }
    
    var disponible = !unidad.esta_prestado && 
      (unidad.estado_fisico === 'funciona' || unidad.estado_fisico === 'obsoleto' || !unidad.estado_fisico);
    
    res.json({
      tipo: 'unidad',
      id: unidad.id,
      codigo_barra: unidad.codigo_barra,
      estado_fisico: unidad.estado_fisico,
      esta_prestado: unidad.esta_prestado,
      disponible: disponible,
      equipo: {
        id: unidad.equipo ? unidad.equipo.id : null,
        marca: unidad.equipo ? unidad.equipo.marca : '',
        modelo: unidad.equipo ? unidad.equipo.modelo : '',
        nombre: unidad.equipo ? (unidad.equipo.marca + ' ' + unidad.equipo.modelo) : 'Sin datos'
      }
    });
  })
  .catch(function(error) {
    console.error('Error buscando unidad:', error);
    res.status(500).json({ mensaje: 'Error al buscar unidad' });
  });
}

module.exports = {
  obtenerEquipos: obtenerEquipos,
  obtenerEquipoPorId: obtenerEquipoPorId,
  crearEquipo: crearEquipo,
  actualizarEquipo: actualizarEquipo,
  eliminarEquipo: eliminarEquipo,
  subirImagenEquipo: subirImagenEquipo,
  buscarPorCodigoBarras: buscarPorCodigoBarras,
  buscarEquiposDisponibles: buscarEquiposDisponibles,
  buscarUnidadPorCodigo: buscarUnidadPorCodigo 
};
