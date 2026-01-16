var Sequelize = require('sequelize');
var db = require('../db');

var MotivoRechazo = db.sequelize.define('MotivoRechazo', {
    id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    titulo_es: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cuerpo_es: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    titulo_en: {
        type: Sequelize.STRING,
        allowNull: true
    },
    cuerpo_en: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    clave: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
        comment: 'Identificador interno opcional (ej: NO_STOCK)'
    }
}, {
    tableName: 'motivos_rechazo',
    timestamps: true
});

MotivoRechazo.associate = function (models) {
    // Podría asociarse a solicitudes, pero como guardamos el texto snapshot, no es estrictamente necesario FK.
};

module.exports = MotivoRechazo;
