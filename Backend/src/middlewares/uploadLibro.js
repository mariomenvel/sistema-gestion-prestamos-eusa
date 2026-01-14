var multer = require('multer');
var path = require('path');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/libros');
  },
  filename: function (req, file, cb) {
    var extension = path.extname(file.originalname);
    var nombreArchivo = 'libro-' + Date.now() + extension;
    cb(null, nombreArchivo);
  }
});

function fileFilter(req, file, cb) {
  var tiposPermitidos = ['image/png', 'image/jpeg', 'image/jpg'];

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de imagen no permitido'), false);
  }
}

var uploadLibro = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = uploadLibro;
