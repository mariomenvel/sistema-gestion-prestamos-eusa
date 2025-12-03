var models = require('../models');
var db = require('../db');

function obtenerInicioCurso() {
  var hoy = new Date();
  var year = hoy.getFullYear();

  // INICIO DE CURSO: 1 de septiembre (ajusta si quieres otra fecha)
  var inicio = new Date(year, 8, 1); // mes 8 = septiembre (0-based)

  if (hoy < inicio) {
    inicio = new Date(year - 1, 8, 1);
  }

  return inicio;
}

function obtenerDashboardPAS(req, res) {
  var inicioCurso = obtenerInicioCurso();
  var ahora = new Date();

  var promesas = [];

  // 1) Número de solicitudes pendientes
  var promSolicitudPend = models.Solicitud.count({
    where: { estado: 'pendiente' }
  });

  promesas.push(promSolicitudPend);

  // 2) Número de préstamos activos
  var promPrestamosActivos = models.Prestamo.count({
    where: { estado: 'activo' }
  });

  promesas.push(promPrestamosActivos);

  // 3) Número de sanciones activas DEL CURSO ACTUAL
  var promSancionesActivasCurso = models.Sancion.count({
    where: {
      estado: 'activa',
      inicio: { [db.Sequelize.Op.gte]: inicioCurso },
      [db.Sequelize.Op.or]: [
        { fin: null },
        { fin: { [db.Sequelize.Op.gt]: ahora } }
      ]
    }
  });

  promesas.push(promSancionesActivasCurso);

  Promise.all(promesas)
    .then(function (resultados) {
      var solicitudesPendientes = resultados[0];
      var prestamosActivos = resultados[1];
      var sancionesActivasCurso = resultados[2];

      res.json({
        solicitudes_pendientes: solicitudesPendientes,
        prestamos_activos: prestamosActivos,
        sanciones_activas_curso: sancionesActivasCurso,
        inicio_curso_actual: inicioCurso
      });
    })
    .catch(function (error) {
      console.error('Error al obtener dashboard PAS:', error);
      res.status(500).json({ mensaje: 'Error al obtener datos del dashboard' });
    });
}

module.exports = {
  obtenerDashboardPAS: obtenerDashboardPAS
};
