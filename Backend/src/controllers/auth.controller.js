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

      // 🔐 COMPARAR CONTRASEÑA CON BCRYPT
      return bcrypt.compare(password, usuario.password_hash)
        .then(function (coincide) {
          if (!coincide) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" });
          }

          // ===== VALIDACIONES DE ESTADO =====

          // 1. Verificar si la fecha de finalización prevista ha pasado
          if (usuario.fecha_fin_prev) {
            var fechaFin = new Date(usuario.fecha_fin_prev);
            var hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (fechaFin < hoy && usuario.estado_perfil === 'activo') {
              return usuario.update({ estado_perfil: 'inactivo' })
                .then(function () {
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
          var token = jwt.sign(
            {
              id: usuario.id,
              email: usuario.email,
              rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
          );

          return res.json({
            mensaje: "Login correcto",
            token: token,
            usuario: {
              id: usuario.id,
              email: usuario.email,
              codigo_tarjeta: usuario.codigo_tarjeta,
              nombre: usuario.nombre,
              apellidos: usuario.apellidos,
              rol: usuario.rol,
              grado_id: usuario.grado_id,
              curso: usuario.curso
            }
          });
        });
    })
    .catch(function (error) {
      console.error("Error en login:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    });
}
function registro(req, res) {
  var datos = req.body;

  // Validar campos requeridos
  var camposRequeridos = ['nombre', 'apellidos', 'email', 'telefono', 'tipo_estudios', 'grado', 'curso', 'fecha_inicio_est', 'fecha_fin_prev', 'password'];
  
  for (var i = 0; i < camposRequeridos.length; i++) {
    if (!datos[camposRequeridos[i]]) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios: ' + camposRequeridos[i] });
    }
  }

  // eliminar espacios y guiones del teléfono
  if (datos.telefono) {
    datos.telefono = datos.telefono.replace(/[\s\-]/g, '');  // Elimina espacios y guiones
  }

  // Validar formato de email
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(datos.email)) {
    return res.status(400).json({ mensaje: 'Email inválido' });
  }

  //Validar dominio del email
  var emailLowerCase = datos.email.toLowerCase();
  var dominiosPermitidos = ['@eusa.es', '@campuscamara.es'];
  var dominioValido = dominiosPermitidos.some(function(dominio) {
    return emailLowerCase.endsWith(dominio);
  });
   if (!dominioValido) {
    return res.status(400).json({ 
      mensaje: 'Solo se permiten emails con dominio @eusa.es o @campuscamara.es' 
    });
  }

  // Verificar si el email ya existe
  models.Usuario.findOne({ where: { email: datos.email } })
    .then(function (usuarioExistente) {
      if (usuarioExistente) {
        return res.status(409).json({ mensaje: 'El email ya está registrado' });
      }

      // Hashear contraseña
      return bcrypt.hash(datos.password, 10)
        .then(function (passwordHash) {
          // Crear usuario
          return models.Usuario.create({
            nombre: datos.nombre,
            apellidos: datos.apellidos,
            email: datos.email,
            telefono: datos.telefono,
            tipo_estudios: datos.tipo_estudios,
            grado: datos.grado,
            curso: datos.curso,
            fecha_inicio_est: datos.fecha_inicio_est,
            fecha_fin_prev: datos.fecha_fin_prev,
            password_hash: passwordHash,
            rol: 'alumno',  // Por defecto todos los registros son alumnos
            estado_perfil: 'activo'
          });
        })
        .then(function (nuevoUsuario) {
          console.log('✅ Usuario registrado:', nuevoUsuario.email);
          
          return res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
              id: nuevoUsuario.id,
              email: nuevoUsuario.email,
              nombre: nuevoUsuario.nombre,
              apellidos: nuevoUsuario.apellidos
            }
          });
        });
    })
    .catch(function (error) {
      console.error('❌ Error en registro:', error);
      res.status(500).json({ mensaje: 'Error al registrar usuario' });
    });
}

module.exports = {
  login: login,
  registro: registro
};
