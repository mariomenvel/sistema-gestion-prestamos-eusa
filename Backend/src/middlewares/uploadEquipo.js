var multer = require('multer');
var path = require('path');

// Configuración de almacenamiento
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/equipos');
  },
  filename: function (req, file, cb) {
    var extension = path.extname(file.originalname);
    var nombreArchivo = 'equipo-' + Date.now() + extension;
    cb(null, nombreArchivo);
  }
});

// Filtro de tipos de archivo
function fileFilter(req, file, cb) {
  var tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg'];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no permitido'), false);
  }
}

var uploadEquipo = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = uploadEquipo;
