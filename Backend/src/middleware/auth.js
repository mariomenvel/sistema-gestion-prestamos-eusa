var jwt = require('jsonwebtoken');

function auth(req, res, next) {
  var header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ mensaje: 'Falta token de autorización' });
  }

  var token = header.split(' ')[1]; // formato: Bearer TOKEN

  jwt.verify(token, 'mi_clave_secreta_super_segura', function (err, decoded) {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }

    // Guardamos los datos del usuario en req.user
    req.user = decoded;
    next();
  });
}

module.exports = auth;
