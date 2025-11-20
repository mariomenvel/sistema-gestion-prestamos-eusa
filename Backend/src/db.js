var Sequelize = require('sequelize');
require('dotenv').config();

var sequelize = new Sequelize(
  process.env.DB_NAME,      // Nombre BD
  process.env.DB_USER,      // Usuario
  process.env.DB_PASS,      // Contraseña
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
);  

function probarConexion() {
  sequelize.authenticate()
    .then(function () {
      console.log('Conexión con MySQL OK');
    })
    .catch(function (error) {
      console.error('Error al conectar con MySQL:', error);
    });
}

module.exports = {
  sequelize: sequelize,
  probarConexion: probarConexion
};
