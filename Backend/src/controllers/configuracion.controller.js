var models = require('../models');

// GET /config
function listarConfig(req, res) {
    models.Configuracion.findAll()
        .then(function (configs) {
            // Formato objeto { TRIMESTRE_1_FIN: '15-12', ... }
            var resultado = {};
            configs.forEach(function (c) {
                resultado[c.clave] = c.valor;
            });
            res.json(resultado);
        })
        .catch(function (error) {
            console.error('Error al listar configuración:', error);
            res.status(500).json({ mensaje: 'Error al obtener configuración' });
        });
}

// PUT /config
// Body: { TRIMESTRE_1_FIN: '15-12', TRIMESTRE_2_FIN: '...' }
function actualizarConfig(req, res) {
    var datos = req.body;
    var claves = Object.keys(datos);
    var promesas = [];

    claves.forEach(function (clave) {
        var valor = datos[clave];
        var p = models.Configuracion.upsert({
            clave: clave,
            valor: valor
        });
        promesas.push(p);
    });

    Promise.all(promesas)
        .then(function () {
            res.json({ mensaje: 'Configuración actualizada' });
        })
        .catch(function (error) {
            console.error('Error al actualizar configuración:', error);
            res.status(500).json({ mensaje: 'Error al actualizar configuración' });
        });
}

module.exports = {
    listarConfig,
    actualizarConfig
};
