require('dotenv').config();
var express = require('express');
var cors = require('cors');
var db = require('./db');

var app = express();

app.use(cors());
app.use(express.json());

app.get('/', function (req, res) {
  res.json({ mensaje: 'API Biblioteca funcionando' });
});

db.probarConexion();

var PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
  console.log("Servidor escuchando en el puerto " + PORT);
});
