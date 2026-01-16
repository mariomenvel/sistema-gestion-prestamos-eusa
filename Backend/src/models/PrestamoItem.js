var Sequelize = require('sequelize');
var db = require('../db');

var PrestamoItem = db.sequelize.define('PrestamoItem', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },

    prestamo_id: {
        type: Sequelize.BIGINT,
        allowNull: false
    },

    // Lo que se entrega físicamente: Unidad o Ejemplar
    unidad_id: {
        type: Sequelize.BIGINT,
        allowNull: true
    },

    ejemplar_id: {
        type: Sequelize.BIGINT,
        allowNull: true
    },

    fecha_devolucion: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha real de devolución de este item específico'
    },

    devuelto: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

}, {
    tableName: 'prestamo_items',
    timestamps: true
});

PrestamoItem.associate = function (models) {
    PrestamoItem.belongsTo(models.Prestamo, { foreignKey: 'prestamo_id' });
    PrestamoItem.belongsTo(models.Unidad, { foreignKey: 'unidad_id' });
    PrestamoItem.belongsTo(models.Ejemplar, { foreignKey: 'ejemplar_id' });
};

module.exports = PrestamoItem;
