var Sequelize = require('sequelize');
var db = require('../db');

var Genero = db.sequelize.define('Genero', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },

    nombre: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
    },

    activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }

}, {
    tableName: 'generos',
    timestamps: true
});

Genero.associate = function (models) {
    Genero.hasMany(models.Libro, {
        foreignKey: 'genero_id'
    });
};

module.exports = Genero;
