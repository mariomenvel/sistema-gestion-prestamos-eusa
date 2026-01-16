var Sequelize = require('sequelize');
var db = require('../db');

var Grado = db.sequelize.define('Grado', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
    },
    activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'grados',
    timestamps: true
});

Grado.associate = function (models) {
    Grado.hasMany(models.Usuario, { foreignKey: 'grado_id' });
    Grado.hasMany(models.Solicitud, { foreignKey: 'grado_id' });
};

module.exports = Grado;
