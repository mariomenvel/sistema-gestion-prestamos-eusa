var Sequelize = require('sequelize');
var db = require('../db');

var SolicitudItem = db.sequelize.define('SolicitudItem', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },

    solicitud_id: {
        type: Sequelize.BIGINT,
        allowNull: false
    },

    // Puede pedir un libro concreto (por título/ISBN global, idealmente Libros)
    // O un tipo de equipo (por modelo/marca, idealmente Equipos)

    libro_id: {
        type: Sequelize.BIGINT,
        allowNull: true
    },

    equipo_id: {
        type: Sequelize.BIGINT,
        allowNull: true
    },

    cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
    }

}, {
    tableName: 'solicitud_items',
    timestamps: true
});

SolicitudItem.associate = function (models) {
    SolicitudItem.belongsTo(models.Solicitud, { foreignKey: 'solicitud_id' });
    SolicitudItem.belongsTo(models.Libro, { foreignKey: 'libro_id' });
    SolicitudItem.belongsTo(models.Equipo, { foreignKey: 'equipo_id' });
};

module.exports = SolicitudItem;
