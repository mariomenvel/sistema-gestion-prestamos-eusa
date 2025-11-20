var fs = require('fs');
var path = require('path');
var db = require('../db');
var Sequelize = require('sequelize');

var basename = path.basename(__filename);
var models = {};

fs.readdirSync(__dirname)
  .filter(function(file) {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(function(file) {
    var model = require(path.join(__dirname, file));
    models[model.name] = model;
  });

// Ejecutar asociaciones si existen
Object.keys(models).forEach(function(modelName) {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = db.sequelize;
models.Sequelize = Sequelize;

module.exports = models;
