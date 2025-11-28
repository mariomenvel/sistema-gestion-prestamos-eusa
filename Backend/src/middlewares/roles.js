function soloPAS(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ mensaje: 'No autenticado' });
  }

  if (req.user.rol !== 'pas') {
    return res.status(403).json({ mensaje: 'Solo PAS puede realizar esta acción' });
  }

  next();
}

function alumnoOProfesor(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ mensaje: 'No autenticado' });
  }

  if (req.user.rol !== 'alumno' && req.user.rol !== 'profesor') {
    return res.status(403).json({ mensaje: 'Solo alumnos o profesores pueden realizar esta acción' });
  }

  next();
}

module.exports = {
  soloPAS: soloPAS,
  alumnoOProfesor: alumnoOProfesor
};
