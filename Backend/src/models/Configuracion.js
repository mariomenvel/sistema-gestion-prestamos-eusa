var Sequelize = require('sequelize');
var db = require('../db');

var Configuracion = db.sequelize.define('Configuracion', {
    clave: {
        type: Sequelize.STRING(50),
        allowNull: false,
        primaryKey: true // Clave única string ej: TRIMESTRE_1_FIN
    },
    valor: {
        type: Sequelize.STRING(255),
        allowNull: false // ej: "15-12"
    },
    descripcion: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    tableName: 'configuraciones',
    timestamps: false
});

module.exports = Configuracion;
