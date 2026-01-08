var models = require("../models");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");

function login(req, res) {
  var email = req.body.email;
  var password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ mensaje: "Email y contraseña requeridos" });
  }

  models.Usuario.findOne({ where: { email: email } })
    .then(function (usuario) {
      if (!usuario) {
        return res.status(401).json({ mensaje: "Credenciales incorrectas" });
      }

 // De momento NO estamos cifrando, solo comparar texto puro
if (password !== usuario.password_hash) {
  return res.status(401).json({ mensaje: "Credenciales incorrectas" });
}

// ===== VALIDACIONES DE ESTADO =====

// 1. Verificar si la fecha de finalización prevista ha pasado
if (usuario.fecha_fin_prev) {
  var fechaFin = new Date(usuario.fecha_fin_prev);
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fecha
  
  if (fechaFin < hoy && usuario.estado_perfil === 'activo') {
    // La fecha ha pasado y el usuario sigue activo -> marcar como inactivo
    return usuario.update({ estado_perfil: 'inactivo' })
      .then(function() {
        return res.status(403).json({ 
          mensaje: 'Tu periodo de estudios ha finalizado. Tu cuenta ha sido marcada como inactiva.' 
        });
      });
  }
}

// 2. Verificar si el usuario está bloqueado
if (usuario.estado_perfil === 'bloqueado') {
  return res.status(403).json({ 
    mensaje: 'Tu cuenta ha sido bloqueada por motivos disciplinarios. Contacta con administración.' 
  });
}

// 3. Verificar si el usuario está inactivo
if (usuario.estado_perfil === 'inactivo') {
  return res.status(403).json({ 
    mensaje: 'Tu cuenta está inactiva. Contacta con Servicio Técnico para reactivarla.' 
  });
}

// ===== CREAR TOKEN =====

// Crear token
var token = jwt.sign(
  {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
  },
  process.env.JWT_SECRET,
  { expiresIn: "2h" }
);

res.json({
  mensaje: "Login correcto",
  token: token,
  usuario: {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellidos: usuario.apellidos,
    rol: usuario.rol,
  },
});
    })
    .catch(function (error) {
      console.error("Error en login:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    });
}

module.exports = {
  login: login,
};
