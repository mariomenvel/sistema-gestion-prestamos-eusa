var jwt = require('jsonwebtoken');

function auth(req, res, next) {
  var authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ mensaje: 'Falta cabecera Authorization' });
  }

  var partes = authHeader.split(' ');

  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ mensaje: 'Formato de Authorization incorrecto' });
  }

  var token = partes[1];

  jwt.verify(token, process.env.JWT_SECRET, function (err, payload) {
    if (err) {
      return res.status(401).json({ mensaje: 'Token inválido o caducado' });
    }

    // Guardamos los datos del usuario en la request
    req.user = {
      id: payload.id,
      email: payload.email,
      rol: payload.rol
    };

    next();
  });
}

module.exports = auth;
