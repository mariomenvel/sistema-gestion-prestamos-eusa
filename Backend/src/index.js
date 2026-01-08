require('dotenv').config();
var express = require('express');
var cors = require('cors');
var db = require('./db');
var models = require('./models');
var librosRoutes = require('./routes/libros.routes');
var equiposRoutes = require('./routes/equipos.routes');
var authRoutes = require('./routes/auth.routes');
var solicitudesRoutes = require('./routes/solicitudes.routes');
var prestamosRoutes = require('./routes/prestamos.routes');
var sancionesRoutes = require('./routes/sanciones.routes');
var usuariosRoutes = require('./routes/usuarios.routes');
var dashboardRoutes = require('./routes/dashboard.routes');
var reportesRoutes = require('./routes/reportes.routes');
var unidadesRoutes = require('./routes/unidades.routes');


var app = express();
app.use(cors());
app.use(express.json());

app.get('/', function(req, res) {
  res.json({ mensaje: 'API Biblioteca funcionando' });
});

app.use('/libros', librosRoutes);
app.use('/equipos', equiposRoutes);
app.use('/auth', authRoutes);
app.use('/solicitudes', solicitudesRoutes);
app.use('/prestamos', prestamosRoutes);
app.use('/sanciones', sancionesRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reportes', reportesRoutes);
app.use('/unidades', unidadesRoutes);


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
