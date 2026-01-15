var models = require('../models');
var db = require('../db');
const { Op } = require('sequelize');

function obtenerDashboardPAS(req, res) {
  // Configurar rango de fechas para "HOY" 
  var startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  var endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  var promesas = [];
  // 1) Solicitudes Pendientes (Card 1)
  promesas.push(models.Solicitud.count({
    where: { estado: 'pendiente' }
  }));

  // 2) Préstamos Activos (Card 2)
  promesas.push(models.Prestamo.count({
    where: { estado: 'activo' }
  }));

  // 3) Devoluciones realizadas HOY (Card 3 - Nueva lógica)
  promesas.push(models.Prestamo.count({
    where: {
      estado: 'devuelto',
      fecha_devolucion_real: {
        [Op.between]: [startOfDay, endOfDay]
      }
    }
  }));

  // 4) Equipos Prestados (Para Card 4)
  promesas.push(models.Unidad.count({ where: { estado: 'prestado' } }));
  
  // 5) Libros (Ejemplares) Prestados (Para Card 4)
  promesas.push(models.Ejemplar.count({ where: { estado: 'prestado' } }));

  Promise.all(promesas)
    .then(function (resultados) {
      var solicitudesPendientes = resultados[0];
      var prestamosActivos = resultados[1];
      var devolucionesHoy = resultados[2];
      // Sumamos equipos + libros para el total de materiales en uso
      var materialesEnUso = resultados[3] + resultados[4]; 

      // Enviamos el JSON con los nombres que espera Angular
      res.json({
        solicitudes_pendientes: solicitudesPendientes,
        prestamos_activos: prestamosActivos,
        devoluciones_hoy: devolucionesHoy,
        materiales_en_uso: materialesEnUso
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

