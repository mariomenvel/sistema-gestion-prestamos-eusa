var models = require('../models');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

function login(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña requeridos' });
  }

  models.Usuario.findOne({ where: { email: email } })
    .then(function(usuario) {

      if (!usuario) {
        return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      }

      // De momento NO estamos cifrando, solo comparar texto puro
      if (password !== usuario.password_hash) {
        return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
      }

      // Crear token
      var token = jwt.sign(
        {
          id: usuario.id,
          email: usuario.email,
          rol: usuario.rol
        },
        'mi_clave_secreta_super_segura',  // luego la pasamos a .env
        { expiresIn: '2h' }
      );

      res.json({
        mensaje: 'Login correcto',
        token: token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellidos: usuario.apellidos,
          rol: usuario.rol
        }
      });
    })
    .catch(function(error) {
      console.error('Error en login:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    });
}

module.exports = {
  login: login
};
