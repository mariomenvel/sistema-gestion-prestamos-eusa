require('dotenv').config();
var express = require('express');
var cors = require('cors');
var db = require('./db');
var models = require('./models');
var librosRoutes = require('./routes/libros.routes');
var equiposRoutes = require('./routes/equipos.routes');
var authRoutes = require('./routes/auth.routes');


var app = express();
app.use(cors());
app.use(express.json());

app.get('/', function(req, res) {
  res.json({ mensaje: 'API Biblioteca funcionando' });
});

app.use('/libros', librosRoutes);
app.use('/equipos', equiposRoutes);
app.use('/auth', authRoutes);


db.probarConexion();

db.sequelize.sync()
  .then(function() {
    console.log('Modelos sincronizados con la base de datos.');
  })
  .catch(function(error) {
    console.error('Error al sincronizar modelos:', error);
  });

var PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log("Servidor escuchando en el puerto " + PORT);
});
